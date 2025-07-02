// controller/adminBannerUpload.js

const Banner = require('../models/BannerModel');

exports.uploadBanner = async (req, res) => {
  try {
    const {  title, description, imageUrl, images } = req.body;

    if (!_id || !['MovieNews', 'MovieReviews', 'Categories'].includes(_id)) {
      return res.status(400).json({ error: "Invalid or missing banner _id" });
    }

    // Find existing or create new banner
    const updated = await Banner.findByIdAndUpdate(
      _id,
      {
        title,
        description,
        imageUrl: imageUrl || {},
        images: images || [],
        createdAt: new Date()
      },
      { new: true, upsert: true } // Create if not exists
    );

    res.json({ message: "Banner uploaded successfully", banner: updated });
  } catch (error) {
    console.error("Banner upload error:", error);
    res.status(500).json({ error: "Failed to upload banner" });
  }
};

// GET: Fetch banners
// router.get('/banner', async (req, res) => {
//   const banners = await BannerModel.find().sort({ createdAt: -1 });
//   res.json({ banners });
// });
exports.getbyBannerId = async (req, res) => {
  try {
    console.log('req.params:', req.params);
    const { bannerType } = req.params;
    console.log('bannerType:', bannerType);

    if (!['MovieNews', 'MovieReviews', 'Categories'].includes(bannerType)) {
      return res.status(400).json({ error: "Invalid bannerType" });
    }

    const banner = await Banner.findOne({ bannerType });

    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    res.json({ banner });
  } catch (error) {
    console.error("Get banner error:", error);
    res.status(500).json({ error: "Failed to fetch banner" });
  }
}
exports.getBannerById=async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    res.json({ banner });
  } catch (error) {
    console.error("Get banner by ID error:", error);
    res.status(500).json({ error: "Failed to fetch banner" });
  }

}

exports.uploadBanners = async (req, res) => {
  try {
    const { bannerType, title, description, imageUrl, images } = req.body;

    if (!bannerType || !['MovieNews', 'MovieReviews', 'Categories'].includes(bannerType)) {
      return res.status(400).json({ error: "Invalid or missing bannerType" });
    }

    const updated = await Banner.findOneAndUpdate(
      { bannerType },
      {
        title,
        description,
        imageUrl: imageUrl || {},
        images: images || [],
        createdAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Banner uploaded successfully", banner: updated });
  } catch (error) {
    console.error("Banner upload error:", error);
    res.status(500).json({ error: "Failed to upload banner" });
  }
};
exports.updateBannerImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl || typeof imageUrl !== 'object') {
      return res.status(400).json({ error: "imageUrl is required and must be an object" });
    }

    const updated = await Banner.findByIdAndUpdate(
      id,
      { imageUrl },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Banner not found" });
    }

    res.json({ message: "Banner image updated successfully", banner: updated });
  } catch (error) {
    console.error("Image update error:", error);
    res.status(500).json({ error: "Failed to update banner image" });
  }
};

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json({ banners });
  } catch (error) {
    console.error("Get all banners error:", error);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};
