import connectDB from "@/lib/mongodb";
import Product from "@/model/Products";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import DeleteProductButton from "@/app/component/admin/DeleteProductButton";
import EditProductButton from "@/app/component/admin/EditProductButton";
import StockToggleButton from "@/app/component/admin/StockToggleButton";
import { sanitizeImageUrl } from "@/lib/imageUtils";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  let products = [];
  let errorMsg = "";

  try {
    await connectDB();
    const rawProducts = await Product.find({}).sort({ createdAt: -1 }).lean();
    products = rawProducts.map((p) => ({
      _id: p._id.toString(),
      name: p.name || "Unnamed Product",
      price: p.price || 0,
      category: p.category || "General",
      image: sanitizeImageUrl(p.image) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      inStock: p.inStock !== false,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    errorMsg = error.message;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-pink-100/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-pink-50 text-pink-500 rounded-xl">
              <Package size={22} />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Products Inventory
            </h1>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Manage your store's products, prices, and categories in real-time.
          </p>
        </div>

        <Link
          href="/admin/products/add-product"
          className="px-6 py-3 bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-pink-200/50 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <Plus size={20} />
          Add New Product
        </Link>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <span>Failed to load products: {errorMsg}</span>
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            🛍️
          </div>
          <h3 className="text-xl font-bold text-slate-800">No products in database</h3>
          <p className="text-slate-400 mt-2 max-w-md mx-auto text-sm">
            Your store database currently has no products. Add your first product to display it live on the storefront.
          </p>
          <Link
            href="/admin/products/add-product"
            className="inline-block mt-6 bg-linear-to-r from-pink-400 to-rose-400 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-pink-200/50 hover:shadow-lg transition duration-150"
          >
            Add Product
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40 flex flex-wrap justify-between items-center gap-3">
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              Total Products: {products.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                In Stock: {products.filter((p) => p.inStock).length}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-200/60">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Out of Stock: {products.filter((p) => !p.inStock).length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-center">Stock Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-pink-50/20 transition duration-150 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200/60 shrink-0 shadow-xs relative">
                          <img
                            src={product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"}
                            alt={product.name}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                              !product.inStock ? "grayscale opacity-75" : ""
                            }`}
                          />
                          {!product.inStock && (
                            <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[9px] font-black text-white uppercase tracking-tighter text-center px-1">
                              Out of Stock
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-base group-hover:text-pink-600 transition-colors">
                            {product.name}
                          </h4>
                          <span className="text-xs text-slate-400 font-mono">
                            ID: {product._id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-600 border border-pink-100/80 capitalize">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-800 text-base">
                      ₹{product.price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StockToggleButton
                        id={product._id}
                        initialInStock={product.inStock}
                        productName={product.name}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <EditProductButton id={product._id} />
                        <DeleteProductButton id={product._id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}