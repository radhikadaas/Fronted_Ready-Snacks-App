import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { fetchProductById } from "../lib/supabaseClient";
import { Card, Spinner } from "flowbite-react";
import ProductBadges from "../components/product/ProductBadges";

export default function Product() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);

  useEffect(() => {
    fetchProductById(id).then(setProduct);
  }, [id]);

  if (!product) {
    return (
      <h1 className="text-center mt-10 text-white">
        Product not found
      </h1>
    );
  }

  const badges =
    typeof product.badges === "object" && product.badges !== null
      ? product.badges
      : {};

  const hasDiscount = !!badges.discount;

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-10 flex justify-center">
      <div className="w-full max-w-sm">
        <Card
          className="bg-white/10 border border-white/10 rounded-xl overflow-hidden"
        >
          {/* IMAGE */}
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-72 object-cover"
            />

            {/* 🔥 REUSABLE BADGES */}
            <ProductBadges product={product} variant="product" />
          </div>

          {/* PRICE */}
          <div className="mt-4">
            {hasDiscount ? (
              <div className="flex gap-2 items-center">
                <span className="text-red-400 text-xl font-bold">
                  ₹{product.price}
                </span>
                <span className="line-through text-gray-400 text-sm">
                  ₹{badges.discount.original_price}
                </span>
              </div>
            ) : (
              <p className="text-indigo-300 text-xl font-semibold">
                ₹{product.price}
              </p>
            )}
          </div>

          {/* TITLE */}
          <h1 className="text-2xl font-bold mt-2">
            {product.name}
          </h1>

          {/* DESCRIPTION */}
          <p className="text-gray-300 text-sm mt-3">
            {product.description || "No description available."}
          </p>

          {/* ADD TO CART */}
          <button
            disabled={loadingBtn}
            onClick={() => {
              setLoadingBtn(true);

              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                badges: product.badges,
              });

              toast.success(`${product.name} added to cart!`);

              setTimeout(() => {
                navigate("/cart");
              }, 500);
            }}
            className={`
              w-full mt-6 py-2.5 rounded-lg
              text-white text-base font-semibold
              flex justify-center items-center gap-2
              transition-all duration-300 ease-in-out
              transform hover:scale-105 active:scale-95
              ${
                loadingBtn
                  ? "bg-linear-to-r from-indigo-500 to-purple-600 cursor-not-allowed shadow-lg shadow-indigo-500/50"
                  : "bg-linear-to-r from-indigo-600 to-purple-700 hover:shadow-lg hover:shadow-indigo-500/50"
              }
            `}
          >
            {loadingBtn ? (
              <>
                <Spinner size="sm" light className="animate-spin" />
                <span className="animate-pulse">Processing...</span>
              </>
            ) : (
              "🛒 Add to Cart"
            )}
          </button>
        </Card>
      </div>
    </div>
  );
}
