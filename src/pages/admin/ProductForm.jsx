import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ProductForm({ product, onClose }) {
  const isEditing = Boolean(product?.id);

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(Number(product?.price) || "");
  const [image] = useState(product?.image || "");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function uploadImage() {
    if (!file) return image;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return image;
    }

    const { data: publicData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    setUploading(false);
    return publicData.publicUrl;
  }

  async function saveProduct(e) {
    e.preventDefault();

    const imageURL = await uploadImage();

    const payload = {
      name,
      description,
      price: Number(price),
      image: imageURL,
      is_active: true,
    };

    let response;

    if (isEditing) {
      response = await supabase
        .from("products")
        .update(payload)
        .eq("id", product.id)
        .select();
    } else {
      response = await supabase.from("products").insert(payload).select();
    }

    if (response.error) {
      alert(response.error.message);
    } else {
      onClose();
    }
  }

  return (
    <div className="bg-black/50 fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white/10 text-white p-8 rounded-2xl shadow-xl border border-white/10 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={saveProduct} className="space-y-4">

          <div>
            <label className="block font-semibold mb-1">Product Name</label>
            <input
              className="w-full bg-gray-800 border border-white/10 p-2 rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              className="w-full bg-gray-800 border border-white/10 p-2 rounded-lg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label className="block font-semibold mb-1">Price (₹)</label>
            <input
              type="number"
              className="w-full bg-gray-800 border border-white/10 p-2 rounded-lg"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              className="bg-gray-800 border border-white/10 p-2 rounded-lg w-full"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <div className="mt-3">
              {file ? (
                <img
                  src={URL.createObjectURL(file)}
                  className="w-24 h-24 rounded object-cover"
                />
              ) : image ? (
                <img
                  src={image}
                  className="w-24 h-24 rounded object-cover"
                />
              ) : null}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-semibold shadow transition"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Save"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-400 px-4 py-2 rounded-lg shadow transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

