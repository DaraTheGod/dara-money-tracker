
import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { subDays, format, startOfDay, eachDayOfInterval } from 'date-fns';
import { formatCurrency, convertCurrency } from '@/utils/currency';

interface IncomeChartProps {
  type: 'bar' | 'line';
  dateRange: string;
}

const IncomeChart = ({ type, dateRange }: IncomeChartProps) => {
  const { data: income = [] } = useTransactions('income');

  const chartData = useMemo(() => {
    const days = parseInt(dateRange);
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    
    return dateInterval.map(date => {
      const dayIncome = income.filter(incomeItem => 
        startOfDay(new Date(incomeItem.transaction_date)).getTime() === startOfDay(date).getTime()
      );
      
      const usdAmount = dayIncome
        .filter(i => i.currency === 'USD')
        .reduce((sum, incomeItem) => sum + Number(incomeItem.amount), 0);
      
      const khrAmount = dayIncome
        .filter(i => i.currency === 'KHR')
        .reduce((sum, incomeItem) => sum + Number(incomeItem.amount), 0);
      
      const totalAmount = usdAmount + convertCurrency(khrAmount, 'KHR', 'USD');
      
      return {
        date: format(date, 'MMM dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        amount: totalAmount,
        usdAmount,
        khrAmount,
        transactions: dayIncome,
        count: dayIncome.length
      };
    });
  }, [income, dateRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-64">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
              <div className="text-right">
                <div className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(data.usdAmount, 'USD')}
                </div>
                <div className="text-xs text-green-500 dark:text-green-400">
                  {formatCurrency(data.khrAmount, 'KHR')}
                </div>
              </div>
            </div>
            {data.transactions.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {data.count} transaction{data.count !== 1 ? 's' : ''}:
                </p>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {data.transactions.slice(0, 3).map((transaction: any, index: number) => (
                    <div key={index} className="text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300 truncate mr-2">
                          {transaction.description || 'No description'}
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {formatCurrency(Number(transaction.amount), transaction.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {data.transactions.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
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
  const ChartElement = type === 'bar' ? Bar : Line;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280" 
            className="dark:stroke-gray-400"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280" 
            className="dark:stroke-gray-400"
            fontSize={12}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          {type === 'bar' ? (
            <Bar dataKey="amount" fill="#16a34a" radius={[2, 2, 0, 0]} />
          ) : (
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#16a34a" 
              strokeWidth={2}
              dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#16a34a' }}
            />
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeChart;
