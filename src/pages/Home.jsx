import { useEffect, useState } from "react";
import { fetchProducts } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import ProductBadges from "../components/product/ProductBadges";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await fetchProducts();
      setProducts(data || []);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">

      {/* ================= HERO SECTION ================= */}
      <div className="relative isolate w-full min-h-screen flex items-center justify-center px-4">

        {/* Gradient Background */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-indigo-900/60 to-gray-900 opacity-90" />

          <div
            className="absolute left-1/2 top-[-200px] w-[800px] h-[800px]
            -translate-x-1/2 rounded-full blur-[160px] opacity-40
            bg-linear-to-tr from-[#ff80b5] to-[#9089fc]"
          />
        </div>

        {/* HERO CONTENT */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold sm:text-6xl">
            Delicious Snacks Delivered Fast
          </h1>

          <p className="mt-6 text-lg text-gray-300">
            Fresh, tasty & delivered to your doorstep.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href="#menu"
              className="rounded-md bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-400"
            >
              Browse Menu
            </a>
            <Link
              to="/cart"
              className="text-sm font-semibold text-gray-200 hover:text-white"
            >
              View Cart →
            </Link>
          </div>
        </div>
      </div>

      {/* ================= MENU SECTION ================= */}
      <div id="menu" className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold mb-6">Snacks Menu</h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const badges =
              typeof p.badges === "object" && p.badges !== null
                ? p.badges
                : {};

            const hasDiscount = !!badges.discount;

            return (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="bg-white/10 backdrop-blur-lg border border-white/10
                rounded-xl p-3 shadow-md transition
                hover:scale-[1.03] hover:bg-white/20"
              >
                {/* IMAGE */}
                <div className="relative">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-40 sm:h-44 object-cover rounded-lg"
                  />

                  {/* 🔥 BADGES (REUSABLE COMPONENT) */}
                  <ProductBadges product={p} variant="home" />
                </div>

                {/* PRICE */}
                <div className="mt-2">
                  {hasDiscount ? (
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-semibold">
                        ₹{p.price}
                      </span>
                      <span className="line-through text-gray-400 text-sm">
                        ₹{badges.discount.original_price}
                      </span>
                    </div>
                  ) : (
                    <p className="text-indigo-300 font-medium">
                      ₹{p.price}
                    </p>
                  )}
                </div>

                {/* NAME */}
                <h3 className="font-semibold text-lg mt-1">
                  {p.name}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                  {p.description || "No description available."}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

