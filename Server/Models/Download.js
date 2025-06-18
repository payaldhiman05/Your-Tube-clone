import mongoose from "mongoose";

const downloadSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  videoId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
  videoUrl: { type: String },
  downloadedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Download", downloadSchema);
