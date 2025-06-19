
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
}

const PaginatedTransactionList = ({ type, showBadges = false }: PaginatedTransactionListProps) => {
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

  if (!allTransactions?.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No transactions found</p>
        <p className="text-sm">Start by adding your first transaction</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {allTransactions.map((transaction, index) => (
          <div 
            key={transaction.id} 
            className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-650 transition-colors ${
              index >= 5 ? 'opacity-90' : ''
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {transaction.description || 'No description'}
                </p>
                <div className="flex items-center space-x-2">
                  {showBadges ? (
                    <Badge 
                      variant={transaction.type === 'income' ? 'default' : 'destructive'}
                      className={transaction.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}
                    >
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount), transaction.currency as 'USD' | 'KHR')}
                    </Badge>
                  ) : (
                    <span className={`font-semibold text-sm ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(Number(transaction.amount), transaction.currency as 'USD' | 'KHR')}
                    </span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <DropdownMenuItem onClick={() => setEditingTransaction(transaction)} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeletingId(transaction.id)}
                        className="text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{transaction.categories?.name || 'Uncategorized'}</span>
                <span>•</span>
                <span>{formatDate(transaction.transaction_date)}</span>
              </div>
            </div>
          </div>
        ))}
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
