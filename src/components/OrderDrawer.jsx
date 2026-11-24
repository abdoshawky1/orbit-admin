import { useEffect } from 'react';
import StatusBadge from './StatusBadge.jsx';
import { nextStatuses } from '../lib/orders.js';
import { formatDate, formatMoneyExact } from '../lib/format.js';

export default function OrderDrawer({ order, onClose, onStatus }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const moves = nextStatuses(order.status);
  return (
    <div className="overlay" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Order ${order.id}`} onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>Order {order.id}</h2>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <p><StatusBadge status={order.status} /> placed {formatDate(order.date)}</p>
        <h3>Customer</h3>
        <p>{order.customer.name}<br /><span className="muted">{order.customer.email}</span></p>
        <h3>Items</h3>
        <ul className="items">
          {order.items.map((i) => (
            <li key={i.name}><span>{i.qty} × {i.name}</span><span>{formatMoneyExact(i.qty * i.price)}</span></li>
          ))}
          <li className="total"><span>Total</span><span>{formatMoneyExact(order.total)}</span></li>
        </ul>
        {moves.length > 0 && (
          <>
            <h3>Update status</h3>
            <div className="actions">
              {moves.map((s) => (
                <button key={s} className={`btn ${s === 'cancelled' ? 'btn-danger' : ''}`}
                  onClick={() => {
                    if (s !== 'cancelled' || window.confirm(`Cancel order ${order.id}?`)) onStatus(order.id, s);
                  }}>
                  Mark {s}
                </button>
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
