import axios from "axios";
import Download from "../Models/Download.js";
import User from "../Models/Auth.js";
import Video from "../Models/videofile.js";

const handleDownload = async (req, res) => {
  const { videoUrl, userId, videoId,title} = req.body;

  if (!videoUrl || !userId || !videoId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.ispremium) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const downloadsToday = await Download.find({
        userId,
        downloadedAt: { $gte: start, $lte: end },
      });

      if (downloadsToday.length >= 1) {
        return res.status(403).json({
          message: "Daily download limit reached. Upgrade to premium to continue downloading.",
        });
      }
    }

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ error: "Video not found" });

    await Download.create({
      userId,
      videoId,
      videoUrl: `http://localhost:5000/${video.filepath}`,
      downloadedAt: new Date(),
    });

    const streamRes = await axios.get(videoUrl, { responseType: "stream" });

    res.setHeader("Content-Disposition", `attachment; filename="${video.title}.mp4"`);
    res.setHeader("Content-Type", "video/mp4");

    streamRes.data.pipe(res);
  } catch (error) {
    console.error("Download Error:", error.message);
    res.status(500).json({ error: "Failed to store download video" });
  }
};

export default handleDownload;
