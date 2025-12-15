// Very small auth utility. In production, prefer HTTP-only cookies.
// For class demo, localStorage keeps the token visible and easy to debug.

export function setToken(token) {
  localStorage.setItem("token", token); // save token after login
}

export function getToken() {
  return localStorage.getItem("token"); // used by guards and API wrapper
}

export function logout() {
  localStorage.removeItem("token");     // clear token
  window.location.href = "/login";      // force redirect to login page
}