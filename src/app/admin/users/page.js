
import connectDB from "@/lib/mongodb";
import User from "@/model/User";
import UsersTable from "@/app/component/admin/UsersTable";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await connectDB();

  const users = await User.find({})
    .sort({ createdAt: -1 })
    .lean();

  const safeUsers = JSON.parse(JSON.stringify(users));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-pink-100/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-pink-50 text-pink-500 rounded-xl">
              <Users size={22} />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Users Management
            </h1>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Here you can see all the registered users and manage them.
          </p>
        </div>
      </div>
      <UsersTable users={safeUsers} />
    </div>
  );
}