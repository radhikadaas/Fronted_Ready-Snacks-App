import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-cover rounded"
      />

      <h3 className="text-lg font-semibold mt-3">{product.name}</h3>

      <p className="text-gray-600 mt-1">₹{product.price}</p>

      <Link
        to={`/product/${product.id}`}
        className="mt-3 block text-center bg-blue-600 text-white py-1 rounded"
      >
        View
      </Link>
    </div>
  );
}
