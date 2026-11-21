"use client";

import React from 'react';
import { useCart } from '../context/CartContext';
import { sanitizeImageUrl } from '@/lib/imageUtils';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const isAvailable = item.inStock !== false;

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border transition-shadow duration-200 ${
      !isAvailable ? "border-rose-200 bg-rose-50/20" : "border-gray-100 hover:shadow-md"
    }`}>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
          <img
            src={sanitizeImageUrl(item.image) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"}
            alt={item.name}
            className={`w-full h-full object-cover ${!isAvailable ? "grayscale opacity-75" : ""}`}
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";
            }}
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
              <span className="text-[9px] font-black text-white bg-rose-600 px-1.5 py-0.5 rounded">
                Out
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {item.category}
            </span>
            {!isAvailable && (
              <span className="text-[10px] font-extrabold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-full border border-rose-200">
                Out of Stock
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 mt-1 text-sm sm:text-base leading-snug">
            {item.name}
          </h3>
          <p className="text-gray-500 text-sm mt-0.5">₹{item.price.toFixed(2)} each</p>
        </div>
      </div>
      <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8 self-stretch sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0">
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="px-3 py-1.5 hover:bg-gray-100 text-gray-600 font-bold transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="px-3 font-semibold text-gray-800 text-sm w-8 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => {
              if (isAvailable) {
                updateQuantity(item.id, item.quantity + 1);
              }
            }}
            disabled={!isAvailable}
            className={`px-3 py-1.5 font-bold transition-colors ${
              !isAvailable ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100 text-gray-600 cursor-pointer"
            }`}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <div className="flex items-center gap-4 ml-auto sm:ml-0">
          <span className="text-base font-extrabold text-gray-900 min-w-[70px] text-right">
            ₹{(item.price * item.quantity).toFixed(2)}
          </span>
          <button
            onClick={() => removeFromCart(item.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 cursor-pointer"
            aria-label="Remove item"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
