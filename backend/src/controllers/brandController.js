import Brand from "../models/Brand.js";

// Get all active brands
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ order: 1 });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all brands (admin)
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ order: 1 });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create brand
export const createBrand = async (req, res) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json(brand);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update brand
export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete brand
export const deleteBrand = async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: "Brand deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
