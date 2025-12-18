import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams } from "react-router-dom";
import OrderStatusBadge from "../components/OrderStatusBadge";

// Flowbite components
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Toast,
  ToastToggle,
} from "flowbite-react";

// Icons (correct import for your version)
import { HiOutlineExclamationCircle, HiFire } from "react-icons/hi";
import { formatIST } from "../../utils/date";

export default function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [showAddress, setShowAddress] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [saving, setSaving] = useState(false);

  // Toast
  const [showToast, setShowToast] = useState(false);

  // Cancel modal
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
  }, [id]);

  function shortId(id) {
    return "ORD-" + id.slice(0, 5);
  }

  const isPickup = order?.delivery_type === "pickup";
  const addr = order?.address || {};

  // --- EDIT MODE ---
  function startEdit() {
    setEditingData({
      name: addr.name || "",
      phone: addr.phone || "",
      alternate_phone: addr.alternate_phone || "",
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
    if (!editingData) return false;

    if (!editingData.name.trim() || !editingData.phone.trim()) return false;

    if (!isPickup) {
      if (
        !editingData.line1.trim() ||
        !editingData.city.trim() ||
        !editingData.pincode.trim()
      )
        return false;
    }

    return true;
  }

  async function saveChanges() {
    if (!validateSave()) return;

    setSaving(true);

    const updatedAddress = {
      name: editingData.name.trim(),
      phone: editingData.phone.trim(),
      alternate_phone: editingData.alternate_phone.trim(),
      line1: editingData.line1.trim(),
      line2: editingData.line2.trim(),
      city: editingData.city.trim(),
      pincode: editingData.pincode.trim(),
    };

    const { error } = await supabase
      .from("orders")
      .update({ address: updatedAddress })
      .eq("id", id);

    setSaving(false);

    if (!error) {
      setOrder({ ...order, address: updatedAddress });
      setIsEditing(false);

      // Show toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }

  // --- CANCEL ORDER ---
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl">
        Loading...
      </div>
    );

  return (
    <>
      {/* MAIN PAGE */}
      <div className="min-h-screen bg-gray-900 text-white px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-xl space-y-8">
            
            {/* HEADER */}
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h1 className="text-3xl font-bold">Order {shortId(order.id)}</h1>
              <OrderStatusBadge status={order.order_status} />
            </div>

            {/* CANCEL ORDER BUTTON */}
            <button
              disabled={order.order_status === "cancelled"}
              onClick={() => setOpenCancelModal(true)}
              className={`w-full py-3 rounded-lg font-semibold border transition ${
                order.order_status === "cancelled"
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-red-700/30 text-red-300 border-red-500/50 hover:bg-red-700/50"
              }`}
            >
              {order.order_status === "cancelled" ? "Order Cancelled" : "Cancel Order"}
            </button>

            {/* ORDER META */}
            <p><b>Date:</b> {formatIST(order.created_at)}</p>
            <p><b>Total:</b> ₹{order.total}</p>

            {/* ADDRESS / PICKUP DETAILS */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => setShowAddress(!showAddress)}
                className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700"
              >
                {showAddress
                  ? "Hide Details"
                  : isPickup
                  ? "Show Pickup Details"
                  : "Show Delivery Address"}
              </button>

              {showAddress && (
                <div className="mt-4 bg-white/5 p-5 rounded-xl space-y-4">
                  
                  {/* VIEW MODE */}
                  {!isEditing && (
                    <>
                      {isPickup ? (
                        <>
                          <p><b>Name:</b> {addr.name}</p>
                          <p><b>Phone:</b> {addr.phone}</p>
                          <p><b>Alternate:</b> {addr.alternate_phone || "—"}</p>
                        </>
                      ) : (
                        <>
                          <p><b>Name:</b> {addr.name}</p>
                          <p><b>Phone:</b> {addr.phone}</p>
                          <p><b>Address 1:</b> {addr.line1}</p>
                          <p><b>Address 2:</b> {addr.line2}</p>
                          <p><b>City:</b> {addr.city}</p>
                          <p><b>Pincode:</b> {addr.pincode}</p>
                        </>
                      )}

                      <button
                        className="px-4 py-2 mt-2 bg-indigo-600 rounded-lg"
                        onClick={startEdit}
                      >
                        Edit
                      </button>
                    </>
                  )}

                  {/* EDIT MODE */}
                  {isEditing && (
                    <div className="space-y-3">
                      {/* Name */}
                      <input
                        value={editingData.name}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                        placeholder="Name"
                        className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded"
                      />

                      {/* Phone */}
                      <input
                        value={editingData.phone}
                        onChange={(e) => setEditingData({ ...editingData, phone: e.target.value })}
                        placeholder="Phone"
                        className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded"
                      />

                      {/* Alternate */}
                      <input
                        value={editingData.alternate_phone}
                        onChange={(e) =>
                          setEditingData({ ...editingData, alternate_phone: e.target.value })
                        }
                        placeholder="Alternate Phone"
                        className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded"
                      />

                      {!isPickup && (
                        <>
                          <input
                            value={editingData.line1}
                            onChange={(e) => setEditingData({ ...editingData, line1: e.target.value })}
                            placeholder="Address Line 1"
                            className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded"
                          />

                          <input
                            value={editingData.line2}
                            onChange={(e) => setEditingData({ ...editingData, line2: e.target.value })}
                            placeholder="Address Line 2"
                            className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded"
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <input
                              value={editingData.city}
                              onChange={(e) => setEditingData({ ...editingData, city: e.target.value })}
                              placeholder="City"
                              className="px-3 py-2 bg-gray-800 border border-white/10 rounded"
                            />

                            <input
                              value={editingData.pincode}
                              onChange={(e) =>
                                setEditingData({ ...editingData, pincode: e.target.value })
                              }
                              placeholder="Pincode"
                              className="px-3 py-2 bg-gray-800 border border-white/10 rounded"
                            />
                          </div>
                        </>
                      )}

                      <div className="flex gap-3 mt-2">
                        <button
                          disabled={!validateSave()}
                          onClick={saveChanges}
                          className={`px-4 py-2 rounded-lg ${
                            validateSave()
                              ? "bg-green-600"
                              : "bg-gray-700 cursor-not-allowed"
                          }`}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>

                        <button
                          className="px-4 py-2 bg-gray-600 rounded-lg"
                          onClick={cancelEdit}
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
              <h2 className="text-2xl font-bold mb-4">Order Items</h2>

              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-white/5 rounded-lg p-4"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-300">Qty: {item.qty}</p>
                  </div>

                  <p className="font-bold text-lg">₹{item.price * item.qty}</p>
                </div>
              ))}

              <p className="mt-6 text-2xl font-semibold text-green-400">
                Final Total: ₹{order.total}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- CANCEL CONFIRMATION MODAL --- */}
      <Modal show={openCancelModal} size="md" popup onClose={() => setOpenCancelModal(false)}>
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-300">
              Are you sure you want to cancel this order?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="red" onClick={confirmCancelOrder}>
                Yes, cancel it
              </Button>
              <Button color="gray" onClick={() => setOpenCancelModal(false)}>
                No, go back
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* --- SUCCESS TOAST --- */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <HiFire className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">
              Details updated successfully!
            </div>
            <ToastToggle onDismiss={() => setShowToast(false)} />
          </Toast>
        </div>
      )}
    </>
  );
}

