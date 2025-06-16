
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';

const FinancialChart = () => {
  const { data: transactions = [] } = useTransactions();

  // Calculate data for pie chart by category
  const categoryData = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'expense') {
      const categoryName = transaction.categories?.name || 'Uncategorized';
      const amount = Number(transaction.amount);
      
      if (acc[categoryName]) {
        acc[categoryName] += amount;
      } else {
        acc[categoryName] = amount;
      }
    }
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (pieData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No expense data available for chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default FinancialChart;
