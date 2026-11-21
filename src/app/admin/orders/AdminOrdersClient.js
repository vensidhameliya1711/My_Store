"use client";

import React, { useState } from "react";
import {
  ShoppingCart,
  Search,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  Banknote,
  ChevronDown,
  ChevronUp,
  MapPin,
  Mail,
  Phone,
  User,
  ShieldCheck,
  Check,
  AlertCircle
} from "lucide-react";
import { sanitizeImageUrl } from "@/lib/imageUtils";

const STATUS_CONFIG = {
  Processing: {
    label: "Processing",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    badge: "bg-amber-500",
    icon: Clock,
  },
  Confirmed: {
    label: "Confirmed",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    badge: "bg-blue-500",
    icon: ShieldCheck,
  },
  Shipped: {
    label: "Shipped",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    badge: "bg-purple-500",
    icon: Package,
  },
  "Out for Delivery": {
    label: "Out for Delivery",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    badge: "bg-orange-500",
    icon: Truck,
  },
  Delivered: {
    label: "Delivered",
    color: "bg-green-50 text-green-700 border-green-200",
    badge: "bg-green-500",
    icon: CheckCircle2,
  },
  Cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border-red-200",
    badge: "bg-red-500",
    icon: XCircle,
  },
};

const ALL_STATUSES = [
  "Processing",
  "Confirmed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export default function AdminOrdersClient({ initialOrders = [] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((ord) =>
            (ord.orderId === orderId || ord._id === orderId)
              ? { ...ord, status: newStatus }
              : ord
          )
        );
        showNotification(`Order ${orderId} delivery status updated to "${newStatus}"!`, "success");
      } else {
        showNotification(data.message || "Failed to update order status", "error");
      }
    } catch (err) {
      console.error("Order status update failed:", err);
      showNotification("Network error updating order status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (order.orderId || order._id || "").toLowerCase().includes(q) ||
      (order.customer?.name || "").toLowerCase().includes(q) ||
      (order.customer?.email || "").toLowerCase().includes(q) ||
      (order.customer?.phone || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "All" || (order.status || "Processing") === statusFilter;

    const matchesPayment =
      paymentFilter === "All" ||
      (paymentFilter === "UPI" && (order.paymentMethod === "upi" || (order.paymentType || "").toLowerCase().includes("upi"))) ||
      (paymentFilter === "COD" && (order.paymentMethod === "cod" || (order.paymentType || "").toLowerCase().includes("cash")));

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const upiOrdersCount = orders.filter((o) => o.paymentMethod === "upi" || (o.paymentType || "").toLowerCase().includes("upi")).length;
  const inTransitCount = orders.filter((o) => ["Shipped", "Out for Delivery"].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const processingCount = orders.filter((o) => (o.status || "Processing") === "Processing").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-top-4 duration-200 ${notification.type === "success"
          ? "bg-slate-900 text-white border-slate-800"
          : "bg-red-600 text-white border-red-700"
          }`}>
          {notification.type === "success" ? (
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
              <Check size={14} className="stroke-3" />
            </div>
          ) : (
            <AlertCircle size={20} className="text-white" />
          )}
          <span className="text-xs font-bold">{notification.msg}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-pink-100/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-pink-50 text-pink-600 rounded-2xl">
            <ShoppingCart size={26} />
          </span>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Order Management & Delivery Tracking
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Manage customer orders, track payments (UPI vs COD), and update live delivery milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="px-3.5 py-1.5 bg-pink-50 text-pink-700 font-extrabold text-xs rounded-xl border border-pink-100">
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-rose-100 p-4 rounded-2xl  shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales</p>
          <p className="text-md font-black text-rose-600 mt-2">₹{totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-amber-100 p-4 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Processing</p>
          <p className="text-md font-black text-amber-600 mt-2">{processingCount}</p>
        </div>

        <div className="bg-purple-100 p-4 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Transit</p>
          <p className="text-md font-black text-purple-600 mt-2">{inTransitCount}</p>
        </div>

        <div className="bg-green-100 p-4 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivered</p>
          <p className="text-md font-black text-green-700 mt-2">{deliveredCount}</p>
        </div>

        <div className="bg-pink-100 p-4 rounded-2xl shadow-xs col-span-2 lg:col-span-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">UPI / Online</p>
          <p className="text-md font-black text-pink-600 mt-2">{upiOrdersCount} Orders</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID, Name, Email, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-pink-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-pink-500"
          >
            <option value="All">All Delivery Statuses</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-pink-500"
          >
            <option value="All">All Payment Modes</option>
            <option value="UPI">UPI / Online Only</option>
            <option value="COD">Cash on Delivery (COD)</option>
          </select>

          {(searchQuery || statusFilter !== "All" || paymentFilter !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setPaymentFilter("All");
              }}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 px-2 py-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-14 text-center shadow-xs">
          <span className="text-5xl block mb-3">📦</span>
          <h3 className="text-md font-bold text-slate-800">No orders found</h3>
          <p className="text-slate-400 text-xs mt-2">
            {orders.length === 0
              ? "When customers place orders, they will appear here."
              : "No orders match your search and filter criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, orderIndex) => {
            const currentStatus = order.status || "Processing";
            const statusStyle = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.Processing;
            const isExpanded = expandedOrderId === (order.orderId || order._id);
            const isUpdating = updatingId === (order.orderId || order._id);

            const isUpi =
              order.paymentMethod === "upi" ||
              (order.paymentType || "").toLowerCase().includes("upi");

            return (
              <div
                key={order.orderId || order._id || orderIndex}
                className="bg-white rounded-3xl border border-slate-150 shadow-xs hover:shadow-md transition duration-200 overflow-hidden"
              >
                <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start md:items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 shadow-xs">
                      #{orderIndex + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-md font-black text-slate-900">
                          {order.orderId || order._id}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          • {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        Customer: <strong className="text-slate-800">{order.customer?.name || "Guest User"}</strong> ({order.customer?.phone || "No Phone"})
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold bg-white shadow-xs">
                      {isUpi ? (
                        <>
                          <Smartphone size={14} className="text-pink-600" />
                          <span className="text-pink-700">UPI Online</span>
                        </>
                      ) : (
                        <>
                          <Banknote size={14} className="text-amber-600" />
                          <span className="text-amber-700">Cash on Delivery</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Delivery Status:</span>
                      <div className="relative">
                        <select
                          disabled={isUpdating}
                          value={currentStatus}
                          onChange={(e) =>
                            handleStatusChange(
                              order.orderId || order._id,
                              e.target.value
                            )
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer outline-none transition-all ${statusStyle.color} ${isUpdating ? "opacity-50" : "hover:scale-105"}`}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/40 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Shipping Information</p>
                    <p className="flex items-center gap-2 text-slate-800 font-bold">
                      <User size={13} className="text-slate-400" />
                      <span>{order.customer?.name || "Guest Customer"}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400" />
                      <span>{order.customer?.email || "N/A"}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400" />
                      <span>{order.customer?.phone || "N/A"}</span>
                    </p>
                    <p className="flex items-start gap-2 pt-1">
                      <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{order.customer?.address || "Address not provided"}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/40 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Financial Breakdown</p>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-slate-800">₹{(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span className="font-semibold text-slate-800">{order.shipping === 0 ? "Free" : `₹${(order.shipping || 0).toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%):</span>
                      <span className="font-semibold text-slate-800">₹{(order.tax || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-md font-extrabold text-slate-900">
                      <span>Total Amount:</span>
                      <span className="text-pink-600 text-base">₹{(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 pt-1">
                      Mode: <strong className="text-slate-700">{order.paymentType || (isUpi ? "UPI Online" : "Cash on Delivery")}</strong>
                    </p>
                  </div>

                  <div className="bg-slate-50/40 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                        Ordered Items ({order.items?.length || 0})
                      </p>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {order.items?.map((item, idx) => (
                          <div key={item.id || item._id || idx} className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                                {item.image ? (
                                  <img
                                    src={sanitizeImageUrl(item.image) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";
                                    }}
                                  />
                                ) : (
                                  <Package size={14} className="m-auto text-slate-400 mt-2" />
                                )}
                              </div>
                              <span className="truncate font-medium text-slate-800 max-w-33">{item.name}</span>
                            </div>
                            <span className="font-bold text-slate-700 shrink-0">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedOrderId(
                          isExpanded ? null : (order.orderId || order._id)
                        )
                      }
                      className="mt-3 text-[11px] font-bold text-pink-600 hover:text-pink-700 flex items-center justify-between w-full pt-2 border-t border-slate-200 cursor-pointer"
                    >
                      <span>{isExpanded ? "Hide Details" : "View Full Order Items"}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 bg-slate-50/80 border-t border-slate-100 animate-in fade-in duration-150">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider py-3">Detailed Product List</p>
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div
                          key={item.id || item._id || idx}
                          className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {item.image ? (
                                <img
                                  src={sanitizeImageUrl(item.image) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";
                                  }}
                                />
                              ) : (
                                <Package size={16} className="m-auto text-slate-400 mt-3" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.name}</p>
                              <p className="text-[10px] text-slate-400">Category: {item.category || "General"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-900">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                            <p className="text-[10px] text-slate-400">₹{(item.price || 0).toFixed(2)} × {item.quantity || 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
