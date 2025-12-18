import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Link } from "react-router-dom";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import { formatIST } from "../../../utils/date";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*") // ✅ Correct — no rpc(), no join
      .order("created_at", { ascending: false });

    if (!error) setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold mb-4">All Orders</h1>

        {loading ? (
          <p className="text-gray-300">Loading...</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10 shadow-xl">

            <table className="w-full text-left text-gray-300">
              <thead className="bg-white/10 backdrop-blur-md">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">User Email</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Manage</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5 transition">

                    <td className="p-3 font-semibold">
                      {o.id.slice(0, 6).toUpperCase()}
                    </td>

                    <td className="p-3 font-bold text-green-400">
                      ₹{o.total}
                    </td>

                    <td className="p-3">{o.user_email || "Unknown"}</td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border
                          ${
                            o.payment_status === "paid"
                              ? "bg-green-600/30 text-green-300 border-green-500/30"
                              : "bg-red-600/30 text-red-300 border-red-500/30"
                          }
                        `}
                      >
                        {o.payment_status}
                      </span>
                    </td>

                    <td className="p-3">
                      <OrderStatusBadge status={o.order_status} />
                    </td>

                    <td className="p-3">
                      {formatIST(o.created_at)}
                    </td>

                    <td className="p-3">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="
                          px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500
                          text-white font-semibold shadow transition
                        "
                      >
                        Manage
                      </Link>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}
