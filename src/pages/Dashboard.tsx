
import React from 'react';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
      </div>
      
      <StatsCards />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions />
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Financial Overview Chart</h3>
          <p className="text-gray-500">Chart coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
