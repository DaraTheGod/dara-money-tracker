
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, BarChart3, LineChart } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import IncomeList from '@/components/income/IncomeList';
import IncomeChart from '@/components/income/IncomeChart';
import TransactionModal from '@/components/modals/TransactionModal';
import FilterDropdown from '@/components/common/FilterDropdown';
import { formatCurrency } from '@/utils/currency';

const Income = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const { data: income = [] } = useTransactions('income');

  const totalIncomeUSD = income
    .filter(t => t.currency === 'USD')
    .reduce((sum, inc) => sum + Number(inc.amount), 0);

  const totalIncomeKHR = income
    .filter(t => t.currency === 'KHR')
    .reduce((sum, inc) => sum + Number(inc.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Income</h1>
          <p className="text-slate-600 dark:text-slate-400">Track and manage your income</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 shadow-lg text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Income
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Recent Income</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-1">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalIncomeUSD, 'USD')}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {formatCurrency(totalIncomeKHR, 'KHR')}
              </div>
            </div>
            <IncomeList />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Income Trends</CardTitle>
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
              <IncomeChart type={chartType} dateRange={dateRange} />
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultType="income"
      />
    </div>
  );
};

export default Income;
