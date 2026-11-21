"use client";

import { SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditProductButton({ id }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/admin/products/edit/${id}`)}
      className="p-2 text-slate-400 hover:text-pink-600 rounded-xl hover:bg-pink-50 transition duration-150 cursor-pointer"
      title="Edit product"
    >
      <SquarePen className="w-4 h-4" />
    </button>
  );
}