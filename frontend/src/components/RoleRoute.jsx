import { Navigate } from "react-router-dom";

export default function RoleRoute({ user, allow = [], children }) {
  if (!user) return <Navigate to="/login" replace />;
  return allow.includes(user.role) ? children : <Navigate to="/" replace />;
}