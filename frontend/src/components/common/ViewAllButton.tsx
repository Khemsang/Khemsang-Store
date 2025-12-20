import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

interface ViewAllButtonProps {
  to: string;
  label?: string;
  variant?: "primary" | "green" | "purple" | "orange";
  size?: "default" | "large";
  rounded?: boolean;
}

const ViewAllButton = ({
  to,
  label = "View All",
  variant = "primary",
  size = "default",
  rounded = false,
}: ViewAllButtonProps) => {
  const navigate = useNavigate();

  const colorVariants = {
    primary: "from-[var(--root-color)] to-purple-600 hover:to-purple-700",
    green:
      "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
    purple:
      "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    orange: "from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
  };

  const sizeClasses = {
    default: "px-6 py-3 text-sm font-semibold gap-2",
    large: "px-10 py-4 text-lg font-bold gap-3",
  };

  return (
    <div className="text-center mt-8">
      <button
        onClick={() => navigate(to)}
        className={`group inline-flex items-center bg-gradient-to-r ${
          colorVariants[variant]
        } text-white ${sizeClasses[size]} ${
          rounded
            ? "rounded-full shadow-xl shadow-[var(--root-color)]/30"
            : "rounded-xl shadow-lg"
        } transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
      >
        <span>{label}</span>
        <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default ViewAllButton;
