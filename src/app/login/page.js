"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Store, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };
  const validateForm = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Login Successful!");

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        localStorage.setItem("role", data.role || "user");
        if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push(redirectUrl || "/home");
        }

        router.refresh();
      } else {
        toast.error(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_20px_60px_rgba(236,72,153,0.12)] p-8 sm:p-10 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-pink-400 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to Store
        </Link>
        <img width={120} height={40} src="/store.png" alt="logo" />
      </div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold bg-linear-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">
          Log in to your MyStore account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wider">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-500 transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-pink-50/30 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-400 transition-all duration-200 text-sm"
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs font-medium mt-1.5 pl-1 animate-fade-in-up">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wider">
            Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-500 transition-colors">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full pl-10 pr-12 py-3 bg-white/90 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-pink-50/30 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-400 transition-all duration-200 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors focus:outline-none p-1 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs font-medium mt-1.5 pl-1 animate-fade-in-up">
              {errors.password}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <Link
            href="/changepassword"
            className="text-xs font-semibold text-pink-500 hover:text-pink-600 hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-linear-to-r from-pink-500 to-pink-600 hover:from-pink-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-md shadow-pink-200/50 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </button>

        <div className="pt-3 text-center text-xs sm:text-sm text-gray-400 border-t border-gray-100">
          Don't have an account?{" "}
          <Link
            href="/registration"
            className="font-bold text-pink-500 hover:text-pink-600 hover:underline transition-colors ml-1"
          >
            Register Now
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-linear-to-br from-rose-50 via-pink-50 to-indigo-50 p-4">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-300/40 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-300/40 rounded-full blur-3xl animate-float-reverse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-200/30 rounded-full blur-2xl animate-pulse pointer-events-none" />

      <Suspense
        fallback={
          <div className="relative w-full max-w-md bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl p-8 flex items-center justify-center min-h-100">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
