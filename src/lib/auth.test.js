import test from 'node:test';
import assert from 'node:assert/strict';
import { checkLogin, DEMO_USER } from './auth.js';

test('accepts the demo login, ignoring case and spaces in the email', () => {
  assert.equal(checkLogin(` ${DEMO_USER.email.toUpperCase()} `, DEMO_USER.password), true);
});
test('rejects wrong or empty credentials', () => {
  assert.equal(checkLogin(DEMO_USER.email, 'nope'), false);
  assert.equal(checkLogin('', ''), false);
});
