import test from 'node:test';
import assert from 'node:assert/strict';
import { ordersToCSV } from './csv.js';
import { sample } from './fixtures.js';

test('csv has a header and one line per order', () => {
  const lines = ordersToCSV(sample).split('\n');
  assert.equal(lines.length, 5);
  assert.equal(lines[1], '#1,2026-11-01,Omar Hassan,omar@example.com,2,20.00,delivered');
});

test('csv quotes commas and quotes', () => {
  const o = [{ ...sample[0], customer: { name: 'Doe, "J"', email: 'j@example.com' } }];
  assert.ok(ordersToCSV(o).includes('"Doe, ""J"""'));
});

test('csv neutralises formulas', () => {
  const o = [{ ...sample[0], customer: { name: '=SUM(A1)', email: 'x@example.com' } }];
  assert.ok(ordersToCSV(o).includes("'=SUM(A1)"));
});
