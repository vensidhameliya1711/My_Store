"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Eye, EyeOff, User, Mail, Globe, Phone, Lock, ArrowLeft, Store, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

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

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First Name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last Name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Minimum 8 characters with uppercase, lowercase, number and special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Registration Successful!");

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          country: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        toast.error(data.message || "Registration Failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-linear-to-br from-rose-50 via-pink-50 to-indigo-50 p-4 py-8">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-300/40 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-300/40 rounded-full blur-3xl animate-float-reverse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="relative w-full max-w-2xl bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl shadow-[0_20px_60px_rgba(236,72,153,0.12)] p-6 sm:p-10 animate-fade-in-up my-auto">
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
          <h2 className="text-3xl font-extrabold bg-linear-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Join mystore to start shopping today
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wider">
                First Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-pink-50/30 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-400 transition-all duration-200"
                />
              </div>
              {errors.firstName && (
                <p className="text-red-400 text-xs font-medium mt-1 pl-1 animate-fade-in-up">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wider">
                Last Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-pink-50/30 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-400 transition-all duration-200"
                />
              </div>
              {errors.lastName && (
                <p className="text-red-400 text-xs font-medium mt-1 pl-1 animate-fade-in-up">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>
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
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-pink-50/30 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-400 transition-all duration-200"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs font-medium mt-1 pl-1 animate-fade-in-up">
                {errors.email}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wider">
                Country
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                  <Globe size={18} />
                </div>
                <input
                  type="text"
                  name="country"
                  placeholder="Enter your country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-pink-50/30 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-400 transition-all duration-200"
                />
              </div>
              {errors.country && (
                <p className="text-red-400 text-xs font-medium mt-1 pl-1 animate-fade-in-up">
                  {errors.country}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wider">
                Phone Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-pink-50/30 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-400 transition-all duration-200"
                />
              </div>
              {errors.phone && (
                <p className="text-red-400 text-xs font-medium mt-1 pl-1 animate-fade-in-up">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wider">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 bg-white/90 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-pink-50/30 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-400 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-400 transition-colors focus:outline-none p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs font-medium mt-1 pl-1 animate-fade-in-up">
                {errors.password}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-600 tracking-wider">
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Enter your confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register</span>
            )}
          </button>

          <div className="pt-3 text-center text-sm text-gray-400 border-t border-gray-100">
            Already have an account?{" "}
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
