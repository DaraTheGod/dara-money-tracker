
import React from 'react';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import FinancialChart from '@/components/dashboard/FinancialChart';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your financial overview.</p>
        </div>
        
        <StatsCards />
        
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentTransactions />
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Financial Overview</h3>
            <FinancialChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
