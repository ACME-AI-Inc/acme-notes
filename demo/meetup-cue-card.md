# Fieldnotes live demo cue card

Open https://bird.composal.com and sign in as **info@pandelis.me**; any password works.
Final stage ARM is intended to last through **7:30 p.m. Pacific**. No new ARM prompt
is needed once the operator confirms it is armed.

Keep Sherlock Logs, Patch McFix, Captain Nitpick, Penny Perks, PostHog, GitHub PRs,
Vercel and the customer inbox in adjacent tabs.

1. **Show the product.** Open **At the water’s edge**, the second journal entry.
   “Four agents operate this app: Sherlock watches, Patch fixes, Captain reviews,
   and Penny looks after the customer. I’m the customer.”
2. **Rage-click Edit four times quickly in the same spot.**
   “The button looks fine, but nothing happens. I’m not submitting a ticket.”
3. **Show Sherlock.** It receives the scoped PostHog rageclick webhook and immediately routes the
   seeded unresponsive-button demo case, without extra evidence queries. Show the session
   and native $rageclick in PostHog; allow roughly one minute for native dispatch.
4. **Show the team.** Patch receives the evidence and fixes the button binding.
   Captain independently reviews that exact commit. Penny sends one proactive email.
5. **Show the PR and Vercel deployment.** Wait for Sherlock’s hosted acceptance.
   Then refresh the app, Edit a note, Save changes and reload to prove persistence.
   Show Penny’s verified resolution email.
6. **Trigger the proactive server case.** Open the same note → **… → Delete**.
   Show the big500 and “The shredder shredded itself.” The note is preserved.
   “This time the server crashed. I still haven’t filed feedback.”
7. **Show PostHog errors/logs and Sherlock.** The request ID links the actual500,
   server exception and logs. Patch makes the tiny server fix; Captain reviews;
   the approved PR merges and deploys.
8. **Refresh and retry Delete.** It succeeds and the note moves to Trash; reload
   and show Trash. Delete emails/credits are disabled; do not promise those sends.

If something stalls, send **Sherlock Logs**:
> Continue the current admitted incident. Reconcile the last teammate receipt and report the exact blocker. Do not create another incident or resend an uncertain email.

To stop new intake, send Sherlock **DISARM DEMO**. Existing admitted cases may
complete. Do not repeatedly click after a case is already admitted.

Final rehearsal: native rage detection, patch, independent review, PR4 merge,
matching Vercel release, hosted editing persistence and both PostHog emails passed.
It took about10minutes including a corrected cross-conversation release stall.
Build publication took11seconds after merge. Don’t promise an instant full repair;
start with Edit and use the waiting time to show the evidence and agent handoffs.

Fast demo mode is now active: intake provider queries and Patch reproduction are
skipped. Captain’s approval directly resumes the receiving Chief thread; Scout
forwards one backup continuation. Remaining platform scheduling/startup overhead
has not been removed. The revised end-to-end duration has not been remeasured.
