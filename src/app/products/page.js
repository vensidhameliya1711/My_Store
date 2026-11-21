import React, { Suspense } from 'react';
import ProductsClientPage from './ProductsClientPage';
import connectDB from '@/lib/mongodb';
import Product from '@/model/Products';
import Category from '@/model/Category';
import { sanitizeImageUrl } from '@/lib/imageUtils';

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const category = resolvedParams.category || "All";
  const priceRange = resolvedParams.priceRange || "all";

  await connectDB();

  const dbCategories = await Category.find({ isDeleted: { $ne: true } })
    .sort({ name: 1 })
    .lean();
  const availableCategories = dbCategories.map((c) => c.name);
  const rawProducts = await Product.find().sort({ createdAt: -1 }).lean();

  const dbProducts = rawProducts.map((p) => ({
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
    specifications: p.specifications || [
      { label: "Category", value: p.category || "General" },
      { label: "Stock", value: p.inStock !== false ? "In Stock" : "Out of Stock" },
    ],
  }));

  let filteredProducts = dbProducts.filter((product) => {
    const matchesCategory =
      category === "All" ||
      product.category.toLowerCase() === category.toLowerCase();

    let matchesPrice = true;
    if (priceRange === "under500") matchesPrice = product.price < 500;
    else if (priceRange === "500to1000") matchesPrice = product.price >= 500 && product.price <= 1000;
    else if (priceRange === "1000to5000") matchesPrice = product.price > 1000 && product.price <= 5000;
    else if (priceRange === "5000to10000") matchesPrice = product.price > 5000 && product.price <= 10000;
    else if (priceRange === "above10000") matchesPrice = product.price > 10000;

    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query));

    return matchesCategory && matchesPrice && matchesSearch;
  });

  const safeFilteredProducts = JSON.parse(JSON.stringify(filteredProducts));
  const safeCategories = JSON.parse(JSON.stringify(availableCategories));

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500 font-semibold text-lg animate-pulse">Loading Products...</p>
        </div>
      }
    >
      <ProductsClientPage
        initialProducts={safeFilteredProducts}
        availableCategories={safeCategories}
        category={category}
        priceRange={priceRange}
        search={search}
      />
    </Suspense>
  );
}
