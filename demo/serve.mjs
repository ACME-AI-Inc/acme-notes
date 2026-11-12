import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import deleteHandler from '../api/notes/delete.js'

const portIndex = process.argv.indexOf('--port')
const port = portIndex < 0 ? 8792 : Number(process.argv[portIndex + 1])
const dist = resolve('dist')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' }
createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname
  if (path === '/api/notes/delete') {
    let body = ''
    for await (const chunk of req) {
      body += chunk
      if (body.length > 8192) { res.writeHead(413).end(); return }
    }
    req.body = body
    res.status = (code) => { res.statusCode = code; return res }
    res.json = (value) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); return res }
    await deleteHandler(req, res)
    return
  }
  const file = resolve(dist, `.${path === '/' ? '/index.html' : path}`)
  if (!file.startsWith(`${dist}/`)) { res.writeHead(403).end(); return }
  try {
    const content = await readFile(file)
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'text/plain' }).end(content)
  } catch { res.writeHead(404).end('Not found') }
}).listen(port, '127.0.0.1', function () {
  console.log(`Acme Notes local app + API: http://127.0.0.1:${this.address().port}`)
})
