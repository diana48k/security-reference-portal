import assert from 'node:assert/strict'
import test from 'node:test'

import { canRemovePrivilegedTarget, getSafeNextPath, passwordSchema } from '../src/lib/auth-utils.ts'

test('safe redirect only accepts local absolute paths', () => {
  assert.equal(getSafeNextPath('/admin/users'), '/admin/users')
  assert.equal(getSafeNextPath('https://evil.example'), '/admin')
  assert.equal(getSafeNextPath('//evil.example'), '/admin')
  assert.equal(getSafeNextPath('/admin\\evil'), '/admin')
})

test('password policy requires length and mixed character classes', () => {
  assert.equal(passwordSchema.safeParse('Correct-Horse9!').success, true)
  assert.equal(passwordSchema.safeParse('short').success, false)
  assert.equal(passwordSchema.safeParse('alllowercase123!').success, false)
})

test('the final active admin or tech cannot lose privilege', () => {
  assert.equal(canRemovePrivilegedTarget({ targetRole: 'admin', targetActive: true, activePrivilegedCount: 1 }), false)
  assert.equal(canRemovePrivilegedTarget({ targetRole: 'tech', targetActive: true, activePrivilegedCount: 2 }), true)
  assert.equal(canRemovePrivilegedTarget({ targetRole: 'viewer', targetActive: true, activePrivilegedCount: 1 }), true)
})
