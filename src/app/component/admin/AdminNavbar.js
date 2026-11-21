"use client";

import { Menu, LogOut, ShieldCheck, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";

export default function AdminNavbar({ collapsed, setCollapsed }) {
  const router = useRouter();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.includes("dashboard"));
    if (pathname.includes("products/add"));
    if (pathname.includes("products/edit"));
    if (pathname.includes("products"));
    if (pathname.includes("orders"));
    if (pathname.includes("users"));
    if (pathname.includes("categories"));
    if (pathname.includes("contact"));
    if (pathname.includes("settings"));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    toast.info("Logged out successfully");
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-pink-100/60 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-slate-700 hover:bg-pink-50 hover:text-pink-600 rounded-xl border border-gray-200 hover:border-pink-200 transition-all cursor-pointer flex items-center justify-center shadow-2xs group"
          title={collapsed ? "Expand Sidebar (Menu)" : "Collapse Sidebar (Menu)"}
          aria-label="Toggle Sidebar Menu"
        >
          <Menu size={22} className="group-hover:scale-105 transition-transform" />
        </button>

        <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
          {getPageTitle()}
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center gap-1.5 bg-purple-50 border border-purple-100/80 px-3 py-1.5 rounded-full">
          <ShieldCheck size={15} className="text-purple-600" />
          <span className="text-xs font-bold text-purple-700">Administrator</span>
        </div>
        <Link
          href="/admin/settings"
          className="p-2 text-slate-600 hover:text-pink-600 hover:bg-pink-100 rounded-xl border border-gray-200 hover:border-pink-200 transition-all cursor-pointer"
          title="Security & Password Settings"
        >
          <Settings size={18} />
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-linear-to-r from-red-600 via-red-500 to-red-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-red-200/50 hover:shadow-lg hover:opacity-95 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}