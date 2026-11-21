import connectDB from "@/lib/mongodb";
import Review from "@/model/Review";
import Product from "@/model/Products"; // Ensure Product model is registered for populate
import User from "@/model/User"; // Ensure User model is registered
import AdminReviewsClient from "./AdminReviewsClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await connectDB();

  let reviews = [];
  try {
    const rawReviews = await Review.find()
      .populate("productId", "name image price category")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    reviews = JSON.parse(JSON.stringify(rawReviews || []));
  } catch (error) {
    console.error("Error loading admin reviews:", error);
  }

  return <AdminReviewsClient initialReviews={reviews} />;
}
