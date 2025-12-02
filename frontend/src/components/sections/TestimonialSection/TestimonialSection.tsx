import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdQuote } from "react-icons/io";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchTestimonials } from "../../../store/slices/testimonialsSlice";

const testimonialHeading = {
  title: "What Our Clients Say",
  description: "Real feedback from our amazing customers.",
  buttonText: "See more testimonials",
};

const animationDuration = 300;

const TestimonialSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: testimonials, loading } = useAppSelector(
    (state) => state.testimonials
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    dispatch(fetchTestimonials());
  }, [dispatch]);

  useEffect(() => {
    setAnimate(true);
  }, [currentIndex]);

  useEffect(() => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    if (!isHoveredRef.current) {
      autoSlideRef.current = setInterval(() => {
        nextTestimonial();
      }, 8000);
    }
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [currentIndex]);

  const prevTestimonial = () => {
    setAnimate(false);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        prev === 0 ? testimonials.length - 1 : prev - 1
      );
    }, animationDuration);
  };

  const nextTestimonial = () => {
    setAnimate(false);
    setTimeout(() => {
      setCurrentIndex((prev) =>
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, animationDuration);
  };

  if (loading || testimonials.length === 0) {
    return (
      <section className="bg-[#f7f1ee] w-full py-16 px-4 text-center">
        <div className="mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800">
            {testimonialHeading.title}
          </h2>
          <p className="text-gray-600 mt-3 md:mt-4 text-sm md:text-lg">
            {testimonialHeading.description}
          </p>
        </div>
        <div className="text-gray-500">Loading testimonials...</div>
      </section>
    );
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section
      className="relative w-full py-16 px-4 bg-gray-50 dark:bg-gray-900"
      onMouseEnter={() => {
        isHoveredRef.current = true;
        if (autoSlideRef.current) clearInterval(autoSlideRef.current);
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        autoSlideRef.current = setInterval(() => {
          nextTestimonial();
        }, 8000);
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            {testimonialHeading.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            {testimonialHeading.description}
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="relative mx-auto w-full max-w-5xl">
          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            aria-label="Previous"
            className="absolute -left-4 md:left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          >
            <MdChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:-translate-x-1 transition-transform" />
          </button>

          <button
            onClick={nextTestimonial}
            aria-label="Next"
            className="absolute -right-4 md:right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          >
            <MdChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 shadow-lg">
            <div
              key={currentTestimonial.id}
              className={`transition-all duration-500 ease-in-out flex flex-col items-center gap-4 sm:gap-6 text-center ${
                animate
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              {/* Avatar */}
              <img
                src={currentTestimonial.imageUrl}
                alt={currentTestimonial.name}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700 shadow-lg"
              />

              {/* Rating Stars */}
              <div className="flex gap-0.5 sm:gap-1">
                {[...Array(currentTestimonial.rating || 5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <div className="relative px-2 sm:px-4 md:px-8 max-w-3xl">
                <IoMdQuote className="text-[var(--root-color)] w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rotate-180 opacity-30 mb-3 sm:mb-4" />
                <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed">
                  "{currentTestimonial.quote}"
                </p>
              </div>

              {/* Name & Role */}
              <div className="mt-1 sm:mt-2">
                <h4 className="text-gray-900 dark:text-white font-bold text-base sm:text-lg md:text-xl mb-1">
                  {currentTestimonial.name}
                </h4>
                <p className="text-[var(--root-color)] font-medium text-xs sm:text-sm md:text-base">
                  {currentTestimonial.role}
                </p>
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "w-8 h-3 bg-[var(--root-color)]"
                    : "w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
