// API helper wraps fetch to always send JSON headers and Authorization.
// If server returns 401 (unauthorized), we clear token and redirect to login.

export async function api(path, options = {}) {
  const token = localStorage.getItem("token"); // read once per call
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",      // JSON in/out by default
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // attach token if logged in
      ...(options.headers || {})               // let callers override or add headers
    }
  });

  // If token expired or missing, server returns 401. Kick user back to login.
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  // NOTE: For non-JSON responses, you can branch on res.headers.get("content-type")
  return res.json();
}
