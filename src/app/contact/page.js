"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Headphones,
  ArrowRight,
  Inbox
} from "lucide-react";

export default function ContactPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("form");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Order & Delivery",
    subject: "",
    message: "",
  });

  const categories = [
    "Order & Delivery",
    "Product Inquiry",
    "Payments & Refund",
    "Returns & Replacement",
    "Account & Login",
    "General Feedback",
  ];
  const fetchMessages = async (userId, userEmail) => {
    try {
      setLoadingMessages(true);
      const queryParam = userId
        ? `userId=${encodeURIComponent(userId)}`
        : userEmail
          ? `email=${encodeURIComponent(userEmail)}`
          : "";

      if (!queryParam) {
        setLoadingMessages(false);
        return;
      }

      const res = await fetch(`/api/contact?${queryParam}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching user messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setForm((prev) => ({
          ...prev,
          name: `${parsedUser.firstName || ""} ${parsedUser.lastName || ""}`.trim() || parsedUser.name || "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || "",
        }));

        fetchMessages(parsedUser._id, parsedUser.email);
      }
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || null,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          category: form.category,
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Inquiry submitted! Our team will reply shortly.");
        setForm((prev) => ({
          ...prev,
          subject: "",
          message: "",
        }));

        await fetchMessages(user?._id, form.email);
        setActiveTab("history");
      } else {
        toast.error(data.message || "Failed to send inquiry.");
      }
    } catch (err) {
      console.error("Submit contact error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // const repliedCount = messages.filter((m) => m.isReplied || m.reply || m.adminReply).length;

  return (
    <div className="bg-gray-50 min-h-screen pt-24 sm:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Headphones className="h-3.5 w-3.5" />
            <span>24/7 Customer Helpdesk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
            How Can We <span className="bg-linear-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Help You?</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-3 max-w-2xl mx-auto leading-relaxed">
            Have a question about your order, tracking, refunds, or product details? Send us a message and track real-time admin replies right here.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Call Customer Care</p>
              <a href="tel:+919876543210" className="text-sm font-bold text-gray-900 hover:text-pink-600 transition-colors">
                +91 98765 43210
              </a>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Email Assistance</p>
              <a href="mailto:support@mystore.com" className="text-sm font-bold text-gray-900 hover:text-pink-600 transition-colors">
                support@mystore.com
              </a>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Headquarters</p>
              <p className="text-sm font-bold text-gray-900">
                Mumbai, Maharashtra
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Support Hours</p>
              <p className="text-sm font-bold text-gray-900">
                Mon - Sat: 9 AM - 8 PM
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center mb-8">
          <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs inline-flex items-center gap-2">
            <button
              onClick={() => setActiveTab("form")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${activeTab === "form"
                ? "bg-linear-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              <Send className="h-4 w-4" />
              <span>Send New Inquiry</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("history");
                if (user?._id || form.email) {
                  fetchMessages(user?._id, form.email);
                }
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${activeTab === "history"
                ? "bg-linear-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>My Inquiries & Replies</span>
              {messages.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${activeTab === "history" ? "bg-white text-pink-600" : "bg-pink-100 text-pink-700"
                  }`}>
                  {messages.length}
                </span>
              )}
            </button>
          </div>
        </div>
        {activeTab === "form" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 bg-linear-to-br from-gray-900 via-gray-900 to-pink-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-6">
              <div className="relative z-10 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-500/30">
                  <Sparkles className="h-3 w-3" /> Quick Support Ticket
                </span>

                <h3 className="text-2xl font-black text-white leading-tight">
                  We're Here to Assist You Every Step of the Way
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed">
                  Submit your query below. Our dedicated support agents actively review messages and provide verified responses directly on this page.
                </p>

                <div className="space-y-3 pt-4 border-t border-white/10 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-400 shrink-0" />
                    <span>Average reply time: Under 2 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-400 shrink-0" />
                    <span>Direct order and shipment lookup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-400 shrink-0" />
                    <span>Track all past replies in one dashboard</span>
                  </div>
                </div>

                {messages.length > 0 && (
                  <div className="pt-4">
                    <button
                      onClick={() => setActiveTab("history")}
                      className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>View My Past {messages.length} Inquiries</span>
                      <ArrowRight className="h-3.5 w-3.5 text-pink-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Full Name <span className="text-pink-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Email Address <span className="text-pink-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Inquiry Category <span className="text-pink-500">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Subject / Order ID <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Query regarding Order #ORD-1092 or Size Exchange"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Your Message <span className="text-pink-500">*</span>
                    </label>
                    <span className="text-xs text-gray-400">
                      {form.message.length} characters
                    </span>
                  </div>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your issue or question in detail..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all resize-y"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold rounded-2xl shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm sm:text-base"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Submitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Submit Inquiry to Support</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>My Support Inquiries</span>
                  <span className="text-xs bg-pink-100 text-pink-700 font-extrabold px-2.5 py-0.5 rounded-full">
                    {messages.length} {messages.length === 1 ? "Ticket" : "Tickets"}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing all questions submitted with admin replies.
                </p>
              </div>

              <button
                onClick={() => fetchMessages(user?._id, form.email)}
                disabled={loadingMessages}
                className="px-4 py-2 bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-pink-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-gray-200"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingMessages ? "animate-spin text-pink-500" : ""}`} />
                <span>Refresh Replies</span>
              </button>
            </div>

            {loadingMessages ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-xs">
                <RefreshCw className="h-8 w-8 text-pink-500 animate-spin mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-700">Loading your inquiries...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-xs space-y-4">
                <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto text-2xl">
                  <Inbox className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">No Support Inquiries Yet</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  You haven't submitted any inquiries yet. Need help with an order or product?
                </p>
                <button
                  onClick={() => setActiveTab("form")}
                  className="px-6 py-2.5 bg-linear-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md hover:scale-105 transition-all"
                >
                  Send a New Message
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => {
                  const hasReply = Boolean(msg.reply || msg.adminReply);
                  const replyContent = msg.reply || msg.adminReply;

                  return (
                    <div
                      key={msg._id}
                      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all space-y-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                            {msg.category || "General Inquiry"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div>
                          {hasReply ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-extrabold rounded-full">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Replied & Resolved</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-extrabold rounded-full">
                              <Clock className="h-3.5 w-3.5 animate-pulse" />
                              <span>Under Review</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-base font-extrabold text-gray-900">
                          {msg.subject}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50/70 p-4 rounded-2xl border border-gray-100/80 whitespace-pre-line">
                          {msg.message}
                        </p>
                      </div>
                      {hasReply ? (
                        <div className="mt-4 bg-linear-to-r from-pink-50/90 to-rose-50/90 border border-pink-200/80 rounded-2xl p-5 shadow-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-linear-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-xs font-black shadow-xs">
                                S
                              </div>
                              <div>
                                <p className="text-xs font-extrabold text-pink-900">
                                  {msg.repliedBy || "MyStore Support Team"}
                                </p>
                                <p className="text-[10px] text-pink-600 font-semibold">
                                  Official Response
                                </p>
                              </div>
                            </div>

                            {msg.repliedAt && (
                              <span className="text-[11px] text-pink-700 font-medium">
                                {new Date(msg.repliedAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>

                          <div className="pt-2 text-xs sm:text-sm text-gray-900 font-medium leading-relaxed whitespace-pre-line pl-1">
                            {replyContent}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-50/60 border border-dashed border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-center gap-2.5">
                          <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                          <span>
                            Our support team has received your ticket and is preparing a response. Please check back shortly.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}