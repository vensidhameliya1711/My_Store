"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  Smartphone,
  Zap,
  Star,
  LogIn,
  UserPlus,
  Store,
} from "lucide-react";
import { sanitizeImageUrl } from "@/lib/imageUtils";

const DEFAULT_WELCOME_CATS = [
  'Electronics',
  'Clothing',
  'Shoes',
  'Jewellery',
  'Accessories',
  'Home & Kitchen',
  'Beauty & Personal Care',
];

export default function WelcomePage() {
  const [categories, setCategories] = useState(DEFAULT_WELCOME_CATS.map(name => ({ name })));

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories?status=active");
        const data = await res.json();
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to load welcome categories:", err);
      }
    };
    loadCategories();
  }, []);
  return (
    <div className="relative min-h-screen w-full bg-linear-to-br from-rose-50 via-pink-50 to-indigo-50 text-gray-900 selection:bg-pink-500 selection:text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl animate-pulse" />
      </div>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/75 border-b border-pink-100/70 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/welcome" className="flex items-center gap-3 group">
            <Image
              src="/Store.png"
              alt="MyStore Logo"
              width={160}
              height={42}
              style={{ width: "auto", height: "auto" }}
              className="object-contain cursor-pointer transition-transform group-hover:scale-105"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#features" className="hover:text-pink-500 transition-colors">Features</a>
            <a href="#categories" className="hover:text-pink-500 transition-colors">Categories</a>
            <a href="#reviews" className="hover:text-pink-500 transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/90 hover:bg-white text-gray-700 hover:text-pink-500 text-xs sm:text-sm font-bold rounded-xl border border-gray-200 hover:border-pink-300 shadow-xs transition-all cursor-pointer"
            >
              <LogIn size={16} />
              <span>Login</span>
            </Link>

            <Link
              href="/registration"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-linear-to-r from-pink-500 to-pink-600 hover:opacity-95 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-pink-300/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus size={16} />
              <span>Register</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-100/70 rounded-full border border-pink-200/70 text-pink-600 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs animate-fade-in-up">
          <Sparkles size={14} className="text-pink-500 fill-pink-500" />
          <span>Welcome to MyStore Online Shopping</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Discover Amazing Products,{' '}
          <span className="bg-linear-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
            Exclusive Deals
          </span>{' '}
          & Fast Delivery.
        </h1>


        <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Experience the next generation of e-commerce with seamless dummy UPI payments, 100% verified products, and real-time live milestone delivery tracking.
        </p>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto">
          <div className="p-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_10px_30px_rgba(236,72,153,0.08)]">
            <p className="text-2xl sm:text-3xl font-black text-gray-900">50K+</p>
            <p className="text-xs text-gray-500 font-bold mt-0.5">Happy Shoppers</p>
          </div>
          <div className="p-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_10px_30px_rgba(236,72,153,0.08)]">
            <p className="text-2xl sm:text-3xl font-black text-pink-500">4.9 ★</p>
            <p className="text-xs text-gray-500 font-bold mt-0.5">Verified Reviews</p>
          </div>
          <div className="p-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_10px_30px_rgba(236,72,153,0.08)]">
            <p className="text-2xl sm:text-3xl font-black text-purple-600">100%</p>
            <p className="text-xs text-gray-500 font-bold mt-0.5">Authentic Goods</p>
          </div>
          <div className="p-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_10px_30px_rgba(236,72,153,0.08)]">
            <p className="text-2xl sm:text-3xl font-black text-rose-500">Instant</p>
            <p className="text-xs text-gray-500 font-bold mt-0.5">Live Delivery Tracking</p>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100/50 rounded-full border border-pink-200/50 text-pink-500 text-xs font-semibold mb-2">
            <Sparkles size={13} />
            <span>Features & Benefits</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Why Customers Love MyStore
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="p-6 bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_15px_40px_rgba(236,72,153,0.08)] hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-pink-500 text-white flex items-center justify-center mb-5 shadow-md shadow-pink-200 group-hover:scale-110 transition-transform">
              <Smartphone size={22} />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 mb-2">Instant UPI & COD</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Pay in seconds via Google Pay, PhonePe, Paytm, QR scan, or choose Cash on Delivery at your doorstep.
            </p>
          </div>

          <div className="p-6 bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_15px_40px_rgba(236,72,153,0.08)] hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center mb-5 shadow-md shadow-purple-200 group-hover:scale-110 transition-transform">
              <Truck size={22} />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 mb-2">Live Delivery Tracker</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Monitor your package step-by-step from warehouse packing and dispatch to out-for-delivery and final handover.
            </p>
          </div>
          <div className="p-6 bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_15px_40px_rgba(236,72,153,0.08)] hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-5 shadow-md shadow-rose-200 group-hover:scale-110 transition-transform">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 mb-2">100% Genuine Quality</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Every product is rigorously quality-inspected, authentic, and backed by a hassle-free cancellation and return guarantee.
            </p>
          </div>
          <div className="p-6 bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_15px_40px_rgba(236,72,153,0.08)] hover:-translate-y-1.5 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center mb-5 shadow-md shadow-pink-200 group-hover:scale-110 transition-transform">
              <Zap size={22} />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 mb-2">Free Delivery Above ₹200</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Enjoy transparent arithmetic pricing, automatic free shipping discounts on all eligible cart orders, and daily deals.
            </p>
          </div>
        </div>
      </section>
      <section id="categories" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-black uppercase tracking-wider text-pink-500 mb-1.5">
            Categories
          </h2>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">
            Shop Top Collections
          </h3>
        </div>

        <div className="flex flex-wrap justify-center gap-3.5 max-w-4xl mx-auto">
          {categories.map((cat, idx) => {
            const catName = typeof cat === "string" ? cat : cat.name;
            const catImg = typeof cat === "object" ? sanitizeImageUrl(cat.image) : "";
            return (
              <Link
                key={idx}
                href={`/products?category=${encodeURIComponent(catName)}`}
                className="px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md hover:bg-pink-50 border border-gray-200/80 hover:border-pink-300 text-gray-800 hover:text-pink-600 text-xs font-extrabold shadow-xs hover:shadow-md transition-all hover:scale-105 cursor-pointer flex items-center gap-2.5 group"
              >
                {catImg ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-pink-100 bg-pink-50">
                    <img
                      src={catImg}
                      alt={catName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <Sparkles size={14} className="text-pink-500 group-hover:rotate-12 transition-transform" />
                )}
                <span>{catName}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="reviews" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-black uppercase tracking-wider text-pink-500 mb-1.5">
            Testimonials
          </h2>
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">
            Loved by Happy Shoppers
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            {
              name: 'Pooja Sharma',
              city: 'Mumbai',
              comment: 'The UPI payment was super fast and smooth. Loved the real-time order tracking updates at each delivery milestone!',
              rating: 4,
            },
            {
              name: 'Rohan Mehta',
              city: 'Delhi',
              comment: 'Amazing product quality and very responsive UI. Best online shopping experience I have had this year!',
              rating: 5,
            },
            {
              name: 'Anjali Verma',
              city: 'Bangalore',
              comment: 'Prices are completely transparent, free delivery was applied automatically and customer support is top-notch.',
              rating: 5,
            },
          ].map((t, idx) => (
            <div
              key={idx}
              className="p-6 bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_15px_40px_rgba(236,72,153,0.08)] space-y-3"
            >
              <div className="flex text-amber-400 gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                &ldquo;{t.comment}&rdquo;
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">{t.name}</span>
                <span className="text-[11px] text-gray-400 font-semibold">{t.city}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="p-8 sm:p-12 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_20px_60px_rgba(236,72,153,0.14)] text-center max-w-4xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-pink-500 to-pink-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-pink-300/50">
            <ShoppingBag size={28} />
          </div>

          <h3 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Ready to Start Shopping on MyStore?
          </h3>
          <p className="text-gray-500 text-sm max-w-xl mx-auto font-medium">
            Create an account in less than a minute to enjoy exclusive discounts, instant UPI checkout, and live order tracking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/registration"
              className="w-full sm:w-auto px-8 py-4 bg-linear-to-r from-pink-500 to-pink-600 hover:opacity-95 text-white font-black text-sm rounded-2xl shadow-xl shadow-pink-300/40 hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <UserPlus size={18} />
              <span>Create Free Account</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 hover:text-pink-500 font-extrabold text-sm rounded-2xl border-2 border-gray-200 hover:border-pink-300 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <LogIn size={18} className="text-pink-500" />
              <span>Sign In to Account</span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 w-full bg-white/80 backdrop-blur-md border-t border-pink-100/70 py-6 text-xs text-gray-500">
        <div className="w-full px-4 sm:px-10 flex flex-col md:flex-row items-center justify-between relative">
          <div className="ml-0 md:ml-10 flex items-center shrink-0">
            <Image
              src="/Store.png"
              alt="MyStore Logo"
              width={160}
              height={42}
              style={{ width: "auto", height: "auto" }}
              className="object-contain"
            />
          </div>

          <div className="w-full md:absolute md:left-1/2 md:-translate-x-1/2 text-center text-gray-500 font-semibold py-2 md:py-0">
            <span>© {new Date().getFullYear()} MyStore. All Rights Reserved.</span>
          </div>
          <div className="hidden md:block w-28 mr-10" />
        </div>
      </footer>
    </div>
  );
}
