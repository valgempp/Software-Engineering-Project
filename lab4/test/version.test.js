import request from 'supertest'
import fs from 'node:fs'
import app from '../src/app.js'
import { describe, it, expect } from 'vitest'

const pkg = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')
)

describe('GET /version', () => {
  it('returns HTTP 200', async () => {
    const res = await request(app).get('/version')
    expect(res.status).toBe(200)
  })

  it('returns exactly the version from package.json', async () => {
    const res = await request(app).get('/version')
    expect(res.body).toEqual({ version: pkg.version })
  })

  it('responds with JSON content-type', async () => {
    const res = await request(app).get('/version')
    expect(res.headers['content-type']).toMatch(/application\/json/)
  })
})
