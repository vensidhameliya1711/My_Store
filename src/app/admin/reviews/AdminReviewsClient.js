"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Trash2,
  Reply,
  RefreshCw,
  Send,
  Sparkles,
  ExternalLink,
  ChevronDown,
  AlertCircle,
  Check,
  X,
  CornerDownRight,
} from "lucide-react";
import { sanitizeImageUrl } from "@/lib/imageUtils";

export default function AdminReviewsClient({ initialReviews = [] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedReplyFilter, setSelectedReplyFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("Store Support Team");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMsg({ msg, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        showToast("Reviews refreshed successfully!");
      }
    } catch (err) {
      console.error("Error fetching admin reviews:", err);
      showToast("Failed to refresh reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  // Quick reply presets
  const quickReplies = [
    "Thank you so much for your kind words! We're thrilled to hear you loved your purchase.",
    "Thank you for sharing your feedback! We strive to deliver the best quality to our valued customers.",
    "We appreciate your honest feedback. Our team is constantly improving to serve you better.",
    "We apologize for the inconvenience caused. Our customer support team will contact you directly to resolve this.",
  ];

  // Stats calculation
  const stats = useMemo(() => {
    const total = reviews.length;
    const verified = reviews.filter((r) => r.isVerifiedPurchase).length;
    const withReplies = reviews.filter((r) => Boolean(r.adminReply)).length;
    const needsReply = total - withReplies;
    const avg =
      total > 0
        ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / total).toFixed(1)
        : "0.0";

    return { total, verified, withReplies, needsReply, avg };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const pName = r.productId?.name || "";
      const uName = r.userName || r.userId?.name || "";
      const uEmail = r.userEmail || r.userId?.email || "";
      const comment = r.comment || "";
      const title = r.title || "";

      const matchesSearch =
        !searchQuery ||
        pName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRating =
        selectedRating === "all" || Number(r.rating) === Number(selectedRating);

      const matchesStatus =
        selectedStatus === "all" || (r.status || "approved") === selectedStatus;

      const matchesReply =
        selectedReplyFilter === "all" ||
        (selectedReplyFilter === "replied" && Boolean(r.adminReply)) ||
        (selectedReplyFilter === "needs_reply" && !r.adminReply);

      return matchesSearch && matchesRating && matchesStatus && matchesReply;
    });
  }, [reviews, searchQuery, selectedRating, selectedStatus, selectedReplyFilter]);

  const handleOpenReply = (review) => {
    setReplyingReviewId(review._id);
    setReplyText(review.adminReply || "");
    setReplyAuthor(review.repliedBy || "Store Support Team");
  };

  const handleSaveReply = async (reviewId) => {
    if (!replyText.trim()) {
      showToast("Please enter a reply message", "error");
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminReply: replyText.trim(),
          repliedBy: replyAuthor.trim() || "Store Support Team",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to post reply");
      }

      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? data.review : r))
      );
      setReplyingReviewId(null);
      setReplyText("");
      showToast("Admin reply published successfully!");
    } catch (err) {
      console.error("Error saving admin reply:", err);
      showToast(err.message || "Error publishing reply", "error");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (reviewId) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/reply`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to remove reply");
      }

      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? data.review : r))
      );
      showToast("Admin reply removed");
    } catch (err) {
      console.error("Error deleting reply:", err);
      showToast("Failed to remove reply", "error");
    }
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId, status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, status: newStatus } : r))
      );
      showToast(`Review status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Failed to update status", "error");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to permanently delete this customer review?")) {
      return;
    }

    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete review");
      }

      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      showToast("Review deleted successfully");
    } catch (err) {
      console.error("Error deleting review:", err);
      showToast("Failed to delete review", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 transition-all animate-in slide-in-from-top duration-300 ${
            toastMsg.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {toastMsg.type === "error" ? (
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          )}
          <span className="text-sm font-bold">{toastMsg.msg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-pink-100/60 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-pink-50 text-pink-500 rounded-2xl">
              <Star size={24} className="fill-pink-500" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Product Reviews &amp; Moderation
            </h1>
          </div>
          <p className="text-slate-500 mt-1.5 text-xs sm:text-sm">
            Read verified customer experiences, moderate feedback, and respond to your buyers.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={loading}
          className="px-4 py-2.5 bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200 text-slate-700 hover:text-pink-600 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-pink-500" : ""} />
          <span>Refresh Reviews</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-xl shrink-0">
            <MessageSquare size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reviews</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold text-xl shrink-0">
            <Star size={22} className="fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Rating</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.avg} ★</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Buyers</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.verified}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl shrink-0">
            <Reply size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Needs Reply</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.needsReply}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product, customer, text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
            />
          </div>

          {/* Rating Filter */}
          <div>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all cursor-pointer"
            >
              <option value="all">⭐ All Ratings</option>
              <option value="5">5 Stars (⭐⭐⭐⭐⭐)</option>
              <option value="4">4 Stars (⭐⭐⭐⭐)</option>
              <option value="3">3 Stars (⭐⭐⭐)</option>
              <option value="2">2 Stars (⭐⭐)</option>
              <option value="1">1 Star (⭐)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all cursor-pointer"
            >
              <option value="all">🛡️ All Moderation Status</option>
              <option value="approved">Approved &amp; Visible</option>
              <option value="pending">Pending Review</option>
              <option value="rejected">Hidden / Rejected</option>
            </select>
          </div>

          {/* Reply Filter */}
          <div>
            <select
              value={selectedReplyFilter}
              onChange={(e) => setSelectedReplyFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all cursor-pointer"
            >
              <option value="all">💬 All Reply States</option>
              <option value="needs_reply">Pending Admin Reply</option>
              <option value="replied">Admin Replied</option>
            </select>
          </div>
        </div>

        {/* Filter Badges / Active count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filteredReviews.length}</strong> of{" "}
            {reviews.length} reviews
          </span>
          {(searchQuery ||
            selectedRating !== "all" ||
            selectedStatus !== "all" ||
            selectedReplyFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedRating("all");
                setSelectedStatus("all");
                setSelectedReplyFilter("all");
              }}
              className="text-pink-600 hover:text-pink-700 font-bold cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Reviews Cards List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto text-3xl">
            ⭐
          </div>
          <h3 className="text-lg font-extrabold text-slate-800">No Reviews Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {reviews.length === 0
              ? "No customer reviews have been submitted yet. Once customers receive their orders, their reviews will appear here."
              : "No reviews match your current search and filter criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => {
            const prod = rev.productId || {};
            const isReplying = replyingReviewId === rev._id;

            return (
              <div
                key={rev._id}
                className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 sm:p-7 space-y-5 transition-all hover:border-pink-100 hover:shadow-md"
              >
                {/* Top Row: Product & Customer header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  {/* Product Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                      <img
                        src={
                          sanitizeImageUrl(prod.image) ||
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
                        }
                        alt={prod.name || "Product"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${prod._id || rev.productId}`}
                          target="_blank"
                          className="font-extrabold text-slate-900 hover:text-pink-600 transition-colors text-sm sm:text-base flex items-center gap-1.5"
                        >
                          <span>{prod.name || "Product"}</span>
                          <ExternalLink size={13} className="text-slate-400" />
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span>Category: <strong className="text-slate-600">{prod.category || "General"}</strong></span>
                        {prod.price && (
                          <span>Price: <strong className="text-slate-600">₹{Number(prod.price).toFixed(2)}</strong></span>
                        )}
                        {rev.orderId && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[10px] text-slate-600">
                            Order #{rev.orderId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info & Moderation Status */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-linear-to-tr from-pink-500 to-rose-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {rev.userName ? rev.userName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-slate-800">
                            {rev.userName || "Customer"}
                          </span>
                          {rev.isVerifiedPurchase && (
                            <span
                              className="text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1"
                              title="Verified Purchase"
                            >
                              <ShieldCheck size={11} />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{rev.userEmail}</p>
                      </div>
                    </div>

                    {/* Moderation Status Dropdown */}
                    <div className="ml-auto lg:ml-0">
                      <select
                        value={rev.status || "approved"}
                        onChange={(e) => handleStatusChange(rev._id, e.target.value)}
                        className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                          rev.status === "rejected"
                            ? "bg-rose-50 border-rose-200 text-rose-700"
                            : rev.status === "pending"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700"
                        }`}
                      >
                        <option value="approved">✓ Approved</option>
                        <option value="pending">⏳ Pending</option>
                        <option value="rejected">✕ Hidden</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Middle Row: Rating, Review Title & Comment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={`${
                              star <= Number(rev.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-black text-slate-800">
                        {rev.rating} / 5
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 font-medium">
                      {rev.createdAt
                        ? new Date(rev.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recently"}
                    </span>
                  </div>

                  {rev.title && (
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {rev.title}
                    </h4>
                  )}

                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100/80">
                    {rev.comment}
                  </p>
                </div>

                {/* Bottom Row: Official Admin Response Display / Editor */}
                <div className="pt-2">
                  {rev.adminReply && !isReplying ? (
                    <div className="p-4.5 rounded-2xl bg-linear-to-r from-pink-50/90 to-rose-50/60 border border-pink-200 space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                            ✓
                          </span>
                          <span className="text-xs font-black text-pink-900">
                            Store Response ({rev.repliedBy || "Store Support Team"})
                          </span>
                          {rev.repliedAt && (
                            <span className="text-[11px] text-pink-600 font-semibold ml-2">
                              •{" "}
                              {new Date(rev.repliedAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenReply(rev)}
                            className="text-xs font-bold text-pink-600 hover:text-pink-800 hover:underline cursor-pointer"
                          >
                            Edit Reply
                          </button>
                          <span className="text-pink-300">|</span>
                          <button
                            onClick={() => handleDeleteReply(rev._id)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                          >
                            Delete Reply
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pl-7 whitespace-pre-line">
                        {rev.adminReply}
                      </p>
                    </div>
                  ) : isReplying ? (
                    /* Inline Reply Composer */
                    <div className="p-5 rounded-2xl bg-pink-50/60 border border-pink-200 space-y-4 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-black uppercase tracking-wider text-pink-900 flex items-center gap-1.5">
                          <Reply size={15} />
                          <span>Compose Official Reply to {rev.userName || "Customer"}</span>
                        </h5>
                        <button
                          onClick={() => setReplyingReviewId(null)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Quick Presets */}
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-500">Quick Templates:</p>
                        <div className="flex flex-wrap gap-2">
                          {quickReplies.map((qr, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setReplyText(qr)}
                              className="text-[11px] bg-white hover:bg-pink-100/70 border border-pink-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors text-left cursor-pointer"
                            >
                              "{qr.slice(0, 45)}..."
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reply Author & Textarea */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-600">Respondent Title:</label>
                          <input
                            type="text"
                            value={replyAuthor}
                            onChange={(e) => setReplyAuthor(e.target.value)}
                            placeholder="e.g. Store Support Team"
                            className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-500"
                          />
                        </div>

                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your official response to this customer review..."
                          className="w-full p-3.5 bg-white border border-pink-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none transition-all leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setReplyingReviewId(null)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveReply(rev._id)}
                          disabled={submittingReply}
                          className="px-5 py-2 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-extrabold rounded-xl shadow-md shadow-pink-200 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                        >
                          {submittingReply ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>Publishing...</span>
                            </>
                          ) : (
                            <>
                              <Send size={13} />
                              <span>Publish Reply</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Reply Trigger Button & Action Bar */
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleOpenReply(rev)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200/80 text-pink-600 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Reply size={13} />
                        <span>Reply to Review</span>
                      </button>

                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        disabled={deletingId === rev._id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-bold cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
