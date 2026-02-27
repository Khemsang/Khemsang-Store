import Testimonial from "../models/Testimonial.js";

// Get all testimonials (admin gets all, public gets only active)
export const getAllTestimonials = async (req, res) => {
  try {
    // If admin query param is true, return all testimonials
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const testimonials = await Testimonial.find(filter).sort({
      createdAt: -1,
    });
    res.json(testimonials);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching testimonials", error: error.message });
  }
};

// Get single testimonial
export const getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.json(testimonial);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching testimonial", error: error.message });
  }
};

// Create testimonial (users can submit, admin approval needed)
export const createTestimonial = async (req, res) => {
  try {

    // Add default values if not provided
    const testimonialData = {
      ...req.body,
      role: req.body.role || "Customer",
      imageUrl:
        req.body.imageUrl ||
        "https://ui-avatars.com/api/?name=" +
          encodeURIComponent(req.body.name || "User") +
          "&background=random",
      isActive: true, // Auto-approve and show immediately
    };


    const testimonial = new Testimonial(testimonialData);
    await testimonial.save();


    res.status(201).json({
      message:
        "Testimonial submitted successfully! It will appear on the website.",
      testimonial: testimonial,
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res
      .status(400)
      .json({ message: "Error creating testimonial", error: error.message });
  }
};

// Update testimonial (admin only)
export const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.json(testimonial);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating testimonial", error: error.message });
  }
};

// Delete testimonial (admin only)
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting testimonial", error: error.message });
  }
};
