import {
  FaUndo,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBox,
  FaExchangeAlt,
} from "react-icons/fa";

const ReturnPolicy = () => {
  const returnSteps = [
    {
      step: 1,
      title: "Initiate Return",
      description:
        "Go to your Orders page and select the item you want to return",
    },
    {
      step: 2,
      title: "Pack the Item",
      description:
        "Pack the product in its original packaging with all tags intact",
    },
    {
      step: 3,
      title: "Schedule Pickup",
      description:
        "Our delivery partner will pick up the item from your address",
    },
    {
      step: 4,
      title: "Get Refund",
      description:
        "Refund will be processed within 5-7 business days after inspection",
    },
  ];

  const eligibleItems = [
    "Clothing and apparel (unworn, with tags)",
    "Electronics (unopened, sealed)",
    "Home decor items",
    "Furniture (unassembled)",
    "Accessories",
  ];

  const nonEligibleItems = [
    "Undergarments and innerwear",
    "Customized or personalized items",
    "Items marked as 'Final Sale'",
    "Products without original packaging",
    "Used or damaged items",
    "Items returned after 7 days",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUndo className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Return & Refund Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Easy returns within 7 days of delivery
          </p>
        </div>

        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <FaClock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">7-Day Return Window</h2>
              <p className="text-white/80">
                Return any eligible item within 7 days of delivery for a full
                refund
              </p>
            </div>
          </div>
        </div>

        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FaExchangeAlt className="text-purple-600" />
            How to Return
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {returnSteps.map((item) => (
              <div
                key={item.step}
                className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-purple-600">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              Eligible for Return
            </h3>
            <ul className="space-y-3">
              {eligibleItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-600 dark:text-gray-400"
                >
                  <FaCheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaTimesCircle className="text-red-500" />
              Not Eligible for Return
            </h3>
            <ul className="space-y-3">
              {nonEligibleItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-600 dark:text-gray-400"
                >
                  <FaTimesCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FaBox className="text-blue-600" />
            Refund Information
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              <strong className="text-gray-900 dark:text-white">
                Processing Time:
              </strong>{" "}
              Refunds are processed within 5-7 business days after we receive
              and inspect the returned item.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Refund Method:
              </strong>{" "}
              Refunds will be credited to your original payment method. For COD
              orders, refund will be transferred to your bank account.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Shipping Costs:
              </strong>{" "}
              Original shipping charges are non-refundable. Return shipping is
              free for defective or wrong items.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">
                Partial Refunds:
              </strong>{" "}
              Items returned in damaged condition or missing parts may receive a
              partial refund.
            </p>
          </div>
        </div>

        
        <div className="text-center bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Have questions about returns?
          </p>
          <a
            href="/contact"
            className="text-purple-600 font-semibold hover:underline"
          >
            Contact our support team →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
