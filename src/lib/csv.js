// Escapes a value for CSV. Also neutralises spreadsheet formulas (=, +, -, @) in text.
function cell(value) {
  let s = String(value ?? '');
  if (/^[=+\-@]/.test(s) && Number.isNaN(Number(s))) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function customersToCSV(customers) {
  const header = ['Customer', 'Email', 'Orders', 'Cancelled', 'Spent (USD)', 'Average order (USD)', 'First order', 'Last order'];
  const lines = customers.map((c) =>
    [c.name, c.email, c.orders, c.cancelled, c.spent.toFixed(2), c.avgOrder.toFixed(2), c.firstOrder, c.lastOrder]
      .map(cell)
      .join(',')
  );
  return [header.join(','), ...lines].join('\n');
}

export function ordersToCSV(orders) {
  const header = ['Order', 'Date', 'Customer', 'Email', 'Items', 'Total (USD)', 'Status'];
  const lines = orders.map((o) =>
    [o.id, o.date, o.customer.name, o.customer.email, o.items.reduce((n, i) => n + i.qty, 0), o.total.toFixed(2), o.status]
      .map(cell)
      .join(',')
  );
  return [header.join(','), ...lines].join('\n');
}
