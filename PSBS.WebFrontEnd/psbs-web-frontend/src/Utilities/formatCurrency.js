export default function formatCurrency(
  value,
  currency = "VND",
  locale = "vi-VN"
) {
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
    return "Invalid Number";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(numberValue);
}
