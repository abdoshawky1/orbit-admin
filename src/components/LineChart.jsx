import { useState } from 'react';
import { formatDate, formatMoney } from '../lib/format.js';

const W = 720, H = 240, PAD = { top: 16, right: 12, bottom: 28, left: 52 };

// Hand-written SVG chart: no chart library, so there is nothing hidden to explain.
export default function LineChart({ points }) {
  const [hover, setHover] = useState(null);
  if (!points.length) return <p className="muted">No data in this period.</p>;

  const max = Math.max(...points.map((p) => p.value), 1);
  const niceMax = Math.ceil(max / 500) * 500 || 500;
  const x = (i) => PAD.left + (points.length === 1 ? 0 : (i / (points.length - 1)) * (W - PAD.left - PAD.right));
  const y = (v) => PAD.top + (1 - v / niceMax) * (H - PAD.top - PAD.bottom);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1)},${H - PAD.bottom} L${x(0)},${H - PAD.bottom} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * niceMax);
  const labelEvery = Math.ceil(points.length / 6);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD.left) / (W - PAD.left - PAD.right)) * (points.length - 1));
    setHover(Math.min(Math.max(i, 0), points.length - 1));
  };
  const h = hover === null ? null : points[hover];

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Daily revenue" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="grid" />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="axis">{formatMoney(t)}</text>
          </g>
        ))}
        <path d={area} className="area" />
        <path d={line} className="line" />
        {points.map((p, i) => i % labelEvery === 0 && (
          <text key={p.date} x={x(i)} y={H - 8} textAnchor="middle" className="axis">{p.date.slice(5)}</text>
        ))}
        {h && <circle cx={x(hover)} cy={y(h.value)} r="4.5" className="dot" />}
      </svg>
      <div className="chart-readout" aria-live="polite">
        {h ? <><strong>{formatMoney(h.value)}</strong> on {formatDate(h.date)}</> : 'Hover the chart to see a day.'}
      </div>
    </div>
  );
}
