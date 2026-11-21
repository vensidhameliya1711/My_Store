"use client";

import { useEffect, useState, useRef } from "react";
import {
  FolderOpen,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Sparkles,
  Search,
  X,
  RefreshCw,
  Archive,
  Image as ImageIcon,
  Upload,
  Link2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { sanitizeImageUrl } from "@/lib/imageUtils";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, trash: 0 });
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef(null);

  const fetchCategories = async (tab = activeTab) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/categories?status=${tab}`);
      const data = await res.json();

      if (data.success) {
        setCategories(data.categories || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(activeTab);
  }, [activeTab]);

  const handleImageUrlChange = (e) => {
    const rawVal = e.target.value;
    const sanitized = sanitizeImageUrl(rawVal);
    setImage(sanitized);
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
      setImage("");
      setImageLoadError(false);
    }
  };

  const clearImage = () => {
    setImage("");
    setImageFile(null);
    setImageLoadError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      setSubmitting(true);

      let finalImageUrl = sanitizeImageUrl(image);

      if (imageFile) {
        finalImageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(imageFile);
        });
      }

      if (editId) {
        const res = await fetch(`/api/categories/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            image: finalImageUrl,
            description: description.trim(),
          }),
        });

        const data = await res.json();
        if (data.success) {
          toast.success(data.message || "Category updated successfully!");
          cancelEdit();
          fetchCategories(activeTab);
        } else {
          toast.error(data.message || "Failed to update category");
        }
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            image: finalImageUrl,
            description: description.trim(),
          }),
        });

        const data = await res.json();
        if (data.success) {
          toast.success(data.message || "Category added successfully!");
          cancelEdit();
          fetchCategories(activeTab);
        } else {
          toast.error(data.message || "Failed to add category");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("An error occurred while saving category");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (cat) => {
    setName(cat.name);
    setImage(sanitizeImageUrl(cat.image || ""));
    setImageFile(null);
    setImageLoadError(false);
    setDescription(cat.description || "");
    setEditId(cat._id);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setName("");
    setImage("");
    setImageFile(null);
    setImageLoadError(false);
    setDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const softDeleteCategory = async (id, catName) => {
    if (!confirm(`Are you sure you want to move "${catName}" to Trash?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.info(data.message || "Category moved to Trash");
        fetchCategories(activeTab);
      } else {
        toast.error(data.message || "Failed to delete category");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting category");
    }
  };

  const restoreCategory = async (id, catName) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || `Category "${catName}" restored!`);
        fetchCategories(activeTab);
      } else {
        toast.error(data.message || "Failed to restore category");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error restoring category");
    }
  };

  const permanentDeleteCategory = async (id, catName) => {
    if (
      !confirm(
        `WARNING: Are you sure you want to PERMANENTLY delete "${catName}"? This action cannot be undone.`
      )
    )
      return;

    try {
      const res = await fetch(`/api/categories/${id}?permanent=true`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Category permanently deleted");
        fetchCategories(activeTab);
      } else {
        toast.error(data.message || "Failed to delete category");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error permanently deleting category");
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const previewSource = imageFile
    ? URL.createObjectURL(imageFile)
    : image
    ? sanitizeImageUrl(image)
    : "";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Categories Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Add, edit, soft-delete, and restore store categories with live image support synced across all user devices.
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => {
              setActiveTab("active");
              cancelEdit();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "active"
                ? "bg-white text-pink-600 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FolderOpen size={15} />
            <span>Active Categories</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-100 text-pink-700 font-black">
              {counts.active}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("trash");
              cancelEdit();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "trash"
                ? "bg-white text-rose-600 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Trash2 size={15} />
            <span>Trash Bin</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                counts.trash > 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {counts.trash}
            </span>
          </button>
        </div>
      </div>

      {activeTab === "active" && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-500" />
              <span>{editId ? "Edit Category Details" : "Add New Store Category"}</span>
            </h2>
            {editId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
              >
                <X size={14} />
                <span>Cancel Edit</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-bold text-slate-700">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Phones, Electronics, Gaming"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all"
                />
              </div>

              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Link2 size={13} className="text-pink-500" />
                  <span>Image URL (Direct or Google Search URL)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://... or paste image link"
                  value={image}
                  onChange={handleImageUrlChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all"
                />
              </div>

              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-bold text-slate-700">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Short summary for category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all"
                />
              </div>
            </div>

            {/* File Upload & Live Preview Section */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-sm">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Upload size={14} className="text-pink-500" />
                  <span>Or Upload Image File from Computer</span>
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
                      alt="Category Preview"
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
                    <p className="text-[10px] text-slate-400 truncate max-w-40" title={previewSource}>
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

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-linear-to-r from-pink-500 to-pink-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-pink-200/50 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Saving Category...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>{editId ? "Update Category & Sync Products" : "Add Category"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900">
              {activeTab === "active" ? "Active Store Categories" : "Trashed Categories (Soft-Deleted)"}
            </h3>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-black rounded-full">
              {filteredCategories.length}
            </span>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search category name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-pink-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-14 text-slate-400 space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-pink-500" />
            <p className="text-xs font-bold">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-14 text-slate-400 space-y-2">
            <Archive className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">
              {activeTab === "active" ? "No categories found" : "Trash Bin is empty"}
            </p>
            <p className="text-xs">
              {activeTab === "active"
                ? "Add a new category above to get started."
                : "Deleted categories will appear here with one-click restore options."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => {
              const catImg = sanitizeImageUrl(cat.image);
              return (
                <div
                  key={cat._id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    activeTab === "trash"
                      ? "bg-rose-50/20 border-rose-100"
                      : "bg-slate-50/50 hover:bg-white border-slate-200/70 hover:border-pink-200 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-pink-100/60 text-pink-600 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-pink-100">
                        {catImg ? (
                          <img
                            src={catImg}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <span>{cat.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                          <span>{cat.name}</span>
                          {catImg && (
                            <span className="inline-flex items-center text-[10px] text-pink-600 font-extrabold" title="Has image">
                              <ImageIcon size={11} />
                            </span>
                          )}
                        </h4>
                        {cat.description ? (
                          <p className="text-slate-400 text-[11px] line-clamp-1">{cat.description}</p>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Active Category</span>
                        )}
                      </div>
                    </div>

                    {activeTab === "trash" && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-extrabold text-[10px]">
                        Deleted
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {activeTab === "trash" && cat.deletedAt
                        ? `Deleted: ${new Date(cat.deletedAt).toLocaleDateString()}`
                        : `Created: ${new Date(cat.createdAt || Date.now()).toLocaleDateString()}`}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-2 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            onClick={() => softDeleteCategory(cat._id, cat.name)}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Move to Trash"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => restoreCategory(cat._id, cat.name)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Restore to Active"
                          >
                            <RotateCcw size={13} />
                            <span>Restore</span>
                          </button>

                          <button
                            onClick={() => permanentDeleteCategory(cat._id, cat.name)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                            title="Permanent Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}