import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bannersApi } from "../../services/api";

interface Banner {
  _id: string;
  title: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  position: "hero" | "secondary" | "footer";
  isActive: boolean;
}

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  // Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await bannersApi.getAll();
        setBanners(
          data.filter((b: Banner) => b.isActive && b.position === "hero")
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchBanners();
  }, []);

  // Auto slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const slide = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(slide);
  }, [banners]);

  const next = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const currentBanner = banners[current];

  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center bg-gray-100 overflow-hidden">

      {/* Background Image */}
      {currentBanner && (
        <img
          src={currentBanner.image}
          alt="banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          {currentBanner?.title || "Welcome to Our Store"}
        </h1>

        <p className="text-white/90 max-w-2xl mx-auto mt-4">
          {currentBanner?.description ||
            "Explore our premium collection with great offers"}
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={() =>
              navigate(currentBanner?.buttonLink || "/products")
            }
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            {currentBanner?.buttonText || "Shop Now"}
          </button>

          <button
            onClick={() => navigate("/about")}
            className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-200"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Left / Right Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-2"
          >
            ❮
          </button>

          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-2"
          >
            ❯
          </button>
        </>
      )}

      {/* Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-10 flex gap-2">
          {banners.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-3 w-3 rounded-full cursor-pointer ${
                i === current ? "bg-white" : "bg-white/50"
              }`}
            ></div>
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
