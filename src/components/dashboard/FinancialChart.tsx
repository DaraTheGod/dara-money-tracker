
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency, calculateDualCurrencyBalances } from '@/utils/currency';

const FinancialChart = () => {
  const { data: transactions = [] } = useTransactions();

  // Calculate balances using dual currency system
  const { balanceUSD, balanceKHR } = calculateDualCurrencyBalances(transactions);

  // Calculate income and expenses by currency
  const totalIncomeUSD = transactions
    .filter(t => t.type === 'income' && t.currency === 'USD')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpensesUSD = transactions
    .filter(t => t.type === 'expense' && t.currency === 'USD')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Create data for pie chart (using USD for visualization)
  const pieData = [
    {
      name: 'Income',
      value: totalIncomeUSD,
      color: '#10b981'
    },
    {
      name: 'Expenses',
      value: totalExpensesUSD,
      color: '#ef4444'
    }
  ];

  // Filter out zero values
  const filteredData = pieData.filter(item => item.value > 0);

  if (filteredData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="mb-2">No financial data available</p>
          <p className="text-sm">Add some transactions to see your overview</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 rounded-lg shadow-lg border">
          <p className="font-medium text-card-foreground">{payload[0].name}</p>
          <div className="text-muted-foreground">
            <div className="text-sm">{formatCurrency(payload[0].value, 'USD')}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Balance Summary */}
      <div className="text-center p-4 bg-muted rounded-lg border">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Total Balance</h4>
        <div className="space-y-1">
          <div className={`text-2xl font-bold ${balanceUSD >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {formatCurrency(balanceUSD, 'USD')}
          </div>
          <div className={`text-sm ${balanceKHR >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {formatCurrency(balanceKHR, 'KHR')}
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
            stroke="none"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-muted rounded-lg border">
          <p className="text-xs text-muted-foreground mb-1">Income</p>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIncomeUSD, 'USD')}
          </div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg border">
          <p className="text-xs text-muted-foreground mb-1">Expenses</p>
          <div className="text-lg font-bold text-red-500 dark:text-red-400">
            {formatCurrency(totalExpensesUSD, 'USD')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialChart;
