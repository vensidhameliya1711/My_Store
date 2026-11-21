"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart } from 'lucide-react';

export default function ProductsClientPage({
  initialProducts,
  availableCategories = [],
  category,
  priceRange,
  search,
}) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addedIds, setAddedIds] = useState(new Set());

  const handleAddToCart = (product) => {
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

  const defaultCategories = [
    "Electronics",
    "Clothing",
    "Shoes",
    "Jewellery",
    "Accessories",
    "Home & Kitchen",
    "Beauty & Personal Care",
    "Groceries",
    "Sports & Fitness",
  ];

  const categories = [
    "All",
    ...(availableCategories.length > 0 ? availableCategories : defaultCategories),
  ];

  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "" || val === "All" || val === "all") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (cat) => {
    updateUrlParams({ category: cat });
  };

  const handlePriceRangeChange = (range) => {
    updateUrlParams({ priceRange: range });
  };

  const resetFilters = () => {
    router.push('/products');
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-16 flex flex-col justify-between flex-1">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto flex-1">
        {/* Header & Controls Bar */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Our Products</h1>
            <p className="mt-1 text-sm text-gray-500">Explore our wide selection of database-driven products.</p>
          </div>

          {/* Filter Dropdowns Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="category-select" className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Category:
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 bg-white shadow-xs focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="price-select" className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Price:
              </label>
              <select
                id="price-select"
                value={priceRange}
                onChange={(e) => handlePriceRangeChange(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 bg-white shadow-xs focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none cursor-pointer"
              >
                <option value="all">All Prices</option>
                <option value="under500">Under ₹500</option>
                <option value="500to1000">₹500 - ₹1,000</option>
                <option value="1000to5000">₹1,000 - ₹5,000</option>
                <option value="5000to10000">₹5,000 - ₹10,000</option>
                <option value="above10000">Above ₹10,000</option>
              </select>
            </div>

            {(category !== "All" || priceRange !== "all" || search) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 bg-pink-50 text-pink-600 font-bold text-xs rounded-xl hover:bg-pink-100 transition duration-150 cursor-pointer whitespace-nowrap"
              >
                Clear Filters ✕
              </button>
            )}
          </div>
        </div>

        {/* Active Search Query Tag */}
        {search && (
          <div className="mb-6 inline-flex items-center gap-2 bg-pink-50 border border-pink-100 px-4 py-2 rounded-full text-xs text-pink-700 font-bold">
            <span>Search Query: "{search}"</span>
            <button
              onClick={() => updateUrlParams({ search: "" })}
              className="text-pink-500 hover:text-pink-800 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Products Grid Section */}
        <div>
          {initialProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-xs">
              <span className="text-5xl block mb-3">🛍️</span>
              <h3 className="text-lg font-bold text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">No products available matching your category or price selection.</p>
              <button
                onClick={resetFilters}
                className="mt-6 px-6 py-2.5 bg-linear-to-r from-pink-400 to-rose-400 text-white font-bold rounded-xl shadow-md shadow-pink-200/50 hover:shadow-lg hover:from-pink-500 hover:to-rose-500 transition-all cursor-pointer text-sm"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialProducts.map((product) => {
                const isAvailable = product.inStock !== false;
                const isAdded = addedIds.has(product.id);

                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group relative ${
                      !isAvailable ? "opacity-90" : ""
                    }`}
                  >
                    {/* Image Container */}
                    <div className="relative h-64 w-full overflow-hidden bg-gray-50">
                      <Link href={`/products/${product.id}`} className="block w-full h-full">
                        <img
                          alt={product.name}
                          className={`object-cover w-full h-full transition-transform duration-500 ${
                            isAvailable ? "group-hover:scale-105" : "grayscale opacity-80"
                          }`}
                          src={product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"}
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";
                          }}
                        />
                      </Link>

                      {/* Out of stock center badge */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                          <span className="px-3.5 py-1.5 bg-rose-600/95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border border-white/20">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {/* Category Badge */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCategoryChange(product.category);
                        }}
                        className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-xs z-10 hover:bg-pink-50 hover:text-pink-600 transition-colors cursor-pointer"
                      >
                        {product.category}
                      </button>

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        className={`absolute top-4 right-4 p-2 rounded-full shadow-xs backdrop-blur-xs transition-all duration-200 cursor-pointer z-20 hover:scale-110 flex items-center justify-center ${isInWishlist(product.id)
                          ? "bg-pink-50 text-pink-600 border border-pink-200"
                          : "bg-white/90 text-gray-400 hover:text-pink-500 hover:bg-white"
                          }`}
                        aria-label="Toggle Wishlist"
                      >
                        <span className="text-base select-none">
                          {isInWishlist(product.id) ? <Heart className='h-5 w-5 fill-pink-600 text-pink-600' /> : <Heart className='h-5 w-5 text-pink-500' />}
                        </span>
                      </button>
                    </div>

                    {/* Details Container */}
                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <Link href={`/products/${product.id}`} className="block mb-4">
                        <h3 className="text-gray-900 font-bold text-lg group-hover:text-pink-500 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-extrabold text-gray-900">
                            ₹{product.price.toFixed(2)}
                          </span>
                          {isAvailable ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              In Stock
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/60 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {isAvailable ? (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${isAdded
                                ? "bg-emerald-500 text-white shadow-emerald-100"
                                : "bg-gray-900 hover:bg-black text-white hover:scale-[1.02] active:scale-[0.98]"
                                }`}
                            >
                              {isAdded ? (
                                <span>Added ✓</span>
                              ) : (
                                <>
                                  <ShoppingCart className='h-4 w-4' /> Add
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => {
                                addToCart(product);
                                router.push('/cart');
                              }}
                              className="py-2 px-3 rounded-xl text-xs font-bold bg-linear-to-r from-pink-400 to-rose-400 text-white shadow-md shadow-pink-200/50 hover:shadow-lg hover:from-pink-500 hover:to-rose-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              Buy Now →
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
        </div>
      </div>
    </div>
  );
}
