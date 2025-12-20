import { Link, useLocation } from "react-router-dom";
import { FaHome, FaChevronRight } from "react-icons/fa";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  const location = useLocation();

  // Auto-generate breadcrumbs from path if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split("/").filter((x) => x);

    return pathnames.map((name, index) => {
      const path = `/${pathnames.slice(0, index + 1).join("/")}`;
      const label = name
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      return { label, path: index < pathnames.length - 1 ? path : undefined };
    });
  };

  const breadcrumbs = items || generateBreadcrumbs();

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      <Link
        to="/"
        className="flex items-center gap-1 text-gray-500 hover:text-purple-600 transition-colors"
      >
        <FaHome className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <FaChevronRight className="w-3 h-3 text-gray-400" />
          {item.path ? (
            <Link
              to={item.path}
              className="text-gray-500 hover:text-purple-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
