import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import ProductForm from "./ProductForm";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProducts([...data]);

    setLoading(false);
  }

  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) loadProducts();
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>

          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 transition shadow"
          >
            Admin Orders
          </Link>
        </div>

        {/* ADD PRODUCT BUTTON */}
        <button
          onClick={() => setEditingProduct({})}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg shadow transition"
        >
          + Add Product
        </button>

        {/* FORM POPUP */}
        {editingProduct !== null && (
          <ProductForm
            product={editingProduct}
            onClose={() => {
              setEditingProduct(null);
              loadProducts();
            }}
          />
        )}

        <h2 className="text-2xl font-bold">Products</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10 shadow-xl">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-white/10 backdrop-blur-lg">
                <tr>
                  <th className="p-3">Image</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-white/5 transition"
                  >
                    <td className="p-3">
                      <img
                        src={p.image}
                        className="w-14 h-14 rounded object-cover"
                      />
                    </td>

                    <td className="p-3 font-semibold">{p.name}</td>

                    <td className="p-3 font-bold text-green-400">₹{p.price}</td>

                    <td className="p-3 space-x-3">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg shadow transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg shadow transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


