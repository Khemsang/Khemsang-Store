import { FaTruck, FaClock } from "react-icons/fa";

interface EstimatedDeliveryProps {
  city?: string;
  className?: string;
}

const EstimatedDelivery = ({
  city,
  className = "",
}: EstimatedDeliveryProps) => {
  // Calculate estimated delivery based on city
  const getDeliveryEstimate = () => {
    const today = new Date();
    let minDays = 2;
    let maxDays = 5;

    // Adjust based on city
    const kathmandu = ["Kathmandu", "Lalitpur", "Bhaktapur"];
    const majorCities = [
      "Pokhara",
      "Biratnagar",
      "Birgunj",
      "Dharan",
      "Bharatpur",
    ];

    if (city && kathmandu.includes(city)) {
      minDays = 1;
      maxDays = 2;
    } else if (city && majorCities.includes(city)) {
      minDays = 2;
      maxDays = 4;
    } else {
      minDays = 3;
      maxDays = 7;
    }

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    };

    return {
      minDate: formatDate(minDate),
      maxDate: formatDate(maxDate),
      minDays,
      maxDays,
    };
  };

  const estimate = getDeliveryEstimate();

  return (
    <div
      className={`bg-green-50 dark:bg-green-900/20 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center flex-shrink-0">
          <FaTruck className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">
            Estimated Delivery
          </h4>
          <p className="text-sm text-green-700 dark:text-green-400">
            {estimate.minDate} - {estimate.maxDate}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-500">
            <FaClock className="w-3 h-3" />
            <span>
              {estimate.minDays}-{estimate.maxDays} business days
              {city && ` to ${city}`}
            </span>
          </div>
        </div>
      </div>

      {/* Free Shipping Notice */}
      <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
        <p className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1">
          <span className="text-lg">🎉</span>
          Free shipping on orders above Rs. 2,000
        </p>
      </div>
    </div>
  );
};

export default EstimatedDelivery;
