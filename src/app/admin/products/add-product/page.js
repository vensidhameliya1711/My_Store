'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  Package,
  Upload,
  Link2,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import { sanitizeImageUrl } from "@/lib/imageUtils";

export default function AddProduct() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    inStock: true,
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories?status=active");
        const data = await res.json();
        const catList = Array.isArray(data) ? data : data.categories || [];
        setCategories(catList);
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const handleImageUrlChange = (e) => {
    const rawVal = e.target.value;
    const sanitized = sanitizeImageUrl(rawVal);
    setForm({ ...form, image: sanitized });
    setImageLoadError(false);
    if (imageFile) {
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setForm({ ...form, image: "" });
      setImageLoadError(false);
    }
  };

  const clearImage = () => {
    setForm({ ...form, image: "" });
    setImageFile(null);
    setImageLoadError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = sanitizeImageUrl(form.image);

      if (imageFile) {
        finalImageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(imageFile);
        });
      }

      if (!finalImageUrl) {
        finalImageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          price: Number(form.price),
          image: finalImageUrl,
          inStock: form.inStock,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Product added successfully!");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to add product.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const previewSource = imageFile
    ? URL.createObjectURL(imageFile)
    : form.image
    ? sanitizeImageUrl(form.image)
    : "";

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-pink-600 transition duration-150"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="border-b border-slate-100 p-6 md:p-8 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-6 h-6 text-pink-500" />
              Add New Product
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Create a new store item with direct image URL or upload an image file.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Wireless Bluetooth Headphones"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition duration-150"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Price (INR) *
              </label>
              <input
                type="number"
                placeholder="e.g., 1499"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition duration-150"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category *
              </label>

              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={`w-full border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition duration-150 bg-white ${
                  form.category ? "text-slate-800" : "text-slate-400"
                }`}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>

                {categories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock Availability Toggle Switch */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-slate-800 block">
                Inventory Stock Status
              </label>
              <p className="text-xs text-slate-500">
                {form.inStock
                  ? "Product is In Stock and available for customer orders."
                  : "Product is Out of Stock and ordering will be disabled on storefront."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setForm({ ...form, inStock: !form.inStock })}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                form.inStock ? "bg-emerald-500" : "bg-slate-300"
              }`}
              role="switch"
              aria-checked={form.inStock}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  form.inStock ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Image Section */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Link2 size={16} className="text-pink-500" />
                <span>Image URL (Direct link or Google Search URL)</span>
              </label>
              <input
                type="text"
                placeholder="https://... or paste image link"
                value={form.image}
                onChange={handleImageUrlChange}
                className="w-full border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition duration-150"
              />
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-sm">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Upload size={14} className="text-pink-500" />
                  <span>Or Upload Image File from Device</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Upload JPG, PNG, or WEBP image file directly.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200 file:cursor-pointer cursor-pointer"
                />
              </div>

              {/* Live Preview Box */}
              {previewSource && (
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 relative shrink-0">
                    <img
                      src={previewSource}
                      alt="Product Preview"
                      className="w-full h-full object-cover"
                      onLoad={() => setImageLoadError(false)}
                      onError={() => setImageLoadError(true)}
                    />
                  </div>
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      {imageLoadError ? (
                        <span className="text-rose-600 flex items-center gap-1">
                          <AlertCircle size={13} />
                          Failed to load image
                        </span>
                      ) : (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          Image Ready
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[10px] text-slate-400 truncate max-w-37.5"
                      title={previewSource}
                    >
                      {imageFile ? imageFile.name : previewSource}
                    </p>
                    <button
                      type="button"
                      onClick={clearImage}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer flex items-center gap-0.5"
                    >
                      <X size={12} />
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-4">
            <Link
              href="/admin/products"
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition duration-150"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-md shadow-pink-200/50 hover:shadow-lg hover:from-pink-600 hover:to-rose-600 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 transition duration-150 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Saving Product...
                </>
              ) : (
                "Save Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
