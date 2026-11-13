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
The prepared note editor is also included; its Edit entry point is intentionally
absent for the meetup scenario below.
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
vercel --prod --scope composal
```

The production and preview Vercel environments use `POSTHOG_KEY` and `POSTHOG_HOST`.
`npm run build` bundles the SDK and copies only public files to `dist/`; env files
and source configuration are never served. The ingestion token is public by design.

The intended Vercel project is <https://vercel.com/composal/acme-notes>, linked to
`ACME-AI-Inc/acme-notes` on `main`. This checkout is linked to that team project.

## Meetup baseline: the Edit button does nothing

Production: **https://bird.composal.com** (Fieldnotes, the Acme Notes demo).
Click the visible **Edit** button four times quickly. It does nothing; the SDK
captures an actual native `$rageclick` and each `note_edit_attempted`.
Sherlock Logs correlates at least three attempts on `#edit-note` with no
`note_editor_opened` outcome through five seconds, then diagnoses unresponsive editing.
No feedback submission is required. Penny Perks handles the support email.

The prebuilt editor, Save/Cancel, validation and browser persistence already work.
Patch McFix’s live source repair changes only the existing button binding:

```diff
- data-action="edit-note-pending"
+ data-action="edit-note"
```

Captain Nitpick reviews the exact head before merge. Sherlock verifies the actual
hosted Edit → Save → Reload journey after the matching deployment. See
[the operating script](demo/run-of-show.md) for the ARM prompt and both scenes.

```bash
# Actual seeded control and native SDK rageclick; no injected repair:
npm run demo:check -- https://bird.composal.com --expect-unresponsive
# Isolated DOM preparation proves the prebuilt editor only:
npm run demo:check -- https://bird.composal.com --prepare
# After the agent's source fix; no preparation flags:
npm run demo:check -- https://bird.composal.com
```

These use isolated QA accounts excluded from live intake. The second seeded case
is **… → Delete**: a real500 and full-page paper-jam crash, preserving the note.
Local app and API: `npm run build`, then `npm run demo:serve -- --port 8792`.
Canonical DNS is Terraform-managed in [Vex PR #4168](https://github.com/ComposalAI/vex/pull/4168).

The verified PostHog sender for project 347307 is
**Acme Notes <support@demo.composal.ai>**. DNS is Terraform-managed in
[Vex PR #4108](https://github.com/ComposalAI/vex/pull/4108).
Email templates and the demo workflows are configured separately.

## PostHog

Telemetry targets the EU `acme` project, ID `347307`:
<https://eu.posthog.com/project/347307>.

- Analytics: pageviews, clicks, page exits, performance, heatmaps, and named events
  for sign-in/out, note navigation, search, theme, pins, sharing, export requests,
  trash, deletes, restores, attempted editing, editor open/save/cancel. Events are
  also written as structured logs; editing events never include note contents.
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
