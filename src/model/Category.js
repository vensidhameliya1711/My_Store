import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Clear model cache in development to ensure new fields register
if (mongoose.models && mongoose.models.Category) {
  delete mongoose.models.Category;
}

export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);