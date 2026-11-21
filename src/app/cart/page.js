"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CartItem from '../component/CartItem';
import { useCart } from '../context/CartContext';
import {
  CheckCircle2,
  Smartphone,
  QrCode,
  CreditCard,
  Banknote,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';

export default function CartPage() {
  const { cart, cartSubtotal, clearCart, addOrder, isMounted } = useCart();

  // Checkout & Payment States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [finalAmount, setFinalAmount] = useState(0);

  // UPI Specific state
  const [upiOption, setUpiOption] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'qr' | 'custom'
  const [upiIdInput, setUpiIdInput] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [isProcessingUpi, setIsProcessingUpi] = useState(false);
  const [upiStep, setUpiStep] = useState(1); // 1: connecting, 2: approval, 3: success
  const [upiTransactionId, setUpiTransactionId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'upi', // default to UPI Online Payment as requested
  });

  const [formErrors, setFormErrors] = useState({});
  const [confirmedOrderDetails, setConfirmedOrderDetails] = useState(null);

  // Autofill user details from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const u = JSON.parse(stored);
          setFormData((prev) => ({
            ...prev,
            name: prev.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || '',
            email: prev.email || u.email || '',
            phone: prev.phone || u.phone || '',
            address: prev.address || u.address || '',
          }));
        }
      } catch (e) {
        console.error('Error prefilling user in cart:', e);
      }
    }
  }, [isCheckoutOpen]);

  // Calculations - Strict arithmetic to prevent floating-point inaccuracies
  const shippingThreshold = 200;
  const standardShipping = 40;
  const discount = 0;

  const validCartSubtotal = Math.round((cartSubtotal || 0) * 100) / 100;
  const shipping = validCartSubtotal > 0 ? (validCartSubtotal >= shippingThreshold ? 0 : standardShipping) : 0;
  const taxableAmount = Math.max(0, Math.round((validCartSubtotal - discount) * 100) / 100);
  const tax = Math.round(taxableAmount * 0.18 * 100) / 100;
  const grandTotal = Math.round((taxableAmount + shipping + tax) * 100) / 100;
  const hasOutOfStockItems = cart.some((item) => item.inStock === false);

  // Checkout form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Invalid phone number (must be 10 digits)';
    }
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    } else if (!/^\d{6}$/.test(formData.postalCode.replace(/[\s-]/g, ''))) {
      errors.postalCode = 'Invalid postal code (6 digits)';
    }

    if (formData.paymentMethod === 'upi' && upiOption === 'custom') {
      if (!upiIdInput.trim()) {
        errors.upiId = 'UPI ID is required (e.g. name@okhdfcbank)';
      } else if (!/^[\w.-]+@[\w.-]+$/.test(upiIdInput.trim())) {
        errors.upiId = 'Invalid UPI ID format (e.g. yourname@upi)';
      }
    }

    return errors;
  };

  // Helper to persist order to MongoDB and Local State
  const executeOrderCreation = async (paymentDetails) => {
    const randomId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
      id: randomId,
      date: new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      items: [...cart],
      subtotal: validCartSubtotal,
      discount,
      shipping,
      tax,
      total: grandTotal,
      customer: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city} - ${formData.postalCode}`,
      },
      paymentMethod: formData.paymentMethod,
      paymentType: paymentDetails.label,
      status: "Processing",
    };

    // Store details for confirmation screen BEFORE clearing cart
    setConfirmedOrderDetails({
      orderId: randomId,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      address: newOrder.customer.address,
      paymentLabel: paymentDetails.label,
      subtotal: validCartSubtotal,
      discount,
      shipping,
      tax,
      grandTotal: grandTotal,
      items: [...cart],
    });

    // Save local state
    addOrder(newOrder);

    // Save to MongoDB
    try {
      let currentUserId = null;
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          if (userObj?._id) {
            currentUserId = userObj._id;
          }
        }
      }

      await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserId,
          orderId: randomId,
          items: cart.map((item) => ({
            id: item.id,
            productId: item.id,
            name: item.name,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            image: item.image,
            category: item.category || "General",
          })),
          subtotal: validCartSubtotal,
          discount,
          shipping,
          tax,
          totalAmount: grandTotal,
          customer: newOrder.customer,
          paymentMethod: formData.paymentMethod,
          paymentType: paymentDetails.label,
          status: "Processing",
        }),
      });
    } catch (error) {
      console.error("Failed to save order to MongoDB:", error);
    }

    setFinalAmount(grandTotal);
    setOrderId(randomId);
    setOrderPlaced(true);
    setIsCheckoutOpen(false);
    setIsProcessingUpi(false);
    clearCart();
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    // Check for out of stock items
    if (hasOutOfStockItems) {
      alert('Your cart contains out of stock items. Please remove them to proceed with checkout.');
      return;
    }

    // Validation
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (formData.paymentMethod === 'upi') {
      // Trigger interactive UPI payment simulation modal
      const txnId = 'UPI' + Math.floor(100000000000 + Math.random() * 900000000000);
      setUpiTransactionId(txnId);
      setIsProcessingUpi(true);
      setUpiStep(1);

      // Step 1 -> Step 2
      setTimeout(() => {
        setUpiStep(2);
      }, 1200);

      // Step 2 -> Step 3 (Payment Success)
      setTimeout(() => {
        setUpiStep(3);
      }, 2600);

      // Finalize Order
      setTimeout(() => {
        let appName = 'Google Pay';
        if (upiOption === 'phonepe') appName = 'PhonePe';
        if (upiOption === 'paytm') appName = 'Paytm UPI';
        if (upiOption === 'qr') appName = 'UPI QR Code';
        if (upiOption === 'custom') appName = `UPI ID (${upiIdInput})`;

        executeOrderCreation({
          label: `UPI Online Payment (${appName} - UTR: ${txnId.slice(-6)})`,
        });
      }, 3800);
    } else {
      // Cash on Delivery
      executeOrderCreation({
        label: 'Cash on Delivery (COD)',
      });
    }
  };

  // Render Order Success State
  if (orderPlaced && confirmedOrderDetails) {
    return (
      <div className="bg-gray-50 min-h-screen pt-24 pb-16 flex flex-col justify-between flex-1">
        <div className="max-w-2xl w-full mx-auto px-4 py-8 text-center flex-1 flex flex-col justify-center items-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm border border-green-200 text-green-600 animate-bounce">
            ✓
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been placed successfully.</p>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm w-full text-left mb-8">
            <h2 className="font-bold text-gray-900 border-b pb-3 mb-3 text-lg flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs px-2.5 py-1 bg-green-50 text-green-700 font-bold rounded-full border border-green-200">
                Confirmed
              </span>
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-bold text-gray-900">{confirmedOrderDetails.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer Name:</span>
                <span className="font-medium text-gray-900">{confirmedOrderDetails.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Address:</span>
                <span className="font-medium text-gray-900 text-right max-w-xs">{confirmedOrderDetails.address}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Payment Mode:</span>
                <span className="font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg text-xs">
                  {confirmedOrderDetails.paymentLabel}
                </span>
              </div>

              {/* Items Breakdown */}
              <div className="border-t border-b py-3 my-3 space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Items Ordered ({confirmedOrderDetails.items.length})</span>
                {confirmedOrderDetails.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <span className="text-gray-800 font-medium">{item.name} <strong className="text-gray-500">x{item.quantity}</strong></span>
                    <span className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium text-gray-900">₹{confirmedOrderDetails.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className="font-medium text-gray-900">
                    {confirmedOrderDetails.shipping === 0 ? <strong className="text-green-600">FREE</strong> : `₹${confirmedOrderDetails.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated GST (18%):</span>
                  <span className="font-medium text-gray-900">₹{confirmedOrderDetails.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-3 mt-2 text-sm">
                  <span className="font-bold text-gray-900">Grand Total Paid:</span>
                  <span className="font-extrabold text-pink-600 text-lg">₹{confirmedOrderDetails.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <Link
              href="/orders"
              className="flex-1 px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
            >
              <span>Track Order Live</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="flex-1 px-6 py-3.5 bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-16 flex flex-col justify-between flex-1">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto flex-1">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b border-gray-200 pb-4">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-lg mx-auto my-6">
            <div className="w-24 h-24 mx-auto mb-6 bg-pink-50 rounded-full flex items-center justify-center text-4xl shadow-inner">
              🛍️
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
              Looks like you haven&apos;t added anything to your cart yet. Explore our latest collections!
            </p>
            <Link
              href="/products"
              className="mt-8 px-8 py-3.5 bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-md shadow-pink-200/50 hover:shadow-lg hover:scale-105 active:scale-95 transition-all inline-block cursor-pointer text-sm"
            >
              Shop Our Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {hasOutOfStockItems && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-700 text-sm font-medium animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span>
                      Some items in your cart are currently <strong>out of stock</strong>. Please remove them before proceeding to checkout.
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <span className="font-bold text-gray-700 text-sm">{cart.length} {cart.length === 1 ? 'Item' : 'Items'}</span>
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>

              <div className="space-y-3">
                {cart.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-sm font-bold text-pink-500 hover:text-pink-600 transition-colors"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-extrabold text-gray-900 border-b pb-4 mb-4">Order Summary</h2>

              {/* Summary Items */}
              <div className="space-y-3 text-sm text-gray-600 border-b pb-4 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{validCartSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {shipping === 0 ? (
                      <span className="text-green-600 font-bold">Free</span>
                    ) : (
                      `₹${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-gray-400 -mt-2">
                    Add ₹{(shippingThreshold - validCartSubtotal).toFixed(2)} more for Free Shipping
                  </p>
                )}

                <div className="flex justify-between">
                  <span>Estimated GST (18%)</span>
                  <span className="font-semibold text-gray-900">₹{tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-2xl font-extrabold text-pink-600">₹{grandTotal.toFixed(2)}</span>
              </div>

              <button
                disabled={hasOutOfStockItems}
                onClick={() => setIsCheckoutOpen(true)}
                className={`w-full py-3.5 font-bold rounded-2xl transition-all text-center ${
                  hasOutOfStockItems
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed select-none shadow-none"
                    : "bg-linear-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200/50 hover:shadow-lg hover:from-pink-600 hover:to-rose-600 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                }`}
              >
                {hasOutOfStockItems ? "Remove Out of Stock Items" : "Proceed to Checkout"}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                <ShieldCheck size={16} className="text-green-500" />
                <span>100% Secure Checkout with Instant UPI</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Complete Your Order</h2>
                <p className="text-xs text-gray-400 mt-0.5">Enter shipping details and choose payment mode</p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3.5 py-2.5 border ${formErrors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm`}
                    placeholder="John Doe"
                  />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3.5 py-2.5 border ${formErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm`}
                    placeholder="john@example.com"
                  />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3.5 py-2.5 border ${formErrors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm`}
                  placeholder="9876543210"
                />
                {formErrors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Delivery Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
                  className={`w-full px-3.5 py-2.5 border ${formErrors.address ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm resize-none`}
                  placeholder="Street Address, Building, Flat / House No..."
                />
                {formErrors.address && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-3.5 py-2.5 border ${formErrors.city ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm`}
                    placeholder="Mumbai"
                  />
                  {formErrors.city && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={`w-full px-3.5 py-2.5 border ${formErrors.postalCode ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm`}
                    placeholder="400001"
                  />
                  {formErrors.postalCode && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.postalCode}</p>}
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Select Payment Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* UPI Option */}
                  <label className={`flex items-start gap-3 p-3.5 border-2 rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === 'upi' ? 'border-pink-500 bg-pink-50/40 shadow-xs' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={handleInputChange}
                      className="accent-pink-500 mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Smartphone size={16} className="text-pink-600" />
                        <span className="text-sm font-bold text-gray-900">UPI / Online Payment</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">Google Pay, PhonePe, Paytm, QR</p>
                    </div>
                  </label>

                  {/* COD Option */}
                  <label className={`flex items-start gap-3 p-3.5 border-2 rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-pink-500 bg-pink-50/40 shadow-xs' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="accent-pink-500 mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Banknote size={16} className="text-gray-700" />
                        <span className="text-sm font-bold text-gray-900">Cash on Delivery</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">Pay in cash when order arrives</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* UPI Custom Options Panel */}
              {formData.paymentMethod === 'upi' && (
                <div className="p-4 bg-linear-to-br from-pink-50/60 to-purple-50/60 rounded-2xl border border-pink-100 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-pink-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap size={14} className="text-pink-500" />
                      Choose UPI Method
                    </span>
                    <span className="text-[11px] font-bold text-green-700 bg-green-100/80 px-2 py-0.5 rounded-full">
                      Zero Processing Fee
                    </span>
                  </div>

                  {/* UPI App Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setUpiOption('gpay')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${upiOption === 'gpay' ? 'bg-white border-pink-500 text-pink-600 shadow-xs ring-1 ring-pink-400' : 'bg-white/70 border-gray-200 text-gray-700 hover:bg-white'}`}
                    >
                      <span className="text-base">🟢</span>
                      <span>Google Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUpiOption('phonepe')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${upiOption === 'phonepe' ? 'bg-white border-pink-500 text-pink-600 shadow-xs ring-1 ring-pink-400' : 'bg-white/70 border-gray-200 text-gray-700 hover:bg-white'}`}
                    >
                      <span className="text-base">🟣</span>
                      <span>PhonePe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUpiOption('paytm')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${upiOption === 'paytm' ? 'bg-white border-pink-500 text-pink-600 shadow-xs ring-1 ring-pink-400' : 'bg-white/70 border-gray-200 text-gray-700 hover:bg-white'}`}
                    >
                      <span className="text-base">🔵</span>
                      <span>Paytm UPI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUpiOption('qr')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${upiOption === 'qr' ? 'bg-white border-pink-500 text-pink-600 shadow-xs ring-1 ring-pink-400' : 'bg-white/70 border-gray-200 text-gray-700 hover:bg-white'}`}
                    >
                      <QrCode size={18} className="text-pink-600" />
                      <span>Scan QR</span>
                    </button>
                  </div>

                  {/* QR Code Display if selected */}
                  {upiOption === 'qr' && (
                    <div className="bg-white p-4 rounded-2xl border border-pink-200 text-center flex flex-col items-center animate-in zoom-in-95 duration-150 shadow-xs">
                      <div className="p-3 bg-white border-2 border-gray-900 rounded-xl shadow-xs mb-2">
                        {/* Dummy SVG QR Code pattern */}
                        <svg className="w-32 h-32 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v4h-4v-4zm-4 4h4v4h-4v-4zm0-4h2v2h-2v-2zm4 4h2v2h-2v-2zm-6-2h2v2h-2v-2zm2-2h2v2h-2v-2zm-2-2h2v2h-2v-2zm4 0h2v2h-2v-2zM5 5h2v2H5V5zm12 0h2v2h-2V5zM5 17h2v2H5v-2z"/>
                        </svg>
                      </div>
                      <p className="text-xs font-bold text-gray-900">Scan & Pay ₹{grandTotal.toFixed(2)}</p>
                      <p className="text-[11px] text-gray-500">UPI ID: <span className="font-mono font-semibold text-pink-600">mystore@icici</span></p>
                    </div>
                  )}

                  {/* Custom UPI ID option */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setUpiOption('custom')}
                      className={`text-xs font-bold transition-colors cursor-pointer ${upiOption === 'custom' ? 'text-pink-600 underline' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      Or enter custom UPI ID (e.g. mobile@upi)
                    </button>

                    {upiOption === 'custom' && (
                      <div className="mt-2 flex gap-2 animate-in fade-in duration-150">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="username@okhdfcbank"
                            value={upiIdInput}
                            onChange={(e) => {
                              setUpiIdInput(e.target.value);
                              setUpiVerified(false);
                              if (formErrors.upiId) setFormErrors(prev => ({ ...prev, upiId: '' }));
                            }}
                            className={`w-full px-3.5 py-2 bg-white border ${formErrors.upiId ? 'border-red-500' : 'border-gray-200'} rounded-xl text-xs outline-none focus:border-pink-500`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (upiIdInput && /^[\w.-]+@[\w.-]+$/.test(upiIdInput.trim())) {
                              setUpiVerified(true);
                            }
                          }}
                          className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          {upiVerified ? '✓ Verified' : 'Verify'}
                        </button>
                      </div>
                    )}
                    {formErrors.upiId && <p className="text-xs text-red-500 mt-1">{formErrors.upiId}</p>}
                  </div>
                </div>
              )}

              {/* Price Breakdown in Modal */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900">₹{validCartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-semibold text-gray-900">{shipping === 0 ? <strong className="text-green-600">Free</strong> : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span className="font-semibold text-gray-900">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-1 text-sm font-bold text-gray-900">
                  <span>Total Payable:</span>
                  <span className="text-pink-600 text-base font-extrabold">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-100 pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-2xl transition-colors cursor-pointer text-sm text-center"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:from-pink-600 hover:to-rose-600 transition-all cursor-pointer text-sm text-center flex items-center justify-center gap-2"
                >
                  {formData.paymentMethod === 'upi' ? (
                    <>
                      <Zap size={16} />
                      <span>Pay ₹{grandTotal.toFixed(2)} via UPI</span>
                    </>
                  ) : (
                    <span>Place COD Order (₹{grandTotal.toFixed(2)})</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated UPI Gateway Modal */}
      {isProcessingUpi && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-pink-100 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-center gap-2 text-pink-600 font-extrabold text-sm tracking-wider uppercase">
              <ShieldCheck size={20} />
              <span>UPI Secure Gateway</span>
            </div>

            {/* Dynamic Status Icons */}
            <div className="py-4 flex justify-center">
              {upiStep < 3 ? (
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
                  <Smartphone className="w-8 h-8 text-pink-600 absolute" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-in zoom-in duration-300">
                  <Check size={40} className="stroke-3" />
                </div>
              )}
            </div>

            {/* Step Message */}
            <div className="space-y-1">
              {upiStep === 1 && (
                <>
                  <h3 className="text-base font-bold text-gray-900">Initiating UPI Payment...</h3>
                  <p className="text-xs text-gray-500">Connecting securely to payment gateway</p>
                </>
              )}
              {upiStep === 2 && (
                <>
                  <h3 className="text-base font-bold text-gray-900">Waiting for UPI Authorization</h3>
                  <p className="text-xs text-gray-500">Approving transaction for ₹{grandTotal.toFixed(2)}</p>
                </>
              )}
              {upiStep === 3 && (
                <>
                  <h3 className="text-lg font-extrabold text-green-600">Payment Successful!</h3>
                  <p className="text-xs text-gray-500 font-mono">UTR: {upiTransactionId}</p>
                </>
              )}
            </div>

            {/* Amount pill */}
            <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-600">Amount Paid:</span>
              <span className="font-extrabold text-pink-600 text-base">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
