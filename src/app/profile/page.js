"use client";

import { UserPen, Camera, Trash2, ArrowLeft, Loader2, Check } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_DIM = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await compressImage(file);
      setUser((prev) => ({
        ...prev,
        profilePic: base64,
      }));
      toast.info("Image selected! Click 'Save Changes' to update your profile.");
    } catch (err) {
      console.error("Failed to process image:", err);
      toast.error("Failed to process image");
    }
  };

  const handleRemovePhoto = () => {
    setUser((prev) => ({
      ...prev,
      profilePic: "",
    }));
    toast.info("Photo removed! Click 'Save Changes' to update your profile.");
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        toast.success(data.message || "Profile Updated Successfully");
        setIsEditing(false);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("storage"));
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-lg font-bold text-pink-600 animate-pulse">
            Loading Profile...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(236,72,153,0.15)] border border-pink-100/60 overflow-hidden">
        <div className="bg-linear-to-r from-pink-500  to-pink-600 h-36 relative px-6 py-4 flex items-start justify-between">
          <Link
            href="/home"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white/90 hover:text-white bg-black/15 hover:bg-black/25 px-3 py-1.5 rounded-xl backdrop-blur-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Store</span>
          </Link>

          {user.role === 'admin' && (
            <span className="bg-white/20 backdrop-blur-xs text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-white/30">
              Admin
            </span>
          )}

          <div className="absolute left-1/2 -translate-x-1/2 top-20">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full shadow-xl border-4 border-white flex items-center justify-center overflow-hidden bg-pink-50">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserPen className="h-14 w-14 text-pink-600" />
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="absolute bottom-0 right-0 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                      title="Upload Profile Picture"
                      aria-label="Upload Profile Picture"
                    >
                      <Camera className="h-4 w-4" />
                    </button>

                    {user.profilePic && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                        title="Remove Profile Picture"
                        aria-label="Remove Profile Picture"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="pt-20 pb-8 px-6 sm:px-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              {user.email}
            </p>
            {isEditing && (
              <p className="text-xs text-pink-600 font-semibold mt-2 animate-pulse">
                Click the camera icon on your avatar to upload a photo
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-100/80">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={user.firstName || ""}
                  onChange={(e) =>
                    setUser({ ...user, firstName: e.target.value })
                  }
                  placeholder="Enter First Name"
                  className="w-full mt-1.5 p-2.5 bg-white border border-pink-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              ) : (
                <h3 className="text-base font-bold text-gray-800 mt-1">
                  {user.firstName || "—"}
                </h3>
              )}
            </div>

            <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-100/80">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={user.lastName || ""}
                  onChange={(e) =>
                    setUser({ ...user, lastName: e.target.value })
                  }
                  placeholder="Enter Last Name"
                  className="w-full mt-1.5 p-2.5 bg-white border border-pink-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              ) : (
                <h3 className="text-base font-bold text-gray-800 mt-1">
                  {user.lastName || "—"}
                </h3>
              )}
            </div>

            <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-100/80">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Country</p>
              {isEditing ? (
                <input
                  type="text"
                  value={user.country || ""}
                  onChange={(e) =>
                    setUser({ ...user, country: e.target.value })
                  }
                  placeholder="Enter Country"
                  className="w-full mt-1.5 p-2.5 bg-white border border-pink-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              ) : (
                <h3 className="text-base font-bold text-gray-800 mt-1">
                  {user.country || "—"}
                </h3>
              )}
            </div>

            <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-100/80">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</p>
              {isEditing ? (
                <input
                  type="text"
                  value={user.phone || ""}
                  onChange={(e) =>
                    setUser({ ...user, phone: e.target.value })
                  }
                  placeholder="Enter Phone"
                  className="w-full mt-1.5 p-2.5 bg-white border border-pink-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              ) : (
                <h3 className="text-base font-bold text-gray-800 mt-1">
                  {user.phone || "—"}
                </h3>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={updateProfile}
                  disabled={saving}
                  className="px-8 py-3 rounded-2xl bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-sm shadow-md shadow-green-200/50 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-8 py-3.5 rounded-2xl bg-linear-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm shadow-md shadow-pink-200/50 hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}