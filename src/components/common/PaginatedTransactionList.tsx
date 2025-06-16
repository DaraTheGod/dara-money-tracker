
import React, { useState } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePaginatedTransactions, useLoadMoreTransactions } from '@/hooks/usePaginatedTransactions';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { formatCurrency } from '@/utils/currency';
import TransactionModal from '@/components/modals/TransactionModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

interface PaginatedTransactionListProps {
  type?: 'income' | 'expense';
  showBadges?: boolean;
}

const PaginatedTransactionList = ({ type, showBadges = false }: PaginatedTransactionListProps) => {
  const { data: paginatedData } = usePaginatedTransactions(type, 5);
  const [allTransactions, setAllTransactions] = useState(paginatedData?.data || []);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const loadMoreQuery = useLoadMoreTransactions(type, allTransactions);
  const deleteTransaction = useDeleteTransaction();

  React.useEffect(() => {
    if (paginatedData?.data) {
      setAllTransactions(paginatedData.data);
    }
  }, [paginatedData?.data]);

  const loadMore = async () => {
    const moreData = await loadMoreQuery.refetch();
    if (moreData.data) {
      setAllTransactions(prev => [...prev, ...moreData.data]);
    }
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteTransaction.mutateAsync(deletingId);
      setDeletingId(null);
      setAllTransactions(prev => prev.filter(t => t.id !== deletingId));
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  if (!paginatedData?.data?.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No transactions found</p>
        <p className="text-sm">Start by adding your first transaction</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {allTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-white">
                  {transaction.description || 'No description'}
                </p>
                {showBadges ? (
                  <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount), 'USD')}
                  </Badge>
                ) : (
                  <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Number(transaction.amount), 'USD')}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span>{transaction.categories?.name || 'Uncategorized'}</span>
                <span>•</span>
                <span>{formatDate(transaction.transaction_date)}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditingTransaction(transaction)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setDeletingId(transaction.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        
        {paginatedData?.hasMore && allTransactions.length < (paginatedData?.total || 0) && (
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loadMoreQuery.isFetching}
            className="w-full"
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            {loadMoreQuery.isFetching ? 'Loading...' : 'Load More'}
          </Button>
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
