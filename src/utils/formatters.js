export const formatCurrency = (amount, currency = '₵') => {
  // If currency is a code (NGN/GHS), convert to symbol
  const symbol = currency === 'NGN' ? '₦' : (currency === 'GHS' ? '₵' : currency);
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const getCurrencySymbol = (currency = '₵') => {
  // If currency is a code, convert to symbol; otherwise return as-is
  return currency === 'NGN' ? '₦' : (currency === 'GHS' ? '₵' : currency);
};