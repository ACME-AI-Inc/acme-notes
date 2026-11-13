import { spawnSync } from 'node:child_process'

const target = process.argv.find((arg) => /^https?:\/\//.test(arg)) || 'http://127.0.0.1:8792'
const expectError = process.argv.includes('--expect-error')
const session = `acme-delete-check-${process.pid}`
function cli(...args) {
  const result = spawnSync('npx', ['--yes', '--package', '@playwright/cli', 'playwright-cli', `-s=${session}`, ...args], { encoding: 'utf8', timeout: 120000 })
  const output = `${result.stdout || ''}\n${result.stderr || ''}`
  if (result.status !== 0 || output.includes('### Error')) throw new Error(output || String(result.error))
  return output
}
try {
  cli('open', target)
  console.log(cli('run-code', `async page => {
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill('delete-smoke-check@acme.example');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('acme-demo');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.evaluate(() => window.posthog?.register({ is_test_run: true, verification_run: 'delete-smoke-check' }));
    await page.locator('[data-note="meeting"]').click();
    const selectedTitle=await page.locator('#title').innerText();
    await page.getByRole('button', { name: 'Note menu', exact: true }).click();
    const pending = page.waitForResponse(r => new URL(r.url()).pathname === '/api/notes/delete' && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    const response = await pending;
    const body = await response.json();
    if (response.status() !== ${expectError ? 500 : 200}) throw new Error('Unexpected actual Delete HTTP status: ' + response.status());
    if (!body.request_id || body.request_id !== response.headers()['x-request-id']) throw new Error('Missing matching request ID');
    if (${JSON.stringify(expectError)}) {
      await page.getByRole('heading', { name: 'The shredder shredded itself.', exact: true }).waitFor({ state: 'visible' });
      if (!await page.getByText('500', { exact: true }).isVisible()) throw new Error('Missing real500 crash state');
      if (await page.evaluate(() => window.__acme.state.trash.includes('meeting'))) throw new Error('Failed request deleted the note');
      await page.getByRole('button', { name: 'Back to notes', exact: true }).click();
      await page.reload();
      await page.locator('[data-note="meeting"]').waitFor({ state: 'visible' });
      if (await page.locator('[data-note="meeting"]').innerText() !== selectedTitle) throw new Error('Failed request changed the note title');
      return { actualStatus: 500, crashScreen: true, failedNotePreservedAfterReload: true, requestId: body.request_id };
    }
    if (body.deleted !== true || body.note_id !== 'meeting') throw new Error('Invalid server deletion acknowledgment');
    await page.getByText('Note moved to Trash', { exact: true }).waitFor({ state: 'visible' });
    await page.reload();
    if (await page.locator('[data-note="meeting"]').count()) throw new Error('Deleted note returned after reload');
    await page.getByRole('button', { name: /^Trash/ }).click();
    await page.getByText(selectedTitle, { exact: true }).waitFor({ state: 'visible' });
    return { actualStatus: 200, deletedAfterAcknowledgment: true, persistedInTrashAfterReload: true, requestId: body.request_id };
  }`))
  console.log(expectError ? 'Baseline Delete500 crash and note-preservation check passed.' : 'Hosted Delete → Trash → Reload acceptance passed.')
} catch (error) { console.error(error.message); process.exitCode = 1 }
finally { try { cli('close') } catch {} }
