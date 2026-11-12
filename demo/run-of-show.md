# Acme Notes: tonight's operating script

Production: https://acme-notes-phi.vercel.app
Customer: **info@pandelis.me**. Any password works; this is a browser-local demo account.
Sender: **Acme Notes <support@demo.composal.ai>**, PostHog EU project **347307**.

The team: **Sherlock Logs** monitors product signals; **Patch McFix** writes code;
**Captain Nitpick** reviews releases; **Penny Perks** handles customer support.

## Open these tabs

- [Acme Notes](https://acme-notes-phi.vercel.app)
- [Sherlock Logs](https://composal.com/acme/agent/acme-signal-scout)
- [Patch McFix](https://composal.com/acme/agent/e2e-github-discovery-20261112)
- [Captain Nitpick](https://composal.com/acme/agent/acme-release-reviewer)
- [Penny Perks](https://composal.com/acme/agent/acme-customer-success)
- PostHog [recordings](https://eu.posthog.com/project/347307/replay), [feedback](https://eu.posthog.com/project/347307/surveys/01a1d173-8f97-0000-50e6-7169f2bdd37f), [logs](https://eu.posthog.com/project/347307/logs), and [errors](https://eu.posthog.com/project/347307/error-tracking).
- [GitHub PRs](https://github.com/ACME-AI-Inc/acme-notes/pulls), [Vercel](https://vercel.com/composal/acme-notes), and the customer's inbox.

Hard-refresh production after the latest deployment. Sign in as info@pandelis.me
and open Meeting notes. Keep the same browser profile throughout the demo so the
app UUID, session, feedback and email identity stay linked.

The final onstage baseline must have **no Edit button**, and **Delete returns500 with the crash screen**. Export works.
During rehearsal, check the current source/release before expecting either bug. Both working behaviors
are prepared; each incident needs a tiny source fix. Native PostHog webhooks drive the monitor; minute polling is disabled.
Its durable gate remains `armed=false` until the operator arms it.

## Arm the team

Send this to **Sherlock Logs** only when ready for the real repair:

> ARM DEMO acme-meetup-20261112. Set the durable armed timestamp to now. Monitor only fresh non-QA evidence for info@pandelis.me in EU PostHog project 347307 and composal/acme-notes. Resolve the customer's current non-QA production session. Handle missing Edit feedback and note_delete_failed with operation note_delete, actual http_status500 and fingerprint note-delete-reference-error as distinct incidents. Allow both sequential scenes for45minutes, auto_disarm_after_admission=false, baseline_sha=null so the approved first fix does not block the second scene. Patch McFix may make the minimal patch, request independent exact-SHA review, open a PR, merge after approval and successful checks, and verify the matching production deployment. Penny Perks may use the approved editing-support workflows only for the editing case after its identity and resolution gates pass. Never process historical QA or preflight evidence.

Do not arm while preparing or before the audience should see the broken baseline.

## Opening narration

“This is Acme Notes. Four agents operate it: one watches the product, one writes
code, one reviews releases, and one looks after customers. I'll be the customer.”

## Scene 1: I cannot edit my notes

1. In Meeting notes, double-click the text two or three times. Look for Edit.
   Say: “I made a note, but now I can't change it.”
2. Click **Feedback** beside **Share** in the top bar, select **I need help**, then **Next**.
   Enter **“I can't edit my notes. There's no Edit button. Can you add one?”**
   and **Send feedback**. Complete both questions; the first answer alone is not a case.
3. Show Scout receiving the webhook and correlating the response with the UUID,
   session, attempted-edit event, application log and recording. There is no minute poll.
4. Show native handoffs to Engineer and Penny Perks. The inbox receives one
   PostHog acknowledgment; that does not mean the fix has shipped.
5. Engineer adds only this control to the note header:

   ```html
   <button class="btn" data-action="edit-note">Edit</button>
   ```

6. Reviewer reads the diff and tests and approves the exact head SHA. Engineer
   opens/merges the PR after that decision and checks. GitHub main deploys to Vercel.
7. Show the deployed SHA. Refresh, reopen Meeting notes, **Edit**, change title
   and content, **Save changes**, then reload and reopen the same note.
8. Scout records hosted acceptance; only then may Penny Perks request the
   resolution email. A synthetic $20 demo credit may be recorded in its ledger.
   It is not real money, a billing discount or an entitlement shown in this app.

Narration: “The monitor supplies evidence. The engineer writes the patch. A
separate agent reviews what ships. Then we retry the customer's original action.”

## Scene 2: an error fixed before I complain

1. Keep the demo armed. Open **Meeting notes → … → Delete**.
2. The actual server request fails with **HTTP500**. The entire app changes to a
   large red500 and **“The shredder shredded itself.”** Your note remains safe.
   Say: “This time I won't file feedback. The product reports the crash itself.”
3. Show PostHog's `note_delete_failed` and `ReferenceError`:
   `deleteRequest is not defined`, operation `note_delete`, http_status500.
   The browser event, server exception, PostHog log (`acme-notes-api`) and real
   Vercel function log share a request ID. Open the recording for the visible crash.
4. PostHog invokes Scout's native webhook. Scout admits one proactive incident
   without a complaint and hands it to Chief. Repeated retries remain one case.
5. Engineer changes **`deleteRequest` → `deletionRequest`** in
   `api/notes/delete.js`, on `demo/fix-delete`. Reviewer approves that exact SHA;
   Engineer opens/merges its PR after review/checks and verifies the matching deployment.
6. Refresh and retry **Meeting notes → … → Delete**. The actual API must return200,
   the note moves to **Trash**, and it stays there after reload. Show Trash.
7. Scout records hosted acceptance of Delete → Trash → Reload. Delete emails and
   credits are off until separate accurate copy is configured; editing-support copy
   is never reused for this case.

The monitor is **Sherlock Logs**. It uses the existing native webhook, not another
poller. ARM is required before onstage clicks can start repairs. The platform
currently admits native deliveries on a roughly one-minute sweep; do not promise
instant dispatch. This new Delete path has baseline checks; full review/repair
loop timing is not yet measured for Delete.

## If something stalls

Send Scout:

> Check the armed incident, deduplicate source events and reconcile the last native teammate delivery. Report the missing evidence or receipt. Continue the existing case; do not duplicate incidents or resend an uncertain email.

Send Engineer:

> Continue Scout's incident in the existing assigned checkout. Make the smallest fix, send the actual diff, tests and head SHA to Reviewer, and merge only the reviewed SHA after checks pass. Report the exact production deployment to Scout; do not close the case yourself.

Native handoffs use `team_agent_send` / `team_agent_read`. The newer
`send_thread_message` and `work_publish` routes are gated off in ACME.

## Checks, limits and reset

- Seeded Delete check: `npm run demo:check-delete -- <url> --expect-error` verifies
  actual500, the crash screen and note preservation. Local API: build, then
  `npm run demo:serve -- --port 8792`.
- Delete release acceptance: `npm run demo:check-delete -- <url>` requires actual200
  and Trash persistence. No injected or mocked fix.
- Edit preparation only: `npm run demo:check -- <url> --prepare` checks the
  prebuilt editor in an isolated browser and leaves the source button absent.
- Release acceptance: run the relevant command **without `--prepare`**.
  Engineer's isolated Linux test process uses `PLAYWRIGHT_MCP_SANDBOX=false` and
  `PLAYWRIGHT_MCP_ISOLATED=true`; host Chrome settings are unchanged.
- Production replay capture uses `/n-sync`. If the list looks empty, use the EU
  project, clear duration/activity/playlist filters, or open a verified direct replay link.
  A session ID alone does not prove a stored recording exists.
- The sender is verified; both editing-support workflows are active. Activation
  sent no emails. The acknowledgment arrived in the customer inbox during rehearsal; resolution is logged sent but inbox arrival remains unconfirmed.
- Replay Vision is separate from replay and rage clicks. No Vision scanner is
  provisioned by this setup; claim a finding only with a real scanner observation.
- Native webhook credentials remain in encrypted PostHog inputs and Composal.
  The old relay destination is disabled; its separate credential expires
  **2026-11-13 20:40 UTC** and is retained only until cutover acceptance.
- Disarm before resetting. Revert only demo repair commits through ordinary
  reviewed commits; never force-push or reset unrelated changes. A fresh browser
  creates a new mock identity and clean notes; never blindly reuse an old email request.
- The first native feedback rehearsal reached reviewed/deployed Edit acceptance
  and both PostHog support sends. It needed configuration corrections and took
  longer than the six-minute target. Inbox delivery remains unconfirmed. Use the
  benchmark receipts and clearly label rehearsal evidence if live services are slow.
