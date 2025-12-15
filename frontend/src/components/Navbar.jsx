import { NavLink } from "react-router-dom";
import { getToken, logout } from "../lib/auth";

export default function Navbar() {
  const token = getToken();
  const linkBase = "px-3 py-2 rounded-lg transition";
  const linkActive = ({ isActive }) =>
    isActive ? `${linkBase} bg-indigo-600 text-white` : `${linkBase} text-slate-700 hover:bg-slate-100`;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b border-slate-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-3">
        <a href="/" className="font-bold text-indigo-700 text-xl">Orgy</a>
        <div className="flex items-center gap-2">
          <NavLink to="/" className={linkActive}>Home</NavLink>
          {token && <NavLink to="/dashboard" className={linkActive}>Dashboard</NavLink>}
          {token && <NavLink to="/reports" className={linkActive}>Reports</NavLink>}
          {!token ? (
            <>
              <NavLink to="/login" className={linkActive}>Login</NavLink>
              <NavLink to="/signup" className={linkActive}>Signup</NavLink>
            </>
          ) : (
            <button onClick={logout} className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}