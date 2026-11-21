import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Product from "@/model/Products";
import Category from "@/model/Category";
import HomePageClient from "../HomePageClient";
import { sanitizeImageUrl } from "@/lib/imageUtils";

export const dynamic = "force-dynamic";

export default async function HomeShoppingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  let categoriesList = [];
  let dbProducts = [];

  try {
    await connectDB();

    // 1. Fetch active categories from MongoDB (isDeleted not true)
    const dbCategories = await Category.find({ isDeleted: { $ne: true } })
      .sort({ name: 1 })
      .lean();

    // 2. Fetch all products from MongoDB
    const rawProducts = await Product.find().sort({ createdAt: -1 }).lean();

    dbProducts = rawProducts.map((p) => ({
      id: p._id ? p._id.toString() : "",
      _id: p._id ? p._id.toString() : "",
      name: p.name || "",
      price: Number(p.price || 0),
      category: p.category || "General",
      image: sanitizeImageUrl(p.image) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      description: p.description || `${p.name} - Premium quality item from our collection.`,
      rating: Number(p.rating || 4.5),
      reviewsCount: Number(p.reviewsCount || 12),
      details: p.details || `${p.name} is designed with superior quality materials for unmatched elegance and comfort.`,
      features: p.features || ["Premium Quality Material", "1 Year Warranty", "Satisfaction Guaranteed"],
      inStock: p.inStock !== false,
    }));

    // Calculate live product count for each category
    const categoryCountMap = {};
    dbProducts.forEach((p) => {
      if (p.category) {
        const catKey = p.category.toLowerCase().trim();
        categoryCountMap[catKey] = (categoryCountMap[catKey] || 0) + 1;
      }
    });

    categoriesList = dbCategories.map((c) => ({
      _id: c._id ? c._id.toString() : "",
      name: c.name,
      image: sanitizeImageUrl(c.image),
      description: c.description || "",
      count: categoryCountMap[c.name.toLowerCase().trim()] || 0,
    }));
  } catch (error) {
    console.error("Error loading home page data:", error);
    categoriesList = [];
    dbProducts = [];
  }

  // Ensure plain JSON objects for client component boundary
  const safeCategories = JSON.parse(JSON.stringify(categoriesList));
  const safeProducts = JSON.parse(JSON.stringify(dbProducts));

  return (
    <HomePageClient
      categories={safeCategories}
      products={safeProducts}
    />
  );
}
