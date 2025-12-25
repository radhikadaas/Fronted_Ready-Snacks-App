import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ProductForm({ product, onClose }) {
  const isEditing = Boolean(product?.id);

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(Number(product?.price) || "");
  const [image] = useState(product?.image || "");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  /* 🔥 BADGES STATE */
  const [badges, setBadges] = useState(product?.badges || {});
  const [showDiscount, setShowDiscount] = useState(
    Boolean(product?.badges?.discount)
  );

  const [discountPercent, setDiscountPercent] = useState(
    product?.badges?.discount?.value || ""
  );
  const [originalPrice, setOriginalPrice] = useState(
    product?.badges?.discount?.original_price || ""
  );

  /* ---------- IMAGE UPLOAD ---------- */
  async function uploadImage() {
    if (!file) return image;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) {
      alert(error.message);
      setUploading(false);
      return image;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    setUploading(false);
    return data.publicUrl;
  }

  /* ---------- DISCOUNT CALCULATION ---------- */
  function applyDiscount() {
    if (!discountPercent || !originalPrice) return;

    const discounted = Math.round(
      Number(originalPrice) -
        (Number(originalPrice) * Number(discountPercent)) / 100
    );

    setPrice(discounted);

    setBadges((prev) => ({
      ...prev,
      discount: {
        type: "percentage",
        value: Number(discountPercent),
        original_price: Number(originalPrice),
      },
    }));
  }

  function toggleBadge(key, value = true) {
    setBadges((prev) => {
      const updated = { ...prev };
      if (updated[key]) delete updated[key];
      else updated[key] = value;
      return updated;
    });
  }

  /* ---------- SAVE ---------- */
  async function saveProduct(e) {
    e.preventDefault();

    const imageURL = await uploadImage();

    const payload = {
      name,
      description,
      price: Number(price),
      image: imageURL,
      badges,
      is_active: true,
    };

    let response;

    if (isEditing) {
      response = await supabase
        .from("products")
        .update(payload)
        .eq("id", product.id);
    } else {
      response = await supabase.from("products").insert(payload);
    }

    if (response.error) alert(response.error.message);
    else onClose();
  }

  return (
    <div className="bg-black/50 fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div
        className="bg-white/10 text-white rounded-2xl shadow-xl border border-white/10 
                w-full max-w-md max-h-[90vh] flex flex-col"
      >
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-2xl font-bold">
            {isEditing ? "Edit Product" : "Add Product"}
          </h2>
        </div>

        <form
          onSubmit={saveProduct}
          className="px-6 py-4 space-y-5 overflow-y-auto flex-1"
        >
          {/* NAME */}
          <div>
            <label className="block font-semibold mb-1">Product Name</label>
            <input
              className="w-full bg-gray-800 border border-white/10 p-2 rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              className="w-full bg-gray-800 border border-white/10 p-2 rounded-lg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* BADGES */}
          <div className="space-y-3">
            <p className="font-semibold">Product Badges</p>

            <div className="flex flex-wrap gap-2">
              {[
                ["new", "🆕 New"],
                ["best_seller", "🔥 Best Seller"],
                ["limited_time", "⏳ Limited Time Deal"],
                ["recommended", "👨‍🍳 favorite Choice"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    toggleBadge(
                      key,
                      key === "recommended" ? "ghar_ka_favorite" : true
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    badges[key]
                      ? "bg-indigo-500 border-indigo-400"
                      : "border-gray-600 hover:border-indigo-400"
                  }`}
                >
                  {label}
                </button>
              ))}

              {/* DISCOUNT */}
              <button
                type="button"
                onClick={() => setShowDiscount(!showDiscount)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  badges.discount
                    ? "bg-red-600 border-red-500"
                    : "border-gray-600 hover:border-red-500"
                }`}
              >
                % OFF
              </button>
            </div>

            {/* DISCOUNT CONFIG */}
            {showDiscount && (
              <div className="bg-black/30 border border-white/10 p-3 rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="% OFF"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="bg-gray-800 p-2 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Original Price"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="bg-gray-800 p-2 rounded"
                  />
                </div>

                <button
                  type="button"
                  onClick={applyDiscount}
                  className="w-full bg-red-600 hover:bg-red-500 py-2 rounded-lg font-semibold"
                >
                  Apply Discount
                </button>
              </div>
            )}
          </div>

          {/* PRICE */}
          <div>
            <label className="block font-semibold mb-1">Final Price (₹)</label>
            <input
              type="number"
              className="w-full bg-gray-800 border border-white/10 p-2 rounded-lg"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          {/* IMAGE */}
          <div>
            <label className="block font-semibold mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              className="bg-gray-800 border border-white/10 p-2 rounded-lg w-full"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <div className="mt-3">
              {(file || image) && (
                <img
                  src={file ? URL.createObjectURL(file) : image}
                  className="w-24 h-24 rounded object-cover"
                />
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="px-6 py-4 border-t border-white/10 bg-black/30 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-semibold"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Save"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-400 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
