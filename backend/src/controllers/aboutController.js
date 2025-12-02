import About from "../models/About.js";

// @desc    Get about page content
// @route   GET /api/about
export const getAbout = async (req, res) => {
  try {
    const about = await About.findOne({ isActive: true });

    if (!about) {
      return res.status(404).json({
        message:
          "About page content not found. Please add content from admin panel.",
      });
    }

    res.json(about);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update about page content (Admin only)
// @route   PUT /api/about
export const updateAbout = async (req, res) => {
  try {
    const {
      heroTitle,
      heroSubtitle,
      heroDescription,
      heroImage,
      heroSmallImage1,
      heroSmallImage2,
      yearsOfExperience,
      happyCustomers,
      whyChooseTitle,
      whyChooseDescription,
      galleryImages,
      ctaTitle,
      ctaDescription,
    } = req.body;

    let about = await About.findOne({ isActive: true });

    if (!about) {
      about = await About.create(req.body);
    } else {
      about.heroTitle = heroTitle || about.heroTitle;
      about.heroSubtitle = heroSubtitle || about.heroSubtitle;
      about.heroDescription = heroDescription || about.heroDescription;
      about.heroImage = heroImage || about.heroImage;
      about.heroSmallImage1 = heroSmallImage1 || about.heroSmallImage1;
      about.heroSmallImage2 = heroSmallImage2 || about.heroSmallImage2;
      about.yearsOfExperience = yearsOfExperience || about.yearsOfExperience;
      about.happyCustomers = happyCustomers || about.happyCustomers;
      about.whyChooseTitle = whyChooseTitle || about.whyChooseTitle;
      about.whyChooseDescription =
        whyChooseDescription || about.whyChooseDescription;
      about.galleryImages = galleryImages || about.galleryImages;
      about.ctaTitle = ctaTitle || about.ctaTitle;
      about.ctaDescription = ctaDescription || about.ctaDescription;

      await about.save();
    }

    res.json(about);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
