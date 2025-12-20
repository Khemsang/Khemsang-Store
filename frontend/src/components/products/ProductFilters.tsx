import { useState, useRef, useEffect } from "react";

interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: string[];
  totalProducts: number;
  priceRange?: { min: number; max: number };
  setPriceRange?: (range: { min: number; max: number }) => void;
  maxPrice?: number;
}

const ProductFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  totalProducts,
  priceRange,
  setPriceRange,
  maxPrice = 100000,
}: ProductFiltersProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        priceRef.current &&
        !priceRef.current.contains(event.target as Node)
      ) {
        setShowPriceFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto mb-10 md:mb-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400 group-focus-within:text-[var(--root-color)] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[var(--root-color)] focus:ring-4 focus:ring-[var(--root-color)]/10 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Price Range Filter */}
          {setPriceRange && (
            <div className="relative md:w-48" ref={priceRef}>
              <button
                onClick={() => setShowPriceFilter(!showPriceFilter)}
                className={`w-full px-4 py-3.5 rounded-xl border-2 ${
                  showPriceFilter
                    ? "border-[var(--root-color)] ring-4 ring-[var(--root-color)]/10"
                    : "border-gray-200 dark:border-gray-600"
                } bg-gray-50 dark:bg-gray-700 text-left flex items-center justify-between transition-all hover:border-[var(--root-color)]/50`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                    Price Range
                  </span>
                </div>
                <svg
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    showPriceFilter ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showPriceFilter && (
                <div className="absolute z-50 w-72 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Price Range (Rs.)
                  </p>
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange?.min || ""}
                      onChange={(e) =>
                        setPriceRange({
                          min: Number(e.target.value) || 0,
                          max: priceRange?.max || maxPrice,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange?.max || ""}
                      onChange={(e) =>
                        setPriceRange({
                          min: priceRange?.min || 0,
                          max: Number(e.target.value) || maxPrice,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPriceRange({ min: 0, max: maxPrice });
                        setShowPriceFilter(false);
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowPriceFilter(false)}
                      className="flex-1 px-3 py-2 text-sm bg-[var(--root-color)] text-white rounded-lg hover:opacity-90"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Custom Category Dropdown */}
          <div className="relative md:w-72" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full px-4 py-3.5 rounded-xl border-2 ${
                isDropdownOpen
                  ? "border-[var(--root-color)] ring-4 ring-[var(--root-color)]/10"
                  : "border-gray-200 dark:border-gray-600"
              } bg-gray-50 dark:bg-gray-700 text-left flex items-center justify-between transition-all hover:border-[var(--root-color)]/50`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg ${
                    selectedCategory
                      ? "bg-[var(--root-color)]/10"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                >
                  <svg
                    className={`h-4 w-4 ${
                      selectedCategory
                        ? "text-[var(--root-color)]"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </div>
                <span
                  className={`font-medium ${
                    selectedCategory
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {selectedCategory || "All Categories"}
                </span>
              </div>
              <svg
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-64 overflow-y-auto">
                  {/* All Categories Option */}
                  <button
                    onClick={() => handleCategorySelect("")}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                      !selectedCategory
                        ? "bg-[var(--root-color)]/10 text-[var(--root-color)]"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg ${
                        !selectedCategory
                          ? "bg-[var(--root-color)]/20"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">All Categories</span>
                    {!selectedCategory && (
                      <svg
                        className="h-5 w-5 ml-auto text-[var(--root-color)]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>

                  {/* Category Options */}
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                        selectedCategory === cat
                          ? "bg-[var(--root-color)]/10 text-[var(--root-color)]"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg ${
                          selectedCategory === cat
                            ? "bg-[var(--root-color)]/20"
                            : "bg-gray-200 dark:bg-gray-600"
                        }`}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium">{cat}</span>
                      {selectedCategory === cat && (
                        <svg
                          className="h-5 w-5 ml-auto text-[var(--root-color)]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters & Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {totalProducts}
            </span>{" "}
            {totalProducts === 1 ? "product" : "products"}
          </p>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--root-color)]/10 text-[var(--root-color)] rounded-lg text-sm font-medium hover:bg-[var(--root-color)]/20 transition-colors"
              >
                <span>{selectedCategory}</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {priceRange &&
              setPriceRange &&
              (priceRange.min > 0 || priceRange.max < maxPrice) && (
                <button
                  onClick={() => setPriceRange({ min: 0, max: maxPrice })}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  <span>
                    Rs. {priceRange.min.toLocaleString()} - Rs.{" "}
                    {priceRange.max.toLocaleString()}
                  </span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
