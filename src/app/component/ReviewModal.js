"use client";

import React, { useState, useEffect } from "react";
import { Star, X, Check, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { sanitizeImageUrl } from "@/lib/imageUtils";

const RATING_LABELS = {
  1: "1★ Poor - Not satisfied",
  2: "2★ Fair - Below expectations",
  3: "3★ Good - Met expectations",
  4: "4★ Very Good - Highly satisfied",
  5: "5★ Excellent - Absolutely loved it!",
};

export default function ReviewModal({
  isOpen,
  onClose,
  product,
  orderId = "",
  existingReview = null,
  onReviewSubmitted,
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      // Pre-fill user data from localStorage
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("user");
          if (stored) {
            const u = JSON.parse(stored);
            setName(
              [u.firstName, u.lastName].filter(Boolean).join(" ") ||
                u.name ||
                "Customer"
            );
            setEmail(u.email || "");
          }
        } catch (e) {
          console.error("Failed to parse user for review modal", e);
        }
      }

      if (existingReview) {
        setRating(existingReview.rating || 5);
        setTitle(existingReview.title || "");
        setComment(existingReview.comment || "");
        if (existingReview.userName) setName(existingReview.userName);
        if (existingReview.userEmail) setEmail(existingReview.userEmail);
      } else {
        setRating(5);
        setTitle("");
        setComment("");
      }
    }
  }, [isOpen, existingReview]);

  if (!isOpen || !product) return null;

  const currentDisplayRating = hoverRating || rating;
  const prodId = product.id || product.productId || product._id;
  const prodImage =
    sanitizeImageUrl(product.image) ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setErrorMsg("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      setErrorMsg("Please enter your review feedback.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      let userId = null;
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("user");
          if (stored) {
            const u = JSON.parse(stored);
            if (u?._id) userId = u._id;
          }
        } catch (err) {}
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: prodId,
          orderId: orderId || existingReview?.orderId || "",
          userId,
          userName: name.trim() || "Verified Buyer",
          userEmail: email.trim(),
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (onReviewSubmitted) {
          onReviewSubmitted(data.review);
        }
        onClose();
      } else {
        setErrorMsg(data.message || "Failed to submit review. Please try again.");
      }
    } catch (err) {
      console.error("Submit review error:", err);
      setErrorMsg("Network error submitting review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-pink-50 via-rose-50 to-white border-b border-pink-100/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-200">
              <Star className="h-5 w-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {existingReview ? "Edit Your Review" : "Write a Product Review"}
              </h3>
              <p className="text-xs text-slate-500">
                Share your verified feedback to help other buyers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Product Preview Card */}
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
              <img
                src={prodImage}
                alt={product.name || "Product"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";
                }}
              />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                <span>{product.category || "General"}</span>
                {orderId && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <ShieldCheck size={12} />
                      <span>Delivered Order</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Star Rating Selector */}
          <div className="space-y-1.5 text-center py-2 bg-pink-50/40 rounded-2xl border border-pink-100/60 p-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Overall Rating
            </label>
            <div className="flex items-center justify-center gap-2 my-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= currentDisplayRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-125 transition-transform duration-150 cursor-pointer focus:outline-none"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-pink-600 transition-all">
              {RATING_LABELS[currentDisplayRating]}
            </p>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Review Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Great quality, fits perfectly!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-pink-500 focus:bg-white focus:ring-1 focus:ring-pink-500 transition-all"
            />
          </div>

          {/* Detailed Comment */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Your Review Feedback <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-semibold">
                {comment.length} characters
              </span>
            </div>
            <textarea
              rows={3}
              required
              placeholder="What did you like or dislike about this product? How was the build quality, appearance, or performance?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-pink-500 focus:bg-white focus:ring-1 focus:ring-pink-500 transition-all resize-y"
            />
          </div>

          {/* Reviewer Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-pink-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email (Kept Private)
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-pink-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !comment.trim()}
              className="px-6 py-2.5 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-extrabold shadow-md shadow-pink-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{existingReview ? "Update Review" : "Submit Review"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
