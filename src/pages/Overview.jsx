import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders.jsx';
import { addDays } from '../lib/dates.js';
import { dailyRevenue, ordersInRange, percentChange, previousRange, statusBreakdown, summarize, topProducts } from '../lib/stats.js';
import { STATUSES } from '../lib/orders.js';
import { formatMoney } from '../lib/format.js';
import KpiCard from '../components/KpiCard.jsx';
import LineChart from '../components/LineChart.jsx';

const RANGES = [7, 30, 90];

export default function Overview() {
  const { orders, today } = useOrders();
  const [days, setDays] = useState(30);

  const data = useMemo(() => {
    const from = addDays(today, -(days - 1));
    const prev = previousRange(from, today);
    const current = ordersInRange(orders, from, today);
    const before = ordersInRange(orders, prev.from, prev.to);
    const now = summarize(current), then = summarize(before);
    return {
      now,
      change: {
        revenue: percentChange(now.revenue, then.revenue),
        orders: percentChange(now.orders, then.orders),
        avgOrder: percentChange(now.avgOrder, then.avgOrder),
        cancelRate: percentChange(now.cancelRate, then.cancelRate),
      },
      points: dailyRevenue(current, from, today),
      statuses: statusBreakdown(current, STATUSES),
      products: topProducts(current),
    };
  }, [orders, today, days]);

  const maxCount = Math.max(...data.statuses.map((s) => s.count), 1);
  const maxRev = Math.max(...data.products.map((p) => p.revenue), 1);

  return (
    <>
      <div className="page-head">
        <h1>Overview</h1>
        <div className="seg" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button key={r} className={r === days ? 'on' : ''} onClick={() => setDays(r)}>Last {r} days</button>
          ))}
        </div>
      </div>

      <div className="kpis">
        <KpiCard label="Revenue" value={formatMoney(data.now.revenue)} change={data.change.revenue} />
        <KpiCard label="Orders" value={data.now.orders} change={data.change.orders} />
        <KpiCard label="Average order" value={formatMoney(data.now.avgOrder)} change={data.change.avgOrder} />
        <KpiCard label="Cancel rate" value={`${(data.now.cancelRate * 100).toFixed(1)}%`} change={data.change.cancelRate} invert />
      </div>

      <section className="card">
        <h2>Daily revenue</h2>
        <LineChart points={data.points} />
      </section>

      <div className="two-col">
        <section className="card">
          <h2>Orders by status</h2>
          <ul className="bars">
            {data.statuses.map((s) => (
              <li key={s.status}>
                <Link to={`/orders?status=${s.status}`}>{s.status}</Link>
                <div className="bar"><div className={`fill fill-${s.status}`} style={{ width: `${(s.count / maxCount) * 100}%` }} /></div>
                <span>{s.count}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h2>Top products</h2>
          <ul className="bars">
            {data.products.map((p) => (
              <li key={p.name}>
                <span title={p.name} className="ellipsis">{p.name}</span>
                <div className="bar"><div className="fill" style={{ width: `${(p.revenue / maxRev) * 100}%` }} /></div>
                <span>{formatMoney(p.revenue)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
