import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Payment() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState("online");

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    alternate_phone: "",
    line1: "",
    line2: "",
    city: "",
    pincode: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const isPickupValid =
    address.name.trim() !== "" && address.phone.trim() !== "";

  const isDeliveryValid =
    isPickupValid &&
    address.line1.trim() !== "" &&
    address.city.trim() !== "" &&
    address.pincode.trim() !== "";

  const isFormValid =
    deliveryType === "pickup" ? isPickupValid : isDeliveryValid;

  // ⭐ FINAL — ONLY ONE placeOrder FUNCTION (MERGED)
  async function placeOrder() {
    if (!user) {
      alert("Please login");
      navigate("/login");
      return;
    }

    if (!isFormValid) {
      alert("Please fill all required fields");
      return;
    }

    setIsLoading(true);

    const payment_status = paymentMethod === "online" ? "paid" : "unpaid";

    const orderPayload = {
      user_id: user.id,
      user_email: user.email,
      items: cart,
      total,
      order_status: "ordered",
      payment_status,
      delivery_type: deliveryType,
      address,
    };

    const { error } = await supabase.from("orders").insert(orderPayload);

    setIsLoading(false);

    if (error) {
      alert("Failed to place order: " + error.message);
      return;
    }

    clearCart();
    navigate("/orders");
  }

  if (cart.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Your cart is empty
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-10 flex justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-6">Payment</h1>

        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-xl space-y-8">

          {/* DELIVERY TYPE */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Delivery Type</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <span
                  className={`w-5 h-5 rounded-full border transition ${
                    deliveryType === "pickup"
                      ? "border-indigo-400 bg-indigo-500"
                      : "border-gray-600 bg-gray-800"
                  }`}
                  onClick={() => {
                    setDeliveryType("pickup");
                    setPaymentMethod("online");
                  }}
                ></span>
                <span>Self Pickup</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <span
                  className={`w-5 h-5 rounded-full border transition ${
                    deliveryType === "delivery"
                      ? "border-indigo-400 bg-indigo-500"
                      : "border-gray-600 bg-gray-800"
                  }`}
                  onClick={() => {
                    setDeliveryType("delivery");
                    setPaymentMethod("online");
                  }}
                ></span>
                <span>Home Delivery</span>
              </label>
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <span
                  className={`w-5 h-5 rounded-full border transition ${
                    paymentMethod === "online"
                      ? "border-green-400 bg-green-500"
                      : "border-gray-600 bg-gray-800"
                  }`}
                  onClick={() => setPaymentMethod("online")}
                ></span>
                <span>Online Payment</span>
              </label>

              <label
                className={`flex items-center gap-3 cursor-pointer ${
                  deliveryType === "delivery" ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border transition ${
                    paymentMethod === "cod"
                      ? "border-yellow-400 bg-yellow-500"
                      : "border-gray-600 bg-gray-800"
                  }`}
                  onClick={() =>
                    deliveryType !== "delivery" && setPaymentMethod("cod")
                  }
                ></span>
                <span>Cash on Pickup</span>
              </label>
            </div>
          </div>

          {/* USER INFO */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold mb-2">Your Information</h2>
            {["name", "phone", "alternate_phone"].map((field) => (
              <input
                key={field}
                placeholder={
                  field === "alternate_phone"
                    ? "Alternate Phone (optional)"
                    : field.charAt(0).toUpperCase() + field.slice(1)
                }
                value={address[field]}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, [field]: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition"
              />
            ))}
          </div>

          {/* DELIVERY ADDRESS */}
          {deliveryType === "delivery" && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold mb-2">Delivery Address</h2>
              {["line1", "line2", "city", "pincode"].map((field) => (
                <input
                  key={field}
                  placeholder={field}
                  value={address[field]}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition"
                />
              ))}

              <div className="bg-linear-to-r from-indigo-500/20 to-purple-500/20 p-4 rounded-xl border border-indigo-400/30 text-gray-200 text-sm">
                <p className="mb-2">
                  <span className="text-indigo-300 font-semibold">
                    ✨ Fast & Reliable Delivery
                  </span>
                </p>
                We partner with <b className="text-green-400">Ola, Uber & Auto</b> to ensure quick delivery.
                <br />
                <span className="text-yellow-300 font-semibold">
                  📍 Delivery charges
                </span>{" "}
                must be paid directly to the rider.
              </div>
            </div>
          )}

          {/* ORDER SUMMARY */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm mb-2">
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>₹{item.price * item.qty}</span>
              </div>
            ))}
            <hr className="my-4 border-white/10" />
            <p className="text-lg font-semibold">
              Total: <span className="text-green-400 font-bold">₹{total}</span>
            </p>
          </div>

          {/* PAY BUTTON */}
          <button
            disabled={!isFormValid || isLoading}
            onClick={placeOrder}
            className={`w-full py-3 rounded-xl text-white font-semibold text-lg shadow-lg transition flex items-center justify-center gap-2 ${
              isFormValid && !isLoading
                ? "bg-indigo-500 hover:bg-indigo-400"
                : "bg-gray-700 cursor-not-allowed"
            }`}
          >
            {isLoading && (
              <svg
                className="w-5 h-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span>{isLoading ? "Processing..." : "Pay Now (Simulated)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


