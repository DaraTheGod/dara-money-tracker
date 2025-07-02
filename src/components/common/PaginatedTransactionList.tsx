import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import { formatCurrency } from '@/utils/currency';
import TransactionModal from '@/components/modals/TransactionModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

interface PaginatedTransactionListProps {
  type?: 'income' | 'expense';
  showBadges?: boolean;
  maxRows?: number;
}

const PaginatedTransactionList = ({ type, showBadges = false, maxRows = 4 }: PaginatedTransactionListProps) => {
  const { data: allTransactions = [], refetch } = useTransactions(type);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const deleteTransaction = useDeleteTransaction();

  useEffect(() => {
    const handleStorageChange = () => {
      refetch();
    };

    window.addEventListener('transactionAdded', handleStorageChange);
    
    return () => {
      window.removeEventListener('transactionAdded', handleStorageChange);
    };
  }, [refetch]);

  const handleDelete = async () => {
    if (deletingId) {
      await deleteTransaction.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  if (!allTransactions?.length) {
    return (
      <div className="text-center py-8 text-foreground/70">
        <p>No transactions found</p>
        <p className="text-sm">Start by adding your first transaction</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className={`${maxRows <= 3 ? 'max-h-60' : 'max-h-100'} overflow-y-auto pr-2 space-y-2`}>
          {allTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-3 bg-card rounded-[var(--radius)] border border-border hover:bg-card/90 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground text-sm">
                    {transaction.description || 'No description'}
                  </p>
                  <div className="flex items-center space-x-2">
                    {showBadges ? (
                      <Badge 
                        variant="default"
                        className={transaction.type === 'income' ? 'text-income text-sm' : 'text-expense text-sm'}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount), transaction.currency as 'USD' | 'KHR')}
                      </Badge>
                    ) : (
                      <span className={`font-semibold text-sm ${transaction.type === 'income' ? 'text-income' : 'text-expense'}`}>
                        {formatCurrency(Number(transaction.amount), transaction.currency as 'USD' | 'KHR')}
                      </span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-foreground/70 hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border border-border">
                        <DropdownMenuItem onClick={() => setEditingTransaction(transaction)} className="text-foreground hover:bg-card/90">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingId(transaction.id)}
                          className="text-expense hover:bg-card/90"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-foreground/70 mt-1">
                  <span>{transaction.categories?.name || 'Uncategorized'}</span>
                  <span>•</span>
                  <span>{formatDate(transaction.transaction_date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {allTransactions.length > maxRows && (
          <div className="text-center pt-2 border-t border-border">
            <p className="text-xs text-foreground/70">
              Showing {maxRows} of {allTransactions.length} transactions
            </p>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
      />

      <DeleteConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </>
  );
};

export default PaginatedTransactionList;