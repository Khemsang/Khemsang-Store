import React, { useState, useEffect } from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaWhatsapp,
} from "react-icons/fa";
import { contactApi } from "../../../services/api";

interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    email: "info@furniturestore.com",
    phone: "+977 980-0000000",
    address: "Kathmandu, Nepal",
    workingHours: "Mon - Fri: 9:00 AM - 6:00 PM",
    socialMedia: {},
  });

  useEffect(() => {
    fetchContactSettings();
  }, []);

  const fetchContactSettings = async () => {
    try {
      const { data } = await contactApi.getSettings();
      setContactSettings(data);
    } catch (error) {
      console.error("Failed to fetch contact settings:", error);
      // Keep default values if API fails
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-6 sm:py-8 md:py-10 px-4 sm:px-6">
      <div className="container mx-auto">
        {/* About Section - Full width on mobile */}
        <div className="mb-6 md:mb-0">
          <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 md:mb-4 text-primary">
            About Us
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            We provide high-quality products for your home and office. Our
            mission is to deliver comfort, style, and durability at affordable
            prices.
          </p>
          <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
            {contactSettings.socialMedia?.facebook && (
              <a
                href={contactSettings.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors text-sm sm:text-base"
              >
                <FaFacebookF />
              </a>
            )}
            {contactSettings.socialMedia?.twitter && (
              <a
                href={contactSettings.socialMedia.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors text-sm sm:text-base"
              >
                <FaTwitter />
              </a>
            )}
            {contactSettings.socialMedia?.instagram && (
              <a
                href={contactSettings.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors text-sm sm:text-base"
              >
                <FaInstagram />
              </a>
            )}
            {contactSettings.socialMedia?.linkedin && (
              <a
                href={contactSettings.socialMedia.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors text-sm sm:text-base"
              >
                <FaLinkedinIn />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links, Customer Service, Contact Us - 3 columns on mobile, 3 separate columns on desktop */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold mb-2 sm:mb-3 md:mb-4 text-primary">
              Quick Links
            </h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-400 hover:text-primary transition-colors text-[10px] sm:text-xs md:text-sm"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="text-gray-400 hover:text-primary transition-colors text-[10px] sm:text-xs md:text-sm"
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-gray-400 hover:text-primary transition-colors text-[10px] sm:text-xs md:text-sm"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-400 hover:text-primary transition-colors text-[10px] sm:text-xs md:text-sm"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/gallery"
                  className="text-gray-400 hover:text-primary transition-colors text-[10px] sm:text-xs md:text-sm"
                >
                  Gallery
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold mb-2 sm:mb-3 md:mb-4 text-primary">
              Service
            </h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <a
                  href="/cart"
                  className="text-gray-400 hover:text-primary transition-colors text-[10px] sm:text-xs md:text-sm"
                >
                  Cart
                </a>
              </li>
              <li>
                <a
                  href="/profile"
                  className="text-gray-400 hover:text-primary transition-colors text-[10px] sm:text-xs md:text-sm"
                >
                  Account
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary transition-colors text-[10px] sm:text-xs md:text-sm"
                >
                  Track
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary transition-colors text-[10px] sm:text-xs md:text-sm"
                >
                  Return
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-gray-400 hover:text-primary transition-colors text-[10px] sm:text-xs md:text-sm"
                >
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold mb-2 sm:mb-3 md:mb-4 text-primary">
              Contact
            </h3>
            <ul className="space-y-1 sm:space-y-2">
              <li className="flex items-start gap-1 sm:gap-2">
                <FaMapMarkerAlt className="text-primary mt-0.5 sm:mt-1 flex-shrink-0 text-[10px] sm:text-xs md:text-sm" />
                <span className="text-gray-400 text-[10px] sm:text-xs md:text-sm line-clamp-2">
                  {contactSettings.address}
                </span>
              </li>
              <li className="flex items-center gap-1 sm:gap-2">
                <FaPhoneAlt className="text-primary flex-shrink-0 text-[10px] sm:text-xs md:text-sm" />
                <a
                  href={`tel:${contactSettings.phone.replace(/\s/g, "")}`}
                  className="text-gray-400 hover:text-primary transition-colors text-[10px] sm:text-xs md:text-sm"
                >
                  {contactSettings.phone}
                </a>
              </li>
              <li className="flex items-center gap-1 sm:gap-2">
                <FaWhatsapp className="text-primary flex-shrink-0 text-[10px] sm:text-xs md:text-sm" />
                <a
                  href={`https://wa.me/${contactSettings.phone.replace(
                    /[^0-9]/g,
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors text-[10px] sm:text-xs md:text-sm"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-1 sm:gap-2">
                <FaEnvelope className="text-primary flex-shrink-0 text-[10px] sm:text-xs md:text-sm" />
                <a
                  href={`mailto:${contactSettings.email}`}
                  className="text-gray-400 hover:text-primary transition-colors text-[10px] sm:text-xs md:text-sm truncate"
                >
                  {contactSettings.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-4 sm:mt-6 md:mt-8 pt-3 sm:pt-4 md:pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-3 md:gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              © {currentYear} Khemsang Store. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm">
              <a
                href="/privacy-policy"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms-of-service"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/sitemap"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
