
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
      <Card className="bg-card border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-card-foreground">Recent Transactions</CardTitle>
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </CardHeader>
        <CardContent>
          <PaginatedTransactionList showBadges={true} maxRows={5} />
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
