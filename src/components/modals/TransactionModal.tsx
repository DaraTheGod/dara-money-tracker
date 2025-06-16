import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories, useCreateTransaction, useUpdateTransaction, type Transaction } from '@/hooks/useTransactions';
import { convertCurrency } from '@/utils/currency';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  defaultType?: 'income' | 'expense';
}

const TransactionModal = ({ isOpen, onClose, transaction, defaultType = 'expense' }: TransactionModalProps) => {
  const { data: categories = [] } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const [formData, setFormData] = useState({
    type: defaultType as 'income' | 'expense',
    amount: '',
    currency: 'USD' as 'USD' | 'KHR',
    category_id: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        category_id: transaction.category_id || '',
        description: transaction.description || '',
        transaction_date: transaction.transaction_date,
      });
    } else {
      setFormData({
        type: defaultType,
        amount: '',
        currency: 'USD',
        category_id: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [transaction, defaultType]);

  const handleCurrencyChange = (newCurrency: 'USD' | 'KHR') => {
    if (formData.amount && formData.currency !== newCurrency) {
      const currentAmount = parseFloat(formData.amount);
      const convertedAmount = convertCurrency(currentAmount, formData.currency, newCurrency);
      setFormData({
        ...formData,
        currency: newCurrency,
        amount: convertedAmount.toString(),
      });
    } else {
      setFormData({ ...formData, currency: newCurrency });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    try {
      if (transaction) {
        await updateTransaction.mutateAsync({ id: transaction.id, ...transactionData });
      } else {
        await createTransaction.mutateAsync(transactionData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => 
              setFormData({ ...formData, type: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="KHR">KHR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.currency === 'KHR' && formData.amount && (
            <div className="text-sm text-gray-500">
              ≈ ${(parseFloat(formData.amount) / 4000).toFixed(2)} USD
            </div>
          )}

          {formData.currency === 'USD' && formData.amount && (
            <div className="text-sm text-gray-500">
              ≈ {(parseFloat(formData.amount) * 4000).toLocaleString()} KHR
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category_id} onValueChange={(value) => 
              setFormData({ ...formData, category_id: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {transaction ? 'Update' : 'Create'} Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
