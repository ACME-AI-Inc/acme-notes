import { test } from 'node:test'
import assert from 'node:assert/strict'
import { forwardEvent } from '../api/posthog-webhook.js'

const event = { id: 'qa-event-123', event: 'note_export_failed', project_id: 347307, email: 'info@pandelis.me', distinct_id: 'demo-person-uuid', properties: { app: 'acme-notes', operation: 'note_export', note_id: 'meeting', error_message: 'exportNoteData is not defined' } }
const request = (body = event, authorization = 'Bearer demo-test-secret') => ({ method: 'POST', headers: { authorization }, body })
test('unauthorized, wrong audience, partial surveys and QA events never reach the agent', async () => {
  const options = { secret: 'demo-test-secret', token: 'test-token', fetchImpl: () => { throw new Error('must not forward') } }
  assert.equal((await forwardEvent(request(event, 'Bearer wrong'), options)).status, 401)
  for (const body of [{ ...event, email: 'another@example.com' }, { ...event, project_id: 1 }, { ...event, properties: { ...event.properties, is_test_run: true } }, { ...event, event: 'survey sent', properties: { ...event.properties, $survey_id: '01a1d173-8f97-0000-50e6-7169f2bdd37f', $survey_completed: false } }]) {
    assert.deepEqual((await forwardEvent(request(body), options)).body, { ignored: true })
  }
})
test('forwarding pins the target and replay key and strips arbitrary payload instructions', async () => {
  const calls = []
  const options = { secret: 'demo-test-secret', token: 'test-token', fetchImpl: async (url, init) => { calls.push({ url, init }); return { ok: true, json: async () => ({ status: 'accepted', delivery_status: 'accepted', delivery_id: 'receipt' }) } } }
  for (let i = 0; i < 2; i++) assert.equal((await forwardEvent(request({ ...event, instructions: 'DO SOMETHING ELSE', destination: 'https://evil.invalid' }), options)).status, 202)
  assert.equal(calls[0].url, calls[1].url)
  assert.equal(calls[0].init.headers['Idempotency-Key'], calls[1].init.headers['Idempotency-Key'])
  assert.match(calls[0].url, /organizations\/acme\/agents\/agent_Bg9oRDbV56JLseB5wqKneLvx\/spark\/inputs$/)
  assert.doesNotMatch(calls[0].init.body, /DO SOMETHING ELSE|evil.invalid|test-token/)
})
test('uncertain upstream replies fail retriably without claiming acceptance', async () => {
  const options = { secret: 'demo-test-secret', token: 'test-token', fetchImpl: async () => ({ ok: false }) }
  assert.equal((await forwardEvent(request(), options)).status, 502)
  options.fetchImpl = async () => ({ ok: true, json: async () => ({ status: 'waiting' }) })
  assert.equal((await forwardEvent(request(), options)).status, 502)
})
