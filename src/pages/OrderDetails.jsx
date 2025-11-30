import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams } from "react-router-dom";
import OrderStatusBadge from "../components/OrderStatusBadge";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [showAddress, setShowAddress] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setOrder(data);
    }

    load();
  }, [id]);

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

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* ⭐ UNIFIED ORDER CARD */}
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-xl space-y-8">

          {/* 🧩 HEADER */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-3xl font-bold">Order {shortId(order.id)}</h1>
            <OrderStatusBadge status={order.order_status} />
          </div>

          {/* 🧩 BADGES ROW */}
          <div className="flex flex-wrap gap-3">
            {/* Payment */}
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                order.payment_status === "paid"
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : "bg-red-500/20 text-red-300 border-red-500/30"
              }`}
            >
              {order.payment_status === "paid" ? "Paid" : "Unpaid"}
            </span>

            {/* Delivery Type */}
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                order.delivery_type === "pickup"
                  ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                  : "bg-green-500/20 text-green-300 border-green-500/30"
              }`}
            >
              {order.delivery_type === "pickup" ? "Self Pickup" : "Home Delivery"}
            </span>
          </div>

          {/* 🧩 ORDER META */}
          <div className="space-y-1 text-gray-300">
            <p className="text-lg">
              <span className="font-semibold text-white">Date:</span>{" "}
              {formatDate(order.created_at)}
            </p>

            <p className="text-lg">
              <span className="font-semibold text-white">Total:</span> ₹{order.total}
            </p>
          </div>

          {/* 🧩 DELIVERY ADDRESS (IF DELIVERY) */}
          {order.delivery_type === "delivery" && order.address && (
            <div className="pt-4 border-t border-white/10">

              <button
                onClick={() => setShowAddress(!showAddress)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition font-medium w-full text-left"
              >
                {showAddress ? "Hide Address" : "Show Delivery Address"}
              </button>

              {showAddress && (
                <div className="mt-4 bg-white/5 p-5 rounded-xl space-y-1">
                  <p><span className="font-semibold">Name:</span> {order.address.name}</p>
                  <p><span className="font-semibold">Phone:</span> {order.address.phone}</p>
                  <p><span className="font-semibold">Address 1:</span> {order.address.line1}</p>
                  <p><span className="font-semibold">Address 2:</span> {order.address.line2}</p>
                  <p><span className="font-semibold">City:</span> {order.address.city}</p>
                  <p><span className="font-semibold">Pincode:</span> {order.address.pincode}</p>
                </div>
              )}
            </div>
          )}

          {/* 🧩 ORDER ITEMS */}
          <div className="pt-4 border-t border-white/10">
            <h2 className="text-2xl font-bold mb-4">Order Items</h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-white/5 rounded-lg p-4"
                >
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-gray-300">Qty: {item.qty}</p>
                  </div>

                  <p className="font-bold text-lg text-white">
                    ₹{item.price * item.qty}
                  </p>
                </div>
              ))}
            </div>

            {/* FINAL TOTAL */}
            <p className="mt-6 text-2xl font-semibold text-green-400">
              Final Total: ₹{order.total}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}


