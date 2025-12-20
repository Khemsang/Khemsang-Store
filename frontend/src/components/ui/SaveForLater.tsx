import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface SaveForLaterProps {
  productId: string;
  productTitle: string;
  isSaved?: boolean;
  onToggle?: (saved: boolean) => void;
  variant?: "icon" | "button";
}

const SaveForLater = ({
  productId,
  productTitle,
  isSaved = false,
  onToggle,
  variant = "icon",
}: SaveForLaterProps) => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const handleToggle = async () => {
    if (!user) {
      showToast("Please login to save items", "error");
      return;
    }

    try {
      if (isSaved) {
        await api.delete(`/auth/wishlist/${productId}`);
        showToast(`${productTitle} removed from saved items`, "success");
      } else {
        await api.post("/auth/wishlist", { productId });
        showToast(`${productTitle} saved for later`, "success");
      }
      onToggle?.(!isSaved);
    } catch (error) {
      showToast("Failed to update saved items", "error");
    }
  };

  if (variant === "button") {
    return (
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          isSaved
            ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30"
            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        }`}
      >
        {isSaved ? (
          <>
            <FaBookmark className="w-4 h-4" />
            Saved
          </>
        ) : (
          <>
            <FaRegBookmark className="w-4 h-4" />
            Save for Later
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-all ${
        isSaved
          ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30"
          : "bg-gray-100 text-gray-400 dark:bg-gray-700 hover:text-purple-600"
      }`}
      title={isSaved ? "Remove from saved" : "Save for later"}
    >
      {isSaved ? (
        <FaBookmark className="w-4 h-4" />
      ) : (
        <FaRegBookmark className="w-4 h-4" />
      )}
    </button>
  );
};

export default SaveForLater;
