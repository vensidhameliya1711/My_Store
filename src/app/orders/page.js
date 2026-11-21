"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import {
  Package,
  ArrowRight,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  MapPin,
  Check,
  Star,
} from 'lucide-react';
import { sanitizeImageUrl } from '@/lib/imageUtils';
import ReviewModal from '../component/ReviewModal';

const STATUS_STEPS = [
  { key: 'Processing', label: 'Order Placed', desc: 'Order received & placed', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', desc: 'Verified by seller', icon: ShieldCheck },
  { key: 'Shipped', label: 'Shipped', desc: 'Dispatched in transit', icon: Package },
  { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Agent out for delivery', icon: Truck },
  { key: 'Delivered', label: 'Delivered', desc: 'Delivered to doorstep', icon: CheckCircle2 },
];

const STATUS_RANK = {
  'Processing': 1,
  'Confirmed': 2,
  'Shipped': 3,
  'Out for Delivery': 4,
  'Delivered': 5,
};

export default function OrdersPage() {
  const { orders: contextOrders, cancelOrder, isMounted } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [reviewModalData, setReviewModalData] = useState(null);
  const [userReviewsMap, setUserReviewsMap] = useState({});

  const showToast = (msg, type = "success") => {
    setToastMsg({ msg, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const fetchUserReviews = async () => {
    try {
      let userId = null;
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u?._id) userId = u._id;
        }
      }
      const res = await fetch(`/api/reviews${userId ? `?userId=${userId}` : ''}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        const map = {};
        data.reviews.forEach((r) => {
          const pId = (r.productId?._id || r.productId || "").toString();
          if (r.orderId && pId) {
            map[`${r.orderId}_${pId}`] = r;
          }
          if (pId) {
            map[`product_${pId}`] = r;
          }
        });
        setUserReviewsMap(map);
      }
    } catch (err) {
      console.error("Error loading user reviews in Orders:", err);
    }
  };

  const fetchLiveOrders = async (notify = false) => {
    setLoading(true);
    try {
      let userId = null;
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u?._id) userId = u._id;
        }
      }

      const url = userId ? `/api/orders?userId=${userId}` : '/api/orders';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();

      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        const mapped = data.orders.map((dbOrder) => ({
          id: dbOrder.orderId || dbOrder._id,
          _id: dbOrder._id,
          date: new Date(dbOrder.createdAt || Date.now()).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          items: dbOrder.items || [],
          subtotal: Number(dbOrder.subtotal) || 0,
          discount: Number(dbOrder.discount) || 0,
          shipping: Number(dbOrder.shipping) || 0,
          tax: Number(dbOrder.tax) || 0,
          total: Number(dbOrder.totalAmount) || 0,
          customer: dbOrder.customer || {},
          paymentMethod: dbOrder.paymentMethod || 'cod',
          paymentType: dbOrder.paymentType || (dbOrder.paymentMethod === 'upi' ? 'UPI Online Payment' : 'Cash on Delivery (COD)'),
          status: dbOrder.status || 'Processing',
        }));
        setOrders(mapped);
        if (notify) showToast("Live delivery status refreshed!");
      } else {
        setOrders(contextOrders || []);
        if (notify) showToast("Order details updated");
      }
      await fetchUserReviews();
    } catch (err) {
      console.error("Error fetching live orders:", err);
      setOrders(contextOrders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) {
      fetchLiveOrders();
      fetchUserReviews();
    }
  }, [isMounted, contextOrders]);

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  if (!isMounted) {
    return (
      <div className="bg-gray-50 min-h-screen pt-24 flex flex-col justify-between">
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-16 flex flex-col justify-between">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-800 flex items-center gap-2.5 animate-in slide-in-from-top-3 duration-200">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white">
            <Check size={12} className="stroke-3" />
          </div>
          <span className="text-xs font-bold">{toastMsg.msg}</span>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Orders & Live Delivery</h1>
            <p className="text-sm text-gray-500 mt-1">Track live delivery status, shipping progress, and payment receipts.</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => fetchLiveOrders(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Check latest live status from warehouse"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-pink-500" : "text-gray-500"} />
              <span>Refresh Status</span>
            </button>

            <span className="text-xs font-semibold text-gray-600 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-xs">
              Orders: <strong className="text-pink-600 font-extrabold">{orders.length}</strong>
            </span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-md mx-auto my-10 flex flex-col items-center">
            <div className="w-24 h-24 mb-6 bg-pink-50 rounded-full flex items-center justify-center text-4xl shadow-inner">
              <Package size={48} className="text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">No orders found</h2>
            <p className="mt-2 text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
              You haven&apos;t placed any orders yet. Fill your cart and checkout to track them here!
            </p>
            <Link
              href="/products"
              className="mt-8 px-8 py-3.5 bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-md shadow-pink-200/50 hover:shadow-lg hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 text-sm cursor-pointer"
            >
              <span>Shop Our Products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, orderIndex) => {
              const orderKey = order.id || order._id || `order-${orderIndex}`;
              const isExpanded = expandedOrderId === orderKey;
              const currentStatus = order.status || 'Processing';
              const isCancelled = currentStatus === 'Cancelled';
              const activeStepRank = STATUS_RANK[currentStatus] || 1;

              const isUpi =
                order.paymentMethod === 'upi' ||
                (order.paymentType || '').toLowerCase().includes('upi');

              return (
                <div
                  key={orderKey}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div className="p-6 sm:p-7 bg-gray-50/60 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
                        <span className="text-sm font-black text-gray-900">{order.id || order._id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Placed on:</span>
                        <span className="font-semibold text-gray-700">{order.date}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end gap-3 sm:gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400 font-bold uppercase">LIVE STATUS</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-extrabold border ${isCancelled
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : currentStatus === 'Delivered'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : currentStatus === 'Shipped' || currentStatus === 'Out for Delivery'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : currentStatus === 'Confirmed'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                        >
                          {currentStatus}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-400 mr-2">Total Paid</span>
                        <span className="text-lg font-black text-pink-600">₹{(order.total || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Truck size={15} className="text-pink-500" />
                        <span>Live Delivery Progress</span>
                      </h3>

                      <span className="text-[11px] font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
                        {isCancelled ? 'Order Cancelled' : `Current Stage: ${currentStatus}`}
                      </span>
                    </div>

                    {isCancelled ? (
                      <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-medium">
                        <XCircle size={20} className="shrink-0 text-red-500" />
                        <div>
                          <p className="font-bold text-red-800">This order has been cancelled.</p>
                          <p className="text-[11px] text-red-600 mt-0.5">If any amount was deducted via UPI, a full refund will be processed within 2-4 business days.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-gray-100 z-0">
                          <div
                            className="h-full bg-linear-to-r from-pink-500 via-purple-500 to-green-500 transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.max(0, ((activeStepRank - 1) / (STATUS_STEPS.length - 1)) * 100))}%`
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
                          {STATUS_STEPS.map((step) => {
                            const stepRank = STATUS_RANK[step.key];
                            const isPast = stepRank < activeStepRank;
                            const isCurrent = step.key === currentStatus;
                            const isPending = stepRank > activeStepRank;
                            const StepIcon = step.icon;

                            return (
                              <div
                                key={step.key}
                                className={`flex sm:flex-col items-center sm:text-center gap-2.5 sm:gap-2 p-2.5 sm:p-2 rounded-2xl transition-all ${isCurrent
                                  ? 'bg-pink-50/80 sm:bg-transparent border sm:border-0 border-pink-200'
                                  : ''
                                  }`}
                              >
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all shadow-xs ${isPast
                                    ? 'bg-pink-500 border-pink-500 text-white'
                                    : isCurrent
                                      ? 'bg-pink-500 border-pink-500 text-white ring-4 ring-pink-100 scale-105'
                                      : 'bg-white border-gray-200 text-gray-400'
                                    }`}
                                >
                                  {isPast ? (
                                    <Check size={16} className="stroke-3" />
                                  ) : (
                                    <StepIcon size={16} />
                                  )}
                                </div>
                                <div className="text-left sm:text-center">
                                  <p
                                    className={`text-xs leading-tight ${isCurrent
                                      ? 'text-pink-600 font-extrabold'
                                      : isPast
                                        ? 'text-gray-900 font-bold'
                                        : 'text-gray-400 font-medium'
                                      }`}
                                  >
                                    {step.label}
                                  </p>
                                  <p className="text-[10px] text-gray-400 hidden sm:block mt-0.5">{step.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 sm:p-7 divide-y divide-gray-100">
                    {order.items?.map((item, itemIndex) => {
                      const itemKey = item.id || item._id || `${orderKey}-item-${itemIndex}`;
                      const prodId = (item.productId || item.id || item._id || "").toString();
                      const specificOrderReviewKey = `${orderKey}_${prodId}`;
                      const existingReview =
                        userReviewsMap[specificOrderReviewKey] ||
                        userReviewsMap[`product_${prodId}`] ||
                        null;

                      return (
                        <div key={itemKey} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                              <img
                                src={sanitizeImageUrl(item.image) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500";
                                }}
                              />
                            </div>
                            <div>
                              <Link href={`/products/${prodId}`} className="font-bold text-gray-900 hover:text-pink-500 transition-colors text-sm sm:text-base">
                                {item.name}
                              </Link>
                              <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                <span>Category: <strong className="text-gray-600">{item.category || "General"}</strong></span>
                                <span>Qty: <strong className="text-gray-600">{item.quantity}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 mt-2 sm:mt-0">
                            {currentStatus === "Delivered" && (
                              <div>
                                {existingReview ? (
                                  <button
                                    onClick={() =>
                                      setReviewModalData({
                                        product: item,
                                        orderId: orderKey,
                                        existingReview,
                                      })
                                    }
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                    title="Edit your review"
                                  >
                                    <Star size={13} className="fill-amber-400 text-amber-400" />
                                    <span>Reviewed ({existingReview.rating}★) • Edit</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      setReviewModalData({
                                        product: item,
                                        orderId: orderKey,
                                        existingReview: null,
                                      })
                                    }
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-extrabold shadow-sm shadow-pink-200 hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                  >
                                    <Star size={13} className="fill-white" />
                                    <span>Rate &amp; Review</span>
                                  </button>
                                )}
                              </div>
                            )}

                            <div className="text-right">
                              <span className="font-black text-gray-900 text-sm sm:text-base">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                              <p className="text-[10px] text-gray-400">₹{(item.price || 0).toFixed(2)} each</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 sm:px-7 sm:pb-7 bg-gray-50/50 border-t border-gray-100 pt-6 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                          <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <MapPin size={14} className="text-pink-500" />
                            <span>Shipping Address</span>
                          </h4>
                          <div className="space-y-1 text-gray-600 text-xs">
                            <p className="font-bold text-gray-900 text-sm">{order.customer?.name || "Customer"}</p>
                            <p>{order.customer?.email}</p>
                            <p>Phone: {order.customer?.phone}</p>
                            <p className="mt-2 text-gray-700 font-medium leading-relaxed">{order.customer?.address}</p>
                          </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                          <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">Payment Breakdown</h4>
                          <div className="space-y-2 text-xs text-gray-600">
                            <div className="flex justify-between items-center">
                              <span>Payment Mode:</span>
                              <span className="font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-lg">
                                {order.paymentType || (isUpi ? 'UPI Online Payment' : 'Cash on Delivery (COD)')}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                              <span>Subtotal:</span>
                              <span>₹{(order.subtotal || 0).toFixed(2)}</span>
                            </div>
                            {(order.discount || 0) > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount:</span>
                                <span>- ₹{(order.discount || 0).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span>{order.shipping === 0 ? <strong className="text-green-600">Free</strong> : `₹${(order.shipping || 0).toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>GST (18%):</span>
                              <span>₹{(order.tax || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 font-bold text-gray-900 text-sm">
                              <span>Grand Total:</span>
                              <span className="text-pink-600 font-black text-base">₹{(order.total || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="px-6 py-4 sm:px-7 border-t border-gray-100 flex items-center justify-between gap-4 bg-gray-50/20">
                    <button
                      onClick={() => toggleExpandOrder(orderKey)}
                      className="text-xs font-bold text-gray-600 hover:text-pink-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <span>Hide Details</span>
                          <span>▲</span>
                        </>
                      ) : (
                        <>
                          <span>View Shipping & Payment</span>
                          <span>▼</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      {order.status === 'Processing' && (
                        <>
                          {confirmCancelId === orderKey ? (
                            <div className="flex items-center gap-2 animate-in fade-in duration-150">
                              <span className="text-xs text-gray-500 font-semibold select-none">Cancel order?</span>
                              <button
                                onClick={async () => {
                                  await cancelOrder(order.id || order._id);
                                  setOrders(prev =>
                                    prev.map(o => (o.id === orderKey || o._id === orderKey) ? { ...o, status: 'Cancelled' } : o)
                                  );
                                  setConfirmCancelId(null);
                                  showToast("Order cancelled successfully");
                                }}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl transition-all cursor-pointer shadow-xs"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmCancelId(null)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 rounded-xl transition-all cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmCancelId(orderKey)}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-600 rounded-xl transition-all cursor-pointer"
                            >
                              Cancel Order
                            </button>
                          )}
                        </>
                      )}

                      {!isCancelled ? (
                        <button
                          onClick={() => showToast(`Delivery update: Order ${order.id || order._id} is at "${currentStatus}" stage.`)}
                          className="px-4 py-2 bg-pink-50 hover:bg-pink-100 border border-pink-200 text-xs font-bold text-pink-600 rounded-xl transition-all cursor-pointer"
                        >
                          Track Shipment
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold italic select-none">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {reviewModalData && (
        <ReviewModal
          isOpen={Boolean(reviewModalData)}
          onClose={() => setReviewModalData(null)}
          product={reviewModalData.product}
          orderId={reviewModalData.orderId}
          existingReview={reviewModalData.existingReview}
          onReviewSubmitted={(savedReview) => {
            showToast("Review submitted successfully! Thank you for your feedback.");
            fetchUserReviews();
          }}
        />
      )}
    </div>
  );
}
