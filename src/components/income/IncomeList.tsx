
import React from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const IncomeList = () => {
  const { data: income = [] } = useTransactions('income', 10);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (income.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No income found</p>
        <p className="text-sm">Start by adding your first income</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {income.map((incomeItem) => (
        <div key={incomeItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">{incomeItem.description || 'No description'}</p>
              <span className="font-bold text-green-600">{formatCurrency(incomeItem.amount)}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
              <span>{incomeItem.categories?.name || 'Uncategorized'}</span>
              <span>•</span>
              <span>{format(new Date(incomeItem.transaction_date), 'MMM d, yyyy')}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
};

export default IncomeList;
