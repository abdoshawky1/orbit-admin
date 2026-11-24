const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const money2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatMoney = (n) => money.format(n);
export const formatMoneyExact = (n) => money2.format(n);

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatPercent(p) {
  if (p === null) return 'n/a';
  const sign = p > 0 ? '+' : '';
  return `${sign}${p.toFixed(1)}%`;
}
