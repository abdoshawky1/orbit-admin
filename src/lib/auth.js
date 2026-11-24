// DEMO ONLY. This checks a hard-coded login in the browser. It protects nothing.
// A real app verifies credentials on a server and issues a session cookie or token.
export const DEMO_USER = { email: 'admin@orbit.demo', password: 'orbit-demo' };

export function checkLogin(email, password) {
  return email.trim().toLowerCase() === DEMO_USER.email && password === DEMO_USER.password;
}
