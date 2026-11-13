import { spawnSync } from 'node:child_process'

const target = process.argv.find((arg) => /^https?:\/\//.test(arg)) || 'http://127.0.0.1:8080'
const prepare = process.argv.includes('--prepare')
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

// Preparation may insert the future button into this isolated browser's DOM.
// Acceptance runs must use the actual source button from the deployed app.
const browserCheck = `async page => {
  const prepare = ${JSON.stringify(prepare)};
  const login = async () => {
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill('editor-smoke-check@acme.example');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('acme-demo');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.evaluate(() => window.posthog?.register({ is_test_run: true, verification_run: 'editor-smoke-check' }));
  };
  const openEditor = async () => {
    if (prepare) {
      if (await page.getByRole('button', { name: 'Edit', exact: true }).count()) throw new Error('Preparation baseline already has an Edit button');
      await page.evaluate(() => document.querySelector('.header').insertAdjacentHTML('beforeend', '<button class="btn" data-action="edit-note">Edit</button>'));
    }
    if (!await page.getByRole('button', { name: 'Edit', exact: true }).count()) throw new Error('Missing Edit button in the deployed source');
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
  };
  await login();
  await page.locator('[data-note="meeting"]').click();
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
  console.log(prepare ? 'Preparation passed. The source Edit button is still intentionally absent.' : 'Hosted Edit → Save → Reload acceptance passed.')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  try { cli('close') } catch { /* Preserve the original verification failure. */ }
}
