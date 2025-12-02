const TermsOfService = () => {
  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          Terms of Service
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              By accessing and using this website, you accept and agree to be
              bound by the terms and provision of this agreement. If you do not
              agree to these terms, please do not use this website.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Use of Website
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              You agree to use this website only for lawful purposes and in a
              way that does not infringe the rights of others. You must not:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li>Use the website in any way that is unlawful or fraudulent</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Transmit any harmful or malicious code</li>
              <li>Collect or harvest any information from the website</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Product Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We strive to provide accurate product descriptions and pricing.
              However, we do not warrant that product descriptions, pricing, or
              other content is accurate, complete, or error-free. We reserve the
              right to correct any errors and update information at any time.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Orders and Payment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              All orders are subject to acceptance and availability. We reserve
              the right to refuse or cancel any order for any reason. Payment
              must be received before orders are processed and shipped.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Shipping and Delivery
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We will make every effort to deliver products within the estimated
              timeframe. However, delivery times are not guaranteed and we are
              not liable for any delays.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Returns and Refunds
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Please refer to our Return Policy for information about returns
              and refunds. We reserve the right to refuse returns that do not
              meet our policy requirements.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We shall not be liable for any indirect, incidental, special, or
              consequential damages arising out of or in connection with your
              use of this website or purchase of products.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Changes to Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We reserve the right to modify these terms at any time. Changes
              will be effective immediately upon posting to the website. Your
              continued use of the website constitutes acceptance of the
              modified terms.
            </p>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;
