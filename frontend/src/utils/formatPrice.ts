export const formatPrice = (
  price: number,
  currency: string = "NPR"
): string => {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatPriceSimple = (price: number): string => {
  return `Rs. ${price.toLocaleString("en-NP")}`;
};

export const calculateDiscount = (
  originalPrice: number,
  discountedPrice: number
): number => {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};
