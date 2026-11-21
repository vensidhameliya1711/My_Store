"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  Sparkles,
  Inbox,
  Edit3,
  RotateCcw,
  Archive,
  Contact,
} from "lucide-react";

export default function AdminContactPage() {
  const [messages, setMessages] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, resolved: 0, trash: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/contact?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.data || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      } else {
        toast.error("Failed to load inquiries");
      }
    } catch (err) {
      console.error("Error fetching admin contact messages:", err);
      toast.error("Error loading messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMessages();
  };

  const handleReplyChange = (id, text) => {
    setReplyDrafts((prev) => ({ ...prev, [id]: text }));
  };

  const sendReply = async (id) => {
    const text = replyDrafts[id];
    if (!text || !text.trim()) {
      toast.error("Please enter a reply before sending.");
      return;
    }

    try {
      setSubmittingId(id);
      const res = await fetch("/api/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          reply: text.trim(),
          status: "resolved",
          repliedBy: "MyStore Support Team",
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Reply sent to customer!");
        setReplyDrafts((prev) => ({ ...prev, [id]: "" }));
        setEditingId(null);
        fetchMessages();
      } else {
        toast.error(data.message || "Failed to send reply");
      }
    } catch (err) {
      console.error("Send reply error:", err);
      toast.error("Error sending reply");
    } finally {
      setSubmittingId(null);
    }
  };

  const softDeleteInquiry = async (id) => {
    try {
      const res = await fetch(`/api/admin/contact?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.info("Inquiry moved to Trash. You can restore it anytime.");
        fetchMessages();
      } else {
        toast.error(data.message || "Failed to delete inquiry");
      }
    } catch (err) {
      console.error("Delete inquiry error:", err);
      toast.error("Error deleting inquiry");
    }
  };

  const restoreInquiry = async (id) => {
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "restore" }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Inquiry restored to active list!");
        fetchMessages();
      } else {
        toast.error(data.message || "Failed to restore inquiry");
      }
    } catch (err) {
      console.error("Restore inquiry error:", err);
      toast.error("Error restoring inquiry");
    }
  };

  const permanentDeleteInquiry = async (id) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this inquiry? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/contact?id=${id}&permanent=true`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Inquiry permanently removed");
        fetchMessages();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (err) {
      console.error("Permanent delete error:", err);
      toast.error("Error deleting inquiry");
    }
  };

  const quickTemplates = [
    "Thank you for contacting us. We have checked your order details and it has been dispatched with express tracking.",
    "Your refund request has been approved and processed. The amount will reflect in your account within 3-5 working days.",
    "We have noted your feedback and our team is actively addressing this issue. Thank you for your patience!",
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-pink-100/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-pink-50 text-pink-500 rounded-xl">
              <Contact size={22} />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Customer Support Inquiries
            </h1>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Review incoming questions, reply to customers in real-time, and manage active &amp; soft-deleted tickets.
          </p>
        </div>
        <button
          onClick={fetchMessages}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-pink-500 to-pink-600 text-white font-bold px-5 py-3 rounded-xl shadow-md shadow-pink-200/50 hover:shadow-lg hover:from-pink-500 hover:to-rose-500 hover:scale-[1.02] active:scale-[0.98] transition duration-200 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-white" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setFilterStatus("all")}
          className={`p-5 rounded-3xl border transition-all text-left flex items-center gap-4 cursor-pointer ${filterStatus === "all"
            ? "bg-pink-600 text-white border-pink-600 shadow-md scale-[1.02]"
            : "bg-white text-slate-900 border-pink-400 hover:border-pink-300 shadow-xs"
            }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${filterStatus === "all" ? "bg-white/10 text-white" : "bg-pink-50 text-pink-600"
            }`}>
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${filterStatus === "all" ? "text-slate-300" : "text-slate-400"
              }`}>Active Inquiries</p>
            <h3 className="text-2xl font-black mt-0.5">{counts.total}</h3>
          </div>
        </button>

        <button
          onClick={() => setFilterStatus("pending")}
          className={`p-5 rounded-3xl border transition-all text-left flex items-center gap-4 cursor-pointer ${filterStatus === "pending"
            ? "bg-amber-500 text-white border-amber-500 shadow-md scale-[1.02]"
            : "bg-white text-slate-900 border-slate-200/80 hover:border-amber-200 shadow-xs"
            }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${filterStatus === "pending" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-600"
            }`}>
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${filterStatus === "pending" ? "text-amber-100" : "text-slate-400"
              }`}>Pending Review</p>
            <h3 className="text-2xl font-black mt-0.5">{counts.pending}</h3>
          </div>
        </button>

        <button
          onClick={() => setFilterStatus("resolved")}
          className={`p-5 rounded-3xl border transition-all text-left flex items-center gap-4 cursor-pointer ${filterStatus === "resolved"
            ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]"
            : "bg-white text-slate-900 border-slate-200/80 hover:border-emerald-200 shadow-xs"
            }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${filterStatus === "resolved" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"
            }`}>
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${filterStatus === "resolved" ? "text-emerald-100" : "text-slate-400"
              }`}>Replied & Resolved</p>
            <h3 className="text-2xl font-black mt-0.5">{counts.resolved}</h3>
          </div>
        </button>

        <button
          onClick={() => setFilterStatus("trash")}
          className={`p-5 rounded-3xl border transition-all text-left flex items-center gap-4 cursor-pointer ${filterStatus === "trash"
            ? "bg-rose-600 text-white border-rose-600 shadow-md scale-[1.02]"
            : "bg-white text-slate-900 border-slate-200/80 hover:border-rose-200 shadow-xs"
            }`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${filterStatus === "trash" ? "bg-white/20 text-white" : "bg-rose-50 text-rose-600"
            }`}>
            <Trash2 className="h-6 w-6" />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${filterStatus === "trash" ? "text-rose-100" : "text-slate-400"
              }`}>Trash / Deleted</p>
            <h3 className="text-2xl font-black mt-0.5">{counts.trash}</h3>
          </div>
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filterStatus === "all"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
          >
            All Active ({counts.total})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filterStatus === "pending"
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setFilterStatus("resolved")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${filterStatus === "resolved"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
          >
            Resolved ({counts.resolved})
          </button>
          <button
            onClick={() => setFilterStatus("trash")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${filterStatus === "trash"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Trash ({counts.trash})</span>
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-pink-500 focus:bg-white focus:ring-1 focus:ring-pink-500 transition-all"
          />
        </form>
      </div>

      {filterStatus === "trash" && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-rose-600 shrink-0" />
            <span>
              <strong>Trash Bin:</strong> These inquiries are soft-deleted. You can restore them to the active list anytime or permanently remove them.
            </span>
          </div>
          <button
            onClick={() => setFilterStatus("all")}
            className="text-rose-700 hover:text-rose-900 font-bold underline whitespace-nowrap cursor-pointer"
          >
            View Active Inquiries →
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center shadow-xs">
          <RefreshCw className="h-8 w-8 text-pink-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Loading customer inquiries...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center shadow-xs space-y-3">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {filterStatus === "trash" ? "Trash is Empty" : "No Inquiries Found"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filterStatus === "trash"
              ? "There are no soft-deleted inquiries in the trash bin."
              : "No contact queries matching your selected filter or search term."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((msg) => {
            const hasReply = Boolean(msg.reply || msg.adminReply);
            const replyContent = msg.reply || msg.adminReply;
            const isEditing = editingId === msg._id;
            const currentDraft = replyDrafts[msg._id] !== undefined ? replyDrafts[msg._id] : "";
            const isTrashed = Boolean(msg.isDeleted);

            return (
              <div
                key={msg._id}
                className={`bg-white rounded-3xl p-6 sm:p-7 border shadow-xs hover:shadow-md transition-all space-y-5 ${isTrashed ? "border-rose-200/80 bg-rose-50/10" : "border-slate-200"
                  }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm ${isTrashed
                      ? "bg-rose-100 text-rose-700"
                      : "bg-linear-to-tr from-slate-800 to-slate-700 text-white"
                      }`}>
                      {msg.name ? msg.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span>{msg.name}</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {msg.category || "General"}
                        </span>
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                        <a
                          href={`mailto:${msg.email}`}
                          className="hover:text-pink-600 transition-colors flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3" />
                          <span>{msg.email}</span>
                        </a>
                        {msg.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{msg.phone}</span>
                          </span>
                        )}
                        <span>•</span>
                        <span>
                          {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isTrashed ? (
                      <div className="flex items-center gap-2">

                        <button
                          onClick={() => restoreInquiry(msg._id)}
                          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Restore to Active List"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Restore</span>
                        </button>

                        <button
                          onClick={() => permanentDeleteInquiry(msg._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          title="Permanently Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {hasReply ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Replied</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-extrabold rounded-full">
                            <Clock className="h-3.5 w-3.5 animate-pulse" />
                            <span>Pending</span>
                          </span>
                        )}

                        <button
                          onClick={() => softDeleteInquiry(msg._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          title="Move to Trash (Soft Delete)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Customer Message
                  </p>
                  <h4 className="text-base font-bold text-slate-900">
                    {msg.subject}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed whitespace-pre-line">
                    {msg.message}
                  </p>
                </div>

                {hasReply && !isEditing ? (
                  <div className="bg-pink-50/70 border border-pink-200/80 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-linear-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-xs font-black">
                          A
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-pink-900">
                            Admin Response Sent
                          </p>
                          {msg.repliedAt && (
                            <p className="text-[10px] text-pink-600">
                              {new Date(msg.repliedAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                      </div>

                      {!isTrashed && (
                        <button
                          onClick={() => {
                            setEditingId(msg._id);
                            setReplyDrafts((prev) => ({ ...prev, [msg._id]: replyContent }));
                          }}
                          className="px-3 py-1.5 bg-white border border-pink-200 hover:bg-pink-100 text-pink-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Update Reply</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line pl-1">
                      {replyContent}
                    </p>
                  </div>
                ) : !isTrashed ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                        <span>{isEditing ? "Edit Admin Response" : "Write Admin Response"}</span>
                      </label>

                      <div className="hidden sm:flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-semibold">Quick Reply:</span>
                        <button
                          type="button"
                          onClick={() => handleReplyChange(msg._id, quickTemplates[0])}
                          className="text-[11px] px-2 py-0.5 bg-white border border-slate-200 hover:border-pink-300 text-slate-600 hover:text-pink-600 rounded-md transition-colors cursor-pointer"
                        >
                          Dispatched 📦
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReplyChange(msg._id, quickTemplates[1])}
                          className="text-[11px] px-2 py-0.5 bg-white border border-slate-200 hover:border-pink-300 text-slate-600 hover:text-pink-600 rounded-md transition-colors cursor-pointer"
                        >
                          Refund Processed 💳
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      placeholder="Type official response that the user will see on their contact page..."
                      value={currentDraft}
                      onChange={(e) => handleReplyChange(msg._id, e.target.value)}
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all resize-y"
                    />

                    <div className="flex items-center justify-end gap-3">
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        onClick={() => sendReply(msg._id)}
                        disabled={submittingId === msg._id}
                        className="px-6 py-2.5 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-extrabold rounded-xl shadow-md shadow-pink-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {submittingId === msg._id ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            <span>{isEditing ? "Update Response" : "Send Response to Customer"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
