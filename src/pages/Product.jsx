import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchProductById } from "../lib/supabaseClient";
import { Card, Spinner } from "flowbite-react";

export default function Product() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false); // 🔥 NEW

  useEffect(() => {
    async function load() {
      const data = await fetchProductById(id);
      setProduct(data);
    }
    load();
  }, [id]);

  if (!product)
    return (
      <h1 className="text-center mt-10 text-white text-xl">
        Product not found
      </h1>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <Card
          className="shadow-xl bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl"
          imgAlt={product.name}
          imgSrc={product.image}
          imgClassName="rounded-t-xl h-72 w-full object-cover"
        >
          {/* Product Title */}
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {product.name}
          </h1>

          {/* Price */}
          <p className="text-indigo-300 text-lg font-semibold mt-1">
            ₹{product.price}
          </p>

          {/* Description */}
          <p className="text-gray-300 text-sm mt-3 leading-relaxed">
            {product.description || "No description available."}
          </p>

          {/* Add to Cart Button */}
          <button
            disabled={loadingBtn}
            onClick={() => {
              setLoadingBtn(true);

              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
              });

              toast.success(`${product.name} added to cart!`);

              setTimeout(() => {
                navigate("/cart");
              }, 500);
            }}
            className={`
              w-full mt-4 py-2.5 rounded-lg
              text-white text-base font-semibold
              flex justify-center items-center gap-2
              transition-all duration-300 ease-in-out
              transform hover:scale-105 active:scale-95
              ${loadingBtn 
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
