import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaQuestionCircle,
  FaShippingFast,
  FaUndo,
  FaCreditCard,
  FaUserCircle,
  FaBox,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const helpCategories = [
    {
      icon: FaShippingFast,
      title: "Shipping & Delivery",
      description: "Track orders, delivery times, shipping costs",
      link: "/shipping-info",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: FaUndo,
      title: "Returns & Refunds",
      description: "Return policy, refund process, exchanges",
      link: "/return-policy",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: FaCreditCard,
      title: "Payment",
      description: "Payment methods, security, billing",
      link: "/faq",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FaUserCircle,
      title: "Account",
      description: "Profile, password, settings",
      link: "/profile",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: FaBox,
      title: "Orders",
      description: "Order status, cancellation, modifications",
      link: "/orders",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: FaQuestionCircle,
      title: "General FAQ",
      description: "Common questions and answers",
      link: "/faq",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const faqs = [
    {
      question: "How do I track my order?",
      answer:
        "You can track your order by going to the 'Orders' page in your account or using our Track Order feature. Enter your order ID to see real-time status updates.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept eSewa digital payments and Cash on Delivery (COD). All online payments are secure and encrypted.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "Delivery typically takes 1-2 days within Kathmandu Valley and 3-7 days for other locations in Nepal.",
    },
    {
      question: "Can I cancel my order?",
      answer:
        "Yes, you can cancel your order before it's shipped. Go to your Orders page and click 'Cancel Order'. Once shipped, cancellation is not possible.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 7-day return policy for most items. Products must be unused and in original packaging. Some items like undergarments are non-returnable.",
    },
    {
      question: "How do I apply a coupon code?",
      answer:
        "During checkout, you'll see a 'Have a Coupon?' section in the order summary. Enter your code and click 'Apply' to get your discount.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaQuestionCircle className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            How can we help you?
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Find answers to common questions or contact our support team
          </p>
        </div>

        
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg"
            />
          </div>
        </div>

        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {helpCategories.map((category) => (
            <Link
              key={category.title}
              to={category.link}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">
                {category.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
            </Link>
          ))}
        </div>

        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <FaChevronUp className="w-4 h-4 text-purple-600" />
                  ) : (
                    <FaChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
          <p className="text-white/80 mb-6">
            Our support team is here to assist you
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              <FaEnvelope className="w-5 h-5" />
              Contact Us
            </Link>
            <a
              href="tel:+9779800000000"
              className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors"
            >
              <FaPhone className="w-5 h-5" />
              Call Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
