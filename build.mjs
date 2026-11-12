import { build } from 'esbuild'
import { cp, mkdir, rm } from 'node:fs/promises'
import { loadEnvFile } from 'node:process'

try { loadEnvFile('.env.local') } catch (error) { if (error.code !== 'ENOENT') throw error }

await rm('dist', { recursive: true, force: true })
await mkdir('dist', { recursive: true })
for (const file of ['index.html', 'logo.svg', 'logo.png', 'apple-touch-icon.png', 'healthz']) {
  await cp(file, `dist/${file}`)
}
await build({
  entryPoints: ['telemetry.js'],
  outfile: 'dist/telemetry.js',
  bundle: true,
  format: 'iife',
  // Keep source readable for exception stack traces. No private API key is used.
  minify: false,
  define: {
    __POSTHOG_KEY__: JSON.stringify(process.env.POSTHOG_KEY || ''),
    __POSTHOG_HOST__: JSON.stringify(process.env.POSTHOG_HOST || ''),
    __APP_ENV__: JSON.stringify(process.env.VERCEL_ENV || 'development'),
    __APP_VERSION__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA || '1.0.0'),
  },
})
