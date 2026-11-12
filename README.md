# Acme Notes

The app behind every new signup's demo project. It is one static page (`index.html`) served by Caddy,
with no backend: notes, pins, trash and the theme live in the visitor's browser.

It has two planted bugs, so Composal has something real to find:

- **Dark mode resets.** Turn on dark mode, then open another note: the theme drops back to light.
  `?build=fixed` serves the fixed behaviour.
- **The trash badge is stale.** Delete a note and the Trash count keeps its old number until a reload.

Sign-in accepts any email and password; the page shows a demo account (`demo@acme.example` /
`acme-demo`) so a Scenario can sign in without a stored credential, which demo projects don't copy.

## Vercel

This standalone copy comes from `demo-apps/acme-notes` in the Vex repository.
The original demo behavior is preserved, with PostHog instrumentation and sign-out added.
Vercel serves the static files directly, with a fallback to `index.html` for deep
links, an `/healthz` endpoint, and the original cache and robots headers.

Run locally from this directory:

```bash
npm ci
cp .env.example .env.local
# Set POSTHOG_KEY and POSTHOG_HOST in .env.local, then:
npm start
```

Deploy to production with the Vercel CLI:

```bash
vercel --prod
```

The production and preview Vercel environments use `POSTHOG_KEY` and `POSTHOG_HOST`.
`npm run build` bundles the SDK and copies only public files to `dist/`; env files
and source configuration are never served. The ingestion token is public by design.

## PostHog

Telemetry targets the EU `acme` project, ID `347307`:
<https://eu.posthog.com/project/347307>.

- Analytics: pageviews, clicks, page exits, performance, heatmaps, and named events
  for sign-in/out, note navigation, search, theme, pins, sharing, export requests,
  trash, deletes, and restores. Events are also written as structured logs.
- Replay: 100% recording, with input values and account display text masked.
  Passwords are never read by the instrumentation. Console output is attached to replay.
- Logs: browser console output and structured application logs go to PostHog Logs,
  automatically associated with the current user and replay session.
- Errors: unhandled exceptions, rejected promises, console errors, and handled
  local-storage errors go to Error Tracking; errors are also mirrored to Logs.
- Identity: sign-in assigns a UUID per normalized demo email in this browser,
  sends the email as a person property, restores identity on reload, and resets
  it on sign-out/account changes. This demo has no real account backend, so the
  same email on another browser gets a separate UUID.
- Flags: `acme-notes-preserve-theme` gates theme persistence between notes.
  Its initial rollout is 0%, preserving the intentional bug. `?build=fixed`
  still forces the fixed behavior. Use PostHog to change the rollout.

The application and telemetry bundle are served unminified, so browser errors
retain readable source and line information without private source-map upload
credentials. Browsers that block PostHog requests can prevent
telemetry delivery; the app continues working.

## Original hosting

Hosted on Composal as the `acme-notes` app in the `vex` organization at
<https://acme-notes.demo.composal.com> (Docker build with this directory as context, port 8080,
health check `/healthz`). The demo template project in Composal's own organization points its environment here;
`DEMO_PROJECT_TEMPLATE` names that project, and the `demo_project` flag switches copying on
(`vex-api/app/services/demo_projects/`).

Run it locally:

```bash
docker build -t acme-notes demo-apps/acme-notes && docker run --rm -p 8080:8080 acme-notes
```
