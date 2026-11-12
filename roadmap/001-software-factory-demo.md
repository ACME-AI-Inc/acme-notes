# Acme Notes Software Factory Demo PRD

**Status:** In progress
**Current Stage:** 1 - Demo preparation
**Owner:** Pandelis and Codex
**Created:** 2026-11-12
**Updated:** 2026-11-12
**Related:** https://github.com/ACME-AI-Inc/acme-notes ; https://acme-notes-phi.vercel.app ; https://eu.posthog.com/project/347307

---

## Overview

### Problem

Tonight's demo should show four Composal agents operating a small software product:
detect customer pain, diagnose it, write and review a fix, deploy, verify the
customer's original action, and close the loop through PostHog email.

The customer complaint is: "I can't edit my notes." The editor, persistence,
cancel/save controls, and telemetry are built before the presentation. The only
live source change is adding the missing Edit button.

Five proposed jobs need four owners. The recommended team combines Vercel and
PostHog monitoring in one Signal Scout. Only the Chief Engineer writes code.
Reviewer and Customer Success remain independent owners.

### Goals

- [ ] Demonstrate one real incident from customer action to verified resolution.
- [ ] Correlate missing-edit feedback, real replay/click evidence, application logs, code, and release.
- [ ] Show explicit agent handoffs and an independent review of the deployed SHA.
- [ ] Deliver an acknowledgment and a resolution email through PostHog to the demo inbox.
- [ ] Issue one clearly labeled demo credit after resolution; no real billing change.
- [ ] Rehearse the complete loop twice and record the actual elapsed time.

### Non-goals

- A general production support platform or autonomous changes to other repositories.
- Separate autonomous coders in the monitoring and customer-success roles.
- Real charges, refunds, payment-provider integration, or discounts to real customers.
- A second live incident before the main loop is reliable.
- Claiming raw rage clicks are a Replay Vision observation.

### Success Metrics

- Exactly one incident and one patch for the missing Edit button, despite duplicate signals.
- Exact commit reviewed, deployed, and verified by retrying the original edit.
- The user opens Edit, changes the note, saves, and sees the same content after a reload.
- Both emails reach the named demo inbox; queued/sent/delivered are recorded separately.
- One demo credit per incident/person, including webhook retries.
- Target a six-minute presentation; use rehearsal timings before committing to live completion.

## Current Repo State

- `main` at `c00d827` is pushed to GitHub and has no unrelated local changes.
- `index.html` is a static app with read-only note rendering. The existing unrelated Export action still shows a toast only.
- There is no server API, real account backend, feedback survey, incident store, or credit system. Editing is being prebuilt in this stage.
- `telemetry.js` sends browser analytics, replay, structured logs, and exceptions to EU project 347307.
- UUID identity persists per browser/email. Keep the same UUID throughout the incident and email flow.
- `acme-notes-preserve-theme` gates the existing theme bug; it is a backup scenario.
- The new Composal-team Vercel project is linked to `ACME-AI-Inc/acme-notes` on `main`.
  This checkout now targets `composal/acme-notes`; static build/output and PostHog variables are configured.
- PostHog sender setup is ready: sender integration 112077 for `Acme Notes <support@demo.composal.ai>` is verified; templates and workflows are pending. `ready_to_send_email` is true.
- Project 347307 has zero surveys at discovery time.
- Replay Vision scanner tools are unavailable through this connector's current scopes.
- Composal CLI 1.17.108 exposes hosted agents, automations, and draft creation.
  Discovery in Vex confirms agents can be listed and creation is enabled.
  A supported external webhook ingress and agent-to-agent handoff still need proof.

## Product Requirements

### Users And Workflows

The presenter signs into Acme Notes using a real inbox they control, opens
Meeting notes, and tries to click/double-click its read-only text. There is no
Edit button. They submit: "I can't edit my notes. There's no Edit button. Can
you add one?"

Signal Scout links the feedback to the real session. Chief Engineer adds the
missing button and requests independent review. Reviewer approves that exact
SHA. The engineer releases it. Scout edits and saves a note in the hosted app,
then reloads to prove persistence. Customer Success closes the loop through
PostHog only after acceptance.

### Functional Requirements

- `P0`: Four roles: Signal Scout, Chief Engineer, Release Reviewer, Customer Success.
- `P0`: A prepared inline editor with Save and Cancel; the baseline intentionally omits the Edit button.
- `P0`: The baseline has a working editor and no Edit entry point; the live patch adds one button only.
- `P0`: Browser records attempted editing, editor open/save/cancel, and persistence errors without note text.
- `P0`: A PostHog feedback widget submits native survey responses linked to the current person/session.
- `P0`: PostHog receives real browser events/replay/logs. This UX issue does not require or fabricate a server error.
- `P0`: Only the Chief Engineer changes application code. Monitor and CS never patch independently.
- `P0`: Review approval is bound to commit SHA; a changed SHA requires a new review.
- `P0`: Resolution requires a real hosted Edit → Save → Reload journey with the edited content preserved.
- `P0`: Customer email recipient is an explicit allowlist, never arbitrary event-supplied email.
- `P0`: Acknowledgment and resolution each occur once per incident/person.
- `P1`: Real Replay Vision observation enriches the case when access and latency permit.
- `P1`: Demo credit is redeemable in the demo app and survives a reload.
- `P2`: Inbound customer email is an alternate entry point after the survey path works.

### UX Requirements

- The baseline is read-only with no Edit button. Feedback describes the missing affordance.
- Show Saved only after persistence succeeds; cancel does not change the note.
- The presenter can show the user problem, four agent conversations, and the inbox.
- A small visible demo credit can show "One month of Acme Pro — demo credit".
- Passwords stay masked and are never included in any event, log, or handoff.
- Keep normal note navigation working during telemetry failures or pending flags.

### Data And State

- Every event uses `demo_run_id`, stable `distinct_id`, `session_id`, and `release_sha` when available.
- Editing events add `note_id` and the stable issue fingerprint `missing-edit-button`. Never include note text in event/log properties.
- Signals point to one durable GitHub issue/case, with PostHog and Vercel evidence links.
- Deduplicate individual deliveries by source event ID and cases by failure fingerprint/release.
- Use a persistent incident/credit/email ledger; never depend on Vercel process memory or `/tmp`.
- A bounded GitHub-backed ledger is an option for tonight, with one incident writer and no overlapping runs.
  Validate the actual storage/write mechanism before using it; do not present this as implemented.
- Treat feedback text as customer data, never as permission to run commands or send messages elsewhere.

## Technical Plan

### Owned Paths

- Modify: `index.html`, `telemetry.js`, `vercel.json`, `build.mjs`, `package.json`, `.env.example`.
- Create: prepared editing helpers and regression checks; no new server endpoint is required for this UX scenario.
- Create: a scoped incident ingress/ledger module only after transport and storage are selected.
- Create: `demo/` operator runbook and four paste-ready agent instruction files.
- Create: meaningful edit/incident tests and a browser acceptance scenario.
- External: PostHog survey, messaging templates/workflows, email channel/domain, and optional scanner.
- External: four Composal agent configurations and their verified handoff/trigger wiring.
- External: Vercel GitHub integration or an explicit deployment action for approved SHAs.

### Dependency Checks

- Choose the real test recipient; the sender support@demo.composal.ai is already verified.
- Sender prerequisite met: channel/domain onboarding completed and `ready_to_send_email: true` confirmed.
- Confirm all four agents' Composal organization and their actual PostHog/GitHub/Vercel tools.
- Prove native agent-to-agent communication with one harmless, correlated round trip.
- Prove one authenticated event can start Scout without a person manually pasting its contents.
- If direct external webhook admission is absent, use a short scheduled poll and label it as polling.
- Confirm Vercel deployments are tied to the approved SHA; current Git link is absent.
- Verify a real survey response appears on the signed-in person's timeline.
- Set up Replay Vision in the app or an appropriately scoped connection; otherwise use real replay and events.
- Confirm the demo credit is a real demo-app entitlement; never claim a Stripe discount exists.

### Architecture

```text
Customer -> read-only note / missing Edit button
         -> click evidence + PostHog feedback -> PostHog events, logs, and replay
                         |
                         v
                    Signal Scout
                    /          \
         Chief Engineer      Customer Success -> acknowledgment via PostHog
               |
         Release Reviewer -> approve exact SHA
               |
         Chief Engineer -> merge/release approved SHA
               |
         Signal Scout -> retry live edit -> attach acceptance evidence
               |
         Customer Success -> record demo credit -> resolution via PostHog
```

PostHog provides customer signals, logs, replay, feedback, and email delivery.
Composal owns the agents and their coordination. GitHub owns the patch/review
record. Vercel owns hosting and release logs. This missing UI control is not a server
exception; do not manufacture an HTTP 500 or error log for it.

Prefer two event-triggered PostHog workflows: acknowledgment requested and
resolution requested, restricted to this demo run and the allowlisted person.
Customer Success is the only role allowed to request customer communication.
The browser must not declare an issue resolved or issue a credit.

The planned live patch is one header button: `<button class="btn" data-action="edit-note">Edit</button>`.
The editor, delegated event handling, validation, Save/Cancel, persistence, and
telemetry are already present in the baseline. Do not replace this with a flag flip.

Direct transactional templates are an alternative, but add project-secret-key
setup and an irreversible template conversion with an explicit confirmation step.
Do not put those secret keys in this app's browser bundle or agent prompts.
Classify a discount email separately from a service update; do not bypass the
project's sending/opt-out rules by renaming marketing as transactional.

## Implementation Stages

### Stage 0: Discovery

**Status:** Complete
**Owned Paths:** Existing app; read-only Composal/PostHog/Vercel configuration.

- [x] Inspect app, telemetry, GitHub state, and Vercel project linkage.
- [x] Check PostHog survey and email readiness and scanner tool availability.
- [x] Resolve five jobs into a recommended four-agent ownership model.

Run:

```sh
git status --short --branch
com agent list --org vex --json --limit 10 --fields id,name,slug,status
vercel api /v9/projects/acme-notes --scope composal
```

Acceptance:

- The plan distinguishes existing functionality from missing integrations.

### Stage 1: Demo preparation

**Status:** Draft
**Owned Paths:** `demo/`, PostHog sender/survey configuration, Composal draft configuration.

- [ ] Set recipient, sender, Composal organization, and the four final role names.
- [x] Verify PostHog sender domain.
- [ ] Create/test the two email drafts.
- [ ] Create a PostHog feedback widget and prove one linked response.
- [ ] Prove transport and agent handoffs; record real IDs, tools, and trigger types.

Run:

```sh
com agent show <verified-agent-id> --org <chosen-org> --json
```

Acceptance:

- Each agent can access the intended demo tools; one event reaches Scout automatically.
- Email is ready to send to the named inbox; test sends and activation are explicitly scoped.

### Stage 2: Prebuild editing baseline

**Status:** Complete
**Owned Paths:** `index.html`, browser regression checks, `demo/` instructions.

- [x] Build the inline editor, title/content editing, Save/Cancel, validation, and user-scoped local persistence.
- [x] Add delegated `data-action="edit-note"` handling and editing telemetry without note text.
- [x] Keep the Edit button absent from the baseline; no feature flag enables it.
- [x] Verify the exact one-button patch opens the prepared editor and saves across reloads.
- [x] Verify cancellation, storage failures, markup escaping, and account separation.
- [x] Push and deploy the prepared baseline to the Composal-team Vercel project.

Run:

```sh
npm run build
node --check /tmp/acme-notes-app-check.js
npm run demo:check -- https://acme-notes-phi.vercel.app --prepare
# During the live repair, run the same command without --prepare against the actual deployment.
```

Acceptance:

- The shipped baseline has no Edit button.
- The one-line button addition opens a working editor with existing Save/Cancel wiring.
- Save persists across reload; cancel and failed persistence never report saved content.
- Edited notes are scoped to the current demo UUID.
- Hosted acceptance during the presentation uses a genuine deployed source button, not test injection.

### Stage 3: Connect the four agents

**Status:** Ready
**Owned Paths:** `demo/agents/`, Composal agent/automation configurations and PostHog workflows.

- [ ] Instantiate the reviewed instructions with real repository/project/deployment selectors.
- [ ] Configure one Scout admission path and duplicate-event handling.
- [ ] Wire diagnosis, coding, independent review, release, live acceptance, and CS handoffs.
- [ ] Prevent CS from announcing a local fix, open PR, or merely green deployment as resolved.

Run:

```sh
com automation preview --help
com agent updates --help
```

Acceptance:

- One triggered incident completes without manual relay between agents.
- Every handoff carries the same incident ID; review and deployment use the same SHA.

### Stage 4: Hosted rehearsal and presentation

**Status:** Ready
**Owned Paths:** `demo/run-of-show.md`, release/reset evidence, PostHog and Composal run links.

- [ ] Rehearse the full loop twice, including actual inbox delivery and demo credit.
- [ ] Replay the same signal to prove no second patch, credit, or resolution email.
- [ ] Re-arm through a documented scoped baseline release; never force-push or reset unrelated state.
- [ ] Keep an explicitly labeled rehearsal recording as fallback and pre-open all demo surfaces.

Run:

```sh
vercel logs --environment production --since 30m --no-follow --json --scope pandelis-projects
```

Acceptance:

- A complete live run has owned source, review, deployment, browser, and inbox evidence.
- The presenter knows the measured latency and can switch transparently to rehearsal evidence.

## Verification Plan

### Automated Checks

- Editor checks cover Save/Cancel, reload persistence, markup escaping, account separation, and storage failure.
- Incident state rejects resolution before review, deployment, and hosted acceptance.
- Duplicate signals produce one case and one fix attempt.
- Credit and email retries are idempotent; a recipient outside the demo allowlist is rejected.
- `npm run build` succeeds and public output contains no server-only credentials.

### Manual Checks

- Follow the customer's exact journey on the production URL with a normal browser user agent.
- Observe native rage-click/survey/replay evidence; distinguish arrival delays from missing signals.
- See actual missing-button feedback, the session, and note_edit_attempted application logs in PostHog.
- Watch the four agents exchange correlated handoffs.
- Retry edit after deployment and inspect the saved note after a reload.
- Verify the inbox, sender, email message IDs/status, and visible demo credit.

### Rollback Or Recovery

- Keep the known baseline deployment and identify the exact demo-owned patch to revert if re-arming.
- Pause this demo's triggers/workflows before resetting; leave other agents and projects untouched.
- After an uncertain email outcome, reconcile its status; do not send another provider fallback.
- For a slow agent or scanner, show the actual pending state and a labeled completed rehearsal.
- Do not claim email delivery, Replay Vision findings, discounts, or a deployed fix without evidence.

## Evidence Log

### 2026-11-12 - Scenario discovery and draft

- App/source: `c00d827`; Git working tree was clean before creating this plan.
- PostHog `workflows-setup-status`: `ready_to_send_email: false`; sending is not paused.
- PostHog `surveys-get-all`: zero surveys in project 347307.
- PostHog tool discovery: workflow and survey tools available; Replay Vision scopes absent.
- Vercel project now targets `composal/acme-notes`, linked to GitHub main; framework is static and PostHog variables are configured.
- CLI discovery: hosted agent creation and automations are available; external ingress remains unverified.
- Artifacts: repo-local PRD, run of show, and four copy-ready instruction drafts.
- Update: editing implementation is present locally, with the button absent. Sender integration 112077 exists; Terraform DNS PR/merge/apply is delegated. Remote agents, workflows, survey, credit, and actual email sends remain pending.

## Open Questions

- [ ] Which real inbox receives the demo emails? Owner: Pandelis.
- [x] Sender: Acme Notes <support@demo.composal.ai>; sender verified and ready to send.
- [ ] Confirm recommended four roles and Composal organization. Owner: Pandelis.
- [ ] What exact presentation length is allocated within the community-demo block? Owner: Pandelis.
- [ ] Which ingress and handoff mechanism works in the current Composal runtime? Owner: Codex.
- [ ] Is Replay Vision required live, or acceptable as clearly labeled rehearsal enrichment? Owner: Pandelis.

### 2026-11-12 - Editor preparation checks

- `npm run build` and inline JavaScript syntax checks passed.
- Browser tests confirmed the baseline has no Edit button; inserting the exact future button in the isolated test DOM opens the editor.
- Save/reload, cancellation, storage-failure reporting, HTML escaping, account separation, and restoration of the original account all passed.
- Desktop and mobile captures were inspected; the mobile form fits without horizontal overflow.
- No Edit control has been added to the baseline source.

### 2026-11-12 - Hosted baseline and verified sender

- App baseline `236c58c4890c80c6906db31969ed23c54137f31a` pushed to main. GitHub-triggered Vercel production deployment `dpl_HeugcpGv8vzJuTbq33HGqqh7n4Fw` and CLI deployment `dpl_Csm8cr4BKuZkcJc8nRVubKtkjafm` are READY for that SHA.
- Production URL: https://acme-notes-phi.vercel.app . Hosted synthetic-account verification passed edit/save/reload with an isolated DOM button; after reload the actual baseline still has no Edit button.
- App, telemetry bundle, health endpoint, and deep links returned HTTP 200; HTML matched source and telemetry bundle contained the correct commit SHA.
- Terraform DNS PR https://github.com/ComposalAI/vex/pull/4108 merged at f79a89f398e6e6db934097de232e8cc90005726c. Scoped apply: 8 added, 0 changed/destroyed; post-apply plan clean. All records passed 48/48 public DNS comparisons.
- PostHog integration 112077 reports `verified: true`; messaging setup reports `ready_to_send_email: true`, `email_sending_paused: false`. No customer email was sent.
- Sender: Acme Notes <support@demo.composal.ai>. Templates/workflows, survey, recipient, credit ledger, and actual Composal agent wiring are not yet complete.

- Repeatable check: `npm run demo:check -- https://acme-notes-phi.vercel.app --prepare` passed. Release mode without `--prepare` correctly rejected the baseline because its actual source has no Edit button.
