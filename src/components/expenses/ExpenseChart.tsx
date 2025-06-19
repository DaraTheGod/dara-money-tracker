
import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { subDays, format, startOfDay, eachDayOfInterval } from 'date-fns';
import { formatCurrency, convertCurrency } from '@/utils/currency';

interface ExpenseChartProps {
  type: 'bar' | 'line';
  dateRange: string;
}

const ExpenseChart = ({ type, dateRange }: ExpenseChartProps) => {
  const { data: expenses = [] } = useTransactions('expense');

  const chartData = useMemo(() => {
    const days = parseInt(dateRange);
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    
    return dateInterval.map(date => {
      const dayExpenses = expenses.filter(expense => 
        startOfDay(new Date(expense.transaction_date)).getTime() === startOfDay(date).getTime()
      );
      
      const usdAmount = dayExpenses
        .filter(e => e.currency === 'USD')
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
      
      const khrAmount = dayExpenses
        .filter(e => e.currency === 'KHR')
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
      
      const totalAmount = usdAmount + convertCurrency(khrAmount, 'KHR', 'USD');
      
      return {
        date: format(date, 'MMM dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        amount: totalAmount,
        usdAmount,
        khrAmount,
        transactions: dayExpenses,
        count: dayExpenses.length
      };
    });
  }, [expenses, dateRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 min-w-64 z-50">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total:</span>
              <div className="text-right">
                <div className="font-semibold text-rose-500 dark:text-rose-400">
                  {formatCurrency(data.usdAmount, 'USD')}
                </div>
                <div className="text-xs text-rose-400 dark:text-rose-400">
                  {formatCurrency(data.khrAmount, 'KHR')}
                </div>
              </div>
            </div>
            {data.transactions.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-600 pt-2">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {data.count} transaction{data.count !== 1 ? 's' : ''}:
                </p>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {data.transactions.slice(0, 3).map((transaction: any, index: number) => (
                    <div key={index} className="text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-300 truncate mr-2">
                          {transaction.description || 'No description'}
                        </span>
                        <span className="text-rose-500 dark:text-rose-400 font-medium">
                          {formatCurrency(Number(transaction.amount), transaction.currency)}
                        </span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {format(new Date(transaction.transaction_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  ))}
                  {data.transactions.length > 3 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      +{data.transactions.length - 3} more...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const Chart = type === 'bar' ? BarChart : LineChart;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-600" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            className="dark:stroke-slate-400"
            fontSize={12}
          />
          <YAxis 
            stroke="#64748b" 
            className="dark:stroke-slate-400"
            fontSize={12}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          {type === 'bar' ? (
            <Bar dataKey="amount" fill="#f43f5e" radius={[2, 2, 0, 0]} />
          ) : (
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#f43f5e" 
              strokeWidth={2}
              dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#f43f5e' }}
            />
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart;
