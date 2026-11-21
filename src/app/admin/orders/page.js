import connectDB from "@/lib/mongodb";
import Order from "@/model/Order";
import User from "@/model/User"; // Ensure User model is registered for populate
import AdminOrdersClient from "./AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await connectDB();

  let orders = [];
  try {
    const rawOrders = await Order.find()
      .populate("userId")
      .sort({ createdAt: -1 })
      .lean();

    // Safely serialize for Client Layout boundary
    orders = JSON.parse(JSON.stringify(rawOrders || []));
  } catch (error) {
    console.error("Error loading admin orders:", error);
  }

  return <AdminOrdersClient initialOrders={orders} />;
}