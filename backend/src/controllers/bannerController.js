import Banner from "../models/Banner.js";

// Get all banners (public sees only active)
export const getAllBanners = async (req, res) => {
  try {
    const { position, admin } = req.query;
    const filter = {};

    if (!admin) filter.isActive = true;
    if (position) filter.position = position;

    const banners = await Banner.find(filter).sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: "Error fetching banners", error: err.message });
  }
};

// Get single banner by ID
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: "Error fetching banner", error: err.message });
  }
};

// Create new banner (admin)
export const createBanner = async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ message: "Error creating banner", error: err.message });
  }
};

// Update banner (admin)
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json(banner);
  } catch (err) {
    res.status(400).json({ message: "Error updating banner", error: err.message });
  }
};

// Delete banner (admin)
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting banner", error: err.message });
  }
};
