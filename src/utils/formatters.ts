// src/utils/formatters.ts

/**
 * Format currency to GHS (₵) or other
 */
export const formatCurrency = (amount: number | string, currency = '₵'): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(value)) return `${currency}0.00`;
  
  return `${currency}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Abbreviate numbers (1k, 1M, etc)
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};