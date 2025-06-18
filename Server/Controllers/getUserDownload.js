import Download from "../Models/Download.js";
import Video from "../Models/videofile.js"; // Ensure correct path

export const getUserDownloads = async (req, res) => {
  try {
    const userId = req.params.userId;

    const downloads = await Download.find({ userId }).sort({ downloadedAt: -1 }); // sort newest first

    const downloadDetails = await Promise.all(
      downloads.map(async (d) => {
        const video = await Video.findById(d.videoId);
        if (!video) return null;

        return {
          _id: video._id,
          videotitle: video.videotitle,
          videoUrl: `http://localhost:5000/${video.filepath}`,
          downloadedAt: d.downloadedAt,
        };
      })
    );

    const filtered = downloadDetails.filter(Boolean);
    res.status(200).json(filtered);
  } catch (error) {
    console.error("Error fetching user downloads:", error);
    res.status(500).json({ error: "Failed to fetch downloads" });
  }
};

