import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    orderId: {
      type: String,
      required: true,
    },
    items: [
      {
        id: String,
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
        category: String,
      },
    ],
    subtotal: Number,
    discount: Number,
    shipping: Number,
    tax: Number,
    totalAmount: {
      type: Number,
      required: true,
    },
    customer: {
      name: String,
      email: String,
      phone: String,
      address: String,
    },
    paymentMethod: String,
    paymentType: String,
    status: {
      type: String,
      default: "Processing",
    },
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);