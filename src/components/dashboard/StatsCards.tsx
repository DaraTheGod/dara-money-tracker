
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import DualCurrencyDisplay from '@/components/common/DualCurrencyDisplay';

const StatsCards = () => {
  const { data: transactions = [] } = useTransactions();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalBalance = totalIncome - totalExpenses;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="glass-effect card-hover border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Balance</CardTitle>
          <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <DualCurrencyDisplay 
            usdAmount={totalBalance} 
            color={totalBalance >= 0 ? 'success' : 'danger'}
            size="lg"
          />
        </CardContent>
      </Card>

      <Card className="glass-effect card-hover border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</CardTitle>
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <DualCurrencyDisplay 
            usdAmount={totalIncome} 
            color="success"
            size="lg"
          />
        </CardContent>
      </Card>

      <Card className="glass-effect card-hover border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</CardTitle>
          <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <DualCurrencyDisplay 
            usdAmount={totalExpenses} 
            color="danger"
            size="lg"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
