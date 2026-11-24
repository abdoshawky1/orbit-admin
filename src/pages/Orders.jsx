import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders.jsx';
import { STATUSES, filterOrders, paginate, sortOrders } from '../lib/orders.js';
import { ordersToCSV } from '../lib/csv.js';
import { formatDate, formatMoneyExact } from '../lib/format.js';
import StatusBadge from '../components/StatusBadge.jsx';
import OrderDrawer from '../components/OrderDrawer.jsx';

const PAGE_SIZE = 12;
const COLUMNS = [
  ['id', 'Order'], ['date', 'Date'], ['customer', 'Customer'], ['total', 'Total'], ['status', 'Status'],
];

export default function Orders() {
  const { orders, setStatus } = useOrders();
  // Filters live in the URL, so a filtered view can be shared or refreshed.
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const status = STATUSES.includes(params.get('status')) ? params.get('status') : 'all';
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);

  const update = (next) => {
    const merged = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) v ? merged.set(k, v) : merged.delete(k);
    if (merged.get('status') === 'all') merged.delete('status');
    setParams(merged, { replace: true });
    setPage(1);
  };

  const filtered = useMemo(() => sortOrders(filterOrders(orders, { query, status }), sort.key, sort.dir), [orders, query, status, sort]);
  const view = paginate(filtered, page, PAGE_SIZE);
  const open = orders.find((o) => o.id === openId);

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'customer' || key === 'id' ? 'asc' : 'desc' }));
    setPage(1);
  };

  const exportCSV = () => {
    const blob = new Blob([ordersToCSV(filtered)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="page-head">
        <h1>Orders</h1>
        <button className="btn btn-outline" onClick={exportCSV} disabled={!filtered.length}>Export CSV ({filtered.length})</button>
      </div>

      <div className="filters">
        <input type="search" placeholder="Search order, name or email" value={query} onChange={(e) => update({ q: e.target.value })} aria-label="Search orders" />
        <select value={status} onChange={(e) => update({ status: e.target.value })} aria-label="Filter by status">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              {COLUMNS.map(([key, label]) => (
                <th key={key} aria-sort={sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button className="th-btn" onClick={() => toggleSort(key)}>
                    {label} {sort.key === key ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.rows.map((o) => (
              <tr key={o.id} tabIndex={0} onClick={() => setOpenId(o.id)} onKeyDown={(e) => e.key === 'Enter' && setOpenId(o.id)}>
                <td>{o.id}</td>
                <td>{formatDate(o.date)}</td>
                <td>{o.customer.name}<br /><span className="muted small">{o.customer.email}</span></td>
                <td>{formatMoneyExact(o.total)}</td>
                <td><StatusBadge status={o.status} /></td>
              </tr>
            ))}
            {!view.rows.length && <tr><td colSpan="5" className="empty">No orders match these filters.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <span className="muted">{view.total} orders · page {view.page} of {view.pages}</span>
        <div>
          <button className="btn btn-outline btn-small" disabled={view.page <= 1} onClick={() => setPage(view.page - 1)}>Previous</button>{' '}
          <button className="btn btn-outline btn-small" disabled={view.page >= view.pages} onClick={() => setPage(view.page + 1)}>Next</button>
        </div>
      </div>

      {open && <OrderDrawer order={open} onClose={() => setOpenId(null)} onStatus={setStatus} />}
    </>
  );
}
