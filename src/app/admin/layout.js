"use client";

import { useState } from "react";
import AdminSidebar from "@/app/component/admin/AdminSidebar";
import AdminNavbar from "@/app/component/admin/AdminNavbar";

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 flex">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ease-in-out ${collapsed ? "ml-20" : "ml-64"
          }`}
      >
        <AdminNavbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="p-4 md:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}