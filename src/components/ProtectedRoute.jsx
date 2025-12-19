// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ⏳ WAIT until Supabase session is restored
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // 🔐 Redirect ONLY after loading is false
  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
}


// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function ProtectedRoute({ children }) {
//   const { user } = useAuth();
//   const location = useLocation();

//   if (!user) {
//     return (
//       <Navigate
//         to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
//         replace
//       />
//     );
//   }

//   return children;
// }
