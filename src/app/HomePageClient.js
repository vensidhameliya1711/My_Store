"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./context/CartContext";
import {
  ShoppingCart,
  Heart,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Flame,
  ChevronLeft,
  ChevronRight,
  Package,
  Check,
} from "lucide-react";
import { sanitizeImageUrl } from "../lib/imageUtils";

const CATEGORY_IMAGE_MAP = {
  "electronics": "/electronic.jpg",
  "clothing": "/men cloth.jpg",
  "shoes": "/shoes.jpg",
  "jewellery": "/jwellery.jpg",
  "accessories": "/bag.jpg",
  "home & kitchen": "/kichen.jpg",
  "beauty & personal care": "/beauty.jpg",
};

function getCategoryDisplayImage(cat) {
  const cleanImg = sanitizeImageUrl(cat?.image);
  if (cleanImg) return cleanImg;
  const key = cat?.name?.toLowerCase().trim();
  if (key && CATEGORY_IMAGE_MAP[key]) return CATEGORY_IMAGE_MAP[key];
  return "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&auto=format&fit=crop&q=80";
}

export default function HomePageClient({ categories = [], products = [] }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [addedIds, setAddedIds] = useState(new Set());
  const scrollContainerRef = useRef(null);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") {
      return products;
    }
    return products.filter(
      (p) => p.category?.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
    );
  }, [selectedCategory, products]);

  const scrollCircles = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inStock === false) return;
    addToCart(product);
    setAddedIds((prev) => {
      const next = new Set(prev);
      next.add(product.id);
      return next;
    });
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  const handleBuyNow = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inStock === false) return;
    addToCart(product);
    router.push("/cart");
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-16 flex flex-col">
      <section className="relative overflow-hidden bg-linear-to-br from-gray-900 via-gray-800 to-pink-950 text-white py-14 sm:py-18 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-pink-300 text-xs sm:text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-pink-400 animate-pulse" />
              <span>Mega Festive Deals • Up to 50% Off Top Brands</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Shop The Best{" "}
              <span className="bg-linear-to-r from-pink-400 via-rose-300 to-pink-500 bg-clip-text text-transparent">
                Categories & Trends
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Explore curated products across our specialized collections. Tap on any circular category below to instantly view all available items.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
              <a
                href="#category-circles-bar"
                className="px-6 py-3 bg-linear-to-r from-pink-500 to-rose-500 text-white font-extrabold rounded-2xl shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <span>Browse Categories</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <Link
                href="/products"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-2xl border border-white/20 backdrop-blur-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-xs sm:text-sm"
              >
                <ShoppingCart className="h-4 w-4 text-pink-400" />
                <span>All Products ({products.length})</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="category-circles-bar"
        className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-20"
      >
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-pink-600 font-extrabold text-[11px] uppercase tracking-widest bg-pink-50 px-3 py-1 rounded-full mb-1">
                <Flame className="h-3.5 w-3.5 fill-pink-500" />
                <span>Shop By Category</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Select a Category
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollCircles("left")}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-pink-600 flex items-center justify-center transition shadow-xs cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollCircles("right")}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-pink-600 flex items-center justify-center transition shadow-xs cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex items-start gap-6 sm:gap-8 overflow-x-auto pb-3 pt-2 no-scrollbar scroll-smooth"
          >
            {categories.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase().trim() === cat.name.toLowerCase().trim();
              const imgSrc = getCategoryDisplayImage(cat);
              return (
                <button
                  key={cat._id || cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className="flex flex-col items-center gap-2 group cursor-pointer shrink-0 transition-transform active:scale-95 outline-none"
                >
                  <div
                    className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 transition-all duration-300 flex items-center justify-center ${isSelected
                      ? "ring-4 ring-pink-500 ring-offset-2 scale-105 shadow-lg shadow-pink-200/80"
                      : "ring-2 ring-slate-200 group-hover:ring-pink-300 group-hover:scale-105"
                      }`}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 shadow-inner relative">
                      <img
                        src={imgSrc}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <p
                      className={`text-xs font-black tracking-tight max-w-20 sm:max-w-25 truncate transition-colors ${isSelected
                        ? "text-pink-600 font-extrabold"
                        : "text-slate-800 group-hover:text-pink-500"
                        }`}
                      title={cat.name}
                    >
                      {cat.name}
                    </p>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 ${isSelected
                        ? "bg-pink-100 text-pink-700 font-black"
                        : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      {cat.count} {cat.count === 1 ? "item" : "items"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-16 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-slate-200/70 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {selectedCategory === "All" ? "All Products" : `${selectedCategory} Collection`}
              </h2>
              <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-black rounded-full">
                {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {selectedCategory === "All"
                ? "Showing all available products from our store."
                : `Showing all products currently available under ${selectedCategory}.`}
            </p>
          </div>

          <Link
            href={
              selectedCategory === "All"
                ? "/products"
                : `/products?category=${encodeURIComponent(selectedCategory)}`
            }
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-4 py-2 rounded-xl transition-all self-start sm:self-auto"
          >
            <span>Open in Full Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-12 text-center max-w-md mx-auto my-6 space-y-3">
            <Package className="h-12 w-12 mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">
              No products found in "{selectedCategory}"
            </h3>
            <p className="text-xs text-slate-400">
              There are currently no products added to this category in the database.
            </p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="mt-2 px-5 py-2.5 bg-linear-to-r from-pink-500 to-rose-500 text-white font-extrabold rounded-xl text-xs shadow-md shadow-pink-200/50 hover:shadow-lg transition cursor-pointer"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const inWishlist = isInWishlist(product.id);
              const isAdded = addedIds.has(product.id);
              const isAvailable = product.inStock !== false;

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col group relative ${!isAvailable ? "opacity-90" : ""
                    }`}
                >
                  <div className="relative h-60 w-full overflow-hidden bg-slate-50">
                    <Link href={`/products/${product.id}`} className="block w-full h-full">
                      <img
                        src={product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${isAvailable ? "group-hover:scale-105" : "grayscale opacity-80"
                          }`}
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";
                        }}
                      />
                    </Link>

                    {/* Out of stock center overlay */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                        <span className="px-3.5 py-1.5 bg-rose-600/95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border border-white/20">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
                      <button
                        onClick={() => setSelectedCategory(product.category)}
                        className="bg-white/95 backdrop-blur-xs text-slate-800 px-3 py-1 rounded-full text-[11px] font-bold shadow-xs hover:bg-pink-50 hover:text-pink-600 transition-colors cursor-pointer self-start"
                      >
                        {product.category}
                      </button>
                      {!isAvailable && (
                        <span className="bg-rose-500/90 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs self-start">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className={`absolute top-3.5 right-3.5 p-2 rounded-full shadow-xs backdrop-blur-xs transition-all duration-200 cursor-pointer z-20 hover:scale-110 flex items-center justify-center ${inWishlist
                        ? "bg-pink-50 text-pink-600 border border-pink-200"
                        : "bg-white/90 text-slate-400 hover:text-pink-500 hover:bg-white"
                        }`}
                      aria-label="Wishlist"
                      title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart
                        className={`h-4.5 w-4.5 transition-colors ${inWishlist ? "fill-pink-600 text-pink-600" : "text-pink-400 hover:text-pink-500"
                          }`}
                      />
                    </button>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5 text-amber-400 text-xs">
                        <span>{"★".repeat(Math.floor(product.rating || 4.5))}</span>
                        <span className="text-slate-400 font-semibold text-[11px]">
                          ({product.reviewsCount || 12})
                        </span>
                      </div>

                      <Link href={`/products/${product.id}`} className="block">
                        <h3 className="text-slate-900 font-bold text-base group-hover:text-pink-600 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xl font-black text-slate-900">
                            ₹{product.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-400 line-through ml-2">
                            ₹{(product.price * 1.25).toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          20% OFF
                        </span>
                      </div>

                      {isAvailable ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${isAdded
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-900 hover:bg-black text-white hover:scale-[1.02] active:scale-[0.98]"
                              }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-3.5 w-3.5" />
                                <span>Add</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={(e) => handleBuyNow(e, product)}
                            className="py-2 px-3 rounded-xl text-xs font-bold bg-linear-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200/50 hover:shadow-pink-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Buy Now</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1.5 select-none"
                        >
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span>Out of Stock</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Why Shop With MyStore?
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              We provide the finest online shopping experience with buyer protection and premium service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center group hover:bg-pink-50/50 hover:border-pink-100 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Truck className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Free Express Shipping</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Enjoy free delivery on all eligible orders delivered directly to your doorstep.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center group hover:bg-pink-50/50 hover:border-pink-100 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">100% Secure Checkout</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Protected by industry-grade encryption. Pay safely via Cards or Cash on Delivery.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center group hover:bg-pink-50/50 hover:border-pink-100 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <RotateCcw className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">7-Day Easy Returns</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Hassle-free replacement or quick refund if your purchase doesn't meet your expectations.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center group hover:bg-pink-50/50 hover:border-pink-100 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Headphones className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">24/7 Customer Care</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Our support team is always available to assist you with any questions or order updates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
