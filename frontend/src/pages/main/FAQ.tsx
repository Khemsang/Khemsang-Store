import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      question: "What are your shipping options?",
      answer:
        "We offer standard and express shipping options. Standard shipping takes 5-7 business days, while express shipping delivers within 2-3 business days. Shipping costs vary based on your location and order size.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We accept returns within 30 days of delivery. Items must be in original condition with all packaging intact. Custom-made or personalized items cannot be returned. Please contact our customer service to initiate a return.",
    },
    {
      question: "Do you offer assembly services?",
      answer:
        "Yes, we offer professional assembly services for an additional fee. You can select this option during checkout. Our experienced team will assemble your furniture at your location.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept various payment methods including credit/debit cards, eSewa, Khalti, and cash on delivery (COD) for eligible orders. All online payments are processed securely.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order is shipped, you'll receive a tracking number via email. You can also track your order by logging into your account and visiting the 'My Orders' section.",
    },
    {
      question: "Do you offer warranties on your products?",
      answer:
        "Yes, all our products come with a manufacturer's warranty. The warranty period varies by product type - typically 1-5 years. Details are provided with each product description.",
    },
    {
      question: "Can I customize furniture pieces?",
      answer:
        "Yes, we offer customization options for many of our furniture pieces. You can choose different colors, materials, and sizes. Contact us for specific customization requests and pricing.",
    },
    {
      question: "What if my item arrives damaged?",
      answer:
        "If your item arrives damaged, please contact us within 48 hours with photos of the damage. We'll arrange for a replacement or refund immediately. Your satisfaction is our priority.",
    },
    {
      question: "Do you have a showroom I can visit?",
      answer:
        "Yes, we have a showroom in Kathmandu where you can view our products in person. Please check our Contact page for the address and opening hours. We recommend calling ahead for personalized assistance.",
    },
    {
      question: "How do I care for my furniture?",
      answer:
        "Care instructions vary by material. Generally, dust regularly with a soft cloth, avoid direct sunlight, and use appropriate cleaners for the material. Detailed care instructions are included with each product.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Find answers to common questions about our products and services
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </h3>
                <span className="text-primary flex-shrink-0">
                  {openIndex === index ? (
                    <FaChevronUp size={20} />
                  ) : (
                    <FaChevronDown size={20} />
                  )}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-5 pt-2">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Can't find the answer you're looking for? Our customer support team
            is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
