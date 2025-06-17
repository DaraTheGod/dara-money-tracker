
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import DualCurrencyDisplay from '@/components/common/DualCurrencyDisplay';

const FinancialChart = () => {
  const { data: transactions = [] } = useTransactions();

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalBalance = totalIncome - totalExpenses;

  // Create data for pie chart
  const pieData = [
    {
      name: 'Income',
      value: totalIncome,
      color: '#22c55e'
    },
    {
      name: 'Expenses',
      value: totalExpenses,
      color: '#ef4444'
    }
  ];

  // Filter out zero values
  const filteredData = pieData.filter(item => item.value > 0);

  if (filteredData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
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
        <div className="glass-effect p-3 rounded-lg shadow-lg border-none">
          <p className="font-medium text-gray-900 dark:text-gray-100">{payload[0].name}</p>
          <DualCurrencyDisplay usdAmount={payload[0].value} size="sm" />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <div className="text-center p-4 glass-effect rounded-lg">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Balance</h4>
        <DualCurrencyDisplay 
          usdAmount={totalBalance} 
          color={totalBalance >= 0 ? 'success' : 'danger'}
          size="lg"
        />
      </div>

      {/* Pie Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => 
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
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
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 glass-effect rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Income</p>
          <DualCurrencyDisplay usdAmount={totalIncome} color="success" size="sm" />
        </div>
        <div className="text-center p-3 glass-effect rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expenses</p>
          <DualCurrencyDisplay usdAmount={totalExpenses} color="danger" size="sm" />
        </div>
      </div>
    </div>
  );
};

export default FinancialChart;
