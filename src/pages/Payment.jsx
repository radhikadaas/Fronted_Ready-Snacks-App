import { useEffect, useState } from "react";
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

  // 🆕 MANUAL DELIVERY LOCATION (GOOGLE MAPS LINK)
  const [deliveryLocation, setDeliveryLocation] = useState("");

  // ✅ PICKUP LOCATIONS
  const [pickupLocations, setPickupLocations] = useState([]);
  const [selectedPickup, setSelectedPickup] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // 🔄 FETCH PICKUP LOCATIONS
  useEffect(() => {
    supabase
      .from("pickup_locations")
      .select("*")
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) setPickupLocations(data);
      });
  }, []);

  // ✅ VALIDATION
  const isPickupValid =
    address.name.trim() !== "" &&
    address.phone.trim() !== "" &&
    selectedPickup !== null;

  const isDeliveryValid =
    address.name.trim() !== "" &&
    address.phone.trim() !== "" &&
    address.line1.trim() !== "" &&
    address.city.trim() !== "" &&
    address.pincode.trim() !== "";

  const isFormValid =
    deliveryType === "pickup" ? isPickupValid : isDeliveryValid;

  // 🚀 PLACE ORDER
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

      address: {
        name: address.name,
        phone: address.phone,
        alternate_phone: address.alternate_phone,
        ...(deliveryType === "delivery"
          ? {
              line1: address.line1,
              line2: address.line2,
              city: address.city,
              pincode: address.pincode,
            }
          : {}),
      },

      pickup_location:
        deliveryType === "pickup"
          ? {
              title: selectedPickup.title,
              address: selectedPickup.address,
              contact_phone: selectedPickup.contact_phone,
              alternate_phone: selectedPickup.alternate_phone,
              map_link: selectedPickup.map_link,
            }
          : null,

      // 🆕 DELIVERY LOCATION (MANUAL GOOGLE MAPS LINK)
      delivery_location:
        deliveryType === "delivery" ? deliveryLocation || null : null,
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
              {["pickup", "delivery"].map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    setDeliveryType(type);
                    setPaymentMethod("online");
                  }}
                >
                  <span
                    className={`w-5 h-5 rounded-full border ${
                      deliveryType === type
                        ? "bg-indigo-500 border-indigo-400"
                        : "bg-gray-800 border-gray-600"
                    }`}
                  />
                  <span>
                    {type === "pickup" ? "Self Pickup" : "Home Delivery"}
                  </span>
                </label>
              ))}
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
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10"
              />
            ))}
          </div>

          {/* 🟣 PICKUP LOCATION */}
          {/* {deliveryType === "pickup" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Select Pickup Location
              </h2>

              <div className="space-y-4">
                {pickupLocations.map((loc) => {
                  const isSelected = selectedPickup?.title === loc.title;

                  return (
                    <div
                      key={loc.id}
                      onClick={() =>
                        setSelectedPickup({
                          title: loc.title,
                          address: loc.address,
                          contact_phone: loc.contact_phone,
                          alternate_phone: loc.alternate_phone,
                          map_link: loc.map_link,
                        })
                      }
                      className={`relative flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all
                        ${
                          isSelected
                            ? "border-indigo-400 bg-indigo-500/20 shadow-lg"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                    >
                      <span
                        className={`mt-1 w-4 h-4 rounded-full border shrink-0 ${
                          isSelected
                            ? "bg-indigo-500 border-indigo-400"
                            : "border-gray-500"
                        }`}
                      />

                      <div className="flex-1 space-y-1">
                        <p className="font-semibold">{loc.title}</p>
                        <p className="text-sm text-gray-300">{loc.address}</p>
                        <p className="text-sm text-gray-400">
                          📞 {loc.contact_phone}
                          {loc.alternate_phone && ` / ${loc.alternate_phone}`}
                        </p>
                      </div>

                      {loc.map_link && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(loc.map_link, "_blank");
                          }}
                          className="absolute top-4 right-4 text-indigo-300 hover:text-indigo-400"
                          title="Open in Google Maps"
                        >
                          📍
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )} */}

          {/* 🟣 PICKUP LOCATION - ENHANCED DESIGN */}
          {deliveryType === "pickup" && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-bold">Select Pickup Location</h2>
                <span className="text-2xl">🏪</span>
              </div>

              {pickupLocations.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No pickup locations available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pickupLocations.map((loc) => {
                    const isSelected = selectedPickup?.title === loc.title;

                    return (
                      <div
                        key={loc.id}
                        onClick={() =>
                          setSelectedPickup({
                            title: loc.title,
                            address: loc.address,
                            contact_phone: loc.contact_phone,
                            alternate_phone: loc.alternate_phone,
                            map_link: loc.map_link,
                          })
                        }
                        className={`group relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 transform ${
                          isSelected
                            ? "border-indigo-400 bg-linear-to-r from-indigo-500/20 to-purple-500/20 shadow-lg shadow-indigo-500/30 scale-102"
                            : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-400/50 hover:shadow-lg"
                        }`}
                      >
                        {/* SELECTION RADIO */}
                        <div className="absolute top-4 right-4">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-indigo-500 border-indigo-300"
                                : "border-gray-500 group-hover:border-indigo-400"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                        </div>

                        <div className="flex gap-4">
                          {/* ICON */}
                          <div
                            className={`text-3xl mt-1 ${
                              isSelected ? "scale-110" : "group-hover:scale-110"
                            } transition-transform`}
                          >
                            🏬
                          </div>

                          {/* CONTENT */}
                          <div className="flex-1 space-y-2">
                            <p className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                              {loc.title}
                            </p>
                            <p className="text-sm text-gray-300 flex items-center gap-2">
                              <span>📍</span>
                              {loc.address}
                            </p>
                            <div className="flex flex-wrap gap-3 text-sm">
                              <p className="text-gray-400 flex items-center gap-1">
                                <span>☎️</span>
                                {loc.contact_phone}
                              </p>
                              {loc.alternate_phone && (
                                <p className="text-gray-400 flex items-center gap-1">
                                  <span>📱</span>
                                  {loc.alternate_phone}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* MAPS BUTTON */}
                          {loc.map_link && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(loc.map_link, "_blank");
                              }}
                              className="self-center px-3 py-2 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/60 text-indigo-300 hover:text-indigo-100 transition-all text-sm font-semibold border border-indigo-400/30 hover:border-indigo-400"
                              title="Open in Google Maps"
                            >
                              🗺️ Maps
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 🟢 DELIVERY ADDRESS */}
          {deliveryType === "delivery" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Delivery Address</h2>

              {["line1", "line2", "city", "pincode"].map((field) => (
                <input
                  key={field}
                  placeholder={field}
                  value={address[field]}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10"
                />
              ))}

              {/* 📍 CURRENT LOCATION INFO CARD */}
              {/* <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5 space-y-3">
                <p className="font-semibold text-indigo-300">
                  📍 Current Location(optional) — Snacks to your Doorstep 😉
                </p>

                <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                  <li><b>Weill confirm the loaction with you from your number don't worry 😉</b></li>
                  <li>Open Google Maps</li>
                  <li>Tap the blue dot (your current location)</li>
                  <li>Select <b>“Share this location”</b></li>
                  <li>Copy the link and paste it below 😉</li>
                </ul>

                <input
                  placeholder="Paste your Google Maps location link here"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-white/10"
                />

                {deliveryLocation && (
                  <a
                    href={deliveryLocation}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-400 underline text-sm"
                  >
                    📍 Open in Google Maps
                  </a>
                )}
              </div> */}
              {/* 📍 CURRENT LOCATION (OPTIONAL) */}
              <div className="rounded-2xl border border-white/10 bg-linear-to-br from-gray-800/70 to-gray-900/80 p-6 space-y-4 shadow-inner">
                {/* HEADER */}
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📍</div>
                  <div>
                    <p className="text-lg font-semibold text-indigo-300">
                      Current Location{" "}
                      <span className="text-sm text-gray-400">(Optional)</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Snacks to your doorstep 😉
                    </p>
                  </div>
                </div>

                {/* INFO NOTE */}
                <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-sm text-gray-300">
                  <p className="mb-2 font-medium text-indigo-200">
                    Don’t worry — we’ll confirm your location on Chat/Call.
                    ☎️
                  </p>

                  <ol className="list-decimal list-inside space-y-1 text-gray-300">
                    <li>
                      Open <b>Google Maps</b>
                    </li>
                    <li>
                      Tap the <b>blue dot</b> (your current location)
                    </li>
                    <li>
                      Select <b>“Share this location”</b>
                    </li>
                    <li>Copy the link and paste it below</li>
                  </ol>
                </div>

                {/* INPUT */}
                <div className="space-y-2">
                  <input
                    placeholder="Paste your Google Maps location link here"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-white/10 text-sm focus:outline-none focus:border-indigo-400 transition"
                  />

                  {/* MAP ACTION */}
                  {deliveryLocation && (
                    <div className="flex justify-end">
                      <a
                        href={deliveryLocation}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-sm font-medium transition border border-indigo-400/30"
                      >
                        🗺️ View on Google Maps for Confirmation
                      </a>
                    </div>
                  )}
                </div>
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
              Total: <span className="text-green-400">₹{total}</span>
            </p>
          </div>

          {/* PAY BUTTON */}
          <button
            disabled={!isFormValid || isLoading}
            onClick={placeOrder}
            className={`w-full py-3 rounded-xl font-semibold ${
              isFormValid
                ? "bg-indigo-500 hover:bg-indigo-400"
                : "bg-gray-700 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Processing..." : "Pay Now (Simulated)"}
          </button>
        </div>
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { useCart } from "../context/CartContext";
// import { useAuth } from "../context/AuthContext";
// import { supabase } from "../lib/supabaseClient";
// import { useNavigate } from "react-router-dom";

// export default function Payment() {
//   const { cart, clearCart } = useCart();
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const [deliveryType, setDeliveryType] = useState("pickup");
//   const [paymentMethod, setPaymentMethod] = useState("online");

//   const [address, setAddress] = useState({
//     name: "",
//     phone: "",
//     alternate_phone: "",
//     line1: "",
//     line2: "",
//     city: "",
//     pincode: "",
//   });

//   // ✅ PICKUP LOCATIONS
//   const [pickupLocations, setPickupLocations] = useState([]);
//   const [selectedPickup, setSelectedPickup] = useState(null);

//   const [isLoading, setIsLoading] = useState(false);

//   const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

//   // 🔄 FETCH PICKUP LOCATIONS
//   useEffect(() => {
//     supabase
//       .from("pickup_locations")
//       .select("*")
//       .eq("is_active", true)
//       .then(({ data }) => {
//         if (data) setPickupLocations(data);
//       });
//   }, []);

//   // ✅ VALIDATION
//   const isPickupValid =
//     address.name.trim() !== "" &&
//     address.phone.trim() !== "" &&
//     selectedPickup !== null;

//   const isDeliveryValid =
//     address.name.trim() !== "" &&
//     address.phone.trim() !== "" &&
//     address.line1.trim() !== "" &&
//     address.city.trim() !== "" &&
//     address.pincode.trim() !== "";

//   const isFormValid =
//     deliveryType === "pickup" ? isPickupValid : isDeliveryValid;

//   // 🚀 PLACE ORDER
//   async function placeOrder() {
//     if (!user) {
//       alert("Please login");
//       navigate("/login");
//       return;
//     }

//     if (!isFormValid) {
//       alert("Please fill all required fields");
//       return;
//     }

//     setIsLoading(true);

//     const payment_status = paymentMethod === "online" ? "paid" : "unpaid";

//     const orderPayload = {
//       user_id: user.id,
//       user_email: user.email,
//       items: cart,
//       total,
//       order_status: "ordered",
//       payment_status,
//       delivery_type: deliveryType,

//       address: {
//         name: address.name,
//         phone: address.phone,
//         alternate_phone: address.alternate_phone,
//         ...(deliveryType === "delivery"
//           ? {
//               line1: address.line1,
//               line2: address.line2,
//               city: address.city,
//               pincode: address.pincode,
//             }
//           : {}),
//       },

//       // ✅ FULL PICKUP LOCATION SNAPSHOT
//       pickup_location:
//         deliveryType === "pickup"
//           ? {
//               title: selectedPickup.title,
//               address: selectedPickup.address,
//               contact_phone: selectedPickup.contact_phone,
//               alternate_phone: selectedPickup.alternate_phone,
//               map_link: selectedPickup.map_link,
//             }
//           : null,
//     };

//     const { error } = await supabase.from("orders").insert(orderPayload);

//     setIsLoading(false);

//     if (error) {
//       alert("Failed to place order: " + error.message);
//       return;
//     }

//     clearCart();
//     navigate("/orders");
//   }

//   if (cart.length === 0)
//     return (
//       <div className="min-h-screen flex items-center justify-center text-white text-xl">
//         Your cart is empty
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gray-900 text-white px-4 py-10 flex justify-center">
//       <div className="w-full max-w-2xl">
//         <h1 className="text-4xl font-bold mb-6">Payment</h1>

//         <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-xl space-y-8">
//           {/* DELIVERY TYPE */}
//           <div>
//             <h2 className="text-xl font-semibold mb-4">Delivery Type</h2>
//             <div className="space-y-3">
//               {["pickup", "delivery"].map((type) => (
//                 <label
//                   key={type}
//                   className="flex items-center gap-3 cursor-pointer"
//                   onClick={() => {
//                     setDeliveryType(type);
//                     setPaymentMethod("online");
//                   }}
//                 >
//                   <span
//                     className={`w-5 h-5 rounded-full border ${
//                       deliveryType === type
//                         ? "bg-indigo-500 border-indigo-400"
//                         : "bg-gray-800 border-gray-600"
//                     }`}
//                   ></span>
//                   <span>
//                     {type === "pickup" ? "Self Pickup" : "Home Delivery"}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* USER INFO */}
//           <div className="space-y-3">
//             <h2 className="text-xl font-semibold mb-2">Your Information</h2>
//             {["name", "phone", "alternate_phone"].map((field) => (
//               <input
//                 key={field}
//                 placeholder={
//                   field === "alternate_phone"
//                     ? "Alternate Phone (optional)"
//                     : field.charAt(0).toUpperCase() + field.slice(1)
//                 }
//                 value={address[field]}
//                 onChange={(e) =>
//                   setAddress((prev) => ({ ...prev, [field]: e.target.value }))
//                 }
//                 className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10"
//               />
//             ))}
//           </div>

//           {/* PICKUP LOCATION */}
//           {/* {deliveryType === "pickup" && (
//             <div>
//               <h2 className="text-xl font-semibold mb-4">
//                 Select Pickup Location
//               </h2>

//               <div className="space-y-3">
//                 {pickupLocations.map((loc) => (
//                   <div
//                     key={loc.id}
//                     onClick={() => setSelectedPickup(loc)}
//                     className={`p-4 rounded-xl border cursor-pointer transition ${
//                       selectedPickup?.id === loc.id
//                         ? "border-indigo-400 bg-indigo-500/20"
//                         : "border-white/10 bg-white/5 hover:bg-white/10"
//                     }`}
//                   >
//                     <div className="flex items-start gap-3">
//                       <span
//                         className={`mt-1 w-4 h-4 rounded-full border ${
//                           selectedPickup?.id === loc.id
//                             ? "bg-indigo-500 border-indigo-400"
//                             : "border-gray-500"
//                         }`}
//                       ></span>

//                       <div>
//                         <p className="font-semibold">{loc.title}</p>
//                         <p className="text-sm text-gray-300">{loc.address}</p>
//                         <p className="text-sm text-gray-400">
//                           📞 {loc.contact_phone}
//                           {loc.alternate_phone && ` / ${loc.alternate_phone}`}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )} */}

//           {/* 🆕 PICKUP LOCATION CARD */}
//           {deliveryType === "pickup" && (
//             <div>
//               <h2 className="text-xl font-semibold mb-4">
//                 Select Pickup Location
//               </h2>

//               <div className="space-y-4">
//                 {pickupLocations.map((loc) => {
//                   const isSelected = selectedPickup?.title === loc.title;

//                   return (
//                     <div
//                       key={loc.id}
//                       onClick={() =>
//                         setSelectedPickup({
//                           title: loc.title,
//                           address: loc.address,
//                           contact_phone: loc.contact_phone,
//                           alternate_phone: loc.alternate_phone,
//                           map_link: loc.map_link,
//                         })
//                       }
//                       className={`relative flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all
//               ${
//                 isSelected
//                   ? "border-indigo-400 bg-indigo-500/20 shadow-lg"
//                   : "border-white/10 bg-white/5 hover:bg-white/10 hover:-translate-y-0.5"
//               }`}
//                     >
//                       {/* RADIO */}
//                       <span
//                         className={`mt-1 w-4 h-4 rounded-full border shrink-0 ${
//                           isSelected
//                             ? "bg-indigo-500 border-indigo-400"
//                             : "border-gray-500"
//                         }`}
//                       />

//                       {/* LOCATION INFO */}
//                       <div className="flex-1 space-y-1">
//                         <p className="font-semibold text-white">{loc.title}</p>
//                         <p className="text-sm text-gray-300">{loc.address}</p>
//                         <p className="text-sm text-gray-400">
//                           📞 {loc.contact_phone}
//                           {loc.alternate_phone && ` / ${loc.alternate_phone}`}
//                         </p>
//                       </div>

//                       {/* MAP ICON */}
//                       {loc.map_link && (
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation(); // 👈 IMPORTANT
//                             setSelectedPickup({
//                               title: loc.title,
//                               address: loc.address,
//                               contact_phone: loc.contact_phone,
//                               alternate_phone: loc.alternate_phone,
//                               map_link: loc.map_link,
//                             });
//                             window.open(loc.map_link, "_blank");
//                           }}
//                           className="absolute top-4 right-4 text-indigo-300 hover:text-indigo-400 transition"
//                           title="Open in Google Maps"
//                         >
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="h-6 w-6"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                             />
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                             />
//                           </svg>
//                         </button>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* DELIVERY ADDRESS */}
//           {deliveryType === "delivery" && (
//             <div className="space-y-3">
//               <h2 className="text-xl font-semibold mb-2">Delivery Address</h2>
//               {["line1", "line2", "city", "pincode"].map((field) => (
//                 <input
//                   key={field}
//                   placeholder={field}
//                   value={address[field]}
//                   onChange={(e) =>
//                     setAddress((prev) => ({ ...prev, [field]: e.target.value }))
//                   }
//                   className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10"
//                 />
//               ))}
//             </div>
//           )}

//           {/* ORDER SUMMARY */}
//           <div>
//             <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
//             {cart.map((item) => (
//               <div key={item.id} className="flex justify-between text-sm mb-2">
//                 <span>
//                   {item.name} × {item.qty}
//                 </span>
//                 <span>₹{item.price * item.qty}</span>
//               </div>
//             ))}
//             <hr className="my-4 border-white/10" />
//             <p className="text-lg font-semibold">
//               Total: <span className="text-green-400">₹{total}</span>
//             </p>
//           </div>

//           {/* PAY BUTTON */}
//           <button
//             disabled={!isFormValid || isLoading}
//             onClick={placeOrder}
//             className={`w-full py-3 rounded-xl font-semibold ${
//               isFormValid
//                 ? "bg-indigo-500 hover:bg-indigo-400"
//                 : "bg-gray-700 cursor-not-allowed"
//             }`}
//           >
//             {isLoading ? "Processing..." : "Pay Now (Simulated)"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
