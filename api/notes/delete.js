import { randomUUID } from 'node:crypto'
import { waitUntil } from '@vercel/functions'
import { PostHog } from 'posthog-node'

const key = process.env.POSTHOG_KEY
const host = process.env.POSTHOG_SERVER_HOST
const telemetry = key && host ? new PostHog(key, {
  host, waitUntil, flushAt: 1, flushInterval: 0, requestTimeout: 2000,
  logs: { serviceName: 'acme-notes-api' },
}) : null
if (!telemetry && process.env.NODE_ENV !== 'production') {
  console.warn('POSTHOG_KEY / POSTHOG_SERVER_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once POSTHOG_KEY / POSTHOG_SERVER_HOST is configured')
}

// Notes live in the demo browser. Only a successful server acknowledgment lets
// the client persist its move to Trash; a failed request never removes a note.
export function deletionResult(deletionRequest) {
  return { deleted: true, note_id: deleteRequest.note_id }
}

export default async function handler(req, res) {
  const requestId = randomUUID()
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Request-Id', requestId)
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'POST required', request_id: requestId })
  }
  let deletionRequest
  try { deletionRequest = typeof req.body === 'string' ? JSON.parse(req.body) : req.body } catch {
    return res.status(400).json({ error: 'Invalid JSON', request_id: requestId })
  }
  if (!deletionRequest || !['welcome', 'meeting', 'roadmap', 'groceries'].includes(deletionRequest.note_id) ||
      typeof deletionRequest.distinct_id !== 'string' || !/^[a-zA-Z0-9_-]{1,200}$/.test(deletionRequest.distinct_id)) {
    return res.status(400).json({ error: 'Valid note and user IDs required', request_id: requestId })
  }
  const context = {
    app: 'acme-notes', environment: process.env.VERCEL_ENV || 'development',
    app_version: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    operation: 'note_delete', note_id: deletionRequest.note_id, request_id: requestId,
    distinct_id: deletionRequest.distinct_id,
    $session_id: String(deletionRequest.session_id || '').slice(0, 200),
    is_test_run: deletionRequest.is_test_run === true,
  }
  try {
    const result = deletionResult(deletionRequest)
    console.info(JSON.stringify({ ...context, level: 'info', message: 'Note deletion acknowledged', http_status: 200 }))
    telemetry?.logger.info('Note deletion acknowledged', { ...context, http_status: 200 })
    return res.status(200).json({ ...result, request_id: requestId })
  } catch (error) {
    const details = { ...context, http_status: 500, failure_fingerprint: 'note-delete-reference-error', error_type: error.name, error_message: error.message }
    console.error(JSON.stringify({ ...details, level: 'error', message: 'Note deletion failed', stack: error.stack }))
    telemetry?.captureException(error, deletionRequest.distinct_id, details)
    telemetry?.logger.error('Note deletion failed', details)
    return res.status(500).json({ error: 'note_delete_failed', error_type: error.name, error_message: error.message, request_id: requestId })
  } finally {
    if (telemetry) {
      // Keep telemetry alive after the HTTP response, without delaying the UI.
      const flush = telemetry.flush().catch(() => console.warn('PostHog server telemetry flush failed'))
      try { waitUntil(flush) } catch { await flush }
    }
  }
}
