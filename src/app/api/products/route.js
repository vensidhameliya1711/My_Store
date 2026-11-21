import connectDB from "@/lib/mongodb";
import Product from "@/model/Products";
import { sanitizeImageUrl } from "@/lib/imageUtils";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const product = await Product.create({
      name: body.name,
      price: Number(body.price),
      category: body.category,
      image: sanitizeImageUrl(body.image),
      inStock: body.inStock !== undefined ? Boolean(body.inStock) : true,
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const body = await req.json();

    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      {
        name: body.name,
        price: Number(body.price),
        category: body.category,
        image: sanitizeImageUrl(body.image),
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find();

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
  

}


