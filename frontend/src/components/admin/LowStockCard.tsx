interface Product {
  _id: string;
  title: string;
  category: string;
  stock: number;
  images?: string[];
}

interface LowStockCardProps {
  product: Product;
}

const LowStockCard = ({ product }: LowStockCardProps) => (
  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
    <div className="flex items-center gap-4 flex-1">
      <img
        src={product.images?.[0] || "/placeholder.jpg"}
        alt={product.title}
        className="w-12 h-12 object-cover rounded-lg"
      />
      <div className="flex-1">
        <p className="font-semibold text-gray-900 dark:text-white">
          {product.title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {product.category}
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm text-gray-600 dark:text-gray-400">Stock</p>
      <p className="text-xl font-bold text-red-600 dark:text-red-400">
        {product.stock}
      </p>
    </div>
  </div>
);

export default LowStockCard;
