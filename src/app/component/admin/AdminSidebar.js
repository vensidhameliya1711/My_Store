"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderOpen,
  Contact,
  Store,
  Star,
} from "lucide-react";

export default function AdminSidebar({ collapsed }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders & Delivery", icon: ShoppingCart },
    { href: "/admin/reviews", label: "Product Reviews", icon: Star },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/categories", label: "Categories", icon: FolderOpen },
    { href: "/admin/contact", label: "Contact", icon: Contact },
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen bg-white text-slate-400 z-50
        flex flex-col justify-between shadow-2xl border-r border-slate-100
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-20 p-3" : "w-64 p-5"}
      `}
    >
      <div>
        <div
          className={`flex items-center border-b border-slate-300 pb-4 mb-6 transition-all ${collapsed ? "justify-center" : "justify-start"
            }`}
        >
          <Link href="/admin/dashboard" className="block focus:outline-none">
            {collapsed ? (
              <div
                className="flex items-center justify-center p-1 hover:scale-105 transition-transform"
                title="MyStore Admin"
              >
                <Image
                  src="/logo.png"
                  alt="MyStore Logo"
                  width={55}
                  height={55}
                  className="w-12 h-12 object-contain drop-shadow-md"
                  priority
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1 animate-in fade-in duration-200">
                <div className="flex justify-center">
                  <Image src="/Store.png" alt="MyStore Admin Logo" width={250} height={100} className="w-62.5 h-20 object-contain object-left drop-shadow-md" priority />
                </div>
              </div>
            )}
          </Link>
        </div>

        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href + "/"));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center rounded-xl font-bold text-sm transition-all duration-200 group relative ${collapsed
                      ? "justify-center p-3.5"
                      : "gap-3 px-4 py-3"
                      } ${isActive
                        ? "text-pink-500"
                        : "text-slate-900 hover:text-slate-500"
                      }`}
                  >
                    <Icon
                      size={20}
                      className={`shrink-0 transition-colors ${isActive ? "text-pink-500" : "text-slate-900 group-hover:text-slate-500"
                        }`}
                    />
                    {!collapsed && (
                      <span className="truncate animate-in fade-in duration-200">
                        {item.label}
                      </span>
                    )}

                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-300 text-xs text-slate-400">
        <Link
          href="/home"
          title={collapsed ? "View Customer Store" : undefined}
          className={`flex items-center text-pink-700 hover:text-pink-500 font-bold transition-colors group relative ${collapsed ? "justify-center p-2" : "gap-2 px-2 mb-2"
            }`}
        >
          <Store size={18} className="shrink-0" />
          {!collapsed && <span>Customer Store</span>}

          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-pink-400 text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700">
              Customer Store
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}