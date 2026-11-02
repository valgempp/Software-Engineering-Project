/**
 * Integration tests for GET /info (DEVOPS-6).
 */
import request from 'supertest'
import fs from 'node:fs'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'

const pkg = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')
)

describe('GET /info', () => {
  it('returns HTTP 200 with a JSON body', async () => {
    const res = await request(app).get('/info')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/json/)
  })

  it('returns name and version from package.json', async () => {
    const res = await request(app).get('/info')
    expect(res.body.name).toBe(pkg.name)
    expect(res.body.version).toBe(pkg.version)
  })

  it('returns the running Node version', async () => {
    const res = await request(app).get('/info')
    expect(res.body.node).toBe(process.version)
  })

  it('returns a non-negative uptime in seconds', async () => {
    const before = process.uptime()
    const res = await request(app).get('/info')
    const after = process.uptime()
    expect(typeof res.body.uptime).toBe('number')
    expect(res.body.uptime).toBeGreaterThanOrEqual(before)
    expect(res.body.uptime).toBeLessThanOrEqual(after)
  })
})
