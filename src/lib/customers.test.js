import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCustomers, customerSummary, filterCustomers, sortCustomers } from './customers.js';
import { customersToCSV } from './csv.js';

const omar = { name: 'Omar Hassan', email: 'omar@example.com' };
const layla = { name: 'Layla Saad', email: 'layla@example.com' };
const orders = [
  { id: '#1', date: '2026-11-01', customer: omar, items: [], total: 100, status: 'delivered' },
  { id: '#2', date: '2026-11-05', customer: omar, items: [], total: 50, status: 'cancelled' },
  { id: '#3', date: '2026-11-03', customer: layla, items: [], total: 200, status: 'paid' },
  { id: '#4', date: '2026-10-20', customer: layla, items: [], total: 80, status: 'shipped' },
];

test('customers are grouped by email with order counts and spend', () => {
  const rows = buildCustomers(orders);
  assert.equal(rows.length, 2);
  const o = rows.find((c) => c.email === 'omar@example.com');
  assert.equal(o.name, 'Omar Hassan');
  assert.equal(o.orders, 2);
  assert.equal(o.cancelled, 1);
  assert.equal(o.spent, 100); // the cancelled order is not spend
  assert.equal(o.avgOrder, 100); // average over the one paid order
  assert.equal(o.firstOrder, '2026-11-01');
  assert.equal(o.lastOrder, '2026-11-05');
});

test('average order ignores cancelled orders and never divides by zero', () => {
  const rows = buildCustomers([
    { id: '#9', date: '2026-11-01', customer: { name: 'Zed', email: 'zed@example.com' }, items: [], total: 40, status: 'cancelled' },
  ]);
  assert.equal(rows[0].spent, 0);
  assert.equal(rows[0].avgOrder, 0);
});

test('buildCustomers does not mutate the orders it is given', () => {
  const copy = JSON.parse(JSON.stringify(orders));
  buildCustomers(orders);
  assert.deepEqual(orders, copy);
});

test('search matches name and email, case-insensitive and trimmed', () => {
  const rows = buildCustomers(orders);
  assert.deepEqual(filterCustomers(rows, { query: 'layla' }).map((c) => c.email), ['layla@example.com']);
  assert.equal(filterCustomers(rows, { query: 'EXAMPLE.COM' }).length, 2);
  assert.equal(filterCustomers(rows, { query: '   ' }).length, 2);
  assert.equal(filterCustomers(rows, { query: 'nobody' }).length, 0);
});

test('sorting by spend, name and last order', () => {
  const rows = buildCustomers(orders);
  assert.deepEqual(sortCustomers(rows, 'spent', 'desc').map((c) => c.email), ['layla@example.com', 'omar@example.com']);
  assert.deepEqual(sortCustomers(rows, 'spent', 'asc').map((c) => c.email), ['omar@example.com', 'layla@example.com']);
  assert.deepEqual(sortCustomers(rows, 'name', 'asc').map((c) => c.name), ['Layla Saad', 'Omar Hassan']);
  assert.deepEqual(sortCustomers(rows, 'lastOrder', 'desc').map((c) => c.email), ['omar@example.com', 'layla@example.com']);
});

test('equal sort keys fall back to email so the order is stable', () => {
  const rows = [
    { name: 'B', email: 'b@example.com', orders: 1, spent: 10 },
    { name: 'A', email: 'a@example.com', orders: 1, spent: 10 },
  ];
  assert.deepEqual(sortCustomers(rows, 'spent', 'desc').map((c) => c.email), ['a@example.com', 'b@example.com']);
});

test('summary counts repeat buyers and average spend', () => {
  assert.deepEqual(customerSummary(buildCustomers(orders)), { count: 2, repeat: 2, avgSpend: 190 });
  assert.deepEqual(customerSummary([]), { count: 0, repeat: 0, avgSpend: 0 });
});

test('customer CSV has a header, one line per customer, and no cancelled spend', () => {
  const lines = customersToCSV(buildCustomers(orders)).split('\n');
  assert.equal(lines.length, 3);
  assert.equal(lines[0].split(',')[0], 'Customer');
  const omarLine = lines.find((l) => l.includes('omar@example.com'));
  assert.ok(omarLine.includes(',2,1,100.00,100.00,2026-11-01,2026-11-05'));
});
