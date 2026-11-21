"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, KeyRound, ArrowLeft, Store, Loader2 } from "lucide-react";

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const validateForm = () => {
    let newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current Password is required";
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!formData.newPassword) {
      newErrors.newPassword = "New Password is required";
    } else if (!passwordRegex.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase, number and special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (
      formData.currentPassword &&
      formData.currentPassword === formData.newPassword
    ) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch("/api/changepassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Password updated successfully!");

        setFormData({
          email: "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-linear-to-br from-rose-50 via-pink-50 to-indigo-50 p-4 py-8">
      <div className="relative w-full max-w-md bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_20px_60px_rgba(236,72,153,0.12)] p-6 sm:p-10 animate-fade-in-up my-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/login"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-pink-400 transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
            Back to Login
          </Link>
          <img width={120} height={40} src="/store.png" alt="logo" />
        </div>

        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-linear-to-tr from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-pink-200/50 mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold bg-linear-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
            Change Password
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Update your account password securely
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wider">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-pink-50/30 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-400 transition-all duration-200"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs font-medium mt-1 pl-1 animate-fade-in-up">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wider">
              Current Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className="w-full pl-10 pr-12 py-3 bg-white/90 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-pink-50/30 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-400 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-400 transition-colors focus:outline-none p-1"
                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-red-400 text-xs font-medium mt-1 pl-1 animate-fade-in-up">
                {errors.currentPassword}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wider">
              New Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full pl-10 pr-12 py-3 bg-white/90 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-pink-50/30 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-400 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-400 transition-colors focus:outline-none p-1"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-400 text-xs font-medium mt-1 pl-1 animate-fade-in-up">
                {errors.newPassword}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wider">
              Confirm New Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full pl-10 pr-12 py-3 bg-white/90 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-pink-50/30 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-400 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-400 transition-colors focus:outline-none p-1"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs font-medium mt-1 pl-1 animate-fade-in-up">
                {errors.confirmPassword}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-linear-to-r from-pink-500 to-pink-600 hover:from-pink-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-md shadow-pink-200/50 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
          <div className="pt-3 text-center text-sm text-gray-400 border-t border-gray-100">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="font-bold text-pink-500 hover:text-pink-600 hover:underline transition-colors ml-1"
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
