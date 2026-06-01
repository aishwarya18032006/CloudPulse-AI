export const formatCurrency = (value) => {
  const num = typeof value === "number" ? value : parseInt(String(value).replace(/\D/g, ""), 10) || 0;
  return `₹${num.toLocaleString("en-IN")}`;
};

export const formatPercent = (value) => `${value > 0 ? "+" : ""}${value}%`;

export const randomInRange = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
