"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StockToggleButton({ id, initialInStock = true, productName = "Product" }) {
  const [inStock, setInStock] = useState(initialInStock);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const newStatus = !inStock;
    // Optimistic UI update
    setInStock(newStatus);
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inStock: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        if (newStatus) {
          toast.success(`"${productName}" is now marked as In Stock!`, {
            autoClose: 2000,
          });
        } else {
          toast.info(`"${productName}" is now marked as Out of Stock!`, {
            autoClose: 2000,
          });
        }
        router.refresh();
      } else {
        // Rollback on failure
        setInStock(!newStatus);
        toast.error(data.message || "Failed to update stock status.");
      }
    } catch (err) {
      console.error("Error toggling product stock:", err);
      // Rollback
      setInStock(!newStatus);
      toast.error("Network error. Could not update stock status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        title={inStock ? "Click to mark as Out of Stock" : "Click to mark as In Stock"}
        className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-70 select-none ${
          inStock
            ? "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-700 focus:ring-emerald-400"
            : "bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-700 focus:ring-rose-400"
        }`}
      >
        {/* Animated pill switch */}
        <div
          className={`w-9 h-5 rounded-full transition-colors duration-200 p-0.5 flex items-center ${
            inStock ? "bg-emerald-500 justify-end" : "bg-rose-400 justify-start"
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform">
            {loading ? (
              <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-600" />
            ) : inStock ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            )}
          </div>
        </div>

        {/* Text Label */}
        <span className="text-xs font-bold whitespace-nowrap">
          {inStock ? "In Stock" : "Out of Stock"}
        </span>
      </button>
    </div>
  );
}
