// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("Creating account...");

    try {
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMsg(
          data.message ||
            "Account created. Check your email to verify, then log in. Redirecting to login..."
        );
        // Redirect to login after a short delay
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMsg(data.message || "Signup failed.");
      }
    } catch (err) {
      setMsg(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSignup} className="max-w-sm mx-auto mt-10 space-y-3">
      <input
        placeholder="Name"
        className="w-full border rounded-lg px-3 py-2"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full border rounded-lg px-3 py-2"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full border rounded-lg px-3 py-2"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        minLength={6}
      />
      <button
        disabled={loading}
        className="w-full bg-indigo-600 disabled:opacity-70 text-white rounded-lg py-2 hover:bg-indigo-700 transition"
      >
        {loading ? "Signing you up..." : "Sign up"}
      </button>
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
    </form>
  );
}