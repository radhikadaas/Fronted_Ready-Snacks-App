import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Spinner } from "flowbite-react";
import ProductBadges from "../components/product/ProductBadges";

export default function Checkout() {
  const { cart } = useCart();
  const navigate = useNavigate();

  const [loadingPayment, setLoadingPayment] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  if (cart.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold opacity-80">
          Your cart is empty
        </h1>
      </div>
    );

  function handleProceed() {
    setLoadingPayment(true);
    setTimeout(() => navigate("/payment"), 600);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* HEADER */}
        <h1 className="text-4xl font-bold">Checkout</h1>

        {/* ORDER SUMMARY */}
        <div
          className="
            bg-white/10 backdrop-blur-lg
            p-6 rounded-2xl shadow-xl
            border border-white/10
          "
        >
          <h2 className="text-2xl font-bold mb-4">
            Order Summary
          </h2>

          <div className="space-y-4">
            {cart.map((item) => {
              const badges =
                typeof item.badges === "object" && item.badges !== null
                  ? item.badges
                  : {};

              const hasDiscount = !!badges.discount;

              return (
                <div
                  key={item.id}
                  className="bg-white/5 p-4 rounded-xl"
                >
                  {/* DISCOUNT BADGES */}
                  {hasDiscount && (
                    <div className="flex gap-2 mb-2">
                      <ProductBadges
                        product={item}
                        variant="checkout"
                      />
                    </div>
                  )}

                  {/* PRODUCT INFO */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-300">
                        Qty: {item.qty}
                      </p>
                    </div>

                    {/* PRICE */}
                    <div className="text-right">
                      {hasDiscount ? (
                        <>
                          <p className="font-bold text-red-400">
                            ₹{item.price * item.qty}
                          </p>
                          <p className="text-xs line-through text-gray-400">
                            ₹{badges.discount.original_price * item.qty}
                          </p>
                        </>
                      ) : (
                        <p className="font-bold text-white">
                          ₹{item.price * item.qty}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="my-4 border-white/10" />

          {/* TOTAL */}
          <div className="flex justify-between items-center text-xl">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-green-400">
              ₹{total}
            </span>
          </div>
        </div>

        {/* PROCEED BUTTON */}
        <button
          onClick={handleProceed}
          disabled={loadingPayment}
          className={`
            w-full py-3 rounded-xl text-lg font-semibold shadow-lg
            flex items-center justify-center gap-2 transition-all
            ${
              loadingPayment
                ? "bg-linear-to-r from-indigo-500 to-purple-500 cursor-not-allowed scale-95 shadow-indigo-500/50"
                : "bg-indigo-500 hover:bg-indigo-400 text-white hover:shadow-lg hover:shadow-indigo-500/50 hover:scale-105"
            }
          `}
        >
          {loadingPayment ? (
            <>
              <Spinner size="sm" light />
              <span className="animate-pulse">
                Processing Payment...
              </span>
            </>
          ) : (
            "Proceed to Payment →"
          )}
        </button>
      </div>
    </div>
  );
}
