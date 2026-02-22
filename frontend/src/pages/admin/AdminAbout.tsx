import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { uploadImage } from "../../utils/imageUpload";
import Loading from "../../components/common/Loading";
import {
  FaImage,
  FaStar,
  FaUsers,
  FaClock,
  FaBullhorn,
  FaPlus,
  FaTrash,
  FaSave,
  FaInfoCircle,
  FaUpload,
  FaBox,
  FaTimes,
  FaSearch,
} from "react-icons/fa";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

interface AboutData {
  _id?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  heroSmallImage1: string;
  heroSmallImage2: string;
  yearsOfExperience: number;
  happyCustomers: number;
  whyChooseTitle: string;
  whyChooseDescription: string;
  galleryImages: string[];
  ctaTitle: string;
  ctaDescription: string;
  bestProducts: string[];
  bestProductsTitle: string;
  bestProductsDescription: string;
}

const AdminAbout = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [uploading, setUploading] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const [formData, setFormData] = useState<AboutData>({
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
    galleryImages: ["", "", "", ""],
    ctaTitle: "",
    ctaDescription: "",
    bestProducts: [],
    bestProductsTitle: "Our Best Products",
    bestProductsDescription: "Handpicked favorites loved by our customers",
  });

  useEffect(() => {
    fetchAbout();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setAllProducts(data);
    } catch (error) {
      console.error("Failed to fetch products");
    }
  };

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/about");
      setFormData({
        heroTitle: data.heroTitle || "",
        heroSubtitle: data.heroSubtitle || "",
        heroDescription: data.heroDescription || "",
        heroImage: data.heroImage || "",
        heroSmallImage1: data.heroSmallImage1 || "",
        heroSmallImage2: data.heroSmallImage2 || "",
        yearsOfExperience: data.yearsOfExperience || 10,
        happyCustomers: data.happyCustomers || 5000,
        whyChooseTitle: data.whyChooseTitle || "",
        whyChooseDescription: data.whyChooseDescription || "",
        galleryImages:
          data.galleryImages?.length > 0
            ? data.galleryImages
            : ["", "", "", ""],
        ctaTitle: data.ctaTitle || "",
        ctaDescription: data.ctaDescription || "",
        bestProducts: data.bestProducts?.map((p: Product) => p._id) || [],
        bestProductsTitle: data.bestProductsTitle || "Our Best Products",
        bestProductsDescription:
          data.bestProductsDescription ||
          "Handpicked favorites loved by our customers",
      });
      // Set selected products for display
      if (data.bestProducts) {
        setSelectedProducts(data.bestProducts);
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to fetch about data",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put("/about", formData);
      showToast("About page updated successfully", "success");
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to update about page",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGalleryImageChange = (index: number, value: string) => {
    const newGalleryImages = [...formData.galleryImages];
    newGalleryImages[index] = value;
    setFormData({ ...formData, galleryImages: newGalleryImages });
  };

  const addGalleryImage = () => {
    setFormData({
      ...formData,
      galleryImages: [...formData.galleryImages, ""],
    });
  };

  const removeGalleryImage = (index: number) => {
    const newGalleryImages = formData.galleryImages.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, galleryImages: newGalleryImages });
  };

  // Best Products functions
  const filteredProducts = allProducts.filter(
    (p) =>
      p?.name?.toLowerCase()?.includes(productSearch.toLowerCase()) &&
      !formData.bestProducts.includes(p._id)
  );

  const addBestProduct = (product: Product) => {
    setFormData({
      ...formData,
      bestProducts: [...formData.bestProducts, product._id],
    });
    setSelectedProducts([...selectedProducts, product]);
    setProductSearch("");
    setShowProductDropdown(false);
  };

  const removeBestProduct = (productId: string) => {
    setFormData({
      ...formData,
      bestProducts: formData.bestProducts.filter((id) => id !== productId),
    });
    setSelectedProducts(selectedProducts.filter((p) => p._id !== productId));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    galleryIndex?: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size should be less than 5MB", "error");
      return;
    }

    try {
      setUploading(field);
      const imageUrl = await uploadImage(file);

      if (galleryIndex !== undefined) {
        handleGalleryImageChange(galleryIndex, imageUrl);
      } else {
        setFormData({ ...formData, [field]: imageUrl });
      }
      showToast("Image uploaded successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to upload image", "error");
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return <Loading text="Loading about page..." fullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 py-6 md:py-8">
      <div className="container">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4 shadow-lg">
            <FaInfoCircle className="text-white text-2xl" />
            <span className="text-white font-bold text-lg">
              About Page Manager
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-3">
            Manage About Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Customize your About Us page content with beautiful sections and
            engaging visuals
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
          {/* Hero Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-purple-100 dark:border-purple-900/30 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <FaStar className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Hero Section
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Main banner content
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Hero Title
                </label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, heroTitle: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 group-hover:border-purple-300"
                  placeholder="Crafting Dreams Into Reality"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Hero Subtitle
                </label>
                <input
                  type="text"
                  value={formData.heroSubtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, heroSubtitle: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 group-hover:border-purple-300"
                  placeholder="Your journey starts here"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Hero Description
                </label>
                <textarea
                  value={formData.heroDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      heroDescription: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 group-hover:border-purple-300 resize-none"
                  placeholder="Tell your story..."
                />
              </div>

              {/* Image Inputs with Preview */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FaImage className="text-purple-600 text-lg" />
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Hero Images
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Main Image
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={formData.heroImage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            heroImage: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        placeholder="https://..."
                      />
                      <label className="cursor-pointer px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-1">
                        <FaUpload className="text-xs" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "heroImage")}
                          className="hidden"
                          disabled={uploading === "heroImage"}
                        />
                      </label>
                    </div>
                    {uploading === "heroImage" && (
                      <p className="text-xs text-purple-500">Uploading...</p>
                    )}
                    {formData.heroImage && (
                      <img
                        src={formData.heroImage}
                        alt="Preview"
                        className="mt-2 w-full h-24 object-cover rounded-lg shadow-md"
                      />
                    )}
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Small Image 1
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={formData.heroSmallImage1}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            heroSmallImage1: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        placeholder="https://..."
                      />
                      <label className="cursor-pointer px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-1">
                        <FaUpload className="text-xs" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(e, "heroSmallImage1")
                          }
                          className="hidden"
                          disabled={uploading === "heroSmallImage1"}
                        />
                      </label>
                    </div>
                    {uploading === "heroSmallImage1" && (
                      <p className="text-xs text-purple-500">Uploading...</p>
                    )}
                    {formData.heroSmallImage1 && (
                      <img
                        src={formData.heroSmallImage1}
                        alt="Preview"
                        className="mt-2 w-full h-24 object-cover rounded-lg shadow-md"
                      />
                    )}
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Small Image 2
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={formData.heroSmallImage2}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            heroSmallImage2: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        placeholder="https://..."
                      />
                      <label className="cursor-pointer px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-1">
                        <FaUpload className="text-xs" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(e, "heroSmallImage2")
                          }
                          className="hidden"
                          disabled={uploading === "heroSmallImage2"}
                        />
                      </label>
                    </div>
                    {uploading === "heroSmallImage2" && (
                      <p className="text-xs text-purple-500">Uploading...</p>
                    )}
                    {formData.heroSmallImage2 && (
                      <img
                        src={formData.heroSmallImage2}
                        alt="Preview"
                        className="mt-2 w-full h-24 object-cover rounded-lg shadow-md"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <FaClock className="text-blue-600 text-2xl" />
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Years of Experience
                    </label>
                  </div>
                  <input
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yearsOfExperience: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg font-bold"
                  />
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-900/20 dark:to-orange-900/20 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <FaUsers className="text-pink-600 text-2xl" />
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Happy Customers
                    </label>
                  </div>
                  <input
                    type="number"
                    value={formData.happyCustomers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        happyCustomers: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-blue-100 dark:border-blue-900/30 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <FaStar className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Why Choose Us
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Highlight your strengths
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={formData.whyChooseTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, whyChooseTitle: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 group-hover:border-blue-300"
                  placeholder="Why Choose Us?"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Section Description
                </label>
                <textarea
                  value={formData.whyChooseDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whyChooseDescription: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 group-hover:border-blue-300 resize-none"
                  placeholder="Explain what makes you special..."
                />
              </div>
            </div>
          </div>

          {/* Gallery Images */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-green-100 dark:border-green-900/30 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <FaImage className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Gallery Images
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showcase your work
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={addGalleryImage}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                <FaPlus className="text-sm" />
                Add Image
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.galleryImages.map((img, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-700 dark:to-green-900/20 rounded-xl p-4 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Image {index + 1}
                    </span>
                    {formData.galleryImages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                      >
                        <FaTrash className="text-xs" />
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={img}
                      onChange={(e) =>
                        handleGalleryImageChange(index, e.target.value)
                      }
                      placeholder={`Gallery Image ${index + 1} URL`}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    />
                    <label className="cursor-pointer px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2 font-medium">
                      <FaUpload className="text-sm" />
                      <span className="hidden sm:inline">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(e, `gallery-${index}`, index)
                        }
                        className="hidden"
                        disabled={uploading === `gallery-${index}`}
                      />
                    </label>
                  </div>
                  {uploading === `gallery-${index}` && (
                    <p className="text-xs text-green-500 mt-1">Uploading...</p>
                  )}
                  {img && (
                    <div className="mt-3 relative overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-200">
                      <img
                        src={img}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/400x300?text=Invalid+Image";
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Best Products Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-amber-100 dark:border-amber-900/30 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <FaBox className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Best Products
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select products to showcase on homepage
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={formData.bestProductsTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bestProductsTitle: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="Our Best Products"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Section Description
                  </label>
                  <input
                    type="text"
                    value={formData.bestProductsDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bestProductsDescription: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="Handpicked favorites..."
                  />
                </div>
              </div>

              {/* Product Search */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Add Products
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="Search products to add..."
                  />
                </div>

                {showProductDropdown &&
                  productSearch &&
                  filteredProducts.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                      {filteredProducts.slice(0, 10).map((product) => (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => addBestProduct(product)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left"
                        >
                          <img
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Rs. {product.price.toLocaleString()} •{" "}
                              {product.category}
                            </p>
                          </div>
                          <FaPlus className="text-amber-500" />
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Selected Products ({selectedProducts.length})
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800"
                      >
                        <img
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={product.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Rs. {product.price.toLocaleString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBestProduct(product._id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProducts.length === 0 && (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <FaBox className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No products selected. Search and add products above.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border border-orange-100 dark:border-orange-900/30 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <FaBullhorn className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Call to Action
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Encourage user engagement
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  CTA Title
                </label>
                <input
                  type="text"
                  value={formData.ctaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaTitle: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 group-hover:border-orange-300"
                  placeholder="Ready to Get Started?"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  CTA Description
                </label>
                <textarea
                  value={formData.ctaDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaDescription: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 group-hover:border-orange-300 resize-none"
                  placeholder="Motivate your visitors to take action..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-4 z-10 flex justify-center">
            <button
              type="submit"
              disabled={saving}
              className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-2xl hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transform"
            >
              <span className="flex items-center gap-3">
                <FaSave className="text-xl" />
                {saving ? "Saving Changes..." : "Save All Changes"}
              </span>
              {!saving && (
                <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAbout;
