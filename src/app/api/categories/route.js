import connectDB from "@/lib/mongodb";
import Category from "@/model/Category";
import Product from "@/model/Products";
import { sanitizeImageUrl } from "@/lib/imageUtils";
import { NextResponse } from "next/server";

const DEFAULT_INITIAL_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Shoes",
  "Jewellery",
  "Accessories",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Groceries",
  "Sports & Fitness",
];

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "active";
    const totalCount = await Category.countDocuments();
    if (totalCount === 0) {
      await Category.insertMany(
        DEFAULT_INITIAL_CATEGORIES.map((name) => ({ name, isDeleted: false }))
      );
    }
    const activeCount = await Category.countDocuments({ isDeleted: { $ne: true } });
    const trashCount = await Category.countDocuments({ isDeleted: true });

    let filter = { isDeleted: { $ne: true } };
    if (status === "trash") {
      filter = { isDeleted: true };
    } else if (status === "all") {
      filter = {};
    }

    const categories = await Category.find(filter).sort(
      status === "trash" ? { deletedAt: -1 } : { name: 1 }
    );

    return NextResponse.json({
      success: true,
      categories,
      counts: {
        total: activeCount + trashCount,
        active: activeCount,
        trash: trashCount,
      },
    });
  } catch (error) {
    console.error("GET categories error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching categories" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, image, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const cleanImage = sanitizeImageUrl(image);
    const cleanDesc = description ? description.trim() : "";

    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    });

    if (existing) {
      if (existing.isDeleted) {
        existing.isDeleted = false;
        existing.deletedAt = null;
        if (image !== undefined) existing.image = cleanImage;
        if (description !== undefined) existing.description = cleanDesc;
        await existing.save();

        return NextResponse.json({
          success: true,
          message: `Category "${trimmedName}" was restored from Trash!`,
          category: existing,
        });
      }

      return NextResponse.json(
        { success: false, message: `Category "${trimmedName}" already exists.` },
        { status: 400 }
      );
    }

    const newCategory = await Category.create({
      name: trimmedName,
      image: cleanImage,
      description: cleanDesc,
      isDeleted: false,
    });

    return NextResponse.json({
      success: true,
      message: `Category "${trimmedName}" added successfully!`,
      category: newCategory,
    });
  } catch (error) {
    console.error("POST category error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error adding category" },
      { status: 500 }
    );
  }
}