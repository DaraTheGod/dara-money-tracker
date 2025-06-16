
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/utils/currency';

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

  const COLORS = ['#22c55e', '#ef4444'];

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

  return (
    <div className="space-y-4">
      {/* Balance Summary */}
      <div className="text-center">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Balance</h4>
        <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(totalBalance, 'USD')}
        </p>
      </div>

      {/* Pie Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) => 
              `${name}: ${formatCurrency(value, 'USD')} (${(percent * 100).toFixed(0)}%)`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => formatCurrency(Number(value), 'USD')}
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Income</p>
          <p className="font-semibold text-green-600">{formatCurrency(totalIncome, 'USD')}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Expenses</p>
          <p className="font-semibold text-red-600">{formatCurrency(totalExpenses, 'USD')}</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialChart;
