export const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

// Allowed next steps. Orders only move forward, and can be cancelled until they ship.
const TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const nextStatuses = (status) => TRANSITIONS[status] ?? [];

export function filterOrders(orders, { query = '', status = 'all' } = {}) {
  const q = query.trim().toLowerCase();
  return orders.filter((o) => {
    if (status !== 'all' && o.status !== status) return false;
    if (!q) return true;
    return (
      o.id.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q)
    );
  });
}

const compare = {
  date: (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  total: (a, b) => a.total - b.total,
  customer: (a, b) => a.customer.name.localeCompare(b.customer.name),
  status: (a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status),
  id: (a, b) => a.id.localeCompare(b.id),
};

export function sortOrders(orders, key = 'date', dir = 'desc') {
  const cmp = compare[key] ?? compare.date;
  const sign = dir === 'asc' ? 1 : -1;
  return [...orders].sort((a, b) => sign * cmp(a, b));
}

export function paginate(items, page, pageSize) {
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * pageSize;
  return { rows: items.slice(start, start + pageSize), page: current, pages, total: items.length };
}

export function updateStatus(orders, id, status) {
  return orders.map((o) => {
    if (o.id !== id) return o;
    if (!nextStatuses(o.status).includes(status)) return o; // invalid move: ignore
    return { ...o, status };
  });
}
