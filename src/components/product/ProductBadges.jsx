// src/components/product/ProductBadges.jsx

export default function ProductBadges({ product, variant = "default" }) {
  if (!product) return null;

  const badges =
    typeof product.badges === "object" && product.badges !== null
      ? product.badges
      : {};

  const base =
    "px-2 py-1 text-xs font-semibold rounded-md shadow whitespace-nowrap";

  const hasDiscount = !!badges.discount;
  const showNew = badges.new && !badges.best_seller;

  /* =========================
     VARIANT RULES
  ========================== */

  const showImageBadges =
    variant === "home" || variant === "product";

  const showDiscountBadges =
    variant === "home" ||
    variant === "product" ||
    variant === "cart" ||
    variant === "checkout" ||
    variant === "payment";

  /* ========================= */

  return (
    <>
      {/* 🔹 IMAGE BADGES (TOP) */}
      {showImageBadges && (
        <div className="absolute inset-0 pointer-events-none">
          {/* TOP LEFT */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {showNew && (
              <span className={`${base} bg-blue-600`}>
                NEW
              </span>
            )}

            {badges.best_seller && (
              <span className={`${base} bg-orange-600`}>
                Best Seller
              </span>
            )}
          </div>

          {/* TOP RIGHT */}
          {badges.recommended && (
            <div className="absolute top-2 right-2">
              <span className={`${base} bg-purple-600`}>
                👨‍🍳 Ghar Ka Favorite
              </span>
            </div>
          )}
        </div>
      )}

      {/* 🔻 DISCOUNT BADGES (BELOW IMAGE / INLINE) */}
      {showDiscountBadges && hasDiscount && (
        <div className="flex gap-2 mt-2">
          <span className={`${base} bg-red-700`}>
            {badges.discount.value}% OFF
          </span>

          <span className={`${base} bg-red-600`}>
            ⏳ Limited Time Deal
          </span>
        </div>
      )}
    </>
  );
}
