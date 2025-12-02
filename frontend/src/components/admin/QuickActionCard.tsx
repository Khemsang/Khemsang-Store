interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  onClick: () => void;
}

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  gradient,
  onClick,
}: QuickActionCardProps) => (
  <div
    onClick={onClick}
    className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105`}
  >
    <Icon className="text-4xl mb-4 opacity-80" />
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="opacity-90 text-sm">{description}</p>
  </div>
);

export default QuickActionCard;
