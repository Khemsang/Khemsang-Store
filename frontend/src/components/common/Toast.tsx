import { useEffect } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose: () => void;
  duration?: number;
}

const Toast = ({
  message,
  type = "info",
  onClose,
  duration = 3000,
}: ToastProps) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: "bg-green-50 dark:bg-green-900/20 border-green-500",
      icon: FaCheckCircle,
      iconColor: "text-green-500",
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/20 border-red-500",
      icon: FaExclamationCircle,
      iconColor: "text-red-500",
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500",
      icon: FaExclamationCircle,
      iconColor: "text-yellow-500",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-500",
      icon: FaInfoCircle,
      iconColor: "text-blue-500",
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] ${style.bg} border-l-4 rounded-lg shadow-2xl p-4 min-w-[300px] max-w-md animate-slideIn`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`${style.iconColor} text-xl flex-shrink-0 mt-0.5`} />
        <p className="flex-1 text-gray-800 dark:text-gray-200 text-sm font-medium">
          {message}
        </p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default Toast;
