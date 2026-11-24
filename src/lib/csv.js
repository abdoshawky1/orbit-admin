// Escapes a value for CSV. Also neutralises spreadsheet formulas (=, +, -, @) in text.
function cell(value) {
  let s = String(value ?? '');
  if (/^[=+\-@]/.test(s) && Number.isNaN(Number(s))) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
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
