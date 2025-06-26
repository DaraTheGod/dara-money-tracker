
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
      <Card className="bg-card border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
          <Wallet className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${balanceUSD >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatCurrency(balanceUSD, 'USD')}
            </div>
            <div className={`text-l ${balanceKHR >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatCurrency(balanceKHR, 'KHR')}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          <TrendingUp className="h-5 w-5 text-income" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-income">
              {formatCurrency(totalIncomeUSD, 'USD')}
            </div>
            <div className="text-l text-income">
              {formatCurrency(totalIncomeKHR, 'KHR')}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          <TrendingDown className="h-5 w-5 text-expense" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-expense">
              {formatCurrency(totalExpenseUSD, 'USD')}
            </div>
            <div className="text-l text-expense">
              {formatCurrency(totalExpenseKHR, 'KHR')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
