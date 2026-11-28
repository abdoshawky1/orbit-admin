import { countsAsRevenue } from './stats.js';

// Customers are derived from the order list: this demo has no separate customer table.
// Cancelled orders count towards how many orders a customer placed, but not towards spend.
export function buildCustomers(orders) {
  const map = new Map();
  for (const o of orders) {
    const email = o.customer.email;
    const row = map.get(email) ?? { name: o.customer.name, email, orders: 0, spent: 0, cancelled: 0, firstOrder: o.date, lastOrder: o.date };
    row.orders += 1;
    if (countsAsRevenue(o)) row.spent += o.total;
    else row.cancelled += 1;
    if (o.date < row.firstOrder) row.firstOrder = o.date;
    if (o.date > row.lastOrder) row.lastOrder = o.date;
    map.set(email, row);
  }
  return [...map.values()].map((c) => {
    const paid = c.orders - c.cancelled;
    return { ...c, avgOrder: paid ? c.spent / paid : 0 };
  });
}

export function filterCustomers(customers, { query = '' } = {}) {
  const q = query.trim().toLowerCase();
  if (!q) return customers;
  return customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
}

const compare = {
  name: (a, b) => a.name.localeCompare(b.name),
  orders: (a, b) => a.orders - b.orders,
  spent: (a, b) => a.spent - b.spent,
  avgOrder: (a, b) => a.avgOrder - b.avgOrder,
  lastOrder: (a, b) => a.lastOrder.localeCompare(b.lastOrder),
};

export function sortCustomers(customers, key = 'spent', dir = 'desc') {
  const cmp = compare[key] ?? compare.spent;
  const sign = dir === 'asc' ? 1 : -1;
  return [...customers].sort((a, b) => sign * cmp(a, b) || a.email.localeCompare(b.email));
}

export function customerSummary(customers) {
  const count = customers.length;
  const repeat = customers.filter((c) => c.orders > 1).length;
  const spent = customers.reduce((s, c) => s + c.spent, 0);
  return { count, repeat, avgSpend: count ? spent / count : 0 };
}
