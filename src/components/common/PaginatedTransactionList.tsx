
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

const PaginatedTransactionList = ({ type, showBadges = false, maxRows = 5 }: PaginatedTransactionListProps) => {
  const { data: allTransactions = [], refetch } = useTransactions(type);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const deleteTransaction = useDeleteTransaction();

  // Auto-refresh functionality
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

  const displayTransactions = allTransactions.slice(0, maxRows);
  const hasMore = allTransactions.length > maxRows;

  if (!allTransactions?.length) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p>No transactions found</p>
        <p className="text-sm">Start by adding your first transaction</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Fixed height container with scroll when there are exactly maxRows items */}
        <div className={`${maxRows <= 3 ? 'max-h-48' : 'max-h-80'} overflow-y-auto pr-2 space-y-3`}>
          {displayTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-650 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                    {transaction.description || 'No description'}
                  </p>
                  <div className="flex items-center space-x-2">
                    {showBadges ? (
                      <Badge 
                        variant={transaction.type === 'income' ? 'default' : 'destructive'}
                        className={transaction.type === 'income' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                        }
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount), transaction.currency as 'USD' | 'KHR')}
                      </Badge>
                    ) : (
                      <span className={`font-semibold text-sm ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                        {formatCurrency(Number(transaction.amount), transaction.currency as 'USD' | 'KHR')}
                      </span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 z-50">
                        <DropdownMenuItem onClick={() => setEditingTransaction(transaction)} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingId(transaction.id)}
                          className="text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>{transaction.categories?.name || 'Uncategorized'}</span>
                  <span>•</span>
                  <span>{formatDate(transaction.transaction_date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {hasMore && (
          <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-600">
            <p className="text-xs text-slate-500 dark:text-slate-400">
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
