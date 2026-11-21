import connectDB from "@/lib/mongodb";
import Category from "@/model/Category";
import Product from "@/model/Products";
import { sanitizeImageUrl } from "@/lib/imageUtils";
import { NextResponse } from "next/server";

export async function PUT(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;
    const body = await req.json();
    const { name, image, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const cleanImage = image !== undefined ? sanitizeImageUrl(image) : undefined;
    const cleanDesc = description !== undefined ? description.trim() : undefined;

    const existingWithSameName = await Category.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    });

    if (existingWithSameName) {
      return NextResponse.json(
        { success: false, message: `Another category with name "${trimmedName}" already exists.` },
        { status: 400 }
      );
    }

    const oldCategory = await Category.findById(id);
    if (!oldCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const oldName = oldCategory.name;
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        $set: {
          name: trimmedName,
          ...(cleanImage !== undefined && { image: cleanImage }),
          ...(cleanDesc !== undefined && { description: cleanDesc }),
        },
      },
      { new: true }
    );

    if (oldName !== trimmedName) {
      const syncResult = await Product.updateMany(
        { category: oldName },
        { $set: { category: trimmedName } }
      );
      console.log(`Synced ${syncResult.modifiedCount} products from "${oldName}" to "${trimmedName}"`);
    }

    return NextResponse.json({
      success: true,
      message: `Category updated to "${trimmedName}" and synced across all products!`,
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const isPermanent = searchParams.get("permanent") === "true";

    const targetCategory = await Category.findById(id);
    if (!targetCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    if (isPermanent) {
      await Category.findByIdAndDelete(id);
      return NextResponse.json({
        success: true,
        message: `Category "${targetCategory.name}" permanently deleted.`,
      });
    }
    targetCategory.isDeleted = true;
    targetCategory.deletedAt = new Date();
    await targetCategory.save();

    return NextResponse.json({
      success: true,
      message: `Category "${targetCategory.name}" moved to Trash.`,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;
    const restoredCategory = await Category.findByIdAndUpdate(
      id,
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
        },
      },
      { new: true }
    );

    if (!restoredCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Category "${restoredCategory.name}" restored successfully!`,
      category: restoredCategory,
    });
  } catch (error) {
    console.error("Error restoring category:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to restore category" },
      { status: 500 }
    );
  }
}