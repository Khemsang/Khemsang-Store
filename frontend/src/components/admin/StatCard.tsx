interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgColor: string;
  textColor: string;
  link?: string;
  onClick?: () => void;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  bgColor,
  textColor,
  onClick,
  link,
}: StatCardProps) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 ${
      link ? "cursor-pointer hover:scale-105" : ""
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center`}
      >
        <Icon className={`text-2xl ${textColor}`} />
      </div>
    </div>
    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
      {title}
    </h3>
    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

export default StatCard;
