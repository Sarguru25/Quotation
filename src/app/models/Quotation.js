import mongoose from "mongoose";

const QuotationSchema = new mongoose.Schema(
  {
    zohoId: { type: String, unique: true },
    customerName: String,
    status: String,
    total: Number,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Quotation ||
  mongoose.model("Quotation", QuotationSchema);