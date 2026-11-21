import connectDB from "@/lib/mongodb";
import Product from "@/model/Products";
import EditProductForm from "./EditProductForm";

export default async function Page({ params }) {
     const { id } = await params;
  await connectDB();

  const product = await Product.findById(id).lean();

  if (!product) {
    return <h2>Product not found</h2>;
  }

  return (
    <EditProductForm
      product={{
        ...product,
        _id: product._id.toString(),
        inStock: product.inStock !== false,
      }}
    />
  );
}