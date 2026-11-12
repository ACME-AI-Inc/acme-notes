# Sol Export repair rehearsal

PR [#1](https://github.com/ACME-AI-Inc/acme-notes/pull/1) repaired Export with
`noteText(exportNoteData)` → `noteText(note)`. This was an **assisted integration
rehearsal**, not an uninterrupted autonomous benchmark.

| Milestone | Elapsed from dispatch |
| --- | ---: |
| Sol low / ultrafast admitted | 0.8s |
| One-token patch applied | 26.6s |
| Local real Markdown download passed | 66.6s |
| Tested branch pushed | 72.6s |
| PR created through Chief's native GitHub integration | 6m 5.6s |
| Independent exact-SHA review approved | 13m 23.6s |
| PR merged | 13m 58.6s |
| Production ready | 14m 8.8s |
| Scout reported hosted download and telemetry acceptance | 18m 28.0s |

The helper's shell GitHub credential could push but received **403 Resource not
accessible by integration** when creating the PR. Chief's native `github_cli`
created it successfully after a manual continuation. A stale reviewer hold then
requested operator confirmation of already authorized work. Direct owner
confirmation resolved that. Repeated local and protected-preview checks also
added delay. None of that delay was Vercel build time.

Production deployment `dpl_FHi5mcvcbi9tXw1y8kWevqS2JycT` was READY on merge
`e1e949bf2d1fecfebc89677730be8b8fd315daba`. Push → ready measured **11.15s**;
build started → ready **6.531s**; installation/startup **0.199s**; output
publication **4.202s**. See the [deployment receipt](export-repair-production.json).

Scout independently verified a real `meeting.md` download containing the note's
title, body and list, then checked `note_exported` on the deployed SHA and no new
export failure/exception in the tested session. No preparation mode or injected
repair was used. No customer email or global ARM occurred.

The standing instructions now explicitly select Sol low / ultrafast for the
coding helper, leave PR creation and merge to Chief's native GitHub integration,
require serving built `dist`, and retain one local coder check plus independent
review and production acceptance. Reviewer accepts native team handoffs under
the operator's existing authorization. These corrections still need a fresh
uninterrupted run before claiming a faster end-to-end result.

[Milestones and interventions](export-sol-rehearsal.json)
