import About from "../models/About.js";

// Get active about page content
export const getAbout = async (req, res) => {
  try {
    let about = await About.findOne({ isActive: true });

    if (!about) {
      // Return default empty data instead of 404 for new setups
      return res.json({
        heroTitle: "",
        heroSubtitle: "",
        heroDescription: "",
        heroImage: "",
        heroSmallImage1: "",
        heroSmallImage2: "",
        yearsOfExperience: 10,
        happyCustomers: 5000,
        whyChooseTitle: "",
        whyChooseDescription: "",
        galleryImages: [],
        ctaTitle: "",
        ctaDescription: "",
      });
    }

    res.json(about);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update about page content (Admin only)
export const updateAbout = async (req, res) => {
  try {
    const data = req.body;

    let about = await About.findOne({ isActive: true });

    if (!about) {
      about = await About.create(data);
    } else {
      Object.keys(data).forEach((key) => {
        about[key] = data[key] || about[key];
      });
      await about.save();
    }

    res.json(about);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
