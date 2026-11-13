import { spawnSync } from 'node:child_process'

const target = process.argv.find((arg) => /^https?:\/\//.test(arg)) || 'http://127.0.0.1:8080'
const prepare = process.argv.includes('--prepare')
const expectUnresponsive = process.argv.includes('--expect-unresponsive')
const session = `acme-editor-check-${process.pid}`

function cli(...args) {
  const result = spawnSync('npx', ['--yes', '--package', '@playwright/cli', 'playwright-cli', `-s=${session}`, ...args], {
    encoding: 'utf8',
    timeout: 120_000,
  })
  const output = `${result.stdout || ''}\n${result.stderr || ''}`
  if (result.status !== 0 || output.includes('### Error')) throw new Error(output || String(result.error))
  return output
}

// Preparation may reconnect the existing button only in this isolated browser's DOM.
// Acceptance runs must use the actual source button from the deployed app.
const browserCheck = `async page => {
  const prepare = ${JSON.stringify(prepare)};
  const expectUnresponsive = ${JSON.stringify(expectUnresponsive)};
  const login = async () => {
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill('editor-smoke-check@acme.example');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('acme-demo');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.evaluate(() => window.posthog?.register({ is_test_run: true, verification_run: 'editor-smoke-check' }));
  };
  const openEditor = async () => {
    if (prepare) {
      await page.evaluate(() => {
        const button = document.getElementById('edit-note');
        if (!button || button.dataset.action !== 'edit-note-pending') throw new Error('Expected the unresponsive source Edit button');
        button.dataset.action = 'edit-note';
      });
    }
    if (!await page.getByRole('button', { name: 'Edit', exact: true }).count()) throw new Error('Missing Edit button in the deployed source');
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
  };
  await login();
  await page.getByRole('button', { name: 'Meeting notes', exact: true }).click();
  if (expectUnresponsive) {
    if (prepare) throw new Error('Baseline check cannot inject a repair');
    await page.evaluate(() => {
      window.__editCheckEvents = [];
      window.posthog.set_config({ before_send: event => {
        if (['$rageclick','note_edit_attempted','note_editor_opened'].includes(event.event)) window.__editCheckEvents.push({ event: event.event, uuid: event.uuid, properties: event.properties });
        return event;
      }});
    });
    const edit = page.getByRole('button', { name: 'Edit', exact: true });
    await edit.waitFor({ state: 'visible' });
    for (let i = 0; i < 4; i++) await edit.click({ delay: 40 });
    await page.waitForFunction(() => window.__editCheckEvents.some(e => e.event === '$rageclick'), null, { timeout: 10000 });
    await page.waitForTimeout(5500);
    if (await page.getByRole('form', { name: 'Edit note', exact: true }).count()) throw new Error('Seeded Edit unexpectedly opened an editor');
    return await page.evaluate(() => {
      const events = window.__editCheckEvents;
      const rage = events.find(e => e.event === '$rageclick');
      const attempts = events.filter(e => e.event === 'note_edit_attempted');
      if (events.some(e => e.event === 'note_editor_opened') || attempts.length < 3) throw new Error('Expected repeated attempts with no editor-open event');
      return { visibleEditUnresponsive: true, actualNativeRageclick: true, attemptCount: attempts.length,
        sourceUuid: rage.uuid, nativeProperties: { elText: rage.properties.$el_text, elements: rage.properties.$elements, chain: rage.properties.$elements_chain, sessionId: rage.properties.$session_id },
        distinctId: window.posthog.get_distinct_id(), sourceButtonVerified: true, injectedRepair: false };
    });
  }
  await openEditor();
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Edited meeting smoke check');
  await page.getByRole('textbox', { name: 'Note content', exact: true }).fill('The saved note survives a reload.');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Edited meeting smoke check', exact: true }).click();
  if (!await page.getByText('The saved note survives a reload.', { exact: true }).isVisible()) throw new Error('Saved content did not survive reload');
  await openEditor();
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Discarded title');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  if (!await page.getByRole('heading', { name: 'Edited meeting smoke check', level: 1 }).isVisible()) throw new Error('Cancel changed the note');
  return { saveAndReload: true, cancel: true, sourceButtonVerified: !prepare, preparationOnly: prepare };
}`

try {
  cli('open', target)
  const result = cli('run-code', browserCheck)
  console.log(result)
  console.log(expectUnresponsive ? 'Visible unresponsive Edit and actual native rageclick baseline passed.' : prepare ? 'Preparation passed. The source Edit button is still intentionally unresponsive.' : 'Hosted Edit → Save → Reload acceptance passed.')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  try { cli('close') } catch { /* Preserve the original verification failure. */ }
}
