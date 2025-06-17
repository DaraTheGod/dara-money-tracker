
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter, TrendingDown, BarChart3, LineChart } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import ExpenseList from '@/components/expenses/ExpenseList';
import ExpenseChart from '@/components/expenses/ExpenseChart';
import TransactionModal from '@/components/modals/TransactionModal';
import FilterDropdown from '@/components/common/FilterDropdown';
import { formatCurrency } from '@/utils/currency';

const Expenses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const { data: expenses = [] } = useTransactions('expense');

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your expenses</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full sm:w-auto bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-5">
        <Card className="lg:col-span-1 xl:col-span-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Expenses</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 mb-4">
              {formatCurrency(totalExpenses, 'USD')}
            </div>
            <ExpenseList />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 xl:col-span-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Expense Trends</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                <LineChart className="h-4 w-4" />
              </Button>
              <FilterDropdown value={dateRange} onChange={setDateRange} />
            </div>
          </CardHeader>
          <CardContent>
            <ExpenseChart type={chartType} dateRange={dateRange} />
          </CardContent>
        </Card>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultType="expense"
      />
    </div>
  );
};

export default Expenses;
