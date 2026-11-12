# Acme Notes Software Factory Demo PRD

**Status:** In progress
**Current Stage:** 4 - Hosted rehearsal and timing optimization
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
cancel/save controls, and telemetry are built before the presentation. The first live source change is adding the missing Edit button. The second scene is now a proactive Delete HTTP500 crash, replacing Export. Its server ReferenceError needs a one-token repair.

Five proposed jobs need four owners. The recommended team combines Vercel and
PostHog monitoring in one Signal Scout. Only the Chief Engineer writes code.
Reviewer and Customer Success remain independent owners.

### Goals

- [x] Demonstrate one real incident from customer action to verified resolution (native Edit rehearsal PR2; assisted configuration run).
- [ ] Correlate missing-edit feedback, real replay/click evidence, application logs, code, and release.
- [x] Show explicit agent handoffs and an independent review of the deployed SHA.
- [ ] Deliver an acknowledgment and a resolution email through PostHog to the demo inbox.
- [ ] Issue one clearly labeled demo credit after resolution; no real billing change.
- [ ] Rehearse the complete loop twice and record the actual elapsed time.

### Non-goals

- A general production support platform or autonomous changes to other repositories.
- Separate autonomous coders in the monitoring and customer-success roles.
- Real charges, refunds, payment-provider integration, or discounts to real customers.
- Unrelated feature work beyond the two explicitly requested seeded incidents.
- Claiming raw rage clicks are a Replay Vision observation.

### Success Metrics

- Exactly one incident and one patch for the missing Edit button, despite duplicate signals.
- Exact commit reviewed, deployed, and verified by retrying the original edit.
- The user opens Edit, changes the note, saves, and sees the same content after a reload.
- Both emails reach the named demo inbox; queued/sent/delivered are recorded separately.
- One demo credit per incident/person, including webhook retries.
- Target a six-minute presentation; use rehearsal timings before committing to live completion.

## Current Repo State

- Production is https://acme-notes-phi.vercel.app in Vercel composal/acme-notes, automatically deployed from ACME-AI-Inc/acme-notes main.
- Current baseline cc06a24 keeps Edit absent and seeds a real Delete HTTP500 with the full-page paper-jam screen. Export works. Failed Delete preserves the note; its server fix is deleteRequest → deletionRequest. cc52571 added first-party replay ingestion through /n-sync.
- Four active ACME agents have real instructions, assigned repository access and PostHog MCP connections. Engineer, Scout and Reviewer also have Vercel MCP. Native legacy teammate pings and acknowledgments passed.
- Native PostHog webhooks now drive an event-triggered monitor; minute polling is disabled. Intake is disarmed after the first admitted rehearsal case.
- Native destination01a1d1e2-07aa-0000-a866-8384eaa56d09 is enabled for Scout endpointwebhook_19d0119fdd890304b81a3948f23de015; the old relay destination is disabled. Actual completed feedback reached this endpoint, workflow and all four role handoffs.
- Feedback widget is launched only for info@pandelis.me on production. Rendering is verified in an isolated normal-UA browser; no real complaint was submitted.
- Acme Notes <support@demo.composal.ai>, integration112077, is verified. Two tested editing-support workflows were explicitly approved and enabled, with zero executions at setup.
- Customer Success preserves the completed rehearsal incident/email/synthetic-credit ledgers. No billing integration or visible credit entitlement exists.
- Export PR1 and Edit PR2 were reviewed, merged and production-verified. Both editing-support email actions were logged as sent, with one synthetic USD20 ledger entry. Acknowledgment inbox delivery was confirmed by the user; resolution inbox delivery remains unconfirmed. The first native Edit run needed configuration corrections and exceeded the six-minute target.
- Replay metadata confirms stored production recordings. Replay Vision is not provisioned and must not be claimed.
- Public IDs and operator instructions are in demo/team-setup.json and demo/run-of-show.md. Secrets remain server-only; the dedicated webhook credential expires 2026-11-13T20:40:23Z.

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

**Status:** Verifying
**Owned Paths:** `demo/agents/`, Composal agent/automation configurations and PostHog workflows.

- [x] Instantiate the reviewed instructions with real repository/project/deployment selectors.
- [x] Configure Scout webhook admission, one-minute backup monitor and duplicate-event receipts.
- [ ] Wire diagnosis, coding, independent review, release, live acceptance, and CS handoffs.
- [x] Configure and test CS gates; actual live resolution remains untested.

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

- [x] Customer inbox: info@pandelis.me.
- [x] Sender: Acme Notes <support@demo.composal.ai>; sender verified and ready to send.
- [x] Four roles are active in ACME; exact IDs are recorded in demo/team-setup.json.
- [ ] What exact presentation length is allocated within the community-demo block? Owner: Pandelis.
- [x] Authenticated PostHog → Vercel → Composal input relay and legacy native teammate messages verified.
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

### 2026-11-12 - Agent team and event transport

- Four active ACME agents and PostHog/Vercel MCP reads verified. Legacy native teammate handoffs passed; newer thread messaging and briefing publication are gated off.
- Monitor trigger clawder_workflow_trigger_wZ1WbXkaMqopWC32AO3PLGmY runs every60seconds. User approved saving/enabling it; a real unarmed run returned normally without provider queries or handoffs.
- PostHog survey01a1d173-8f97-0000-50e6-7169f2bdd37f is launched, targeted to the named customer, and rendered on production. No response was submitted during setup.
- HTTP destination01a1d17f-6a18-0000-2510-ae0a699dbe85 is enabled after mocked and real invocation tests. Duplicate relay requests returned the same deliveryID.
- User approved both tested editing-support email workflows, now active. No actual emails, credits, repair PRs or customer fixes were issued during setup.
- Build, relay authorization/audience/retry tests and hosted browser-only Export repair checks passed. Full autonomous repair and inbox rehearsal remains open.

### 2026-11-12 - Production replay verification

- User reported recordings not visible. session-recording-get confirmed pre-existing production replay01a1d184-da89-75e3-b88c-ee18666c364d (24seconds,36,880bytes,17events) and list queries returned recordings; missing capture was not established for every visitor.
- cc52571 introduced first-party capture and explicit SDK recording start. Hosted checks caught fallback/trailing-slash routing errors; 6de84f2 and2c412e7 corrected them. Final browser verification on2c412e7: recorder/config assets304, flags/events/logs/surveys/replay uploads200, zerofailedrequests, recordingStarted=true. No claim is based only on deployment-ready status.
- New production session01a1d18d-0dea-7636-817c-1508e3618650 uploaded through /n-sync/s/ successfully.

- session-recording-get confirmed new first-party production replay01a1d18d-0dea-7636-817c-1508e3618650:55seconds,62,463bytes,58events, fourclicks, identifiedinfo@pandelis.me. This is stored replay evidence, not merely an SDK session ID.

### 2026-11-12 - Full native feedback rehearsal and faster intake

- Actual complete feedback01a1d1fd-67c5-7f12-aad1-aee3a7bb2437 at23:00:07.855UTC reached native endpoint23:00:15; its partial predecessor was ignored.
- Workflowclawder_workflow_run_NKdyp2GkBG6mHppYe69w5z7m admitted one verified missing-Edit incident, then disarmed further intake. Stored customer replay and real source identity/session/release were verified. The initial evidence step took222s before coding handoff.
- Actual Sol low coder added one button in1de0d8629fbbc7afb8b6b8c55a30ebaffb754752. PR2 merged15b0299d47c7642b69c54a282629e984d5a79994 after independent native exact-head approval. Vercel productiondpl_Cy6cHhfbdRrvf4F8rTe4by7GAdNV took10.898s push-to-ready.
- Scout actual-source hosted Edit/Save/Reload/Cancel passed23:12:45–51, no preparation mode. PostHog note_saved matched the deployed SHA; the available QA replay segment ends before Save, so it is not full save/reload replay proof.
- Acknowledgment invocation01a1d204-b92e-0000-9473-ae94a0f674bd logged sent23:08:08.145. Resolution01a1d20a-e18a-0000-1a50-8d8bc7dcac2a logged sent23:14:51.417. CS records one synthetic USD20 entry, no actual billing change. Inbox delivery is unconfirmed.
- Corrected stale per-agent setup holds: Scout owns intake authority; other agents accept its authenticated admitted-case scope. Clarified synthetic-credit scope to match the already-approved resolution workflow. Normal HogFlow action logs cover these emails; transactional-only send logs did not. This first run is explicitly assisted.
- New compact current-control block lives at the top of the existing allowed daily memory; original history is archived below it. No new memory paths or expanded permissions. Optimized monitor84d1b2d0da5425634e1bef3b6da8cbc49391120857aa07dd1dd17b23df099bfd uses one scalar source lookup before handoff and enriches replay/logs afterward. Both Edit and proactive Export branches are retained.
- All13 current native team conversations confirmed /fast ultrafast; Sol low is the model default and implementation delegation explicitly requests ultrafast. Native workflow runner forwards model/thinking but not fastMode; step speed must not be claimed verified. A new uninterrupted timing remains pending.
- Ordinary baseline reset1281be4 removed only the Edit control for the next rehearsal; Feedback and the working Export were preserved. Final onstage reset must restore both requested seeded bugs after tests, then leave intake disarmed.

### Delete500 scenario replaces Export (2026-11-12)

- User requested a visible crash on normal Delete. Baseline cc06a24 implements
  POST /api/notes/delete with a genuine ReferenceError and500; no note moves to
  Trash until the server acknowledges200. Full-page “The shredder shredded itself.”
  includes recovery/retry and request ID. Export restored working; Edit absent.
- Browser baseline check passes actual500, crash rendering and preservation after
  reload. Desktop/mobile visually checked, no horizontal overflow. Build and
  frozen Bun install pass. The future repair changes one identifier in the helper.
- Native PostHog destination now filters completed survey or note_delete_failed,
  rejecting QA, wrong operation/status/fingerprint and missing request ID. New
  http_status/request_id/error_type body fields preserve request correlation.
  Mocked-delivery preflight passes; QA and200 cases make no fetch.
- Scout saved/read back digest
  bd7e4235ce1886f5011b3f86b5fc6fc300bb442b06cdcad82702a87b25f48d3f;
  same active event trigger, no stale binding; intake remains disarmed. Four
  roles updated and Reviewer branch grant demo/fix-delete added. Delete email
  and credit remain off pending accurate dedicated copy. Full Delete repair
  rehearsal remains unmeasured. Historical Export/Edit results above are retained.

- Production baseline cc06a24 deployed READY as dpl_DnieF5KsuS8xspMh84PLhVyMMBHE
  in10.011seconds from deployment creation (8.934seconds building-to-ready).
  Hosted actual500/crash/preservation passed. Exact QA request correlated in
  PostHog browser failure, server exception, acme-notes-api log and genuine Vercel
  serverless500 log. Normal customer pre-arm Delete also reached the native
  destination successfully; no repair requested. See demo/benchmarks/delete-500-baseline.json.
