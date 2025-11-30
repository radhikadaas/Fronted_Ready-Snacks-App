export default function OrderStatusBadge({ status }) {
  const badgeStyles = {
    ordered: {
      color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      label: "Ordered",
      icon: "🛒",
    },
    in_process: {
      color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      label: "Processing",
      icon: "⚙️",
    },
    shipped: {
      color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      label: "Shipped",
      icon: "📦",
    },
    delivered: {
      color: "bg-green-600/20 text-green-300 border-green-600/30",
      label: "Delivered",
      icon: "✔️",
    },
    cancelled: {
      color: "bg-red-600/20 text-red-300 border-red-600/30",
      label: "Cancelled",
      icon: "❌",
    },
  };

  const badge = badgeStyles[status] || badgeStyles.ordered;

  return (
    <span
      className={`
        inline-flex items-center gap-2
        px-3 py-1.5 rounded-full text-sm font-medium
        border backdrop-blur-sm
        transition-all duration-200
        ${badge.color}
      `}
    >
      <span className="text-lg leading-none">{badge.icon}</span>
      {badge.label}
    </span>
  );
}

