import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams } from "react-router-dom";
import OrderStatusBadge from "../components/OrderStatusBadge";

import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Toast,
  ToastToggle,
} from "flowbite-react";

import {
  HiOutlineExclamationCircle,
  HiFire,
  HiLocationMarker,
} from "react-icons/hi";
import { formatIST } from "../../utils/date";

export default function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [showAddress, setShowAddress] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [saving, setSaving] = useState(false);

  const [pickupLocations, setPickupLocations] = useState([]);

  const [showToast, setShowToast] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      setOrder(data);
    }

    load();

    supabase
      .from("pickup_locations")
      .select("*")
      .eq("is_active", true)
      .then(({ data }) => setPickupLocations(data || []));
  }, [id]);

  const isPickup = order?.delivery_type === "pickup";
  const addr = order?.address || {};
  const pickup = order?.pickup_location || null;

  function shortId(id) {
    return "ORD-" + id.slice(0, 5);
  }

  // ---------- EDIT MODE ----------
  function startEdit() {
    setEditingData({
      name: addr.name || "",
      phone: addr.phone || "",
      alternate_phone: addr.alternate_phone || "",
      pickup_location: pickup || null,
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      pincode: addr.pincode || "",
    });

    setIsEditing(true);
    setShowAddress(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditingData(null);
  }

  function validateSave() {
    if (!editingData?.name || !editingData?.phone) return false;
    if (isPickup && !editingData.pickup_location) return false;
    if (
      !isPickup &&
      (!editingData.line1 || !editingData.city || !editingData.pincode)
    )
      return false;
    return true;
  }

  async function saveChanges() {
    if (!validateSave()) return;

    setSaving(true);

    const updatedAddress = {
      name: editingData.name,
      phone: editingData.phone,
      alternate_phone: editingData.alternate_phone,
      ...(isPickup
        ? {}
        : {
            line1: editingData.line1,
            line2: editingData.line2,
            city: editingData.city,
            pincode: editingData.pincode,
          }),
    };

    const { error } = await supabase
      .from("orders")
      .update({
        address: updatedAddress,
        pickup_location: isPickup ? editingData.pickup_location : null,
      })
      .eq("id", id);

    setSaving(false);

    if (!error) {
      setOrder({
        ...order,
        address: updatedAddress,
        pickup_location: editingData.pickup_location,
      });
      setIsEditing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }

  async function confirmCancelOrder() {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: "cancelled" })
      .eq("id", id);

    if (!error) {
      setOrder({ ...order, order_status: "cancelled" });
      setOpenCancelModal(false);
    }
  }

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 p-8 rounded-2xl space-y-8">
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Order {shortId(order.id)}</h1>
              <OrderStatusBadge status={order.order_status} />
            </div>

            {/* 📍 CURRENT PICKUP LOCATION */}
            {isPickup && pickup?.map_link && (
              <a
                href={pickup.map_link}
                target="_blank"
                rel="noreferrer"
                className="group block p-4 rounded-xl border border-indigo-400/30
                           bg-indigo-500/10 hover:bg-indigo-500/20
                           transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400
                                  group-hover:scale-110 transition"
                  >
                    <HiLocationMarker className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-indigo-300 font-semibold">
                      Current Pickup Location
                    </p>
                    <p className="font-semibold text-white">{pickup.title}</p>
                    <p className="text-sm text-gray-300">{pickup.address}</p>
                  </div>

                  <span
                    className="text-sm text-indigo-300 opacity-0
                                   group-hover:opacity-100 transition"
                  >
                    Open Maps →
                  </span>
                </div>
              </a>
            )}

            {/* 📍 CURRENT DELIVERY LOCATION */}
            {!isPickup && order?.delivery_location && (
              <a
                href={order.delivery_location}
                target="_blank"
                rel="noreferrer"
                className="group block p-4 rounded-xl border border-green-400/30 
               bg-green-500/10 hover:bg-green-500/20 
               transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg bg-green-600/20 text-green-400 
                      group-hover:scale-110 transition"
                  >
                    <HiLocationMarker className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-green-300 font-semibold">
                      Delivery Location
                    </p>
                    <p className="text-sm text-gray-300">
                      Tap to open in Google Maps
                    </p>
                  </div>

                  <span
                    className="text-sm text-green-300 opacity-0 
                       group-hover:opacity-100 transition"
                  >
                    Open Maps →
                  </span>
                </div>
              </a>
            )}

            <p>
              <b>Date:</b> {formatIST(order.created_at)}
            </p>
            <p>
              <b>Total:</b> ₹{order.total}
            </p>

            {/* DETAILS */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => setShowAddress(!showAddress)}
                className="w-full py-2 rounded-lg bg-gray-800"
              >
                {showAddress
                  ? "Hide Details"
                  : isPickup
                  ? "Show Pickup Details"
                  : "Show Delivery Address"}
              </button>

              {showAddress && (
                <div className="mt-4 bg-white/5 p-5 rounded-xl space-y-4">
                  {!isEditing && (
                    <>
                      {/* BASIC INFO (COMMON) */}
                      <p>
                        <b>Name:</b> {addr.name}
                      </p>
                      <p>
                        <b>Phone:</b> {addr.phone}
                      </p>
                      <p>
                        <b>Alternate:</b> {addr.alternate_phone || "—"}
                      </p>

                      {/* 🟢 DELIVERY ADDRESS (ONLY FOR HOME DELIVERY) */}
                      {!isPickup && (
                        <div className="pt-3 space-y-1">
                          <p className="font-semibold text-green-400">
                            Delivery Address
                          </p>
                          <p>
                            <b>Address Line 1:</b> {addr.line1}
                          </p>
                          {addr.line2 && (
                            <p>
                              <b>Address Line 2:</b> {addr.line2}
                            </p>
                          )}
                          <p>
                            <b>City:</b> {addr.city}
                          </p>
                          <p>
                            <b>Pincode:</b> {addr.pincode}
                          </p>
                        </div>
                      )}

                      {/* 🟣 PICKUP DETAILS (ONLY FOR PICKUP) */}
                      {isPickup && pickup && (
                        <div className="pt-3 space-y-1">
                          <p className="font-semibold text-indigo-400">
                            Pickup Location
                          </p>
                          <p>
                            <b>Building:</b> {pickup.title}
                          </p>
                          <p>
                            <b>Address:</b> {pickup.address}
                          </p>
                          <p>
                            <b>Shop Phone:</b> {pickup.contact_phone}
                          </p>
                          <p>
                            <b>Alternate:</b> {pickup.alternate_phone || "—"}
                          </p>
                        </div>
                      )}

                      <button
                        className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg"
                        onClick={startEdit}
                      >
                        Edit
                      </button>
                    </>
                  )}

                  {isEditing && (
                    <div className="space-y-4">
                      {/* BASIC INFO */}
                      {["name", "phone", "alternate_phone"].map((f) => (
                        <input
                          key={f}
                          value={editingData[f]}
                          placeholder={f.replace("_", " ")}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              [f]: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-800 rounded"
                        />
                      ))}

                      {/* 🟢 DELIVERY ADDRESS (HOME DELIVERY) */}
                      {!isPickup && (
                        <div className="space-y-3 pt-2">
                          <p className="font-semibold text-green-400">
                            Delivery Address
                          </p>

                          {["line1", "line2", "city", "pincode"].map((f) => (
                            <input
                              key={f}
                              value={editingData[f]}
                              placeholder={f.replace("_", " ")}
                              onChange={(e) =>
                                setEditingData({
                                  ...editingData,
                                  [f]: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 bg-gray-800 rounded"
                            />
                          ))}
                        </div>
                      )}

                      {/* 🟣 PICKUP LOCATION (PICKUP ONLY) */}
                      {isPickup && (
                        <div className="space-y-2">
                          <p className="font-semibold text-indigo-400">
                            Pickup Location
                          </p>

                          {pickupLocations.map((loc) => (
                            <div
                              key={loc.id}
                              onClick={() =>
                                setEditingData({
                                  ...editingData,
                                  pickup_location: {
                                    title: loc.title,
                                    address: loc.address,
                                    contact_phone: loc.contact_phone,
                                    alternate_phone: loc.alternate_phone,
                                    map_link: loc.map_link,
                                  },
                                })
                              }
                              className={`p-3 rounded-lg cursor-pointer border ${
                                editingData.pickup_location?.title === loc.title
                                  ? "border-indigo-400 bg-indigo-500/20"
                                  : "border-white/10"
                              }`}
                            >
                              <p className="font-medium">{loc.title}</p>
                              <p className="text-sm text-gray-300">
                                {loc.address}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ACTIONS */}
                      <div className="flex gap-3 pt-2">
                        <button
                          disabled={!validateSave()}
                          onClick={saveChanges}
                          className="bg-green-600 px-4 py-2 rounded"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>

                        <button
                          onClick={cancelEdit}
                          className="bg-gray-600 px-4 py-2 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ITEMS */}
            <div className="pt-4 border-t border-white/10">
              <h2 className="text-2xl font-bold mb-3">Order Items</h2>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between p-3 bg-white/5 rounded-lg"
                >
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span>₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TOAST */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast>
            <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <HiFire className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm">Updated successfully!</div>
            <ToastToggle onDismiss={() => setShowToast(false)} />
          </Toast>
        </div>
      )}
    </>
  );
}

// import { useEffect, useState } from "react";
// import { supabase } from "../lib/supabaseClient";
// import { useParams } from "react-router-dom";
// import OrderStatusBadge from "../components/OrderStatusBadge";

// import {
//   Modal,
//   ModalHeader,
//   ModalBody,
//   Button,
//   Toast,
//   ToastToggle,
// } from "flowbite-react";

// import { HiOutlineExclamationCircle, HiFire, HiLocationMarker } from "react-icons/hi";
// import { formatIST } from "../../utils/date";

// export default function OrderDetails() {
//   const { id } = useParams();

//   const [order, setOrder] = useState(null);
//   const [showAddress, setShowAddress] = useState(false);

//   const [isEditing, setIsEditing] = useState(false);
//   const [editingData, setEditingData] = useState(null);
//   const [saving, setSaving] = useState(false);

//   const [pickupLocations, setPickupLocations] = useState([]);

//   const [showToast, setShowToast] = useState(false);
//   const [openCancelModal, setOpenCancelModal] = useState(false);

//   useEffect(() => {
//     async function load() {
//       const { data } = await supabase
//         .from("orders")
//         .select("*")
//         .eq("id", id)
//         .single();

//       setOrder(data);
//     }

//     load();

//     supabase
//       .from("pickup_locations")
//       .select("*")
//       .eq("is_active", true)
//       .then(({ data }) => setPickupLocations(data || []));
//   }, [id]);

//   const isPickup = order?.delivery_type === "pickup";
//   const addr = order?.address || {};
//   const pickup = order?.pickup_location || null;

//   function shortId(id) {
//     return "ORD-" + id.slice(0, 5);
//   }

//   // ---------- EDIT MODE ----------
//   function startEdit() {
//     setEditingData({
//       name: addr.name || "",
//       phone: addr.phone || "",
//       alternate_phone: addr.alternate_phone || "",
//       pickup_location: pickup || null,
//       line1: addr.line1 || "",
//       line2: addr.line2 || "",
//       city: addr.city || "",
//       pincode: addr.pincode || "",
//     });

//     setIsEditing(true);
//     setShowAddress(true);
//   }

//   function cancelEdit() {
//     setIsEditing(false);
//     setEditingData(null);
//   }

//   function validateSave() {
//     if (!editingData?.name || !editingData?.phone) return false;
//     if (isPickup && !editingData.pickup_location) return false;
//     if (
//       !isPickup &&
//       (!editingData.line1 || !editingData.city || !editingData.pincode)
//     )
//       return false;
//     return true;
//   }

//   async function saveChanges() {
//     if (!validateSave()) return;

//     setSaving(true);

//     const updatedAddress = {
//       name: editingData.name,
//       phone: editingData.phone,
//       alternate_phone: editingData.alternate_phone,
//       ...(isPickup
//         ? {}
//         : {
//             line1: editingData.line1,
//             line2: editingData.line2,
//             city: editingData.city,
//             pincode: editingData.pincode,
//           }),
//     };

//     const { error } = await supabase
//       .from("orders")
//       .update({
//         address: updatedAddress,
//         pickup_location: isPickup ? editingData.pickup_location : null,
//       })
//       .eq("id", id);

//     setSaving(false);

//     if (!error) {
//       setOrder({
//         ...order,
//         address: updatedAddress,
//         pickup_location: editingData.pickup_location,
//       });
//       setIsEditing(false);
//       setShowToast(true);
//       setTimeout(() => setShowToast(false), 3000);
//     }
//   }

//   async function confirmCancelOrder() {
//     const { error } = await supabase
//       .from("orders")
//       .update({ order_status: "cancelled" })
//       .eq("id", id);

//     if (!error) {
//       setOrder({ ...order, order_status: "cancelled" });
//       setOpenCancelModal(false);
//     }
//   }

//   if (!order)
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
//         Loading...
//       </div>
//     );

//   return (
//     <>
//       <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
//         <div className="max-w-3xl mx-auto">
//           <div className="bg-white/10 p-8 rounded-2xl space-y-8">

//             {/* HEADER */}
//             <div className="flex justify-between items-center">
//               <h1 className="text-3xl font-bold">Order {shortId(order.id)}</h1>
//               <OrderStatusBadge status={order.order_status} />
//             </div>

//             {/* 📍 CURRENT PICKUP LOCATION */}
//             {isPickup && pickup?.map_link && (
//               <a
//                 href={pickup.map_link}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="group block p-4 rounded-xl border border-indigo-400/30
//                            bg-indigo-500/10 hover:bg-indigo-500/20
//                            transition-all hover:-translate-y-0.5"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400
//                                   group-hover:scale-110 transition">
//                     <HiLocationMarker className="w-6 h-6" />
//                   </div>

//                   <div className="flex-1">
//                     <p className="text-sm text-indigo-300 font-semibold">
//                       Current Pickup Location
//                     </p>
//                     <p className="font-semibold text-white">
//                       {pickup.title}
//                     </p>
//                     <p className="text-sm text-gray-300">
//                       {pickup.address}
//                     </p>
//                   </div>

//                   <span className="text-sm text-indigo-300 opacity-0
//                                    group-hover:opacity-100 transition">
//                     Open Maps →
//                   </span>
//                 </div>
//               </a>
//             )}

//             <p><b>Date:</b> {formatIST(order.created_at)}</p>
//             <p><b>Total:</b> ₹{order.total}</p>

//             {/* DETAILS */}
//             <div className="pt-4 border-t border-white/10">
//               <button
//                 onClick={() => setShowAddress(!showAddress)}
//                 className="w-full py-2 rounded-lg bg-gray-800"
//               >
//                 {showAddress
//                   ? "Hide Details"
//                   : isPickup
//                   ? "Show Pickup Details"
//                   : "Show Delivery Address"}
//               </button>

//               {showAddress && (
//                 <div className="mt-4 bg-white/5 p-5 rounded-xl space-y-4">

//                   {!isEditing && (
//                     <>
//                       <p><b>Name:</b> {addr.name}</p>
//                       <p><b>Phone:</b> {addr.phone}</p>
//                       <p><b>Alternate:</b> {addr.alternate_phone || "—"}</p>

//                       {isPickup && pickup && (
//                         <div className="pt-3 space-y-1">
//                           <p className="font-semibold text-indigo-400">
//                             Pickup Location
//                           </p>
//                           <p><b>Building:</b> {pickup.title}</p>
//                           <p><b>Address:</b> {pickup.address}</p>
//                           <p><b>Shop Phone:</b> {pickup.contact_phone}</p>
//                           <p><b>Alternate:</b> {pickup.alternate_phone || "—"}</p>
//                         </div>
//                       )}

//                       <button
//                         className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg"
//                         onClick={startEdit}
//                       >
//                         Edit
//                       </button>
//                     </>
//                   )}

//                   {isEditing && (
//                     <div className="space-y-3">
//                       {["name", "phone", "alternate_phone"].map((f) => (
//                         <input
//                           key={f}
//                           value={editingData[f]}
//                           placeholder={f}
//                           onChange={(e) =>
//                             setEditingData({
//                               ...editingData,
//                               [f]: e.target.value,
//                             })
//                           }
//                           className="w-full px-3 py-2 bg-gray-800 rounded"
//                         />
//                       ))}

//                       {isPickup && (
//                         <div className="space-y-2">
//                           <p className="font-semibold">Pickup Location</p>
//                           {pickupLocations.map((loc) => (
//                             <div
//                               key={loc.id}
//                               onClick={() =>
//                                 setEditingData({
//                                   ...editingData,
//                                   pickup_location: {
//                                     title: loc.title,
//                                     address: loc.address,
//                                     contact_phone: loc.contact_phone,
//                                     alternate_phone: loc.alternate_phone,
//                                     map_link: loc.map_link,
//                                   },
//                                 })
//                               }
//                               className={`p-3 rounded-lg cursor-pointer border ${
//                                 editingData.pickup_location?.title === loc.title
//                                   ? "border-indigo-400 bg-indigo-500/20"
//                                   : "border-white/10"
//                               }`}
//                             >
//                               <p className="font-medium">{loc.title}</p>
//                               <p className="text-sm text-gray-300">
//                                 {loc.address}
//                               </p>
//                             </div>
//                           ))}
//                         </div>
//                       )}

//                       <div className="flex gap-3">
//                         <button
//                           disabled={!validateSave()}
//                           onClick={saveChanges}
//                           className="bg-green-600 px-4 py-2 rounded"
//                         >
//                           {saving ? "Saving..." : "Save"}
//                         </button>
//                         <button
//                           onClick={cancelEdit}
//                           className="bg-gray-600 px-4 py-2 rounded"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* ITEMS */}
//             <div className="pt-4 border-t border-white/10">
//               <h2 className="text-2xl font-bold mb-3">Order Items</h2>
//               {order.items.map((item) => (
//                 <div
//                   key={item.id}
//                   className="flex justify-between p-3 bg-white/5 rounded-lg"
//                 >
//                   <span>{item.name} × {item.qty}</span>
//                   <span>₹{item.price * item.qty}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* TOAST */}
//       {showToast && (
//         <div className="fixed bottom-6 right-6 z-50">
//           <Toast>
//             <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
//               <HiFire className="h-5 w-5" />
//             </div>
//             <div className="ml-3 text-sm">Updated successfully!</div>
//             <ToastToggle onDismiss={() => setShowToast(false)} />
//           </Toast>
//         </div>
//       )}
//     </>
//   );
// }
