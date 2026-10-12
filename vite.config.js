import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('.', import.meta.url))

// Models the tutor proxy will forward to (mirrors MODELS in Assistant.jsx).
const TUTOR_MODELS = new Set(['claude-haiku-4-5', 'claude-sonnet-4-6', 'claude-opus-4-8'])
const DEFAULT_TUTOR_MODEL = 'claude-haiku-4-5'
const MAX_BODY = 256 * 1024

// Server-side proxy for the AI tutor. The Anthropic key is read from
// ANTHROPIC_API_KEY (in .env.local or the environment) and attached here, on
// the server, so it is never bundled into the client JS or sent to the browser.
// Runs for both `npm run dev` and `npm run preview`.
function tutorProxy(apiKey) {
  const send = (res, status, obj) => {
    res.statusCode = status
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(obj))
  }
  const readBody = (req) => new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (c) => {
      size += c.length
      if (size > MAX_BODY) { reject(new Error('too-large')); req.destroy() } else chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })

  const handler = async (req, res, next) => {
    const path = (req.url || '').split('?')[0]
    if (!path.startsWith('/api/tutor')) return next()

    // Only accept calls from this app's own pages, not other sites the user visits.
    const origin = req.headers.origin
    if (origin) {
      let host = ''
      try { host = new URL(origin).host } catch {}
      if (host !== req.headers.host) return send(res, 403, { error: { message: 'Forbidden origin.' } })
    }

    if (path === '/api/tutor/status') return send(res, 200, { enabled: !!apiKey })
    if (path !== '/api/tutor' || req.method !== 'POST') return send(res, 404, { error: { message: 'Not found.' } })
    if (!apiKey) return send(res, 503, { error: { message: 'No ANTHROPIC_API_KEY is configured on the server.' } })

    let body
    try { body = JSON.parse(await readBody(req)) } catch { return send(res, 400, { error: { message: 'Bad request.' } }) }
    if (!Array.isArray(body.messages) || body.messages.length === 0) return send(res, 400, { error: { message: 'Bad request.' } })

    const payload = {
      model: TUTOR_MODELS.has(body.model) ? body.model : DEFAULT_TUTOR_MODEL,
      max_tokens: Math.min(Math.max(Number(body.max_tokens) || 800, 1), 1024),
      system: typeof body.system === 'string' ? body.system : undefined,
      messages: body.messages,
    }
    try {
      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify(payload),
      })
      res.statusCode = upstream.status
      res.setHeader('content-type', 'application/json')
      res.end(await upstream.text())
    } catch {
      send(res, 502, { error: { message: 'Could not reach the Anthropic API.' } })
    }
  }

  return {
    name: 'tutor-proxy',
    configureServer(server) { server.middlewares.use(handler) },
    configurePreviewServer(server) { server.middlewares.use(handler) },
  }
}

// Base is relative so the built app also works when opened from a static host
// or a subpath. Dev server just runs on the default port.
export default defineConfig(({ mode }) => {
  // '' prefix = load every variable, including the non-VITE_ ANTHROPIC_API_KEY.
  // Only VITE_* variables are ever exposed to client code, so this stays server-side.
  const env = loadEnv(mode, ROOT, '')
  return {
    plugins: [react(), tutorProxy(env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY)],
    base: './',
    root: ROOT,
  }
})
