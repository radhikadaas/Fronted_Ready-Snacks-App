import { Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const active = (path) =>
    location.pathname === path
      ? "text-indigo-400 font-semibold"
      : "text-gray-300";

  async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <nav
      className="
        fixed top-0 left-0 w-full z-50 
        backdrop-blur-md bg-white/10 
        border-b border-white/10
      "
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Brand */}
        <Link
          to="/"
          className="text-xl font-bold text-indigo-400 flex items-center gap-1"
        >
          🍿 <span>Snacks</span>
        </Link>

        {/* Nav Links */}
        <div className="space-x-6 flex items-center text-sm">
          <Link className={active("/")} to="/">Home</Link>
          <Link className={active("/cart")} to="/cart">Cart</Link>
          <Link className={active("/orders")} to="/orders">Orders</Link>
          <Link className={active("/profile")} to="/profile">Profile</Link>

          {isAdmin && (
            <Link className={active("/admin")} to="/admin">
              Admin
            </Link>
          )}

          {user ? (
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          ) : (
            <Link className={active("/login")} to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

