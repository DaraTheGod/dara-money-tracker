
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingDown, BarChart3, LineChart } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import ExpenseChart from '@/components/expenses/ExpenseChart';
import TransactionModal from '@/components/modals/TransactionModal';
import FilterDropdown from '@/components/common/FilterDropdown';
import PaginatedTransactionList from '@/components/common/PaginatedTransactionList';
import { formatCurrency } from '@/utils/currency';

const Expenses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const { data: expenses = [] } = useTransactions('expense');

  const totalExpenseUSD = expenses
    .filter(t => t.currency === 'USD')
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const totalExpenseKHR = expenses
    .filter(t => t.currency === 'KHR')
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your expenses</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-card-foreground">Recent Expenses</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-1">
              <div className="text-2xl font-bold text-red-500 dark:text-red-400">
                {formatCurrency(totalExpenseUSD, 'USD')}
              </div>
              <div className="text-sm text-red-500 dark:text-red-400">
                {formatCurrency(totalExpenseKHR, 'KHR')}
              </div>
            </div>
            <PaginatedTransactionList type="expense" maxRows={3} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-card-foreground">Expense Trends</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
                className="h-8 w-8 p-0"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
                className="h-8 w-8 p-0"
              >
                <LineChart className="h-4 w-4" />
              </Button>
              <FilterDropdown value={dateRange} onChange={setDateRange} />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64">
              <ExpenseChart type={chartType} dateRange={dateRange} />
            </div>
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
