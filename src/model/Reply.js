import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    adminReply: String,
  },
  { timestamps: true }
);

export default mongoose.models.Reply ||
  mongoose.model("Reply", ReplySchema);