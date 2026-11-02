/**
 * Unit tests for src/utils/appInfo.js (DEVOPS-6).
 * No HTTP or Express involved; just pure functions.
 */
import fs from 'node:fs'
import { describe, it, expect } from 'vitest'
import { getPackageInfo, getRuntimeInfo } from '../../src/utils/appInfo.js'

const pkg = JSON.parse(
  fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
)

describe('getPackageInfo', () => {
  it('returns name and version from package.json', () => {
    expect(getPackageInfo()).toEqual({ name: pkg.name, version: pkg.version })
  })
})

describe('getRuntimeInfo', () => {
  it('returns the running Node version', () => {
    expect(getRuntimeInfo().node).toBe(process.version)
  })

  it('returns a non-negative uptime in seconds', () => {
    const before = process.uptime()
    const { uptime } = getRuntimeInfo()
    const after = process.uptime()
    expect(uptime).toBeGreaterThanOrEqual(before)
    expect(uptime).toBeLessThanOrEqual(after)
  })
})
