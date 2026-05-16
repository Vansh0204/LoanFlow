export const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
  }).format(amount);

export const formatDate = (date: string | Date) =>
  new Intl.DateTimeFormat('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).format(new Date(date));
