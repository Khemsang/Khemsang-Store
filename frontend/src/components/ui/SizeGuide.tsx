import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRuler, FaTimes } from "react-icons/fa";

interface SizeGuideProps {
  category?: string;
}

const SizeGuide = ({ category = "clothing" }: SizeGuideProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const clothingSizes = [
    { size: "XS", chest: "32-34", waist: "26-28", hip: "34-36" },
    { size: "S", chest: "34-36", waist: "28-30", hip: "36-38" },
    { size: "M", chest: "38-40", waist: "32-34", hip: "40-42" },
    { size: "L", chest: "42-44", waist: "36-38", hip: "44-46" },
    { size: "XL", chest: "46-48", waist: "40-42", hip: "48-50" },
    { size: "XXL", chest: "50-52", waist: "44-46", hip: "52-54" },
  ];

  const shoeSizes = [
    { us: "6", uk: "5.5", eu: "38", cm: "24" },
    { us: "7", uk: "6.5", eu: "39", cm: "25" },
    { us: "8", uk: "7.5", eu: "40", cm: "26" },
    { us: "9", uk: "8.5", eu: "41", cm: "27" },
    { us: "10", uk: "9.5", eu: "42", cm: "28" },
    { us: "11", uk: "10.5", eu: "43", cm: "29" },
    { us: "12", uk: "11.5", eu: "44", cm: "30" },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
      >
        <FaRuler className="w-4 h-4" />
        Size Guide
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <FaRuler className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Size Guide
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-auto max-h-[calc(90vh-100px)]">
                {/* Clothing Sizes */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Clothing Sizes (inches)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Size
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Chest
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Waist
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Hip
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {clothingSizes.map((row, idx) => (
                          <tr
                            key={row.size}
                            className={
                              idx % 2 === 0
                                ? ""
                                : "bg-gray-50 dark:bg-gray-700/30"
                            }
                          >
                            <td className="px-4 py-3 font-semibold text-purple-600">
                              {row.size}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              {row.chest}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              {row.waist}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              {row.hip}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Shoe Sizes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Shoe Sizes
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                            US
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                            UK
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                            EU
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                            CM
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {shoeSizes.map((row, idx) => (
                          <tr
                            key={row.us}
                            className={
                              idx % 2 === 0
                                ? ""
                                : "bg-gray-50 dark:bg-gray-700/30"
                            }
                          >
                            <td className="px-4 py-3 font-semibold text-purple-600">
                              {row.us}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              {row.uk}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              {row.eu}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              {row.cm}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                    How to Measure
                  </h4>
                  <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                    <li>
                      • <strong>Chest:</strong> Measure around the fullest part
                      of your chest
                    </li>
                    <li>
                      • <strong>Waist:</strong> Measure around your natural
                      waistline
                    </li>
                    <li>
                      • <strong>Hip:</strong> Measure around the fullest part of
                      your hips
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SizeGuide;
