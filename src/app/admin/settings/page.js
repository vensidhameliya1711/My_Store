"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Shield,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [profileData, setProfileData] = useState({
    name: "Administrator",
    email: "admin@mystore.com",
    phone: "+91 9999999999",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profileData.email,
          name: profileData.name,
          phone: profileData.phone,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Admin password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Set password error:", err);
      toast.error("An error occurred while updating admin password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Admin Security &amp; Password Settings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Set dedicated Administrator credentials, change passwords, and manage role permissions.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-100/70 border border-purple-200 text-purple-800 text-xs font-extrabold rounded-full">
          <Shield className="h-3.5 w-3.5" />
          <span>Role: Administrator</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-5">
          <div className="bg-linear-to-br from-slate-900 to-slate-950 rounded-3xl p-6 text-white border border-slate-800 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-pink-400 font-bold">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Role-Based Access</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Admins have exclusive access to manage products, view all customer orders, manage registered users, and answer support inquiries.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Middleware Protection:</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Password Encryption:</span>
                <span className="text-emerald-400 font-bold">BCrypt Salt 10</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Cookie Auth:</span>
                <span className="text-purple-300 font-bold">HttpOnly Secure</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-3xl p-5 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Password Security Tip</span>
            </div>
            <p className="leading-relaxed">
              Use a strong combination of letters, numbers, and special symbols for the administrator account to maintain store data integrity.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900">Update Admin Password</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your desired password to update administrator login access.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 tracking-wider flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-purple-600" />
                <span>Admin Email Address</span>
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="admin@mystore.com"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>Current Password (Optional if resetting)</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password if known"
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 tracking-wider flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-pink-500" />
                <span>New Admin Password *</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new strong password (min 6 characters)"
                  required
                  minLength={6}
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Confirm New Password *</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-type new password"
                  required
                  minLength={6}
                  className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-linear-to-r from-pink-500 to-pink-600 hover:from-pink-700 hover:to-pink-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-purple-200/50 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving Admin Password...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Admin Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
