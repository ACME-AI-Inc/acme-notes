# Vercel demo release timings

Measured on 2026-11-12 for **composal/acme-notes**. These are real production
deployment/API/build-log receipts, not estimates from a local build.

| Stage | npm + Standard baseline | Bun + Turbo first Git deployment | Bun + Turbo same-SHA warm redeploy |
| --- | ---: | ---: | ---: |
| Admission and provisioning | 1.024s | 0.774s | 0.906s |
| Install and command startup | 2.370s | 0.176s | 0.465s |
| App build and function packaging | 0.548s | 0.834s | 0.945s |
| Output publication | 4.146s | 4.196s | 4.292s |
| Build started → ready | 8.112s | 6.202s | 6.875s |
| Deployment created → ready | 9.136s | 6.976s | 7.781s |
| Git push → ready | 13.544s | 9.395s | Not a Git push |

The main observed gain is dependency installation. Output publication still takes
about **4.2 seconds** and dominates the optimized path. Both package manager and
runner changed together, so these measurements do not prove a separate Turbo CPU
benefit. The preceding five production Git deployments had a median push-to-ready
time of **12.186 seconds**; Git delivery itself varies and its source timestamp
can have one-second granularity. Do not attribute all push-to-ready improvement
to the build configuration.

## Applied settings

- Project-only fixed **Turbo: 30 vCPU / 60GB**; no plan or team-wide changes.
- On-demand concurrency enabled, with `SKIP_NAMESPACE_QUEUE` explicitly selected.
- `bun install --frozen-lockfile`, preserving resolved dependency versions.
- `bun run build`, which deliberately executes the existing **Node 26**
  `node build.mjs` command. The relay function also retains its Node runtime.
- Frozen Bun lockfile added; npm lockfile retained for existing `npm ci` agent
  checks. Production uses the explicit Bun install command.
- All `/n-sync` proxy paths, trailing-slash handling, SPA exclusions, API code,
  missing Edit control and intentional Export error remain unchanged.

The installed local Bun was **1.3.11**; the actual Vercel builds used **1.3.14**.
The package-manager metadata now matches the observed Vercel version. Vercel's
bundled binary is used directly to avoid a version-download step; the metadata
alone does not guarantee Vercel will keep that exact patch version indefinitely.
The frozen lockfile fixes dependencies. Forcing the entire build to use local Bun
failed because Bun 1.3.11 lacks the named `node:process.loadEnvFile` export, so no
Bun function/runtime migration was made.

Local checks: frozen install, build and the three relay authorization/audience/
retry tests passed. Production checks confirmed `/` and `/healthz` respond 200;
unauthenticated relay calls remain 401; ingestion paths reach PostHog and reject
missing credentials/payloads correctly. The public SDK still uses `/n-sync`.

## Cost

Published CPU-minute pricing gives **$0.014 per rounded billable minute** for
4-CPU Standard and **$0.105** for 30-CPU Turbo: **$0.091 more per subminute build**
before included credit or discounts. Builds are rounded up to a minute, so these
short deployments still count as one billable minute. This is an estimate from
published rates, not an invoice. On-demand concurrency was already enabled for
the project; it remains enabled and only used builds incur usage.

[Build machine, concurrency and billing documentation](https://vercel.com/docs/builds/managing-builds)
· [Package manager selection](https://vercel.com/docs/package-managers)

## Receipts and reuse

- [Baseline](baseline-npm-standard.json): `dpl_5zDNU7QD66R617B7gSs1tuLMrMxw`, source `da1c78f`.
- [First optimized](optimized-bun-turbo-first.json): `dpl_3g1b6Rkgbu7kgSGzbXbhYQ2RqPid`, source `bb78f3e`.
- [Warm optimized](optimized-bun-turbo-warm.json): `dpl_B3yDxkaN26q7j4SUxSMBPS3XLpXd`, same source `bb78f3e`.
- [Project settings and cost inputs](project-speed-settings.json).
- [Directional local package-manager measurements](local-package-manager.json).

For the actual agent repair deployment, collect a fresh receipt:

```sh
node demo/benchmarks/measure-vercel.mjs <deployment-id-or-hostname> --output /tmp/acme-repair-deployment.json
```

The collector uses existing Vercel CLI authentication and excludes environment
values and billing/account details from its output. The full agent-to-review-to-
merge time must be measured separately; it is not included in this build table.

## Agent repair rehearsal

The [Sol Export rehearsal](export-sol-rehearsal.md) separates 72.6 seconds to a
tested pushed patch from integration/review delays. Its real production release
took 11.15 seconds push to ready and6.531 seconds build to ready. This was an
assisted integration rehearsal, not an uninterrupted autonomous timing claim.

[Native webhook preflight](native-webhook-preflight.json) records actual delivery,
guard and main-continuation timestamps. PostHog HTTP delivery is fast, but native
workflow admission currently adds measurable delay; no instant processing claim.

The [first complete native Edit integration rehearsal](edit-native-rehearsal.json)
passed hosted editing12m43s after the complaint and logged the resolution email
as sent at14m44s. It included scope/credit configuration corrections. This misses
the six-minute presentation target; intake and review are being shortened and a
fresh uninterrupted timing is required. The actual Vercel release took10.898s.
Both support emails were logged as sent, with inbox delivery still unconfirmed.
