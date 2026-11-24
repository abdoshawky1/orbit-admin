import test from 'node:test';
import assert from 'node:assert/strict';
import { filterOrders, sortOrders, paginate, updateStatus, nextStatuses } from './orders.js';
import { sample } from './fixtures.js';

test('filter by status', () => {
  assert.deepEqual(filterOrders(sample, { status: 'paid' }).map((o) => o.id), ['#2']);
  assert.equal(filterOrders(sample, { status: 'all' }).length, 4);
});

test('search matches id, name and email, ignoring case', () => {
  assert.equal(filterOrders(sample, { query: 'OMAR' }).length, 2);
  assert.equal(filterOrders(sample, { query: '#4' }).length, 1);
  assert.equal(filterOrders(sample, { query: 'layla@' }).length, 1);
  assert.equal(filterOrders(sample, { query: 'nobody' }).length, 0);
});

test('search and status combine', () => {
  assert.equal(filterOrders(sample, { query: 'omar', status: 'cancelled' }).length, 1);
});

test('sort by total in both directions, without mutating the input', () => {
  const copy = [...sample];
  assert.deepEqual(sortOrders(sample, 'total', 'asc').map((o) => o.total), [20, 30, 50, 60]);
  assert.deepEqual(sortOrders(sample, 'total', 'desc').map((o) => o.total), [60, 50, 30, 20]);
  assert.deepEqual(sample, copy);
});

test('sort by date breaks ties by id', () => {
  assert.deepEqual(sortOrders(sample, 'date', 'asc').map((o) => o.id), ['#1', '#2', '#3', '#4']);
});

test('paginate clamps the page', () => {
  const p = paginate(sample, 9, 3);
  assert.equal(p.page, 2);
  assert.equal(p.pages, 2);
  assert.equal(p.rows.length, 1);
  assert.equal(paginate([], 1, 10).pages, 1);
});

test('status only moves along allowed steps', () => {
  assert.deepEqual(nextStatuses('shipped'), ['delivered']);
  const paid = updateStatus(sample, '#2', 'shipped');
  assert.equal(paid.find((o) => o.id === '#2').status, 'shipped');
  const bad = updateStatus(sample, '#1', 'pending'); // delivered -> pending is not allowed
  assert.equal(bad.find((o) => o.id === '#1').status, 'delivered');
  assert.equal(updateStatus(sample, '#3', 'paid').find((o) => o.id === '#3').status, 'cancelled');
});
