import { useState, useEffect } from "react";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { contactApi } from "../../../services/api";

interface ContactSettings {
  email: string;
  phone: string;
}

const Header = () => {
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    email: "info@furniturestore.com",
    phone: "+977 980-0000000",
  });

  useEffect(() => {
    fetchContactSettings();
  }, []);

  const fetchContactSettings = async () => {
    try {
      const { data } = await contactApi.getSettings();
      setContactSettings({
        email: data.email,
        phone: data.phone,
      });
    } catch (error) {
      console.error("Failed to fetch contact settings:", error);
      // Keep default values if API fails
    }
  };

  return (
    <div className="flex justify-between items-center text-xs md:text-sm">
      <div className="flex items-center gap-4">
        <a
          href={`tel:${contactSettings.phone.replace(/\s/g, "")}`}
          className="flex items-center gap-2 hover:text-white/80 transition-colors"
        >
          <FaPhoneAlt />
          <span className="hidden sm:inline">{contactSettings.phone}</span>
        </a>
        <a
          href={`mailto:${contactSettings.email}`}
          className="flex items-center gap-2 hover:text-white/80 transition-colors"
        >
          <FaEnvelope />
          <span className="hidden sm:inline">{contactSettings.email}</span>
        </a>
      </div>
      <div className="hidden md:block">
        <span>Free Shipping on Orders Over Rs. 10,000</span>
      </div>
    </div>
  );
};

export default Header;
