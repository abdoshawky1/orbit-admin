import { formatPercent } from '../lib/format.js';

export default function KpiCard({ label, value, change, invert = false }) {
  // For cancel rate, a rise is bad, so `invert` flips the colour.
  const good = change === null || change === undefined ? null : invert ? change < 0 : change > 0;
  return (
    <div className="card kpi">
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
      {change !== undefined && (
        <span className={`kpi-change ${good === null ? '' : good ? 'up' : 'down'}`}>
          {formatPercent(change)} vs previous period
        </span>
      )}
    </div>
  );
}
