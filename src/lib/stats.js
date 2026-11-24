import { addDays, eachDay } from './dates.js';

// Cancelled orders never count as revenue. Everything else does.
export const countsAsRevenue = (o) => o.status !== 'cancelled';

export function ordersInRange(orders, fromISO, toISOstr) {
  return orders.filter((o) => o.date >= fromISO && o.date <= toISOstr);
}

export function summarize(orders) {
  const paid = orders.filter(countsAsRevenue);
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const customers = new Set(paid.map((o) => o.customer.email)).size;
  return {
    revenue,
    orders: orders.length,
    avgOrder: paid.length ? revenue / paid.length : 0,
    customers,
    cancelRate: orders.length ? (orders.length - paid.length) / orders.length : 0,
  };
}

// Percent change vs the previous value. null when there is nothing to compare to.
export function percentChange(current, previous) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

// One point per day, including days with no orders (value 0).
export function dailyRevenue(orders, fromISO, toISOstr) {
  const byDay = new Map(eachDay(fromISO, toISOstr).map((d) => [d, 0]));
  for (const o of orders) {
    if (countsAsRevenue(o) && byDay.has(o.date)) byDay.set(o.date, byDay.get(o.date) + o.total);
  }
  return [...byDay].map(([date, value]) => ({ date, value }));
}

export function statusBreakdown(orders, statuses) {
  const counts = Object.fromEntries(statuses.map((s) => [s, 0]));
  for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
  return statuses.map((status) => ({ status, count: counts[status] }));
}

export function topProducts(orders, limit = 5) {
  const map = new Map();
  for (const o of orders.filter(countsAsRevenue)) {
    for (const item of o.items) {
      const row = map.get(item.name) ?? { name: item.name, units: 0, revenue: 0 };
      row.units += item.qty;
      row.revenue += item.qty * item.price;
      map.set(item.name, row);
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

// The window right before [fromISO, toISO], same length.
export function previousRange(fromISO, toISOstr) {
  const length = eachDay(fromISO, toISOstr).length;
  return { from: addDays(fromISO, -length), to: addDays(fromISO, -1) };
}
