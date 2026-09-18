import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";

// Sends signed-out visitors to the login page, remembering where they were
// headed so login can send them back.
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
