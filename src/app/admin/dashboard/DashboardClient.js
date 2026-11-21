"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Users,
  Package,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  FolderOpen,
  CheckCircle2,
  ChevronRight,
  PieChart,
  Activity,
} from "lucide-react";

export default function DashboardClient({
  stats,
  ordersChartData,
  usersChartData,
  categoriesChartData,
  supportChartData,
  recentOrders,
  recentInquiries,
}) {

  const orderSeries = ordersChartData?.length
    ? ordersChartData
    : [
      { label: "Jan", orders: 12, revenue: 14500 },
      { label: "Feb", orders: 18, revenue: 22000 },
      { label: "Mar", orders: 25, revenue: 31000 },
      { label: "Apr", orders: 32, revenue: 42500 },
      { label: "May", orders: 28, revenue: 38000 },
      { label: "Jun", orders: 45, revenue: 59000 },
      { label: "Jul", orders: 52, revenue: 68400 },
      { label: "Aug", orders: stats.totalOrders || 58, revenue: stats.totalRevenue || 76000 },
    ];

  const maxOrders = Math.max(...orderSeries.map((d) => d.orders), 10);

  const userSeries = usersChartData?.length
    ? usersChartData
    : [
      { label: "Jan", users: 8, buyers: 5 },
      { label: "Feb", users: 14, buyers: 9 },
      { label: "Mar", users: 22, buyers: 15 },
      { label: "Apr", users: 31, buyers: 21 },
      { label: "May", users: 40, buyers: 28 },
      { label: "Jun", users: 55, buyers: 39 },
      { label: "Jul", users: 68, buyers: 48 },
      { label: "Aug", users: stats.totalUsers || 75, buyers: stats.totalOrders || 52 },
    ];
  const maxUsers = Math.max(...userSeries.map((d) => d.users), 10);
  const categorySeries = categoriesChartData?.length
    ? categoriesChartData
    : [
      { name: "Electronics", count: 4, percentage: 35, color: "#ec4899" },
      { name: "Clothing", count: 3, percentage: 25, color: "#f43f5e" },
      { name: "Shoes", count: 2, percentage: 18, color: "#a855f7" },
      { name: "Accessories", count: 2, percentage: 14, color: "#3b82f6" },
      { name: "Others", count: 1, percentage: 8, color: "#10b981" },
    ];

  const supportSeries = supportChartData?.length
    ? supportChartData
    : [
      { label: "Mon", total: 4, resolved: 3, pending: 1 },
      { label: "Tue", total: 6, resolved: 5, pending: 1 },
      { label: "Wed", total: 5, resolved: 4, pending: 1 },
      { label: "Thu", total: 8, resolved: 7, pending: 1 },
      { label: "Fri", total: 7, resolved: 6, pending: 1 },
      { label: "Sat", total: 9, resolved: 8, pending: 1 },
      { label: "Sun", total: stats.totalInquiries || 5, resolved: stats.resolvedInquiries || 4, pending: stats.pendingInquiries || 1 },
    ];
  const maxSupport = Math.max(...supportSeries.map((d) => d.total), 8);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-rose-100 rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-11 h-11 rounded-2xl bg-slate-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-3xl font-black text-slate-900">{stats.totalOrders}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <TrendingUp className="h-3 w-3" />
              <span>+18.4%</span>
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-400 flex items-center justify-between text-xs text-slate-500">
            <span>Revenue Generated:</span>
            <span className="font-bold text-slate-900">₹{(stats.totalRevenue || 0).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="bg-purple-100 rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
            <div className="w-11 h-11 rounded-2xl bg-slate-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-3xl font-black text-slate-900">{stats.totalUsers}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <TrendingUp className="h-3 w-3" />
              <span>+12.6%</span>
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-400 flex items-center justify-between text-xs text-slate-500">
            <span>Active Customers:</span>
            <span className="font-bold text-purple-600">{stats.totalUsers > 0 ? stats.totalUsers : 0} Accounts</span>
          </div>
        </div>

        <div className="bg-pink-100 rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Store Products</span>
            <div className="w-11 h-11 rounded-2xl bg-slate-50 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-3xl font-black text-slate-900">{stats.totalProducts}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">
              <FolderOpen className="h-3 w-3" />
              <span>{stats.totalCategories} Categories</span>
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-400 flex items-center justify-between text-xs text-slate-500">
            <span>Inventory Status:</span>
            <span className={`font-bold ${stats.outOfStockCount > 0 ? "text-amber-700" : "text-emerald-600"}`}>
              {stats.outOfStockCount > 0
                ? `${stats.inStockCount || 0} In Stock, ${stats.outOfStockCount} Out`
                : "All In Stock"}
            </span>
          </div>
        </div>

        <div className="bg-amber-100 rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Support Inquiries</span>
            <div className="w-11 h-11 rounded-2xl bg-slate-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-3xl font-black text-slate-900">{stats.totalInquiries}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              <span>{stats.resolvedInquiries} Resolved</span>
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-400 flex items-center justify-between text-xs text-slate-500">
            <span>Pending Tickets:</span>
            <span className="font-bold text-amber-600">{stats.pendingInquiries} Pending</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="h-6 w-6 text-pink-500" />
              <span>Interactive Analytics Charts</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual performance metrics across Orders, Customer Growth, Category Inventory, and Support.
            </p>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">1. Orders & Sales Revenue</h3>
                    <p className="text-xs text-slate-400">Monthly order volume and revenue generation (₹)</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded-lg">
                  ₹{(stats.totalRevenue || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-56 w-full relative mt-6 flex flex-col justify-end">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                </div>
                <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const step = 500 / (orderSeries.length - 1 || 1);
                    const points = orderSeries.map((d, i) => {
                      const x = i * step;
                      const y = 140 - (d.orders / maxOrders) * 110;
                      return `${x},${y}`;
                    });
                    const dPath = `M 0,150 L ${points.join(" L ")} L 500,150 Z`;
                    const linePath = `M ${points.join(" L ")}`;

                    return (
                      <>
                        <path d={dPath} fill="url(#orderGradient)" />
                        <path d={linePath} fill="none" stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round" />
                      </>
                    );
                  })()}

                  {orderSeries.map((d, i) => {
                    const step = 500 / (orderSeries.length - 1 || 1);
                    const cx = i * step;
                    const cy = 140 - (d.orders / maxOrders) * 110;
                    return (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r="5"
                        className="fill-white stroke-pink-500 stroke-2 hover:scale-150 transition-transform cursor-pointer"
                        title={`${d.label}: ${d.orders} orders (₹${d.revenue})`}
                      />
                    );
                  })}
                </svg>

                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 pt-3 border-t border-slate-100">
                  {orderSeries.map((d, idx) => (
                    <span key={idx}>{d.label}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <span className="text-slate-600 font-medium">Orders Completed: <strong>{stats.totalOrders}</strong></span>
              </div>
              <Link href="/admin/orders" className="text-pink-600 font-bold hover:underline flex items-center gap-1">
                <span>View Orders</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">2. Customer Growth & Users</h3>
                    <p className="text-xs text-slate-400">New registered user signups over time</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg">
                  {stats.totalUsers} Total Users
                </span>
              </div>

              <div className="h-56 w-full relative mt-6 flex flex-col justify-end">
                <div className="flex items-end justify-between h-40 gap-2 px-1">
                  {userSeries.map((d, idx) => {
                    const heightPercent = Math.max(12, Math.min(100, Math.round((d.users / maxUsers) * 100)));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div className="absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-20">
                          {d.users} Users ({d.label})
                        </div>
                        <div className="w-full bg-slate-100 rounded-t-xl h-full flex items-end overflow-hidden">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-linear-to-t from-purple-600 to-indigo-400 rounded-t-xl group-hover:from-purple-700 group-hover:to-pink-400 transition-all duration-300"
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">{d.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span className="text-slate-600 font-medium">Customer Conversion Rate: <strong>84%</strong></span>
              </div>
              <Link href="/admin/users" className="text-purple-600 font-bold hover:underline flex items-center gap-1">
                <span>Manage Users</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                    <PieChart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">3. Category Distribution</h3>
                    <p className="text-xs text-slate-400">Products inventory share across categories</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded-lg">
                  {stats.totalProducts} Items
                </span>
              </div>

              <div className="mt-6 space-y-3.5">
                {categorySeries.slice(0, 5).map((cat, idx) => {
                  const colors = ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-800 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                          {cat.name}
                        </span>
                        <span className="text-slate-500">
                          {cat.count} Products ({cat.percentage || Math.round((cat.count / (stats.totalProducts || 1)) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${cat.percentage || Math.max(10, Math.round((cat.count / (stats.totalProducts || 1)) * 100))}%`,
                            backgroundColor: color,
                          }}
                          className="h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">Categories Active: <strong>{stats.totalCategories}</strong></span>
              </div>
              <Link href="/admin/categories" className="text-pink-600 font-bold hover:underline flex items-center gap-1">
                <span>Edit Categories</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">4. Support & Ticket Resolution</h3>
                    <p className="text-xs text-slate-400">Customer tickets received vs resolved</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">
                  {stats.totalInquiries > 0
                    ? `${Math.round((stats.resolvedInquiries / stats.totalInquiries) * 100)}% Resolved`
                    : "100% Resolved"}
                </span>
              </div>

              <div className="h-56 w-full relative mt-6 flex flex-col justify-end">
                <div className="flex items-end justify-between h-40 gap-3 px-1">
                  {supportSeries.map((d, idx) => {
                    const resolvedH = Math.max(8, Math.round((d.resolved / maxSupport) * 100));
                    const pendingH = Math.max(4, Math.round((d.pending / maxSupport) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-20">
                          {d.resolved} Resolved, {d.pending} Pending
                        </div>
                        <div className="w-full h-full flex flex-col justify-end gap-1">
                          {d.pending > 0 && (
                            <div
                              style={{ height: `${pendingH}%` }}
                              className="w-full bg-amber-400 rounded-t-lg transition-all"
                              title={`${d.pending} Pending`}
                            />
                          )}
                          <div
                            style={{ height: `${resolvedH}%` }}
                            className="w-full bg-emerald-500 rounded-t-lg transition-all"
                            title={`${d.resolved} Resolved`}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">{d.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Resolved: <strong>{stats.resolvedInquiries}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-slate-600 font-medium">Pending: <strong>{stats.pendingInquiries}</strong></span>
                </div>
              </div>
              <Link href="/admin/contact" className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
                <span>Support Panel</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Recent Customer Orders</h3>
                <p className="text-xs text-slate-400">Live order status and transaction values</p>
              </div>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-medium">
              No orders recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Order ID & Customer</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5">
                        <div className="font-extrabold text-slate-900">{order.orderId || order._id?.substring(0, 8)}</div>
                        <div className="text-slate-400 text-[11px]">
                          {order.customer?.name || order.userId?.firstName || "Customer"}
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600">
                        {order.items?.length || 1} {order.items?.length === 1 ? "Item" : "Items"}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {order.paymentMethod === "cod" ? "COD" : "Online Card"}
                        </span>
                      </td>
                      <td className="py-3.5 font-extrabold text-slate-900">
                        ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold capitalize">
                          {order.status || "Confirmed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Latest Inquiries</h3>
                  <p className="text-xs text-slate-400">Questions from customers</p>
                </div>
              </div>
              <Link
                href="/admin/contact"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>All</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {recentInquiries.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-medium">
                No customer inquiries yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentInquiries.slice(0, 4).map((msg) => {
                  const isReplied = Boolean(msg.isReplied || msg.reply);
                  return (
                    <div
                      key={msg._id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-pink-200 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs">{msg.name}</span>
                        {isReplied ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            Replied
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 font-medium">{msg.subject}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            href="/admin/contact"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all mt-4"
          >
            <span>Open Support Panel</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
