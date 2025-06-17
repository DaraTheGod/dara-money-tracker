
export const EXCHANGE_RATE = 4000; // 1 USD = 4000 KHR

export const convertCurrency = (amount: number, fromCurrency: 'USD' | 'KHR', toCurrency: 'USD' | 'KHR'): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  if (fromCurrency === 'USD' && toCurrency === 'KHR') {
    return amount * EXCHANGE_RATE;
  }
  
  if (fromCurrency === 'KHR' && toCurrency === 'USD') {
    return amount / EXCHANGE_RATE;
  }
  
  return amount;
};

export const formatCurrency = (amount: number, currency: 'USD' | 'KHR'): string => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  } else {
    return new Intl.NumberFormat('km-KH', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' Riel';
  }
};

export const formatDualCurrency = (usdAmount: number): string => {
  const rielAmount = convertCurrency(usdAmount, 'USD', 'KHR');
  return `${formatCurrency(usdAmount, 'USD')}\n${formatCurrency(rielAmount, 'KHR')}`;
};

export const checkSufficientBalance = (
  currentBalance: number, 
  transactionAmount: number, 
  currency: 'USD' | 'KHR'
): { sufficient: boolean; message?: string } => {
  if (transactionAmount > currentBalance) {
    return {
      sufficient: false,
      message: `Insufficient balance. Available: ${formatCurrency(currentBalance, currency)}`
    };
  }
  
  return { sufficient: true };
};

// New function to calculate dual currency balances
export const calculateDualCurrencyBalances = (transactions: any[]) => {
  const balanceUSD = transactions
    .filter(t => t.currency === 'USD')
    .reduce((balance, t) => {
      return t.type === 'income' ? balance + Number(t.amount) : balance - Number(t.amount);
    }, 0);

  const balanceKHR = transactions
    .filter(t => t.currency === 'KHR')
    .reduce((balance, t) => {
      return t.type === 'income' ? balance + Number(t.amount) : balance - Number(t.amount);
    }, 0);

  return { balanceUSD, balanceKHR };
};

export const formatDualCurrencyBalance = (balanceUSD: number, balanceKHR: number): string => {
  return `${formatCurrency(balanceUSD, 'USD')}\n${formatCurrency(balanceKHR, 'KHR')}`;
};
