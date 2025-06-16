
import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { subDays, format, startOfDay, eachDayOfInterval } from 'date-fns';

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
      
      const totalAmount = dayIncome.reduce((sum, incomeItem) => sum + Number(incomeItem.amount), 0);
      
      return {
        date: format(date, 'MMM dd'),
        amount: totalAmount,
      };
    });
  }, [income, dateRange]);

  const Chart = type === 'bar' ? BarChart : LineChart;
  const ChartElement = type === 'bar' ? Bar : Line;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
          />
          {type === 'bar' ? (
            <Bar dataKey="amount" fill="#22c55e" />
          ) : (
            <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} />
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeChart;
