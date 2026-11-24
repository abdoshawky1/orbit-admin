import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { DEMO_USER } from '../lib/auth.js';

export default function Login() {
  const { signedIn, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (signedIn) return <Navigate to="/" replace />;

  const submit = (e) => {
    e.preventDefault();
    if (login(email, password)) navigate('/');
    else setError('Wrong email or password.');
  };

  return (
    <div className="login-wrap">
      <form className="card login" onSubmit={submit}>
        <div className="logo"><span className="logo-mark">O</span> Orbit Admin</div>
        <h1>Sign in</h1>
        <label>Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" type="submit">Sign in</button>
        <p className="hint">
          Demo login: <code>{DEMO_USER.email}</code> / <code>{DEMO_USER.password}</code>
          <br />This is a front-end demo. The data is generated in your browser.
        </p>
      </form>
    </div>
  );
}
