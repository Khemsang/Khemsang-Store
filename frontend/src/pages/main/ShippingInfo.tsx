import {
  FaTruck,
  FaMapMarkerAlt,
  FaClock,
  FaShieldAlt,
  FaBox,
  FaCheckCircle,
} from "react-icons/fa";

const ShippingInfo = () => {
  const shippingZones = [
    {
      zone: "Kathmandu Valley",
      cities: ["Kathmandu", "Lalitpur", "Bhaktapur"],
      time: "1-2 days",
      cost: "Rs. 100",
      freeAbove: "Rs. 2,000",
    },
    {
      zone: "Major Cities",
      cities: ["Pokhara", "Biratnagar", "Birgunj", "Dharan", "Bharatpur"],
      time: "2-4 days",
      cost: "Rs. 150",
      freeAbove: "Rs. 3,000",
    },
    {
      zone: "Other Areas",
      cities: ["All other locations in Nepal"],
      time: "4-7 days",
      cost: "Rs. 200",
      freeAbove: "Rs. 5,000",
    },
  ];

  const features = [
    {
      icon: FaTruck,
      title: "Fast Delivery",
      description: "Quick and reliable delivery across Nepal",
    },
    {
      icon: FaShieldAlt,
      title: "Safe Packaging",
      description: "Products are carefully packed to prevent damage",
    },
    {
      icon: FaMapMarkerAlt,
      title: "Real-time Tracking",
      description: "Track your order status in real-time",
    },
    {
      icon: FaCheckCircle,
      title: "Delivery Confirmation",
      description: "Get notified when your order is delivered",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTruck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Shipping Information
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We deliver across Nepal with care and speed
          </p>
        </div>

        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-lg"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-600" />
              Delivery Zones & Rates
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Zone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Delivery Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Shipping Cost
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Free Shipping
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {shippingZones.map((zone) => (
                  <tr
                    key={zone.zone}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {zone.zone}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {zone.cities.join(", ")}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaClock className="w-4 h-4" />
                        {zone.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {zone.cost}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                        Above {zone.freeAbove}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaBox className="text-purple-600" />
              Order Processing
            </h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="w-4 h-4 text-green-500 mt-1" />
                <span>Orders placed before 2 PM are processed same day</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="w-4 h-4 text-green-500 mt-1" />
                <span>Orders after 2 PM are processed next business day</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="w-4 h-4 text-green-500 mt-1" />
                <span>Weekend orders are processed on Monday</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-blue-600" />
              Delivery Notes
            </h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="w-4 h-4 text-green-500 mt-1" />
                <span>
                  Delivery times may vary during festivals and holidays
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="w-4 h-4 text-green-500 mt-1" />
                <span>Remote areas may take additional 2-3 days</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="w-4 h-4 text-green-500 mt-1" />
                <span>You'll receive SMS/email updates for your order</span>
              </li>
            </ul>
          </div>
        </div>

        
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Track Your Order</h2>
          <p className="text-white/80 mb-6">
            Enter your order ID to see real-time delivery status
          </p>
          <a
            href="/track"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            <FaTruck className="w-5 h-5" />
            Track Order
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
