import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Spinner } from "flowbite-react";

export default function Checkout() {
  const { cart } = useCart();
  const navigate = useNavigate();

  const [loadingPayment, setLoadingPayment] = useState(false); // 🔥 NEW

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (cart.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold opacity-80">Your cart is empty</h1>
      </div>
    );

  function handleProceed() {
    setLoadingPayment(true);

    // Smooth delay before routing
    setTimeout(() => navigate("/payment"), 600);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* HEADER */}
        <h1 className="text-4xl font-bold">Checkout</h1>

        {/* ⭐ ORDER SUMMARY CARD */}
        <div
          className="
            bg-white/10 backdrop-blur-lg 
            p-6 rounded-2xl shadow-xl 
            border border-white/10
          "
        >
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-white/5 p-4 rounded-xl"
              >
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-sm text-gray-300">Qty: {item.qty}</p>
                </div>

                <p className="font-bold text-white">
                  ₹{item.price * item.qty}
                </p>
              </div>
            ))}
          </div>

          <hr className="my-4 border-white/10" />

          <div className="flex justify-between items-center text-xl">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-green-400">₹{total}</span>
          </div>
        </div>

        {/* ⭐ PROCEED BUTTON WITH BEAUTIFUL LOADER */}
        <button
          onClick={handleProceed}
          disabled={loadingPayment}
          className={`
            w-full py-3 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300
            flex items-center justify-center gap-2
            ${loadingPayment
              ? "bg-linear-to-r from-indigo-500 to-purple-500 cursor-not-allowed scale-95 shadow-indigo-500/50"
              : "bg-indigo-500 hover:bg-indigo-400 text-white hover:shadow-lg hover:shadow-indigo-500/50 hover:scale-105"}
          `}
        >
          {loadingPayment ? (
            <>
              <Spinner size="sm" light />
              <span className="animate-pulse">Processing Payment...</span>
            </>
          ) : (
            <span className="transition-transform group-hover:translate-x-1">
              Proceed to Payment →
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

