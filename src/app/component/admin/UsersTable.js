"use client";

import React, { useState } from "react";
import { Trash2, RotateCcw, Shield, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "react-toastify";

export default function UsersTable({ users: initialUsers }) {
  const [users, setUsers] = useState(initialUsers || []);
  const [updatingId, setUpdatingId] = useState(null);

  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.info("User deactivated");
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isDeleted: true } : u))
        );
      } else {
        toast.error("Failed to deactivate user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deactivating user");
    } finally {
      setUpdatingId(null);
    }
  };

  const restoreUser = async (id) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
      });
      if (res.ok) {
        toast.success("User restored successfully");
        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, isDeleted: false } : u))
        );
      } else {
        toast.error("Failed to restore user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error restoring user");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleUserRole = async (user) => {
    const targetRole = user.role === "admin" ? "user" : "admin";
    const confirmMsg =
      targetRole === "admin"
        ? `Grant Administrator privileges to ${user.firstName} (${user.email})?`
        : `Revoke Admin privileges from ${user.firstName} and set to Customer?`;

    if (!confirm(confirmMsg)) return;

    try {
      setUpdatingId(user._id);
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, role: targetRole }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || `Role updated to ${targetRole}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, role: targetRole } : u))
        );
      } else {
        toast.error(data.message || "Failed to update role");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating user role");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white shadow-xs border border-slate-200/80 rounded-3xl p-6 sm:p-7 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>User Accounts &amp; Permissions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage user profiles, assign Administrator roles, and activate/deactivate accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold rounded-full">
            {users.filter((u) => u.role === "admin").length} Admin
          </span>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            {users.filter((u) => u.role !== "admin").length} Customers
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4">User Details</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Registered</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {users.map((user) => {
              const isAdmin = user.role === "admin";
              const isUpdating = updatingId === user._id;

              return (
                <tr key={user._id} className="hover:bg-pink-50/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs ${isAdmin
                          ? "bg-linear-to-tr from-purple-600 to-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700"
                          }`}
                      >
                        {user.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>
                            {user.firstName} {user.lastName}
                          </span>
                          {isAdmin && (
                            <ShieldCheck className="h-3.5 w-3.5 text-purple-600" title="Administrator" />
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px]">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-slate-600">
                    <div>{user.phone || "N/A"}</div>
                    <div className="text-slate-400 text-[11px]">{user.country || "India"}</div>
                  </td>

                  <td className="p-4">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                        <Shield className="h-3 w-3 text-purple-600" />
                        <span>Administrator</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        <UserCheck className="h-3 w-3 text-slate-500" />
                        <span>Customer</span>
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    {user.isDeleted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
                        Deactivated
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-slate-400 text-[11px]">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                      : "N/A"}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleUserRole(user)}
                        disabled={isUpdating}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${isAdmin
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          : "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                          }`}
                        title={isAdmin ? "Demote to Customer" : "Promote to Admin"}
                      >
                        <Shield className="h-3 w-3" />
                        <span>{isAdmin ? "Demote" : "Make Admin"}</span>
                      </button>

                      {!user.isDeleted ? (
                        <button
                          onClick={() => deleteUser(user._id)}
                          disabled={isUpdating}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Deactivate User"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => restoreUser(user._id)}
                          disabled={isUpdating}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                          title="Restore User"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-slate-400 space-y-2">
          <p className="text-sm font-bold">No registered users found</p>
        </div>
      )}
    </div>
  );
}