import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // match your UI sections
    category: {
      type: String,
      enum: ["Decoration Products", "Food & Catering", "Kitchen Essentials"],
      required: true,
    },

    // 👉 fields you requested
    price: { type: Number, required: true },
    type: { type: String, enum: ["buy", "rent"], default: "buy" },

    // image URL or local path like "/images/led-lights.jpg"
    photo: { type: String, required: true },

    stock: { type: Number, default: 100 },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
