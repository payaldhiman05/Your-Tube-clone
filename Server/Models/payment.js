import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  paymentId: String,
  orderId: String,
  status: { type: String, default: "Success" },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", paymentSchema);
