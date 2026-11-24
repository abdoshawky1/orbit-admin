import { createContext, useContext, useState } from 'react';
import { checkLogin } from '../lib/auth.js';

const KEY = 'orbit-admin-session';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [signedIn, setSignedIn] = useState(() => sessionStorage.getItem(KEY) === '1');

  const login = (email, password) => {
    const ok = checkLogin(email, password);
    if (ok) sessionStorage.setItem(KEY, '1');
    setSignedIn(ok);
    return ok;
  };
  const logout = () => {
    sessionStorage.removeItem(KEY);
    setSignedIn(false);
  };

  return <AuthContext.Provider value={{ signedIn, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
