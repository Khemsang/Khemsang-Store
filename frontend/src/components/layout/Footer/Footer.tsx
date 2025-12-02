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
    <footer className="bg-gray-900 text-white py-10 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">About Us</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We provide high-quality products for your home and office. Our
              mission is to deliver comfort, style, and durability at affordable
              prices.
            </p>
            <div className="flex gap-3 mt-4">
              {contactSettings.socialMedia?.facebook && (
                <a
                  href={contactSettings.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                >
                  <FaFacebookF />
                </a>
              )}
              {contactSettings.socialMedia?.twitter && (
                <a
                  href={contactSettings.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                >
                  <FaTwitter />
                </a>
              )}
              {contactSettings.socialMedia?.instagram && (
                <a
                  href={contactSettings.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                >
                  <FaInstagram />
                </a>
              )}
              {contactSettings.socialMedia?.linkedin && (
                <a
                  href={contactSettings.socialMedia.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                >
                  <FaLinkedinIn />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/gallery"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Gallery
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">
              Customer Service
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/cart"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Shopping Cart
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  My Account
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Track Order
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Return Policy
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  {contactSettings.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-primary flex-shrink-0" />
                <a
                  href={`tel:${contactSettings.phone.replace(/\s/g, "")}`}
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  {contactSettings.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaWhatsapp className="text-primary flex-shrink-0" />
                <a
                  href={`https://wa.me/${contactSettings.phone.replace(
                    /[^0-9]/g,
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  WhatsApp Us
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-primary flex-shrink-0" />
                <a
                  href={`mailto:${contactSettings.email}`}
                  className="text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  {contactSettings.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Khemsang Store. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
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
