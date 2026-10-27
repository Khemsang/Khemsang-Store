import React, { useState } from "react";
import { useGallery } from "../../hooks/useGallery";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaExpand,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const GalleryPage: React.FC = () => {
  const { items: galleryItems, isLoading: loading } = useGallery();

  const ITEMS_PER_LOAD = 16;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchGalleryImages());
  }, [dispatch]);

  const categories = [
    "all",
    ...Array.from(
      new Set(galleryItems.map((item) => item.category || "Other"))
    ),
  ];

  const filteredItems =
    filter === "all"
      ? galleryItems
      : galleryItems.filter((item) => (item.category || "Other") === filter);

  const openModal = (index: number) => setCurrentIndex(index);
  const closeModal = () => setCurrentIndex(null);

  const goNext = () => {
    if (currentIndex !== null && currentIndex < filteredItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex !== null && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleLoadMore = () => {
    if (visibleCount >= filteredItems.length) {
      setVisibleCount(ITEMS_PER_LOAD);
    } else {
      setVisibleCount(filteredItems.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4 text-center text-gray-500">
          Loading gallery...
        </div>
      </div>
    );
  }

  const visibleItems = filteredItems.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Our Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Explore our beautiful furniture collection
          </p>
        </motion.div>

        
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat);
                setVisibleCount(ITEMS_PER_LOAD);
              }}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === cat
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No items found in this category
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
              {visibleItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 cursor-pointer"
                  onClick={() => openModal(index)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {item.title}
                      </h3>
                      {item.category && (
                        <p className="text-white/80 text-sm">{item.category}</p>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <FaExpand className="text-white text-xl" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            
            {filteredItems.length > ITEMS_PER_LOAD && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  {visibleCount >= filteredItems.length
                    ? "Show Less"
                    : `Load More (${
                        filteredItems.length - visibleCount
                      } remaining)`}
                </button>
              </div>
            )}
          </>
        )}

        
        <AnimatePresence>
          {currentIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <FaTimes className="text-2xl" />
              </button>

              {currentIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <FaChevronLeft className="text-2xl" />
                </button>
              )}

              {currentIndex < filteredItems.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <FaChevronRight className="text-2xl" />
                </button>
              )}

              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="max-w-5xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={filteredItems[currentIndex].imageUrl}
                  alt={filteredItems[currentIndex].title}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
                <div className="mt-4 text-center">
                  <h2 className="text-white text-2xl font-bold mb-2">
                    {filteredItems[currentIndex].title}
                  </h2>
                  {filteredItems[currentIndex].description && (
                    <p className="text-white/80">
                      {filteredItems[currentIndex].description}
                    </p>
                  )}
                  <p className="text-white/60 text-sm mt-2">
                    {currentIndex + 1} / {filteredItems.length}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GalleryPage;
