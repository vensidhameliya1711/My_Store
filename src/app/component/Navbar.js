"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { useCart } from "../context/CartContext";
import { User, ShoppingBag, Heart, LogOut, ShoppingCart, SquareUser, LogIn, UserPlus, ShieldCheck, Moon } from "lucide-react";

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    setSearchVal(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal.trim()) {
      params.set("search", searchVal.trim());
    } else {
      params.delete("search");
    }
    params.delete("category");
    params.delete("maxPrice");
    params.delete("sortBy");

    router.push(`/products?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative">
      <input
        type="text"
        placeholder="Search..."
        value={searchVal}
        onChange={(e) => setSearchVal(e.target.value)}
        className="w-40 sm:w-56 px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all text-sm pr-8"
      />
      {searchVal && (
        <button
          type="button"
          onClick={() => {
            setSearchVal("");
            const params = new URLSearchParams(searchParams.toString());
            params.delete("search");
            router.push(`/products?${params.toString()}`);
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
        >
          ✕
        </button>
      )}
    </form>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { cartItemsCount } = useCart();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    const loadUserData = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            setCurrentUser(JSON.parse(stored));
          } catch (e) {
            console.error("Failed to parse stored user", e);
          }
        }

        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch (err) {
      }
    };

    loadUserData();

    window.addEventListener("storage", loadUserData);
    return () => {
      window.removeEventListener("storage", loadUserData);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isProfileOpen]);

  const displayName = mounted && currentUser
    ? [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") || currentUser.email || "User"
    : "Account";

  return (
    <header className="fixed top-0 z-50 bg-white border-b border-gray-200 shadow-sm w-full">
      <div className="w-full h-16 flex items-center justify-between px-4 md:px-10">
        <div>
          <Link href="/home">
            <Image
              src="/Store.png"
              alt="MyStore Logo"
              width={130}
              height={50}
              style={{ width: "auto", height: "auto" }}
              className="object-contain cursor-pointer"
              priority
            />
          </Link>
        </div>

        <ul className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <li>
            <Link href="/home" className="hover:text-pink-600 transition-colors">
              Home
            </Link>
          </li>

          <li>
            <Link href="/products" className="hover:text-pink-600 transition-colors">
              Products
            </Link>
          </li>

          <li>
            <Link href="/about" className="hover:text-pink-600 transition-colors">
              About
            </Link>
          </li>

          <li>
            <Link href="/contact" className="hover:text-pink-600 transition-colors">
              Contact Us
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-3">
          <Suspense
            fallback={
              <input
                type="text"
                placeholder="Search..."
                disabled
                className="w-40 sm:w-56 px-3 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-gray-50 text-gray-400"
              />
            }
          >
            <SearchBar />
          </Suspense>

          <Link
            href="/cart"
            className="relative p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-200 flex items-center justify-center group"
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={24} className="text-pink-600 group-hover:scale-110 transition-transform duration-200" />

            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cartItemsCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-1.5 sm:p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-200 flex items-center justify-center group cursor-pointer"
              aria-label="User Profile"
            >
              {mounted && currentUser?.profilePic ? (
                <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-pink-400">
                  <img
                    src={currentUser.profilePic}
                    alt={displayName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  />
                </div>
              ) : (
                <SquareUser
                  size={24}
                  className="text-pink-600 group-hover:scale-110 transition-transform duration-200"
                />
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-gray-100 mb-1 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {mounted && currentUser?.profilePic ? (
                      <img
                        src={currentUser.profilePic}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <SquareUser size={20} className="text-pink-600" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
                      {mounted && currentUser?.role === 'admin' ? 'Admin' : 'Account'}
                    </p>
                    <p className="text-sm font-bold text-gray-800 truncate" title={displayName}>
                      {displayName}
                    </p>
                  </div>
                </div>

                {mounted && currentUser ? (
                  <>
                    {currentUser.role === 'admin' && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-colors font-bold"
                      >
                        <ShieldCheck size={18} className="text-purple-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors font-medium"
                    >
                      <User size={18} />
                      My Profile
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors font-medium"
                    >
                      <ShoppingBag size={18} />
                      My Orders
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors font-medium"
                    >
                      <Heart size={18} />
                      My Wishlist
                    </Link>

                    <button
                      onClick={async () => {
                        setIsProfileOpen(false);
                        localStorage.removeItem("user");
                        localStorage.removeItem("role");
                        localStorage.removeItem("token");
                        setCurrentUser(null);

                        try {
                          await fetch("/api/logout", { method: "POST" });
                        } catch (error) {
                          console.error("Logout failed:", error);
                        }

                        router.push("/login");
                        router.refresh();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-semibold cursor-pointer border-t border-gray-100 mt-1"
                    >
                      <LogOut size={18} />
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors font-semibold"
                    >
                      <LogIn size={18} />
                      Log In
                    </Link>

                    <Link
                      href="/registration"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors font-semibold"
                    >
                      <UserPlus size={18} />
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}