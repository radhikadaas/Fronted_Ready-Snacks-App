import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminOnly({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/login" replace />;

  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
