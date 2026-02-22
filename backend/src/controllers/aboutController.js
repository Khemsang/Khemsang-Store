import About from "../models/About.js";

// Get active about page content
export const getAbout = async (req, res) => {
  try {
    let about = await About.findOne({ isActive: true }).populate({
      path: "bestProducts",
      select: "name price images category discount",
    });

    if (!about) {
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
        bestProducts: [],
        bestProductsTitle: "Our Best Products",
        bestProductsDescription: "Handpicked favorites loved by our customers",
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
