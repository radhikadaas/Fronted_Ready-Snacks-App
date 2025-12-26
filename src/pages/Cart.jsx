import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Spinner } from "flowbite-react";
import ProductBadges from "../components/product/ProductBadges";

export default function Cart() {
  const { cart, updateQty, removeItem } = useCart();
  const navigate = useNavigate();

  const [loadingCheckout, setLoadingCheckout] = useState(false);

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
          {cart.map((item) => {
            const badges =
              typeof item.badges === "object" && item.badges !== null
                ? item.badges
                : {};

            const hasDiscount = !!badges.discount;

            return (
              <div
                key={item.id}
                className="
    p-4 bg-white/10 backdrop-blur-md rounded-xl
    border border-white/10 shadow-md
  "
              >
                <div className="flex gap-4 items-start">
                  {/* IMAGE (LEFT) */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg shadow-md shrink-0"
                  />

                  {/* CONTENT (VERTICAL) */}
                  <div className="flex-1 flex flex-col gap-2">
                    {/* BADGES */}
                    {hasDiscount && (
                      <div className="flex gap-2">
                        <ProductBadges product={item} variant="cart" />
                      </div>
                    )}

                    {/* PRODUCT NAME */}
                    <h3 className="text-lg font-semibold leading-tight">
                      {item.name}
                    </h3>

                    {/* PRICE */}
                    {hasDiscount ? (
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-semibold">
                          ₹{item.price}
                        </span>
                        <span className="line-through text-gray-400 text-sm">
                          ₹{badges.discount.original_price}
                        </span>
                      </div>
                    ) : (
                      <p className="text-gray-300">₹{item.price}</p>
                    )}

                    {/* QTY CONTROLS */}
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg"
                      >
                        –
                      </button>

                      <span className="text-lg font-semibold">{item.qty}</span>

                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* REMOVE (RIGHT) */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-300 text-xl font-bold self-start"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ORDER SUMMARY (UNCHANGED) */}
        <div className="mt-8 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg">
          <h2 className="text-2xl font-semibold mb-2">Order Summary</h2>

          <p className="text-lg font-medium text-gray-300">
            Total: <span className="text-white font-bold">₹{total}</span>
          </p>

          <button
            onClick={() => {
              setLoadingCheckout(true);
              setTimeout(() => navigate("/checkout"), 500);
            }}
            disabled={loadingCheckout}
            className={`
              mt-5 w-full py-3 rounded-lg font-semibold
              flex items-center justify-center gap-2 transition-all
              ${
                loadingCheckout
                  ? "bg-indigo-600 cursor-not-allowed shadow-lg"
                  : "bg-indigo-500 hover:bg-indigo-400 hover:shadow-lg active:scale-95"
              }
            `}
          >
            {loadingCheckout ? (
              <>
                <Spinner size="sm" light />
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
