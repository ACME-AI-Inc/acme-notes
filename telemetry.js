import posthog from 'posthog-js'

const enabled = Boolean(__POSTHOG_KEY__ && __POSTHOG_HOST__)
const safely = (fn) => {
  if (!enabled) return
  try { return fn() } catch { /* Telemetry must never interrupt the app. */ }
}

const telemetry = {
  capture(event, properties = {}) {
    safely(() => {
      posthog.capture(event, properties)
      posthog.logger.info(event, properties)
    })
  },
  identify(user) {
    if (user?.id) safely(() => posthog.identify(user.id, { email: user.email || undefined, app: 'acme-notes' }))
  },
  reset() { safely(() => posthog.reset()) },
  isEnabled(key) { return safely(() => posthog.isFeatureEnabled(key)) === true },
  error(error, properties = {}) {
    safely(() => {
      posthog.captureException(error, properties)
      posthog.logger.error(error instanceof Error ? error.message : String(error), properties)
    })
  },
  log(level, message, properties = {}) {
    safely(() => posthog.captureLog({ level, body: message, attributes: properties }))
  },
}
window.acmeTelemetry = telemetry

if (enabled) {
  try {
    posthog.init(__POSTHOG_KEY__, {
      api_host: __POSTHOG_HOST__,
      ui_host: __POSTHOG_UI_HOST__ || undefined,
      defaults: '2026-08-30',
      person_profiles: 'identified_only',
      // This demo is also exercised by browser agents; keep their sessions visible.
      opt_out_useragent_filter: true,
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      capture_performance: true,
      capture_heatmaps: true,
      capture_dead_clicks: true,
      capture_exceptions: {
        capture_unhandled_errors: true,
        capture_unhandled_rejections: true,
        capture_console_errors: true,
      },
      disable_session_recording: false,
      enable_recording_console_log: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '.ph-mask',
        sampleRate: 1,
        strictMinimumDuration: false,
        recordHeaders: false,
        recordBody: false,
      },
      logs: {
        serviceName: 'acme-notes',
        environment: __APP_ENV__,
        serviceVersion: __APP_VERSION__,
        captureConsoleLogs: true,
      },
      loaded(client) {
        client.register({ app: 'acme-notes', environment: __APP_ENV__, app_version: __APP_VERSION__ })
        client.startSessionRecording()
        client.logger.info('Acme Notes telemetry initialized', { app: 'acme-notes' })
      },
    })
    window.posthog = posthog
    posthog.onFeatureFlags((flags) => {
      telemetry.log('info', 'Feature flags loaded', { flag_keys: flags })
      window.dispatchEvent(new CustomEvent('acme:flags-ready'))
    })
    // Exceptions themselves are captured by the SDK; mirror their context to Logs.
    window.addEventListener('error', (event) => {
      telemetry.log('error', event.message || 'Resource failed to load', {
        source: event.filename || event.target?.src,
        line: event.lineno,
        stack: event.error?.stack,
      })
    }, true)
    window.addEventListener('unhandledrejection', (event) => {
      telemetry.log('error', 'Unhandled promise rejection', {
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
      })
    })
  } catch (error) {
    console.warn('PostHog could not initialize; Acme Notes will keep running.', error)
  }
} else if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  console.error('POSTHOG_KEY / POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once POSTHOG_KEY / POSTHOG_HOST is configured')
}
