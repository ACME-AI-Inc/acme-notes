import { spawnSync } from 'node:child_process'

const target = process.argv.find((arg) => /^https?:\/\//.test(arg)) || 'http://127.0.0.1:8080'
const prepare = process.argv.includes('--prepare')
const session = `acme-export-check-${process.pid}`
function cli(...args) {
  const r = spawnSync('npx', ['--yes', '--package', '@playwright/cli', 'playwright-cli', `-s=${session}`, ...args], { encoding: 'utf8', timeout: 120000 })
  const output = `${r.stdout || ''}\n${r.stderr || ''}`
  if (r.status !== 0 || output.includes('### Error')) throw new Error(output || String(r.error))
  return output
}
const check = `async page => {
  await page.getByRole('textbox', {name:'Email',exact:true}).fill('export-smoke-check@acme.example');
  await page.getByRole('textbox', {name:'Password',exact:true}).fill('acme-demo');
  await page.getByRole('button', {name:'Sign in',exact:true}).click();
  await page.evaluate(() => {
    window.posthog?.register({is_test_run:true,verification_run:'export-smoke-check'});
    window.__exportErrors=[];
    const original=window.acmeTelemetry.error;
    window.acmeTelemetry.error=(error,context)=>{window.__exportErrors.push({message:error.message,name:error.name,context});original(error,context)};
  });
  await page.getByRole('button',{name:'Meeting notes',exact:true}).click();
  const openMenu=()=>page.locator('#menu').click();
  if (${JSON.stringify(prepare)}) {
    await openMenu(); await page.locator('#export').click();
    await page.getByText('Export failed. Please try again.',{exact:true}).waitFor();
    const errors=await page.evaluate(()=>window.__exportErrors);
    if(errors.length!==1 || errors[0].name!=='ReferenceError' || !errors[0].message.includes('exportNoteData') || errors[0].context.operation!=='note_export') throw new Error('Seeded export failure did not produce the expected structured exception');
    await page.evaluate(()=>{ exportNote=eval('('+exportNote.toString().replace('noteText(exportNoteData)','noteText(note)')+')'); window.__exportErrors=[]; });
  }
  await openMenu();
  const downloaded=page.waitForEvent('download');
  await page.locator('#export').click();
  const download=await downloaded;
  const stream=await download.createReadStream();const chunks=[];for await(const chunk of stream)chunks.push(chunk);
  const markdown=Buffer.concat(chunks).toString('utf8');
  if(download.suggestedFilename()!=='meeting.md' || !markdown.startsWith('# Meeting notes') || !markdown.includes('Weekly sync, Tuesday.') || !markdown.includes('- Owner: Priya'))throw new Error('Download did not contain the selected note as Markdown');
  if((await page.evaluate(()=>window.__exportErrors)).length)throw new Error('Successful export logged an exception');
  return {markdownDownloaded:true,filename:download.suggestedFilename(),sourceFixVerified:${JSON.stringify(!prepare)},preparationOnly:${JSON.stringify(prepare)}};
}`
try {
  cli('open', target)
  console.log(cli('run-code', check))
  console.log(prepare ? 'Preparation passed: baseline error captured; one-token browser-only repair downloads real Markdown.' : 'Hosted Markdown export acceptance passed.')
} catch (error) { console.error(error.message); process.exitCode = 1 }
finally { try { cli('close') } catch {} }
