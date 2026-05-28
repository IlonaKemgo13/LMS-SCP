/**
 * Load Test Script — LMS-SCP API Routes
 *
 * Simulates concurrent requests against the API and reports:
 *   - Total requests, successful, failed
 *   - Average response time, p95 response time
 *   - Requests per second
 *
 * Usage:
 *   node __tests__/load/load-test.js [baseUrl] [--concurrency N]
 *
 * Examples:
 *   node __tests__/load/load-test.js
 *   node __tests__/load/load-test.js http://localhost:3000
 *   node __tests__/load/load-test.js http://localhost:3000 --concurrency 50
 *
 * NOTE: Without a real running server the requests will fail with ECONNREFUSED.
 * The script will still report statistics for all attempted requests.
 */

'use strict'

const http  = require('http')
const https = require('https')
const { URL } = require('url')

// ── Config ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const BASE_URL = args.find(a => a.startsWith('http')) ?? 'http://localhost:3000'
const concurrencyArg = args.indexOf('--concurrency')
const DEFAULT_CONCURRENCY = concurrencyArg !== -1 ? parseInt(args[concurrencyArg + 1], 10) : 50

const ROUTES = [
  { path: '/api/student/dashboard', method: 'GET' },
  { path: '/api/admin/stats',       method: 'GET' },
  { path: '/api/teacher/stats',     method: 'GET' },
]

const CONCURRENCY_LEVELS = [50, 100, 200]

// ── HTTP Request Helper ────────────────────────────────────────────────────────
function makeRequest(url, method = 'GET', headers = {}) {
  return new Promise((resolve) => {
    const start = Date.now()
    const parsed = new URL(url)
    const lib = parsed.protocol === 'https:' ? https : http

    const options = {
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path:     parsed.pathname + parsed.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: 10000,
    }

    const req = lib.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        resolve({
          status:       res.statusCode,
          duration:     Date.now() - start,
          success:      res.statusCode < 500,
          error:        null,
        })
      })
    })

    req.on('timeout', () => {
      req.destroy()
      resolve({ status: 0, duration: Date.now() - start, success: false, error: 'TIMEOUT' })
    })

    req.on('error', (err) => {
      resolve({ status: 0, duration: Date.now() - start, success: false, error: err.code ?? err.message })
    })

    req.end()
  })
}

// ── Stats Calculator ───────────────────────────────────────────────────────────
function calcStats(durations) {
  if (durations.length === 0) return { avg: 0, p95: 0, min: 0, max: 0 }
  const sorted = [...durations].sort((a, b) => a - b)
  const avg    = Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length)
  const p95    = sorted[Math.floor(sorted.length * 0.95)]
  return { avg, p95, min: sorted[0], max: sorted[sorted.length - 1] }
}

// ── Run a batch of concurrent requests ────────────────────────────────────────
async function runBatch(url, method, count) {
  const promises = Array.from({ length: count }, () => makeRequest(url, method))
  return Promise.all(promises)
}

// ── Print a results table ──────────────────────────────────────────────────────
function printTable(rows) {
  const headers  = ['Route', 'Concurrency', 'Total', 'Success', 'Failed', 'Avg(ms)', 'p95(ms)', 'Req/s']
  const widths   = headers.map((h) => h.length)

  rows.forEach((row) => {
    row.forEach((cell, i) => {
      widths[i] = Math.max(widths[i], String(cell).length)
    })
  })

  const line = widths.map((w) => '-'.repeat(w + 2)).join('+')
  const header = headers.map((h, i) => ` ${h.padEnd(widths[i])} `).join('|')

  console.log('+' + line + '+')
  console.log('|' + header + '|')
  console.log('+' + line + '+')
  rows.forEach((row) => {
    const rowStr = row.map((cell, i) => ` ${String(cell).padEnd(widths[i])} `).join('|')
    console.log('|' + rowStr + '|')
  })
  console.log('+' + line + '+')
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║          LMS-SCP API Load Test Report        ║')
  console.log('╚══════════════════════════════════════════════╝\n')
  console.log(`Base URL   : ${BASE_URL}`)
  console.log(`Routes     : ${ROUTES.map(r => r.path).join(', ')}`)
  console.log(`Concurrency: ${CONCURRENCY_LEVELS.join(', ')} concurrent requests per route\n`)

  const allRows = []
  const summary = { total: 0, success: 0, failed: 0 }

  for (const { path, method } of ROUTES) {
    const url = `${BASE_URL}${path}`
    console.log(`\nTesting route: ${method} ${path}`)
    console.log('─'.repeat(50))

    for (const concurrency of CONCURRENCY_LEVELS) {
      process.stdout.write(`  Concurrency ${concurrency.toString().padStart(3)}: sending requests...`)

      const start   = Date.now()
      const results = await runBatch(url, method, concurrency)
      const elapsed = (Date.now() - start) / 1000  // seconds

      const successful = results.filter(r => r.success).length
      const failed     = results.length - successful
      const durations  = results.map(r => r.duration)
      const { avg, p95 } = calcStats(durations)
      const rps        = Math.round(concurrency / elapsed)

      summary.total   += concurrency
      summary.success += successful
      summary.failed  += failed

      process.stdout.write(` done\n`)

      allRows.push([
        path,
        concurrency,
        results.length,
        successful,
        failed,
        avg,
        p95,
        rps,
      ])

      // Error breakdown
      const errors = results.filter(r => r.error).reduce((acc, r) => {
        acc[r.error] = (acc[r.error] ?? 0) + 1
        return acc
      }, {})
      if (Object.keys(errors).length > 0) {
        console.log(`    Errors: ${JSON.stringify(errors)}`)
      }

      // Brief pause between runs to avoid flooding
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log('\n\n── Results Table ─────────────────────────────────────────────────────────')
  printTable(allRows)

  console.log('\n── Summary ───────────────────────────────────────────────────────────────')
  console.log(`Total requests  : ${summary.total}`)
  console.log(`Successful      : ${summary.success} (${Math.round(summary.success / summary.total * 100)}%)`)
  console.log(`Failed          : ${summary.failed} (${Math.round(summary.failed / summary.total * 100)}%)`)

  if (summary.failed > 0) {
    const failureRate = summary.failed / summary.total
    if (failureRate > 0.1) {
      console.log('\n⚠  PERFORMANCE WARNING: >10% failure rate detected.')
      console.log('   Possible causes: server not running, rate limiting, or resource exhaustion.')
    }
  }

  // Status codes summary
  console.log('\n── Status Code Distribution ──────────────────────────────────────────────')
  const allResults = allRows.map(r => ({ success: r[3], failed: r[4], total: r[2] }))
  console.log('  (Note: 401/403 responses are expected without valid auth cookies)')
  console.log('  These count as "successful" (non-5xx) responses in the above table.')
  console.log('  A 401 for /api/student/dashboard means the auth middleware is working.')

  console.log('\n── Performance Thresholds ────────────────────────────────────────────────')
  const avgTimes = allRows.map(r => r[5])
  const maxAvg   = Math.max(...avgTimes)
  const p95Times = allRows.map(r => r[6])
  const maxP95   = Math.max(...p95Times)

  if (maxAvg > 500) {
    console.log(`⚠  Average response time (${maxAvg}ms) exceeds 500ms threshold`)
  } else {
    console.log(`✓  Average response time (${maxAvg}ms) is within 500ms threshold`)
  }

  if (maxP95 > 2000) {
    console.log(`⚠  p95 response time (${maxP95}ms) exceeds 2000ms threshold`)
  } else {
    console.log(`✓  p95 response time (${maxP95}ms) is within 2000ms threshold`)
  }

  console.log('\n── How to run with a real server ─────────────────────────────────────────')
  console.log('  1. Start the Next.js server:  npm run dev')
  console.log('  2. Run load test:              npm run test:load')
  console.log('  3. With auth cookies, add headers via --headers flag (future enhancement)')
  console.log('')
}

main().catch((err) => {
  console.error('Load test failed:', err)
  process.exit(1)
})
