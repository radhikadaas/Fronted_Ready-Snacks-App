// src/components/AdminOnly.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminOnly({ children }) {
  const { user, isAdmin, loading } = useAuth();

  // ⏳ Wait for session restore
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}


// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function AdminOnly({ children }) {
//   const { user, isAdmin, loading } = useAuth();

//   if (loading) return <p>Loading...</p>;

//   if (!user) return <Navigate to="/login" replace />;

//   if (!isAdmin) return <Navigate to="/" replace />;

//   return children;
// }
