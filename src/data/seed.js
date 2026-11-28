import { addDays } from '../lib/dates.js';

const PRODUCTS = [
  { name: 'Aero Wireless Headphones', price: 129 },
  { name: 'Nomad Laptop Backpack', price: 79 },
  { name: 'Pulse Fitness Band', price: 59 },
  { name: 'Lumen Desk Lamp', price: 45 },
  { name: 'Terra Water Bottle', price: 24 },
  { name: 'Orbit Mechanical Keyboard', price: 109 },
  { name: 'Slate Phone Stand', price: 19 },
  { name: 'Drift Bluetooth Speaker', price: 69 },
];

const FIRST = ['Omar', 'Layla', 'Youssef', 'Mona', 'Karim', 'Nour', 'Hassan', 'Salma', 'Tarek', 'Dina', 'Ali', 'Rania', 'Ziad', 'Hana', 'Mostafa', 'Farida'];
const LAST = ['Hassan', 'Ibrahim', 'Mansour', 'Saad', 'Fahmy', 'Nabil', 'Adel', 'Samir', 'Khalil', 'Farouk', 'Zaki', 'Rashad', 'Fouad', 'Gaber', 'Helal', 'Kamal', 'Lotfy', 'Maged', 'Naguib', 'Osman', 'Ragab', 'Sabry', 'Tawfik', 'Wahba'];

// Small seeded random generator so the demo data is the same on every load.
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Status depends on order age: old orders are mostly delivered, new ones still moving.
function pickStatus(rand, ageDays) {
  const r = rand();
  if (r < 0.07) return 'cancelled';
  if (ageDays > 10) return 'delivered';
  if (ageDays > 4) return r < 0.5 ? 'shipped' : 'delivered';
  if (ageDays > 1) return r < 0.5 ? 'paid' : 'shipped';
  return r < 0.5 ? 'pending' : 'paid';
}

export function generateOrders(todayISO, days = 120, seed = 7) {
  const rand = mulberry32(seed);
  const customers = Array.from({ length: 400 }, (_, i) => {
    const first = FIRST[Math.floor(rand() * FIRST.length)];
    const last = LAST[Math.floor(rand() * LAST.length)];
    return { name: `${first} ${last}`, email: `${first}.${last}${i}@example.com`.toLowerCase() };
  });

  const orders = [];
  let n = 1000;
  for (let age = days; age >= 0; age--) {
    const date = addDays(todayISO, -age);
    const growth = 1 + (days - age) / days; // shop grows over time
    const count = Math.round((3 + rand() * 5) * growth);
    for (let i = 0; i < count; i++) {
      const lines = 1 + Math.floor(rand() * 3);
      const items = [];
      for (let k = 0; k < lines; k++) {
        const p = PRODUCTS[Math.floor(rand() * PRODUCTS.length)];
        if (!items.some((x) => x.name === p.name)) items.push({ ...p, qty: 1 + Math.floor(rand() * 2) });
      }
      const total = items.reduce((s, x) => s + x.qty * x.price, 0);
      orders.push({
        id: `#${++n}`,
        date,
        customer: customers[Math.floor(rand() * customers.length)],
        items,
        total,
        status: pickStatus(rand, age),
      });
    }
  }
  return orders;
}
