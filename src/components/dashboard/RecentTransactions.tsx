
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TransactionModal from '@/components/modals/TransactionModal';
import PaginatedTransactionList from '@/components/common/PaginatedTransactionList';

const RecentTransactions = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-900 dark:text-white">Recent Transactions</CardTitle>
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 shadow-lg text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </CardHeader>
        <CardContent>
          <PaginatedTransactionList showBadges={true} />
        </CardContent>
      </Card>

      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
};

export default RecentTransactions;
