
import React from 'react';
import { formatCurrency, convertCurrency } from '@/utils/currency';

interface DualCurrencyDisplayProps {
  usdAmount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'success' | 'danger';
}

const DualCurrencyDisplay = ({ 
  usdAmount, 
  className = '', 
  size = 'md', 
  color = 'default' 
}: DualCurrencyDisplayProps) => {
  const rielAmount = convertCurrency(usdAmount, 'USD', 'KHR');
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };
  
  const colorClasses = {
    default: 'text-gray-900 dark:text-gray-100',
    success: 'text-green-600 dark:text-green-400',
    danger: 'text-red-600 dark:text-red-400'
  };
  
  return (
    <div className={`${sizeClasses[size]} font-bold ${colorClasses[color]} ${className}`}>
      <div>{formatCurrency(usdAmount, 'USD')}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        {formatCurrency(rielAmount, 'KHR')}
      </div>
    </div>
  );
};

export default DualCurrencyDisplay;
