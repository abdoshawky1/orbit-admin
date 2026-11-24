import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { generateOrders } from '../data/seed.js';
import { toISO } from '../lib/dates.js';
import { updateStatus } from '../lib/orders.js';

const KEY = 'orbit-admin-orders-v1';
const OrdersContext = createContext(null);

function load(today) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && saved.today === today && Array.isArray(saved.orders)) return saved.orders;
  } catch {
    // corrupted storage: fall through to fresh data
  }
  return generateOrders(today);
}

export function OrdersProvider({ children }) {
  const today = toISO(new Date());
  const [orders, setOrders] = useState(() => load(today));

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ today, orders }));
  }, [today, orders]);

  const value = useMemo(
    () => ({
      orders,
      today,
      setStatus: (id, status) => setOrders((prev) => updateStatus(prev, id, status)),
      reset: () => setOrders(generateOrders(today)),
    }),
    [orders, today]
  );
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export const useOrders = () => useContext(OrdersContext);
