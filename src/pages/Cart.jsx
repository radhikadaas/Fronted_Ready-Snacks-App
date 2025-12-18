import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Spinner } from "flowbite-react";

export default function Cart() {
  const { cart, updateQty, removeItem } = useCart();
  const navigate = useNavigate();

  const [loadingCheckout, setLoadingCheckout] = useState(false); // 🔥 NEW

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (cart.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold opacity-80">Your cart is empty</h1>
        <Link
          to="/"
          className="mt-4 px-6 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-white font-medium transition"
        >
          Browse Menu
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Your Cart</h1>

        <div className="space-y-5">
          {cart.map((item) => (
            <div
              key={item.id}
              className="
                flex gap-4 items-center p-4 
                bg-white/10 backdrop-blur-md rounded-xl shadow-md 
                border border-white/10 transition hover:shadow-lg
              "
            >
              {/* IMAGE */}
              <img
                src={item.image}
                className="w-24 h-24 object-cover rounded-lg shadow-md"
                alt={item.name}
              />

              {/* ITEM INFO */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-300 text-sm">₹{item.price}</p>

                {/* QTY BUTTONS */}
                <div className="flex items-center mt-3 gap-3">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg text-white shadow transition"
                  >
                    –
                  </button>

                  <span className="text-lg font-semibold">{item.qty}</span>

                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg text-white shadow transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* REMOVE BUTTON */}
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-400 hover:text-red-300 text-xl font-bold transition"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* TOTAL + CHECKOUT BUTTON */}
        <div className="mt-8 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg">
          <h2 className="text-2xl font-semibold mb-2">Order Summary</h2>
          <p className="text-lg font-medium text-gray-300">
            Total: <span className="text-white font-bold">₹{total}</span>
          </p>

          {/* 🔥 ANIMATED BUTTON WITH LOADER */}
          <button
            onClick={() => {
              setLoadingCheckout(true);
              setTimeout(() => navigate("/checkout"), 500);
            }}
            disabled={loadingCheckout}
            className={`
              mt-5 w-full py-3 rounded-lg font-semibold
              flex items-center justify-center gap-2 transition-all duration-300
              ${loadingCheckout
                ? "bg-indigo-600 cursor-not-allowed shadow-lg shadow-indigo-500/50 scale-[0.98]"
                : "bg-indigo-500 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/50 text-white active:scale-95"}
            `}
          >
            {loadingCheckout ? (
              <>
                <div className="animate-spin">
                  <Spinner size="sm" light color="white" />
                </div>
                <span className="animate-pulse">Processing Order...</span>
              </>
            ) : (
              "Proceed to Checkout →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

