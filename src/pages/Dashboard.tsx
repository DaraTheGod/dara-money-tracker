
import React from 'react';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import FinancialChart from '@/components/dashboard/FinancialChart';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's your financial overview.</p>
      </div>
      
      <StatsCards />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions />
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Financial Overview</h3>
          <FinancialChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
