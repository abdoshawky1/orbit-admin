import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo"><span className="logo-mark">O</span> Orbit Admin</div>
        <nav>
          <NavLink to="/" end>Overview</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/customers">Customers</NavLink>
        </nav>
        <button className="btn btn-ghost" onClick={() => { logout(); navigate('/login'); }}>Sign out</button>
      </aside>
      <main className="content"><Outlet /></main>
    </div>
  );
}
