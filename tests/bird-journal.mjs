// Run after npm run build against an isolated static server serving dist.
// PLAYWRIGHT_MODULE may point to an already installed Playwright module.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const context = await browser.newContext({ acceptDownloads: true })
const page = await context.newPage()
const url = process.argv[2] || 'http://127.0.0.1:8091'
try {
  await page.goto(url)
  await page.getByLabel('Email', { exact: true }).fill('bird-test@example.invalid')
  await page.getByLabel('Password', { exact: true }).fill('test')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByRole('heading', { name: 'A little closer to the wild', exact: true, level: 2 }).waitFor()
  assert.equal(await page.locator('.field-bird').count(), 1)
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(250, 248, 240)')
  await page.screenshot({path:'/tmp/bird-journal-fresh.png',fullPage:true})
  await page.locator('#search').fill('robin')
  assert.equal(await page.locator('#notes .note').count(), 1)
  await page.locator('#search').fill('')
  await page.getByRole('button', { name: 'Meet the American robin', exact: true }).click()
  assert.match(await page.locator('#note-document').innerText(), /some stay through winter/)
  await page.locator('#menu').click(); await page.locator('#pin').click()
  assert.equal(await page.locator('[data-note="roadmap"] .pin').count(), 1)
  await page.locator('#menu').click()
  const downloadEvent = page.waitForEvent('download')
  await page.locator('#export').click()
  const download = await downloadEvent
  assert.equal(download.suggestedFilename(), 'roadmap.md')
  const stream = await download.createReadStream(); const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  assert.match(Buffer.concat(chunks).toString(), /# Meet the American robin/)
  await page.locator('#share-open').click(); await page.locator('#share-toggle').click()
  await page.locator('#share-link').waitFor()
  await page.locator('#theme-toggle').click()
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark')
  await page.reload()
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark')
  // Existing account edits, trash and pins must never be rewritten by new defaults.
  const saved = {welcome:{title:'My existing journal',body:['Keep this exact text.'],list:['Original item']}}
  await page.evaluate(saved => {
    const user = JSON.parse(sessionStorage.getItem('acme-user'))
    localStorage.setItem(`acme-note-edits:${user.id}`, JSON.stringify(saved))
    localStorage.setItem('trash', JSON.stringify(['groceries']))
  }, saved)
  await page.reload()
  await page.getByRole('button', { name: 'My existing journal', exact: true }).click()
  assert.match(await page.locator('#note-document').innerText(), /Keep this exact text/)
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem(`acme-note-edits:${JSON.parse(sessionStorage.getItem('acme-user')).id}`))), saved)
  await page.locator('#trash-link').click(); await page.getByRole('button', { name: 'Restore', exact: true }).click()
  assert.equal(await page.getByRole('button', { name: 'Before you head outside', exact: true }).count(), 1)
  // Test the unchanged delete-failure UI without depending on a live backend.
  await page.route('**/api/notes/delete', route => route.fulfill({status:500, contentType:'application/json',body:JSON.stringify({error_message:'Seeded failure',request_id:'bird-test'})}))
  await page.getByRole('button', { name: 'My existing journal', exact: true }).click()
  await page.locator('#menu').click(); await page.locator('#delete').click()
  await page.getByText('Your note wasn’t deleted.', {exact:true}).waitFor()
  await page.locator('#crash-back').click()
  await page.setViewportSize({width:390,height:844})
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  await page.screenshot({path:'/tmp/bird-journal-mobile.png',fullPage:true})
  await page.setViewportSize({width:1440,height:1000})
  await page.screenshot({path:'/tmp/bird-journal-desktop.png',fullPage:true})
  console.log('PASS: fresh defaults, bird facts, illustration, search/navigation, pin, Markdown export, sharing, theme reload, existing edits preserved, trash restore, mocked delete-failure recovery, mobile layout.')
} finally { await browser.close() }
