import express from 'express';
import handleDownload from '../Controllers/downloadController.js';
import { getUserDownloads } from '../Controllers/getUserDownload.js';
import Download from '../Models/Download.js';
import User from '../Models/Auth.js';

const router = express.Router();

router.post('/video', handleDownload);

router.get('/downloads/:userId', getUserDownloads);

router.get('/check-limit/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.ispremium) {
      return res.status(200).json({ limitReached: false });
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todayDownloads = await Download.find({
      userId,
      downloadedAt: { $gte: start, $lte: end }
    });

    res.status(200).json({ limitReached: todayDownloads.length >= 1 });
  } catch (error) {
    console.error('Error checking download limit:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
