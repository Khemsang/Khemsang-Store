import { Link } from "react-router-dom";

const Sitemap = () => {
  const sitemapSections = [
    {
      title: "Main Pages",
      links: [
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
        { name: "Featured Products", path: "/featured-products" },
        { name: "Gallery", path: "/gallery" },
        { name: "About Us", path: "/about" },
        { name: "Contact", path: "/contact" },
      ],
    },
    {
      title: "Shopping",
      links: [
        { name: "Shopping Cart", path: "/cart" },
        { name: "Checkout", path: "/checkout" },
        { name: "My Orders", path: "/orders" },
      ],
    },
    {
      title: "Account",
      links: [
        { name: "Login", path: "/login" },
        { name: "Sign Up", path: "/signup" },
        { name: "My Profile", path: "/profile" },
        { name: "Dashboard", path: "/dashboard" },
      ],
    },
    {
      title: "Information",
      links: [
        { name: "Privacy Policy", path: "/privacy-policy" },
        { name: "Terms of Service", path: "/terms-of-service" },
        { name: "Submit Testimonial", path: "/submit-testimonial" },
      ],
    },
  ];

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Sitemap
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          Find all the pages and sections of our website
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {sitemapSections.map((section, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center group"
                    >
                      <span className="w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Need Help?
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            If you can't find what you're looking for, please{" "}
            <Link
              to="/contact"
              className="text-primary hover:underline font-semibold"
            >
              contact us
            </Link>{" "}
            and we'll be happy to help.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Sitemap;
