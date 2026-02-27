import React, { useState, useEffect, useRef } from "react";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchTestimonials } from "../../../store/slices/testimonialsSlice";
import Loading from "../../common/Loading";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";

const testimonialHeading = {
  title: "What Our Clients Say",
  description: "Real feedback from our amazing customers.",
  buttonText: "See more testimonials",
};

const animationDuration = 300;

const TestimonialSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: testimonials, loading } = useAppSelector(
    (state) => state.testimonials
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    dispatch(fetchTestimonials());
  }, [dispatch]);

  useEffect(() => {
    setAnimate(true);
  }, [currentIndex]);

  const nextTestimonial = () => {
    if (testimonials.length <= 2) return;
    setAnimate(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 2) % testimonials.length);
    }, animationDuration);
  };

  const prevTestimonial = () => {
    if (testimonials.length <= 2) return;
    setAnimate(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 2 + testimonials.length) % testimonials.length);
    }, animationDuration);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (testimonials.length <= 2) return; // Don't auto-scroll if only 1-2 testimonials
    
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }
    
    if (!isHoveredRef.current) {
      autoSlideRef.current = setInterval(() => {
        setAnimate(false);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 2) % testimonials.length);
        }, animationDuration);
      }, 5000); // Auto-scroll every 5 seconds
    }
    
    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [currentIndex, testimonials.length]);

  if (loading || testimonials.length === 0) {
    return <Loading text="Loading testimonials..." size="sm" variant="minimal" />;
  }

  const currentTestimonial = testimonials[currentIndex];

  // Safety check - if no testimonial at current index, return early
  if (!currentTestimonial) {
    return (
      <section className="bg-gray-50 dark:bg-gray-900 w-full py-16 px-4 text-center">
        <div className="mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-white">
            {testimonialHeading.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-3 md:mt-4 text-sm md:text-lg">
            {testimonialHeading.description}
          </p>
        </div>
        <div className="text-gray-500 dark:text-gray-400">No testimonials available</div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full py-8 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      onMouseEnter={() => {
        isHoveredRef.current = true;
        if (autoSlideRef.current) {
          clearInterval(autoSlideRef.current);
          autoSlideRef.current = null;
        }
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        if (testimonials.length > 2) {
          autoSlideRef.current = setInterval(() => {
            setAnimate(false);
            setTimeout(() => {
              setCurrentIndex((prev) => (prev + 2) % testimonials.length);
            }, animationDuration);
          }, 5000);
        }
      }}
    >
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Compact Header */}
        <div className="text-center mb-6 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Customer Reviews
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            What our customers say about us
          </p>
        </div>

        {/* Testimonial Cards - 2 per row */}
        <div className="relative mx-auto w-full max-w-6xl">
          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            disabled={testimonials.length <= 2}
            className="absolute -left-3 md:-left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" />
          </button>

          <button
            onClick={nextTestimonial}
            disabled={testimonials.length <= 2}
            className="absolute -right-3 md:-right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next testimonials"
          >
            <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[currentIndex, currentIndex + 1].map((index) => {
              const testimonial = testimonials[index % testimonials.length];
              if (!testimonial) return null;
              
              return (
                <div
                  key={testimonial._id || index}
                  className={`transition-all duration-500 ease-in-out ${
                    animate
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  }`}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-full">
                    <div className="p-6">
                      {/* Quote Icon */}
                      <div className="flex justify-center mb-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                          <Quote className="h-4 w-4 text-white" />
                        </div>
                      </div>

                      {/* Review Message */}
                      <blockquote className="text-center mb-4">
                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-4">
                          "{testimonial.message}"
                        </p>
                      </blockquote>

                      {/* Author */}
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {testimonial.name?.charAt(0).toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                            {testimonial.name || 'Anonymous'}
                          </h4>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">Verified Customer</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: Math.ceil(testimonials.length / 2) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * 2)}
                className={`transition-all duration-300 rounded-full ${
                  Math.floor(currentIndex / 2) === index
                    ? "w-8 h-2.5 bg-gradient-to-r from-blue-600 to-purple-600"
                    : "w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 hover:scale-125"
                }`}
                aria-label={`Go to testimonials ${index * 2 + 1}-${index * 2 + 2}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
