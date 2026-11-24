// Small hand-written orders used by the tests.
export const sample = [
  { id: '#1', date: '2026-11-01', customer: { name: 'Omar Hassan', email: 'omar@example.com' }, items: [{ name: 'A', price: 10, qty: 2 }], total: 20, status: 'delivered' },
  { id: '#2', date: '2026-11-02', customer: { name: 'Layla Ibrahim', email: 'layla@example.com' }, items: [{ name: 'B', price: 50, qty: 1 }, { name: 'A', price: 10, qty: 1 }], total: 60, status: 'paid' },
  { id: '#3', date: '2026-11-02', customer: { name: 'Omar Hassan', email: 'omar@example.com' }, items: [{ name: 'B', price: 50, qty: 1 }], total: 50, status: 'cancelled' },
  { id: '#4', date: '2026-11-04', customer: { name: 'Nour Saad', email: 'nour@example.com' }, items: [{ name: 'A', price: 10, qty: 3 }], total: 30, status: 'pending' },
];
