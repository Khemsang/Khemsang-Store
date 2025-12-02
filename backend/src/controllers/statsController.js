import Stats from "../models/Stats.js";

// Get all active stats
export const getAllStats = async (req, res) => {
  try {
    const stats = await Stats.find({ isActive: true }).sort({ order: 1 });
    res.json(stats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
};

// Get single stat
export const getStatById = async (req, res) => {
  try {
    const stat = await Stats.findById(req.params.id);
    if (!stat) {
      return res.status(404).json({ message: "Stat not found" });
    }
    res.json(stat);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stat", error: error.message });
  }
};

// Create stat (admin)
export const createStat = async (req, res) => {
  try {
    const stat = new Stats(req.body);
    await stat.save();
    res.status(201).json(stat);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating stat", error: error.message });
  }
};

// Update stat (admin)
export const updateStat = async (req, res) => {
  try {
    const stat = await Stats.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!stat) {
      return res.status(404).json({ message: "Stat not found" });
    }
    res.json(stat);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating stat", error: error.message });
  }
};

// Delete stat (admin)
export const deleteStat = async (req, res) => {
  try {
    const stat = await Stats.findByIdAndDelete(req.params.id);
    if (!stat) {
      return res.status(404).json({ message: "Stat not found" });
    }
    res.json({ message: "Stat deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting stat", error: error.message });
  }
};
