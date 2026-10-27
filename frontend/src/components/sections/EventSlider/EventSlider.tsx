import React, { useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useCategories } from "../../../hooks/useServerQueries";

const ChooseYourPickSlider = () => {
  const { data: categories = [], isLoading: loading } = useCategories();
  const settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2500,
    speed: 800,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  if (loading || categories.length === 0) {
    return (
      <div className="container max-w-full overflow-hidden py-10 bg-primary/20 rounded-3xl my-10">
        <h2 className="text-center text-xl sm:text-2xl font-semibold text-gray-800 mb-8">
          CHOOSE YOUR PRODUCTS
        </h2>
        <div className="text-center text-gray-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-full overflow-hidden py-10 bg-primary/20 rounded-3xl my-10">
      <h2 className="text-center text-xl sm:text-2xl font-semibold text-gray-800 mb-8">
        CHOOSE YOUR PRODUCTS
      </h2>
      <div className="px-4">
        <Slider {...settings}>
          {categories.map((item) => (
            <div key={item._id} className="px-2">
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-2xl hover:shadow-md transition-shadow cursor-pointer h-56 justify-between">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-contain rounded-2xl"
                />
                <div className="flex flex-col flex-grow justify-center">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default ChooseYourPickSlider;
