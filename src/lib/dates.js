// Dates are local YYYY-MM-DD strings, never UTC timestamps (avoids off-by-one-day bugs).
const pad = (n) => String(n).padStart(2, '0');

export function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  return toISO(new Date(y, m - 1, d + days));
}

export function daysBetween(fromISO, toISOstr) {
  const [y1, m1, d1] = fromISO.split('-').map(Number);
  const [y2, m2, d2] = toISOstr.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

export function eachDay(fromISO, toISOstr) {
  const out = [];
  for (let d = fromISO; d <= toISOstr; d = addDays(d, 1)) out.push(d);
  return out;
}
