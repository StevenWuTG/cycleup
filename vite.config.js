import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Narrows the Content-Security-Policy in dist/_headers from every *.supabase.co
// to this project's own Supabase host, so a listing can't load images from (or
// the app connect to) some other Supabase project. The host comes from the build
// environment (VITE_SUPABASE_URL), so it never has to be committed.
function scopeCspToSupabase() {
  let config
  return {
    name: 'scope-csp-to-supabase',
    apply: 'build',
    configResolved(resolved) { config = resolved },
    closeBundle() {
      const url = loadEnv(config.mode, config.envDir, 'VITE_').VITE_SUPABASE_URL
      const file = path.resolve(config.root, config.build.outDir, '_headers')
      if (!url || !fs.existsSync(file)) {
        console.warn('[scope-csp-to-supabase] skipped: no VITE_SUPABASE_URL or no dist/_headers')
        return
      }
      const host = new URL(url).host
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll('*.supabase.co', host))
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), scopeCspToSupabase()],
  server: {
    historyApiFallback: true,
  },
})
