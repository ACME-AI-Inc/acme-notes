# Tonight: the customer-to-fix loop

The editor is being prepared; the baseline intentionally has no Edit button. Agent and email automation still need rehearsal. See
[the implementation plan](../roadmap/001-software-factory-demo.md) for readiness.

## The opening

"This is Acme Notes. Four agents operate it: one watches the product, one writes
code, one reviews releases, and one looks after customers. I'm going to be the
customer having a bad day."

## One story, four agents

1. Sign into Acme Notes using the demo inbox. Open Meeting notes.
2. Click/double-click the note text and look for an Edit button. The note stays read-only.
   Native rage/dead clicks may arrive; the complaint itself is the deterministic trigger.
3. Open the PostHog feedback widget. Submit:
   "I can't edit my notes. There's no Edit button. Can you add one?"
4. Show Signal Scout's case: user UUID, session/replay, feedback, and attempted-edit application logs. Do not imply a missing button creates a server exception.
5. Show Scout handing the issue to Chief Engineer and Customer Success.
6. The inbox receives an acknowledgment from Customer Success through PostHog.
7. Chief Engineer adds the missing Edit button and sends that minimal patch to Reviewer. The editor, Save/Cancel, persistence, and telemetry are already built.
8. Reviewer approves the exact SHA or requests corrections. Show the review evidence.
9. Chief Engineer deploys that approved SHA. Scout opens Edit, changes the note, saves, and reloads to verify persistence. A green deployment alone does not close the case.
10. Customer Success records one demo credit and requests the resolution email through PostHog.
11. Refresh the app, show the edited note, and show the credit and inbox message.

## Narration at the handoffs

- Detection: "PostHog ties the complaint to the person's actual session and attempted editing."
- Coding: "The monitoring agent doesn't patch it. It hands evidence to the engineer."
- Review: "A separate agent reviews the commit that will actually ship."
- Release: "We retry the customer's failed action on the deployed version."
- Customer: "The team closes the loop with the person who hit the bug."

Use "Replay Vision found this" only when a real scanner observation exists. A raw
rage-click event and a playable recording are useful evidence, but are distinct
from a Replay Vision observation.

## Suggested presentation budget

- 0:00-0:30: introduce the product and four agent roles.
- 0:30-1:15: experience the missing Edit button and submit feedback.
- 1:15-2:00: show the correlated case and acknowledgment.
- 2:00-4:30: show the engineering/review/release work already in progress.
- 4:30-5:30: save a note, reload, and show the credit and resolution email.
- 5:30-6:00: show the complete trace and explain the division of responsibilities.

These are presentation targets, not verified runtime estimates. If the full loop
takes longer in rehearsal, start the real customer run shortly before presenting,
then show its timestamped work as it finishes. Keep a labeled rehearsal recording
for a slow build, model, network, scanner, or inbox.

## Draft customer messages

Acknowledgment subject: **We're looking into your missing Edit button**

"Thanks for reporting this. We can see that you could not open an editor in your session and our
engineering team is investigating. We'll update you when we've verified a fix."

Resolution subject: **You can now edit your Acme Notes**

"We've added the Edit button and verified that changes save correctly. Please
refresh Acme Notes, click Edit, change your note, and save. We've also added one month of Acme Pro
as a demo credit. Thanks for helping us catch this."

The credit sentence is sent only when the entitlement is actually recorded.
Use a support update and a separate discount message if the final sending rules
require different categories. The sender is Acme Notes <support@demo.composal.ai>; the demo recipient remains to be supplied.

## Before going on stage

- One named test inbox, one verified sender, four active agents with correct tool access.
- A working PostHog feedback widget; first response linked to the same UUID/session.
- The prepared editor baseline with no Edit button; a one-line source button patch opens it.
- Real browser events/replay/logs in PostHog and a proven automatic Scout trigger or clearly labeled poll.
- A deploy action connected to the approved SHA; the Composal Vercel project now has the GitHub link.
- Two full rehearsals and a duplicate-trigger test.
- Record the baseline deployment, event/workflow/agent IDs, and reset procedure.
- Pre-open app, agents, PostHog evidence, GitHub diff/review, Vercel deployment, and inbox.

## Alternate stories

- **Backup:** the existing dark-mode reset bug is easy to reproduce and already
  has a feature flag. It demonstrates feedback/replay, but does not create Vercel
  server error logs on this static app.
- **Later:** inbound support email. Add this only after the native PostHog survey
  path works; it needs a separate real mailbox trigger and identity mapping.

## Things the audience should see

A real customer action, real telemetry, explicit agent handoffs, an actual source
patch, an independent review, the exact deployed commit, the successful Edit → Save → Reload journey, and an email in the customer's inbox. Keep all synthetic discounts labeled.

## The prepared repair

The entire live code change is adding this control to the note header:

```html
<button class="btn" data-action="edit-note">Edit</button>
```

The baseline already has the editor, delegated event handling, Save/Cancel,
validation, user-scoped local persistence, and telemetry. Do not change those
during the live repair. This is a real missing UI affordance, not a hidden feature
flag or a manufactured server failure. Tests may inject the button in an isolated
DOM during preparation; the actual demo must deploy a source change.
