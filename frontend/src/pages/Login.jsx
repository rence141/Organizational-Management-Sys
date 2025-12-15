// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../lib/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("Signing in...");

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setToken(data.token);
        navigate("/dashboard");
      } else {
        // Show backend message (e.g. verify email) if available
        setMsg(data.message || "Login failed. Check your credentials.");
      }
    } catch (err) {
      setMsg("Could not reach server. Please try again.");
    }
  }

  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto mt-10 space-y-3">
      <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Email" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Password" />
      <button className="w-full bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700 transition">Login</button>
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
    </form>
  );
}