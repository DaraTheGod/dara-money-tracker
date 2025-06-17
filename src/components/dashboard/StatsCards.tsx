
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { calculateDualCurrencyBalances, formatCurrency } from '@/utils/currency';

const StatsCards = () => {
  const { data: transactions = [] } = useTransactions();

  const { balanceUSD, balanceKHR } = calculateDualCurrencyBalances(transactions);

  const totalIncomeUSD = transactions
    .filter(t => t.type === 'income' && t.currency === 'USD')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalIncomeKHR = transactions
    .filter(t => t.type === 'income' && t.currency === 'KHR')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenseUSD = transactions
    .filter(t => t.type === 'expense' && t.currency === 'USD')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenseKHR = transactions
    .filter(t => t.type === 'expense' && t.currency === 'KHR')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Balance</CardTitle>
          <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${balanceUSD >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(balanceUSD, 'USD')}
            </div>
            <div className={`text-sm ${balanceKHR >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(balanceKHR, 'KHR')}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</CardTitle>
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalIncomeUSD, 'USD')}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              {formatCurrency(totalIncomeKHR, 'KHR')}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</CardTitle>
          <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpenseUSD, 'USD')}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">
              {formatCurrency(totalExpenseKHR, 'KHR')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
