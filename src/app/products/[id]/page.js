"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Heart, ArrowLeft, Star, Truck, ShieldCheck, RefreshCw, Check, Sparkles, MessageSquare } from 'lucide-react';
import { sanitizeImageUrl } from '@/lib/imageUtils';
import ReviewModal from '../../component/ReviewModal';

export default function ProductDetailPage({ params }) {
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;

  const { addToCart, updateQuantity, cart, toggleWishlist, isInWishlist } = useCart();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Dynamic reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    ratingPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [eligibleOrderId, setEligibleOrderId] = useState("");

  const fetchProductReviews = async () => {
    if (!productId) return;
    try {
      setReviewsLoading(true);

      let userId = "";
      let userEmail = "";
      if (typeof window !== "undefined") {
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            userId = parsed._id || parsed.id || "";
            userEmail = parsed.email || "";
          }
        } catch (e) {}
      }

      const params = new URLSearchParams({ productId });
      if (userId) params.append("userId", userId);
      if (userEmail) params.append("userEmail", userEmail);

      const res = await fetch(`/api/reviews?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.stats) {
          setReviewStats(data.stats);
        }
        setCanReview(Boolean(data.canReview));
        setUserReview(data.userReview || null);
        setEligibleOrderId(data.eligibleOrderId || "");
      }
    } catch (err) {
      console.error("Error fetching product reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    async function fetchProductData() {
      try {
        setLoading(true);
        const allRes = await fetch("/api/products");
        const allData = await allRes.json();

        const productsList = (allData.products || []).map((p) => ({
          ...p,
          id: p._id ? p._id.toString() : "",
          price: Number(p.price || 0),
          category: p.category || "General",
          image: sanitizeImageUrl(p.image) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
          description: p.description || `${p.name} - Premium quality item from our collection.`,
          rating: Number(p.rating || 4.5),
          reviewsCount: Number(p.reviewsCount || 0),
          details: p.details || `${p.name} is crafted with high quality materials for long lasting elegance and style.`,
          features: p.features || ["Premium Quality Material", "1 Year Warranty", "Satisfaction Guaranteed"],
          inStock: p.inStock !== false,
          specifications: p.specifications || [
            { label: "Category", value: p.category || "General" },
            { label: "Stock Availability", value: p.inStock !== false ? "In Stock" : "Out of Stock" },
          ],
        }));
        setAllProducts(productsList);

        const found = productsList.find((p) => p.id === productId || p._id === productId);
        setProduct(found || null);
      } catch (err) {
        console.error("Error fetching product detail:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProductData();
    fetchProductReviews();
  }, [productId]);

  // Find related products (same category, excluding current product, max 4)
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];
    return allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [product, allProducts]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-between bg-gray-50 min-h-screen pt-24">
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-pink-600 font-bold text-base animate-pulse">Loading Product Details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col justify-between bg-gray-50 min-h-screen pt-24 pb-16">
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 max-w-md mx-auto text-center">
          <div className="w-24 h-24 mb-6 bg-pink-50 rounded-full flex items-center justify-center text-4xl shadow-inner">
            🔍
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">The product you are looking for does not exist or has been removed from our catalog.</p>
          <Link
            href="/products"
            className="mt-6 px-8 py-3.5 bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-md shadow-pink-200/50 hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-sm"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (val) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const handleAddToCart = () => {
    if (product.inStock === false) return;
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantity + quantity);
    } else {
      addToCart(product);
      if (quantity > 1) {
        updateQuantity(product.id, quantity);
      }
    }

    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 1500);
  };

  const isAvailable = product.inStock !== false;

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-16 flex flex-col justify-between">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto flex-1">

        {/* Navigation Breadcrumb & Back button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <Link href="/" className="hover:text-pink-600 transition-colors font-medium">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-pink-600 transition-colors font-medium">Products</Link>
            <span>/</span>
            <span className="text-gray-400 font-medium truncate max-w-37.5 sm:max-w-50">{product.category}</span>
            <span>/</span>
            <span className="text-gray-900 font-bold truncate max-w-37.5 sm:max-w-50">{product.name}</span>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-600 hover:text-pink-600 transition-colors self-start sm:self-auto bg-white px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Products</span>
          </Link>
        </div>

        {/* Main Product Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

            {/* Left Side: Product Image Showcase */}
            <div className="flex flex-col gap-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group">
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";
                  }}
                  className={`object-cover w-full h-full transition-transform duration-500 ${isAvailable ? "group-hover:scale-105" : "grayscale opacity-80"
                    }`}
                />
                {!isAvailable && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <span className="px-4 py-2 bg-rose-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl border border-white/20">
                      Out of Stock
                    </span>
                  </div>
                )}
                <span className="absolute top-4 left-4 bg-linear-to-r from-pink-500 to-rose-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md shadow-pink-200/50">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Right Side: Product Details */}
            <div className="flex flex-col">
              {/* Product Info Header */}
              <div className="border-b border-gray-100 pb-6 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-amber-400 text-sm items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          reviewStats.totalReviews > 0
                            ? star <= Math.round(reviewStats.averageRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                            : star <= 5
                            ? "fill-amber-400/30 text-amber-400/50"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    {reviewStats.totalReviews > 0
                      ? `${reviewStats.averageRating} (${reviewStats.totalReviews} review${reviewStats.totalReviews === 1 ? '' : 's'})`
                      : "New Product • No reviews yet"}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">
                  {product.name}
                </h1>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-gray-900">
                    ₹{product.price.toFixed(2)}
                  </span>
                  {isAvailable ? (
                    <span className="text-xs text-emerald-700 font-extrabold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs text-rose-700 font-extrabold bg-rose-50 px-3 py-1 rounded-full border border-rose-200 inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Product Short Description */}
              <p className="text-gray-600 leading-relaxed mb-8 text-sm sm:text-base">
                {product.description}
              </p>

              {/* Out of stock alert message or Quantity / Cart actions */}
              {!isAvailable ? (
                <div className="space-y-4 mt-auto">
                  <div className="bg-rose-50 border border-rose-200/70 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 text-base">
                      ⚠️
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-rose-800">
                        Item Currently Unavailable
                      </h4>
                      <p className="text-[11px] sm:text-xs text-rose-600 mt-0.5">
                        This product is currently out of stock. You can save it to your wishlist to check back later.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      disabled
                      className="flex-1 py-3.5 px-8 rounded-2xl font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed text-sm flex items-center justify-center gap-2 select-none"
                    >
                      <span>Out of Stock</span>
                    </button>

                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`py-3.5 px-6 rounded-2xl font-bold border transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm ${isInWishlist(product.id)
                          ? "bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100"
                          : "bg-white border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-900"
                        }`}
                      aria-label="Toggle Wishlist"
                    >
                      <Heart
                        className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-pink-500 text-pink-500" : "text-pink-400"
                          }`}
                      />
                      <span className="hidden sm:inline">
                        {isInWishlist(product.id) ? "Saved" : "Save"}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/50 p-1 self-start sm:self-auto">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center text-lg font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-bold text-gray-900 text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-lg font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 px-8 rounded-2xl font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm ${addedFeedback
                        ? "bg-emerald-500 text-white shadow-emerald-100 scale-[1.02]"
                        : "bg-linear-to-r from-pink-500 to-rose-500 text-white shadow-pink-200/50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                  >
                    {addedFeedback ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Added Successfully</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`py-3.5 px-6 rounded-2xl font-bold border transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm ${isInWishlist(product.id)
                        ? "bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100"
                        : "bg-white border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-900"
                      }`}
                    aria-label="Toggle Wishlist"
                  >
                    <Heart
                      className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-pink-500 text-pink-500" : "text-pink-400"
                        }`}
                    />
                    <span className="hidden sm:inline">
                      {isInWishlist(product.id) ? "Saved" : "Save"}
                    </span>
                  </button>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-gray-100 text-center">
                <div className="flex flex-col items-center">
                  <Truck className="h-5 w-5 text-pink-500 mb-1" />
                  <span className="text-[10px] sm:text-xs font-bold text-gray-700">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="h-5 w-5 text-pink-500 mb-1" />
                  <span className="text-[10px] sm:text-xs font-bold text-gray-700">Secure Checkout</span>
                </div>
                <div className="flex flex-col items-center">
                  <RefreshCw className="h-5 w-5 text-pink-500 mb-1" />
                  <span className="text-[10px] sm:text-xs font-bold text-gray-700">Easy Returns</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Detailed Tabs Information */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-100 overflow-x-auto bg-gray-50/50">
            {[
              { id: 'description', label: 'Details' },
              { id: 'features', label: 'Features' },
              { id: 'specs', label: 'Specifications' },
              { id: 'reviews', label: `Reviews (${reviewStats.totalReviews})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 sm:px-8 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id
                  ? 'border-pink-500 text-pink-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tabs Content */}
          <div className="p-6 sm:p-10">
            {activeTab === 'description' && (
              <div className="text-gray-600 leading-relaxed text-sm sm:text-base space-y-4">
                <p>{product.details}</p>
                <p>All our products are crafted with close attention to detail and undergo strict quality assessments to ensure the best possible experience for our community.</p>
              </div>
            )}

            {activeTab === 'features' && (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                    <span className="text-green-500 font-bold mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'specs' && (
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                        <td className="py-3.5 px-5 font-bold text-gray-700 w-1/3 border-b border-gray-100">{spec.label}</td>
                        <td className="py-3.5 px-5 text-gray-600 border-b border-gray-100">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="flex flex-col gap-8">
                {/* Review Header & Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-50/60 p-6 rounded-3xl border border-slate-100 items-center">
                  {/* Average Rating Score */}
                  <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                    <span className="text-5xl font-black text-slate-900 tracking-tight">
                      {reviewStats.totalReviews > 0 ? reviewStats.averageRating : "0.0"}
                    </span>
                    <div className="flex text-amber-400 my-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          className={`${
                            reviewStats.totalReviews > 0 && star <= Math.round(reviewStats.averageRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-slate-500">
                      Based on {reviewStats.totalReviews} verified {reviewStats.totalReviews === 1 ? "review" : "reviews"}
                    </p>
                  </div>

                  {/* Rating Breakdown Bars */}
                  <div className="space-y-1.5 w-full">
                    {[5, 4, 3, 2, 1].map((s) => {
                      const count = reviewStats.ratingCounts?.[s] || 0;
                      const percent = reviewStats.ratingPercentages?.[s] || 0;
                      return (
                        <div key={s} className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-600 w-6 shrink-0">{s}★</span>
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400 w-8 text-right shrink-0">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Write / Edit Review Action or Purchase Notice */}
                  {canReview ? (
                    <div className="flex flex-col items-center lg:items-end justify-center">
                      <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="inline-flex items-center gap-2 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold px-6 py-3 rounded-2xl shadow-md shadow-pink-200 hover:shadow-lg hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm cursor-pointer"
                      >
                        {userReview ? (
                          <>
                            <Star size={16} className="fill-white" />
                            <span>Edit Your Review ({userReview.rating}★)</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            <span>Write a Review</span>
                          </>
                        )}
                      </button>
                      <p className="text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                        <ShieldCheck size={13} />
                        <span>Verified Buyer Access</span>
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center lg:items-end justify-center text-center lg:text-right">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                        <ShieldCheck size={14} className="text-pink-500" />
                        <span>Verified Purchases Only</span>
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1.5 max-w-xs">
                        Only customers who purchased and received this product can write a review.
                      </p>
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                {reviewsLoading ? (
                  <div className="py-12 text-center">
                    <RefreshCw className="h-6 w-6 text-pink-500 animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">Loading verified customer reviews...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto text-2xl">
                      ⭐
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      No Customer Reviews Yet
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {canReview
                        ? "You have received this product! Be the first to leave a verified review and share your feedback with others."
                        : "No reviews have been written for this product yet. Verified buyers will be able to review this item after delivery."}
                    </p>
                    {canReview && (
                      <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-pink-200 hover:shadow-lg cursor-pointer transition-all"
                      >
                        <Sparkles size={14} />
                        <span>Write First Review</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 divide-y divide-gray-100">
                    {reviews.map((rev, i) => (
                      <div key={rev._id || i} className={i > 0 ? "pt-6" : ""}>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-linear-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-xs font-black shadow-xs">
                              {rev.userName ? rev.userName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-sm">{rev.userName}</span>
                                {rev.isVerifiedPurchase && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-extrabold">
                                    <ShieldCheck size={11} />
                                    <span>Verified Purchase</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-400">
                                {rev.createdAt
                                  ? new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "Recently"}
                              </span>
                            </div>
                          </div>

                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={`${
                                  star <= Number(rev.rating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {rev.title && (
                          <h5 className="font-extrabold text-slate-900 text-sm mb-1 mt-2">
                            {rev.title}
                          </h5>
                        )}

                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                          {rev.comment}
                        </p>

                        {/* Admin Official Reply Callout */}
                        {rev.adminReply && (
                          <div className="mt-4 p-4.5 rounded-2xl bg-linear-to-r from-pink-50/80 to-rose-50/50 border border-pink-200/80 space-y-2 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                                  ✓
                                </span>
                                <span className="text-xs font-black text-pink-900">
                                  Official Store Response ({rev.repliedBy || "Support Team"})
                                </span>
                              </div>
                              {rev.repliedAt && (
                                <span className="text-[10px] text-pink-600 font-semibold">
                                  {new Date(rev.repliedAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pl-7 whitespace-pre-line">
                              {rev.adminReply}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group"
                >
                  <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                    <Link href={`/products/${p.id}`} className="block w-full h-full">
                      <img
                        alt={p.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        src={p.image}
                      />
                    </Link>
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm z-10">
                      {p.category}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <Link href={`/products/${p.id}`} className="block">
                      <h3 className="text-gray-900 font-bold text-sm line-clamp-1 mb-1 group-hover:text-pink-600 transition-colors">
                        {p.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                      <span className="text-base font-black text-gray-900">
                        ₹{p.price.toFixed(2)}
                      </span>
                      <Link
                        href={`/products/${p.id}`}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-linear-to-r from-pink-500 to-rose-500 text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {isReviewModalOpen && product && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          product={product}
          orderId={eligibleOrderId || userReview?.orderId || ""}
          existingReview={userReview}
          onReviewSubmitted={() => {
            fetchProductReviews();
          }}
        />
      )}
    </div>
  );
}
