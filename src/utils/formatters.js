export const formatCurrency = (amount, currency = 'GHS') => {
  const symbol = currency === 'NGN' ? '₦' : '₵';
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const getCurrencySymbol = (currency = 'GHS') => {
  return currency === 'NGN' ? '₦' : '₵';
};