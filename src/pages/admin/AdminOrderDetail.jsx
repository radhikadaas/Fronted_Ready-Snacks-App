import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import OrderStatusBadge from "../../components/OrderStatusBadge";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    supabase
      .from("orders")
      .select("*") // ✅ No join; using user_email saved in table
      .eq("id", id)
      .single()
      .then(({ data }) => setOrder(data));
  }, [id]);

  async function updateField(field, value) {
    const { error } = await supabase
      .from("orders")
      .update({ [field]: value })
      .eq("id", id);

    if (error) alert(error.message);
    else setOrder({ ...order, [field]: value });
  }

  function updateStatus(newStatus) {
    updateField("order_status", newStatus);
  }

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  const shortId = order.id.slice(0, 6).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-10 flex justify-center">
      <div className="w-full max-w-3xl space-y-10">

        {/* HEADER */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl p-8 space-y-6">

          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">
              Order <span className="text-indigo-400">#{shortId}</span>
            </h2>
            <OrderStatusBadge status={order.order_status} />
          </div>

          {/* USER INFO */}
          <div className="space-y-2 text-gray-300">
            <p>
              <span className="font-semibold text-white">User:</span>{" "}
              {order.user_email}
            </p>

            <p>
              <span className="font-semibold text-white">Payment:</span>{" "}
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  order.payment_status === "paid"
                    ? "bg-green-600/30 text-green-300 border border-green-500/30"
                    : "bg-red-600/30 text-red-300 border border-red-500/30"
                }`}
              >
                {order.payment_status}
              </span>
            </p>

            {/* Payment Status Buttons */}
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => updateField("payment_status", "paid")}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-500"
              >
                Mark Paid
              </button>
              <button
                onClick={() => updateField("payment_status", "unpaid")}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500"
              >
                Mark Unpaid
              </button>
            </div>

            <p>
              <span className="font-semibold text-white">Delivery Type:</span>{" "}
              {order.delivery_type === "pickup"
                ? "Self Pickup"
                : "Home Delivery"}
            </p>

            <p className="font-semibold text-lg text-green-400">
              Total: ₹{order.total}
            </p>
          </div>

          {/* DELIVERY ADDRESS */}
          {order.delivery_type === "delivery" && order.address && (
            <div className="bg-white/5 p-5 rounded-xl border border-white/10 mt-4">
              <h3 className="text-xl font-semibold mb-3">Delivery Address</h3>
              <div className="space-y-1 text-gray-300">
                <p><b>Name:</b> {order.address.name}</p>
                <p><b>Phone:</b> {order.address.phone}</p>
                <p><b>Address 1:</b> {order.address.line1}</p>
                <p><b>Address 2:</b> {order.address.line2}</p>
                <p><b>City:</b> {order.address.city}</p>
                <p><b>Pincode:</b> {order.address.pincode}</p>
              </div>
            </div>
          )}

          {/* ORDER STATUS WORKFLOW */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Update Status</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["ordered", "in_process", "shipped", "delivered", "cancelled"].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    className={`
                      w-full px-4 py-2 rounded-lg font-semibold transition
                      ${
                        order.order_status === s
                          ? "bg-gray-600 cursor-default"
                          : "bg-indigo-600 hover:bg-indigo-500 shadow"
                      }
                    `}
                  >
                    Mark as {s.replace("_", " ")}
                  </button>
                )
              )}
            </div>
          </div>

          {/* DELIVERY CHARGE */}
          <div className="bg-white/5 p-5 rounded-xl border border-white/10 mt-6">
            <h3 className="text-xl font-bold mb-3">Delivery Charge</h3>

            <div className="flex gap-3">
              <input
                type="number"
                className="p-2 rounded bg-gray-800 border border-white/20 w-32"
                value={order.delivery_charge_cents || 0}
                onChange={(e) =>
                  setOrder({
                    ...order,
                    delivery_charge_cents: Number(e.target.value),
                  })
                }
              />

              <button
                onClick={() =>
                  updateField("delivery_charge_cents", order.delivery_charge_cents)
                }
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-500"
              >
                Save
              </button>
            </div>
          </div>

        </div>

        {/* ITEMS */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl p-8">
          <h3 className="text-2xl font-bold mb-4">Items</h3>

          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10"
              >
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-gray-400 text-sm">Qty: {item.qty}</p>
                </div>

                <p className="font-bold text-green-400">
                  ₹{item.price * item.qty}
                </p>
              </div>
            ))}
          </div>

          <hr className="my-6 border-white/10" />

          <p className="text-xl font-semibold text-green-400">
            Final Total: ₹{order.total}
          </p>
        </div>

      </div>
    </div>
  );
}


