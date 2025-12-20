import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShare,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaLink,
  FaTimes,
} from "react-icons/fa";
import { useToast } from "../../context/ToastContext";

interface ShareProductProps {
  productTitle: string;
  productUrl?: string;
}

const ShareProduct = ({ productTitle, productUrl }: ShareProductProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();

  const url = productUrl || window.location.href;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(productTitle);

  const shareLinks = [
    {
      name: "Facebook",
      icon: FaFacebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      color: "bg-sky-500 hover:bg-sky-600",
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      color: "bg-green-500 hover:bg-green-600",
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!", "success");
      setIsOpen(false);
    } catch {
      showToast("Failed to copy link", "error");
    }
  };

  const handleShare = (shareUrl: string) => {
    window.open(shareUrl, "_blank", "width=600,height=400");
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
        title="Share"
      >
        <FaShare className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[200px]"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Share
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <FaTimes className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-2">
                {shareLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleShare(link.url)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 ${link.color} text-white rounded-xl transition-all`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{link.name}</span>
                  </button>
                ))}

                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  <FaLink className="w-5 h-5" />
                  <span className="font-medium">Copy Link</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareProduct;
