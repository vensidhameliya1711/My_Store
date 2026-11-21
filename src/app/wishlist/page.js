"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart, Trash2, ArrowRight } from 'lucide-react';
import { sanitizeImageUrl } from '@/lib/imageUtils';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart, isMounted } = useCart();
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

  if (!isMounted) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen pt-24 flex flex-col justify-between">
        <div className="grow flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-16 flex flex-col justify-between">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto flex-1">
        <div className="border-b border-gray-200 pb-5 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              My Wishlist
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage the products you have saved for later.
            </p>
          </div>
          {wishlist.length > 0 && (
            <span className="px-3.5 py-1.5 bg-pink-100 text-pink-700 font-extrabold text-xs rounded-full self-start sm:self-auto">
              {wishlist.length} {wishlist.length === 1 ? 'Saved Item' : 'Saved Items'}
            </span>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center max-w-lg mx-auto my-10 flex flex-col items-center">
            <div className="w-24 h-24 mb-6 bg-pink-50 rounded-full flex items-center justify-center text-4xl shadow-inner">
              💖
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Wishlist is Empty</h2>
            <p className="text-gray-500 mt-2 max-w-sm text-sm leading-relaxed">
              Tap the heart icon on any product in our catalog to save your favorite items here for later!
            </p>
            <Link
              href="/products"
              className="mt-8 px-8 py-3.5 bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-md shadow-pink-200/50 hover:shadow-lg hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 text-sm cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => {
              const isAvailable = product.inStock !== false;

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group relative ${
                    !isAvailable ? "opacity-90" : ""
                  }`}
                >
                  <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                    <Link href={`/products/${product.id}`} className="block w-full h-full">
                      <img
                        alt={product.name}
                        className={`object-cover w-full h-full transition-transform duration-500 ${
                          isAvailable ? "group-hover:scale-105" : "grayscale opacity-75"
                        }`}
                        src={sanitizeImageUrl(product.image) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";
                        }}
                      />
                    </Link>

                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                        <span className="px-3 py-1 bg-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border border-white/20">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    <span className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm z-10">
                      {product.category}
                    </span>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3.5 right-3.5 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-red-500 hover:text-red-600 transition-all duration-200 cursor-pointer z-20 hover:scale-110 flex items-center justify-center"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-[11px] font-bold text-pink-500 uppercase tracking-widest mb-1">
                      {product.category}
                    </span>
                    <Link href={`/products/${product.id}`} className="block group-hover:text-pink-600 transition-colors">
                      <h3 className="text-gray-900 font-bold text-base line-clamp-1 mb-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1.5 mb-4">
                      <div className="flex text-amber-400 text-xs">
                        {"★".repeat(Math.floor(product.rating || 4.5))}
                        {"☆".repeat(5 - Math.floor(product.rating || 4.5))}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">
                        ({product.reviewsCount || 12})
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <span className="text-lg font-black text-gray-900">
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
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`w-full mt-4 py-2.5 rounded-xl font-bold transition-all duration-200 shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-xs ${addedIds.has(product.id)
                            ? "bg-emerald-500 text-white shadow-emerald-100"
                            : "bg-linear-to-r from-pink-500 to-rose-500 text-white shadow-pink-200/50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                          }`}
                      >
                        {addedIds.has(product.id) ? (
                          <>
                            <span>Added to Cart ✓</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full mt-4 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed text-xs flex items-center justify-center gap-1.5 select-none"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Out of Stock</span>
                      </button>
                    )}
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
