import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders.jsx';
import { buildCustomers, customerSummary, filterCustomers, sortCustomers } from '../lib/customers.js';
import { customersToCSV } from '../lib/csv.js';
import { formatDate, formatMoney } from '../lib/format.js';

const PAGE_SIZE = 15;
const COLUMNS = [
  ['name', 'Customer'], ['orders', 'Orders'], ['spent', 'Spent'], ['avgOrder', 'Avg order'], ['lastOrder', 'Last order'],
];

export default function Customers() {
  const { orders } = useOrders();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [sort, setSort] = useState({ key: 'spent', dir: 'desc' });
  const [page, setPage] = useState(1);

  const customers = useMemo(() => buildCustomers(orders), [orders]);
  const summary = useMemo(() => customerSummary(customers), [customers]);
  const filtered = useMemo(() => sortCustomers(filterCustomers(customers, { query }), sort.key, sort.dir), [customers, query, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const setQuery = (value) => {
    const next = new URLSearchParams(params);
    value ? next.set('q', value) : next.delete('q');
    setParams(next, { replace: true });
    setPage(1);
  };

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'name' ? 'asc' : 'desc' }));
    setPage(1);
  };

  const exportCSV = () => {
    const blob = new Blob([customersToCSV(filtered)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'customers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="page-head">
        <h1>Customers</h1>
        <button className="btn btn-outline" onClick={exportCSV} disabled={!filtered.length}>Export CSV ({filtered.length})</button>
      </div>

      <p className="muted small">
        {summary.count} customers · {summary.repeat} repeat buyers · {formatMoney(summary.avgSpend)} average spend.
        Built from the orders in this demo; a real shop keeps customers in its own table.
      </p>

      <div className="filters">
        <input type="search" placeholder="Search name or email" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search customers" />
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
            {rows.map((c) => (
              <tr key={c.email} tabIndex={0} onClick={() => navigate(`/orders?q=${encodeURIComponent(c.email)}`)} onKeyDown={(e) => e.key === 'Enter' && navigate(`/orders?q=${encodeURIComponent(c.email)}`)} title={`Show ${c.name}'s orders`}>
                <td>{c.name}<br /><span className="muted small">{c.email}</span></td>
                <td>{c.orders}{c.cancelled > 0 && <span className="muted small"> ({c.cancelled} cancelled)</span>}</td>
                <td>{formatMoney(c.spent)}</td>
                <td>{formatMoney(c.avgOrder)}</td>
                <td>{formatDate(c.lastOrder)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="5" className="empty">No customers match this search.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <span className="muted">{filtered.length} customers · page {current} of {pages}</span>
        <div>
          <button className="btn btn-outline btn-small" disabled={current <= 1} onClick={() => setPage(current - 1)}>Previous</button>{' '}
          <button className="btn btn-outline btn-small" disabled={current >= pages} onClick={() => setPage(current + 1)}>Next</button>
        </div>
      </div>
    </>
  );
}
