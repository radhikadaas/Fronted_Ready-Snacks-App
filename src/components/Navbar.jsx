// src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "flowbite-react";

function Navbar() {
  const location = useLocation();
  const { user, isAdmin, avatarUrl, logout } = useAuth();

  const active = (path) =>
    location.pathname === path
      ? "text-indigo-400 font-semibold"
      : "text-gray-300";

  // Generate initials from email (e.g., keshav → KS)
  function getInitials(email) {
    if (!email) return "U";
    const name = email.split("@")[0];
    const parts = name.replace(/[^a-zA-Z]/g, " ").split(" ");
    let initials = parts[0]?.[0] || "U";

    if (parts.length > 1 && parts[1][0]) {
      initials += parts[1][0];
    }

    return initials.toUpperCase();
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

        {/* Brand Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-indigo-400 flex items-center gap-1 select-none"
        >
          🍿 <span>Snacks</span>
        </Link>

        {/* --- Navigation Menu --- */}
        <div className="flex items-center gap-6 text-sm">

          <Link className={active("/")} to="/">Home</Link>
          <Link className={active("/cart")} to="/cart">Cart</Link>
          <Link className={active("/orders")} to="/orders">Orders</Link>
          <Link className={active("/profile")} to="/profile">Profile</Link>

          {/* Admin */}
          {isAdmin && (
            <Link className={active("/admin")} to="/admin">
              Admin
            </Link>
          )}

          {/* Authentication */}
          {user ? (
            <>
              <button
                onClick={logout}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Logout
              </button>

              {/* Avatar Logic */}
              {avatarUrl ? (
                <Avatar
                  img={avatarUrl}
                  className="cursor-pointer w-9 h-9 border border-white/20 shadow"
                />
              ) : (
                <Avatar
                  placeholderInitials={getInitials(user.email)}
                  className="cursor-pointer w-9 h-9 border border-white/20 shadow"
                />
              )}
            </>
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

