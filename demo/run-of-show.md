# Acme Notes: tonight's operating script

Production: https://acme-notes-phi.vercel.app
Customer: **info@pandelis.me**. Any password works; this is a browser-local demo account.
Sender: **Acme Notes <support@demo.composal.ai>**, PostHog EU project **347307**.

## Open these tabs

- [Acme Notes](https://acme-notes-phi.vercel.app)
- [Signal Scout](https://composal.com/acme/agent/acme-signal-scout)
- [Chief Engineer](https://composal.com/acme/agent/e2e-github-discovery-20261112)
- [Release Reviewer](https://composal.com/acme/agent/acme-release-reviewer)
- [Customer Success](https://composal.com/acme/agent/acme-customer-success)
- PostHog [recordings](https://eu.posthog.com/project/347307/replay), [feedback](https://eu.posthog.com/project/347307/surveys/01a1d173-8f97-0000-50e6-7169f2bdd37f), [logs](https://eu.posthog.com/project/347307/logs), and [errors](https://eu.posthog.com/project/347307/error-tracking).
- [GitHub PRs](https://github.com/ACME-AI-Inc/acme-notes/pulls), [Vercel](https://vercel.com/composal/acme-notes), and the customer's inbox.

Hard-refresh production after the latest deployment. Sign in as info@pandelis.me
and open Meeting notes. Keep the same browser profile throughout the demo so the
app UUID, session, feedback and email identity stay linked.

The baseline has **no Edit button**, and **Export fails**. Both working behaviors
are prepared; each incident needs a tiny source fix. The minute monitor is enabled,
but its durable gate remains `armed=false` until the operator arms it.

## Arm the team

Send this to **Signal Scout** only when ready for the real repair:

> ARM DEMO acme-meetup-20261112. Set the durable armed timestamp to now. Monitor only fresh non-QA evidence for info@pandelis.me in EU PostHog project 347307 and composal/acme-notes. Handle missing Edit feedback and note_export errors as distinct incidents. Chief Engineer may make the minimal patch, request independent exact-SHA review, open a PR, merge after approval and successful checks, and verify the matching production deployment. Customer Success may use the approved editing-support workflows only for the editing case after its identity and resolution gates pass. Never process historical QA or preflight evidence.

Do not arm while preparing or before the audience should see the broken baseline.

## Opening narration

“This is Acme Notes. Four agents operate it: one watches the product, one writes
code, one reviews releases, and one looks after customers. I'll be the customer.”

## Scene 1: I cannot edit my notes

1. In Meeting notes, double-click the text two or three times. Look for Edit.
   Say: “I made a note, but now I can't change it.”
2. Click the right-side **Feedback** tab, select **I need help**, then **Next**.
   Enter **“I can't edit my notes. There's no Edit button. Can you add one?”**
   and **Send feedback**. Complete both questions; the first answer alone is not a case.
3. Show Scout receiving the webhook and correlating the response with the UUID,
   session, attempted-edit event, application log and recording. The minute poll is backup.
4. Show native handoffs to Engineer and Customer Success. The inbox receives one
   PostHog acknowledgment; that does not mean the fix has shipped.
5. Engineer adds only this control to the note header:

   ```html
   <button class="btn" data-action="edit-note">Edit</button>
   ```

6. Reviewer reads the diff and tests and approves the exact head SHA. Engineer
   opens/merges the PR after that decision and checks. GitHub main deploys to Vercel.
7. Show the deployed SHA. Refresh, reopen Meeting notes, **Edit**, change title
   and content, **Save changes**, then reload and reopen the same note.
8. Scout records hosted acceptance; only then may Customer Success request the
   resolution email. A synthetic $20 demo credit may be recorded in its ledger.
   It is not real money, a billing discount or an entitlement shown in this app.

Narration: “The monitor supplies evidence. The engineer writes the patch. A
separate agent reviews what ships. Then we retry the customer's original action.”

## Scene 2: an error fixed before I complain

1. Keep the demo armed. Open Meeting notes, then **… → Export**.
2. The app shows **Export failed. Please try again.** There is no special error button.
   Say: “This time I won't file feedback. The product reports the exception itself.”
3. Show the real PostHog `ReferenceError`, structured error log and replay:
   `exportNoteData is not defined`, operation `note_export`.
4. PostHog's `note_export_failed` event invokes the authenticated webhook. Scout
   correlates the exception/Logs and opens one separate incident without a complaint.
5. Engineer changes **`noteText(exportNoteData)` → `noteText(note)`** on
   `demo/fix-export`. Reviewer approves that SHA; Engineer opens the PR, merges
   after review/checks, and waits for the matching production deployment.
6. Refresh and retry **… → Export**. A real **meeting.md** download must contain
   the selected note's title, paragraphs and list. Show the downloaded file.
7. Scout marks acceptance after the actual download succeeds and no new export
   failure appears for the retried action. Editing-support emails are not reused
   for Export; separate export copy exists only as an inactive draft.

This is a browser exception and application error log, not a Vercel server 500.
Vercel runtime logs apply to the server-side webhook relay.

## If something stalls

Send Scout:

> Check the armed incident, deduplicate source events and reconcile the last native teammate delivery. Report the missing evidence or receipt. Continue the existing case; do not duplicate incidents or resend an uncertain email.

Send Engineer:

> Continue Scout's incident in the existing assigned checkout. Make the smallest fix, send the actual diff, tests and head SHA to Reviewer, and merge only the reviewed SHA after checks pass. Report the exact production deployment to Scout; do not close the case yourself.

Native handoffs use `team_agent_send` / `team_agent_read`. The newer
`send_thread_message` and `work_publish` routes are gated off in ACME.

## Checks, limits and reset

- Preparation: `npm run demo:check -- <url> --prepare` and
  `npm run demo:check-export -- <url> --prepare`. These apply future tiny fixes
  inside isolated browsers and leave the real baseline broken.
- Release acceptance: run the relevant command **without `--prepare`**.
  Engineer's isolated Linux test process uses `PLAYWRIGHT_MCP_SANDBOX=false` and
  `PLAYWRIGHT_MCP_ISOLATED=true`; host Chrome settings are unchanged.
- Production replay capture uses `/n-sync`. If the list looks empty, use the EU
  project, clear duration/activity/playlist filters, or open a verified direct replay link.
  A session ID alone does not prove a stored recording exists.
- The sender is verified; both editing-support workflows are active. Activation
  sent no emails. Actual inbox delivery still needs the real demo run.
- Replay Vision is separate from replay and rage clicks. No Vision scanner is
  provisioned by this setup; claim a finding only with a real scanner observation.
- The dedicated webhook credential expires **2026-11-13 20:40 UTC**. Renew it
  for later demos. The agents' MCP accounts are separate from this credential.
- Disarm before resetting. Revert only demo repair commits through ordinary
  reviewed commits; never force-push or reset unrelated changes. A fresh browser
  creates a new mock identity and clean notes; never blindly reuse an old email request.
- The full autonomous repair/inbox loop has not been rehearsed end to end while
  preserving this baseline. Report actual timings and pending states. Use an
  explicitly labeled rehearsal recording if live services are slow.
