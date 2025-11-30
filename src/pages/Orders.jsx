import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import OrderStatusBadge from "../components/OrderStatusBadge";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function load() {
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setOrders(data);
    }
    load();
  }, [user]);

  function shortId(id) {
    return "ORD-" + id.slice(0, 5);
  }

  function formatDate(d) {
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Orders</h1>

        {/* EMPTY STATE */}
        {orders.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center shadow-md">
            <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-gray-300 mb-6">
              Looks like you haven’t placed any orders yet.
            </p>

            <Link
              to="/"
              className="inline-block px-5 py-2 bg-indigo-500 rounded-md text-white font-medium hover:bg-indigo-400 transition"
            >
              Browse Menu
            </Link>
          </div>
        )}

        {/* ORDER LIST */}
        <div className="space-y-6">
          {orders.map((o) => (
            <div
              key={o.id}
              className="
                bg-white/10 backdrop-blur-lg border border-white/10 
                p-6 rounded-xl shadow-md hover:shadow-lg transition
              "
            >
              {/* Top Row */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">{shortId(o.id)}</h2>

                <span
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    o.delivery_type === "pickup"
                      ? "bg-blue-600 text-white"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {o.delivery_type === "pickup" ? "Self Pickup" : "Home Delivery"}
                </span>
              </div>

              {/* Status + Payment */}
              <div className="flex items-center justify-between mb-4">
                <OrderStatusBadge status={o.order_status} />

                <span
                  className={`px-3 py-1 rounded-md text-sm font-semibold ${
                    o.payment_status === "paid"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {o.payment_status === "paid" ? "Paid" : "Unpaid"}
                </span>
              </div>

              {/* Price + Date */}
              <div className="mb-4">
                <p className="font-bold text-lg">Total: ₹{o.total}</p>
                <p className="text-gray-300 text-sm">
                  Date: {formatDate(o.created_at)}
                </p>
              </div>

              {/* View Details Button */}
              <Link
                to={`/orders/${o.id}`}
                className="inline-block px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-400 transition"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

