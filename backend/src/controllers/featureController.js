import Feature from "../models/Feature.js";

// Get all features
export const getAllFeatures = async (req, res) => {
  try {
    const filter = {};
    if (!req.query.admin) filter.isActive = true;

    const features = await Feature.find(filter)
      .sort({ order: 1, createdAt: -1 });
    res.json(features);
  } catch (err) {
    res.status(500).json({ message: "Error fetching features", error: err.message });
  }
};

// Get single feature by ID
export const getFeatureById = async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) return res.status(404).json({ message: "Feature not found" });
    res.json(feature);
  } catch (err) {
    res.status(500).json({ message: "Error fetching feature", error: err.message });
  }
};

// Create feature (admin)
export const createFeature = async (req, res) => {
  try {
    const feature = new Feature(req.body);
    await feature.save();
    res.status(201).json(feature);
  } catch (err) {
    res.status(400).json({ message: "Error creating feature", error: err.message });
  }
};

// Update feature (admin)
export const updateFeature = async (req, res) => {
  try {
    const feature = await Feature.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!feature) return res.status(404).json({ message: "Feature not found" });
    res.json(feature);
  } catch (err) {
    res.status(400).json({ message: "Error updating feature", error: err.message });
  }
};

// Delete feature (admin)
export const deleteFeature = async (req, res) => {
  try {
    const feature = await Feature.findByIdAndDelete(req.params.id);
    if (!feature) return res.status(404).json({ message: "Feature not found" });
    res.json({ message: "Feature deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting feature", error: err.message });
  }
};
