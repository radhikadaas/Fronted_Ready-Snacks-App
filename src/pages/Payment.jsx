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
    line1: "",
    line2: "",
    city: "",
    pincode: "",
  });

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  async function placeOrder() {
    if (!user) {
      alert("Please login");
      navigate("/login");
      return;
    }

    if (deliveryType === "delivery") {
      if (!address.name || !address.phone || !address.line1 || !address.city || !address.pincode) {
        alert("Please fill all required delivery fields");
        return;
      }
    }

    let payment_status = paymentMethod === "online" ? "paid" : "unpaid";

    const orderPayload = {
      user_id: user.id,
      user_email: user.email,
      items: cart,
      total,
      order_status: "ordered",
      payment_status,
      delivery_type: deliveryType,
      address: deliveryType === "delivery" ? address : null,
    };

    const { error } = await supabase.from("orders").insert(orderPayload);

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

        {/* PAGE TITLE */}
        <h1 className="text-4xl font-bold mb-6">Payment</h1>

        {/* ⭐ UNIFIED CARD */}
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-xl space-y-8">

          {/* DELIVERY TYPE */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Delivery Type</h2>

            <div className="space-y-3">
              {/* Pickup */}
              <label className="flex items-center gap-3 cursor-pointer">
                <span
                  className={`w-5 h-5 rounded-full border transition 
                    ${
                      deliveryType === "pickup"
                        ? "border-indigo-400 bg-indigo-500"
                        : "border-gray-600 bg-gray-800"
                    }
                  `}
                  onClick={() => {
                    setDeliveryType("pickup");
                    setPaymentMethod("online");
                  }}
                ></span>
                <span>Self Pickup</span>
              </label>

              {/* Delivery */}
              <label className="flex items-center gap-3 cursor-pointer">
                <span
                  className={`w-5 h-5 rounded-full border transition 
                    ${
                      deliveryType === "delivery"
                        ? "border-indigo-400 bg-indigo-500"
                        : "border-gray-600 bg-gray-800"
                    }
                  `}
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
              {/* Online */}
              <label className="flex items-center gap-3 cursor-pointer">
                <span
                  className={`w-5 h-5 rounded-full border transition 
                    ${
                      paymentMethod === "online"
                        ? "border-green-400 bg-green-500"
                        : "border-gray-600 bg-gray-800"
                    }
                  `}
                  onClick={() => setPaymentMethod("online")}
                ></span>
                <span>Online Payment</span>
              </label>

              {/* COD */}
              <label
                className={`flex items-center gap-3 cursor-pointer ${
                  deliveryType === "delivery" ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border transition 
                    ${
                      paymentMethod === "cod"
                        ? "border-yellow-400 bg-yellow-500"
                        : "border-gray-600 bg-gray-800"
                    }
                  `}
                  onClick={() => deliveryType !== "delivery" && setPaymentMethod("cod")}
                ></span>
                <span>Cash on Pickup</span>
              </label>
            </div>
          </div>

          {/* ADDRESS FORM (IF DELIVERY) */}
          {deliveryType === "delivery" && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold mb-2">Delivery Address</h2>

              {["name", "phone", "line1", "line2", "city", "pincode"].map((field) => (
                <input
                  key={field}
                  placeholder={field}
                  value={address[field]}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  className="
                    w-full px-4 py-2 rounded-lg 
                    bg-gray-800 border border-white/10 
                    text-white placeholder-gray-400 
                    focus:border-indigo-500 focus:ring-indigo-500
                    outline-none transition
                  "
                />
              ))}

              {/* Info Box */}
              <div className="bg-white/10 p-4 rounded-xl border border-white/10 text-gray-300 text-sm">
                Home delivery uses <b>Ola / Uber / Auto</b>.  
                Delivery charges vary by location and must be paid  
                <b> directly to the delivery person.</b>
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
            onClick={placeOrder}
            className="
              w-full py-3 rounded-xl 
              bg-indigo-500 hover:bg-indigo-400 
              text-white font-semibold text-lg 
              shadow-lg transition
            "
          >
            Pay Now (Simulated)
          </button>

        </div>
      </div>
    </div>
  );
}


