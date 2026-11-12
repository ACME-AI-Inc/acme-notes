import { spawnSync } from 'node:child_process'
import { writeFile } from 'node:fs/promises'

// Uses Vercel CLI authentication. Output deliberately excludes env values and account details.
const projectId = 'prj_zvcpKZtTKTQPNEmR3ytDBgFSb9IF'
const scope = 'composal'
const args = process.argv.slice(2)
const outputIndex = args.indexOf('--output')
const output = outputIndex >= 0 ? args[outputIndex + 1] : null
const requested = args.find((arg, i) => !arg.startsWith('--') && !(outputIndex >= 0 && i === outputIndex + 1))

function cli(...args) {
  const result = spawnSync('vercel', args, { encoding: 'utf8', timeout: 60000 })
  if (result.status !== 0) throw new Error(result.stderr || 'Vercel CLI failed')
  return { stdout: result.stdout, stderr: result.stderr }
}
function api(path) { return JSON.parse(cli('api', path, '--scope', scope, '--raw').stdout) }
const elapsed = (start, end) => typeof start === 'number' && typeof end === 'number' ? Math.round((end - start) * 1000) / 1000000 : null

let deploymentId = requested
if (!deploymentId) {
  const list = api(`/v6/deployments?projectId=${projectId}&target=production&limit=1`)
  deploymentId = list.deployments?.[0]?.uid
}
if (!deploymentId) throw new Error('No deployment found')
deploymentId = deploymentId.replace(/^https?:\/\//, '')
const deployment = api(`/v13/deployments/${encodeURIComponent(deploymentId)}`)
if (deployment.projectId !== projectId) throw new Error('Deployment is outside the Acme Notes project')
const logs = cli('inspect', deployment.id, '--logs', '--scope', scope)
const lines = `${logs.stdout}\n${logs.stderr}`.split('\n').flatMap((line) => {
  const match = line.match(/(\d{4}-\d\d-\d\dT[\d:.]+Z)\s+(.*)/)
  return match ? [{ timestamp: match[1], at: Date.parse(match[1]), text: match[2] }] : []
})
const find = (pattern) => lines.find((line) => pattern.test(line.text))
const phase = {
  runner_start: find(/^Running build in /),
  clone_start: find(/^Cloning /),
  clone_end: find(/^Cloning completed/),
  install_start: find(/^Running "install" command:/),
  package_manager: find(/^bun install v/),
  app_build_start: find(/^(> |\$ )node build\.mjs/),
  build_complete: find(/^Build Completed in /),
  publish_start: find(/^Deploying outputs/),
  publish_end: find(/^Deployment completed/),
  cache_start: find(/^Creating build cache/),
  cache_end: find(/^Build cache uploaded/),
}
const machine = deployment.resourceConfig?.buildMachine
const pushedAt = deployment.source === 'git' ? Number(deployment.meta?.repoPushedAt) || null : null
const report = {
  measured_at: new Date().toISOString(),
  project: `${scope}/acme-notes`,
  deployment: { id: deployment.id, url: `https://${deployment.url}`, sha: deployment.meta?.githubCommitSha, source: deployment.source, target: deployment.target, status: deployment.readyState },
  machine: machine ? { cores: machine.cores, memory_mb: machine.memory, purchase_type: machine.purchaseType, selection: machine.machineSelectionType, selection_source: machine.selectionSource } : null,
  api_timestamps_ms: { pushed: pushedAt, created: deployment.createdAt, building: deployment.buildingAt, ready: deployment.ready, alias_assigned: deployment.aliasAssignedAt, container_finished: deployment.buildContainerFinishedAt },
  api_durations_seconds: {
    push_to_admission: elapsed(pushedAt, deployment.createdAt),
    admission_and_provisioning: elapsed(deployment.createdAt, deployment.buildingAt),
    created_to_ready: elapsed(deployment.createdAt, deployment.ready),
    created_to_alias: elapsed(deployment.createdAt, deployment.aliasAssignedAt),
    build_to_ready: elapsed(deployment.buildingAt, deployment.ready),
    push_to_ready: elapsed(pushedAt, deployment.ready),
    push_to_alias: elapsed(pushedAt, deployment.aliasAssignedAt),
    build_to_container_finished: elapsed(deployment.buildingAt, deployment.buildContainerFinishedAt),
  },
  build_log_phases: Object.fromEntries(Object.entries(phase).map(([name, entry]) => [name, entry ? { timestamp: entry.timestamp, marker: entry.text } : null])),
  build_log_durations_seconds: {
    clone: elapsed(phase.clone_start?.at, phase.clone_end?.at),
    install_and_command_startup: elapsed(phase.install_start?.at, phase.app_build_start?.at),
    application_build_and_function_packaging: elapsed(phase.app_build_start?.at, phase.build_complete?.at),
    output_publication: elapsed(phase.publish_start?.at, phase.publish_end?.at),
    cache_after_publication: elapsed(phase.cache_start?.at, phase.cache_end?.at),
  },
  caveats: ['Git repoPushedAt may have one-second granularity.', 'Admission/provisioning is not pure queue time.', 'Build log phase times include infrastructure work between markers.', 'Cache creation can finish after production is already ready.'],
}
if (output) await writeFile(output, JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
