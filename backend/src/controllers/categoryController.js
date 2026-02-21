import Category from "../models/Category.js";

// Get all active categories
export const getAllCategories = async (req, res) => {
  try {
    const { adminOnly } = req.query;
    const filter = { isActive: true };

    // Super Admin sees ALL, regular admin sees only their own
    if (adminOnly === "true" && req.user?.isAdmin && !req.user?.isSuperAdmin) {
      filter.createdBy = req.user._id;
    }

    const categories = await Category.find(filter).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: err.message });
  }
};

// Get single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching category", error: err.message });
  }
};

// Create category (admin only)
export // Create category (super admin only)
export const createCategory = async (req, res) => {
  try {
    // Only super admin can create categories
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({
        message: "Only super admin can create categories"
      });
    }

    const category = new Category({
      ...req.body,
      createdBy: req.user._id,
    });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating category", error: err.message });
  }
};

// Update category (admin only - own categories only)
export // Update category (super admin only)
export const updateCategory = async (req, res) => {
  try {
    // Only super admin can update categories
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({
        message: "Only super admin can update categories"
      });
    }

    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error updating category", error: err.message });
  }
};

// Delete category (admin only - own categories only)
export // Delete category (super admin only)
export const deleteCategory = async (req, res) => {
  try {
    // Only super admin can delete categories
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({
        message: "Only super admin can delete categories"
      });
    }

    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting category", error: err.message });
  }
};
