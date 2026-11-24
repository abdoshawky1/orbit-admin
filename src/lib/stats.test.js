import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize, percentChange, dailyRevenue, statusBreakdown, topProducts, ordersInRange, previousRange } from './stats.js';
import { STATUSES } from './orders.js';
import { sample } from './fixtures.js';

test('summary ignores cancelled orders for revenue and customers', () => {
  const s = summarize(sample);
  assert.equal(s.revenue, 110);
  assert.equal(s.orders, 4);
  assert.equal(s.avgOrder, 110 / 3);
  assert.equal(s.customers, 3);
  assert.equal(s.cancelRate, 0.25);
});

test('summary of nothing is all zeros', () => {
  assert.deepEqual(summarize([]), { revenue: 0, orders: 0, avgOrder: 0, customers: 0, cancelRate: 0 });
});

test('percent change', () => {
  assert.equal(percentChange(150, 100), 50);
  assert.equal(percentChange(50, 100), -50);
  assert.equal(percentChange(10, 0), null);
});

test('daily revenue includes empty days', () => {
  const pts = dailyRevenue(sample, '2026-11-01', '2026-11-05');
  assert.deepEqual(pts.map((p) => p.value), [20, 60, 0, 30, 0]);
});

test('status breakdown lists every status', () => {
  const b = statusBreakdown(sample, STATUSES);
  assert.equal(b.length, STATUSES.length);
  assert.equal(b.find((x) => x.status === 'shipped').count, 0);
  assert.equal(b.find((x) => x.status === 'cancelled').count, 1);
});

test('top products sorted by revenue, cancelled excluded', () => {
  const top = topProducts(sample);
  assert.deepEqual(top.map((t) => t.name), ['A', 'B']);
  assert.equal(top[0].revenue, 60);
  assert.equal(top[0].units, 6);
  assert.equal(top[1].revenue, 50); // the cancelled order for B is not counted
});

test('range helpers', () => {
  assert.equal(ordersInRange(sample, '2026-11-02', '2026-11-03').length, 2);
  assert.deepEqual(previousRange('2026-11-08', '2026-11-14'), { from: '2026-11-01', to: '2026-11-07' });
});
