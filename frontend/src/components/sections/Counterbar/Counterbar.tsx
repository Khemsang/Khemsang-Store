import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { api } from "../../../services/api";

interface CounterCardProps {
  end: number;
  label: string;
  suffix?: string;
  duration?: number;
}

const CounterCard: React.FC<CounterCardProps> = ({
  end,
  label,
  suffix = "",
  duration = 2.5,
}) => {
  const [key, setKey] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });

  useEffect(() => {
    if (inView) {
      setKey((prev) => prev + 1);
    }
  }, [inView]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
    >
      <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-2 sm:mb-3">
        {inView ? (
          <CountUp key={key} end={end} duration={duration} suffix={suffix} />
        ) : (
          <span>0{suffix}</span>
        )}
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg font-medium text-center">
        {label}
      </p>
    </div>
  );
};

const Counterbar: React.FC = () => {
  const [stats, setStats] = useState([
    { _id: "1", value: 0, label: "Products Available", suffix: "+" },
    { _id: "2", value: 0, label: "Categories", suffix: "+" },
    { _id: "3", value: 0, label: "Happy Customers", suffix: "+" },
    { _id: "4", value: 0, label: "5-Star Reviews", suffix: "%" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealStats();
  }, []);

  const fetchRealStats = async () => {
    try {
      setLoading(true);
      const { data: products } = await api.get("/products");

      // Get unique categories
      const uniqueCategories = new Set(products.map((p: any) => p.category));

      // Use static values for customers and reviews (no auth required)
      const happyCustomers = 500;
      const fiveStarPercentage = 98;

      setStats([
        {
          _id: "1",
          value: products.length,
          label: "Products Available",
          suffix: "+",
        },
        {
          _id: "2",
          value: uniqueCategories.size,
          label: "Categories",
          suffix: "+",
        },
        {
          _id: "3",
          value: happyCustomers,
          label: "Happy Customers",
          suffix: "+",
        },
        {
          _id: "4",
          value: fiveStarPercentage,
          label: "5-Star Reviews",
          suffix: "%",
        },
      ]);
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback to default values on error
      setStats([
        { _id: "1", value: 100, label: "Products Available", suffix: "+" },
        { _id: "2", value: 10, label: "Categories", suffix: "+" },
        { _id: "3", value: 500, label: "Happy Customers", suffix: "+" },
        { _id: "4", value: 98, label: "5-Star Reviews", suffix: "%" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto text-center text-gray-500">
          Loading stats...
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-800 dark:text-white">
          Our Achievements
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-8 sm:mb-12">
          Numbers that speak for our quality and service
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {stats.map((stat) => (
            <CounterCard
              key={stat._id}
              end={stat.value}
              label={stat.label}
              suffix={stat.suffix}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Counterbar;
