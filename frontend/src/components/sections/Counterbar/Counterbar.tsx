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
    { _id: "4", value: 0, label: "Average Rating", suffix: "/5" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealStats();
  }, []);

  const fetchRealStats = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const { data: productsRes } = await api.get("/products");
      const products = Array.isArray(productsRes) ? productsRes : (productsRes.products ?? []);

      // Get unique categories
      const uniqueCategories = new Set(products.map((p: any) => p.category));

      // Fetch users count
      let usersCount = 0;
      try {
        const { data } = await api.get("/auth/users/count");
        usersCount = data.totalUsers || 0;
      } catch (err) {
        console.error("Error fetching users count:", err);
        usersCount = 100; // Fallback
      }

      // Calculate average rating from all products
      let averageRating = 0;
      const productsWithRating = products.filter((p: any) => p.rating && p.rating > 0);
      if (productsWithRating.length > 0) {
        const totalRating = productsWithRating.reduce((sum: number, p: any) => sum + (p.rating || 0), 0);
        averageRating = parseFloat((totalRating / productsWithRating.length).toFixed(1));
      }

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
          value: usersCount,
          label: "Happy Customers",
          suffix: "+",
        },
        {
          _id: "4",
          value: averageRating,
          label: "Average Rating",
          suffix: "/5",
        },
      ]);
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback to default values on error
      setStats([
        { _id: "1", value: 100, label: "Products Available", suffix: "+" },
        { _id: "2", value: 10, label: "Categories", suffix: "+" },
        { _id: "3", value: 100, label: "Happy Customers", suffix: "+" },
        { _id: "4", value: 4.5, label: "Average Rating", suffix: "/5" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto text-center text-gray-500">
          Loading stats...
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 bg-gray-100 dark:from-gray-900 dark:to-gray-800">
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
