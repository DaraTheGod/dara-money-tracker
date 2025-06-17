
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCategories, useCreateTransaction, useUpdateTransaction, Transaction, useTransactions } from '@/hooks/useTransactions';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast"

const FormSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number.",
  }),
  currency: z.enum(['USD', 'KHR']),
  category_id: z.string().nullable(),
  description: z.string().optional(),
  transaction_date: z.date(),
});

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  defaultType?: 'income' | 'expense';
}

const TransactionModal = ({ isOpen, onClose, transaction, defaultType }: TransactionModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balanceWarning, setBalanceWarning] = useState<string>('');
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: transactions = [] } = useTransactions();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      type: defaultType || 'expense',
      amount: '',
      currency: 'USD',
      category_id: null,
      description: '',
      transaction_date: new Date(),
    },
  });

  // Reset form when modal opens with transaction data
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        form.reset({
          type: transaction.type,
          amount: transaction.amount?.toString() || '',
          currency: transaction.currency as 'USD' | 'KHR',
          category_id: transaction.category_id || null,
          description: transaction.description || '',
          transaction_date: transaction ? new Date(transaction.transaction_date) : new Date(),
        });
      } else {
        form.reset({
          type: defaultType || 'expense',
          amount: '',
          currency: 'USD',
          category_id: null,
          description: '',
          transaction_date: new Date(),
        });
      }
      setBalanceWarning('');
    }
  }, [isOpen, transaction, defaultType, form]);

  // Calculate current balances by currency
  const balanceUSD = transactions
    .filter(t => t.currency === 'USD')
    .reduce((balance, t) => {
      return t.type === 'income' ? balance + Number(t.amount) : balance - Number(t.amount);
    }, 0);

  const balanceKHR = transactions
    .filter(t => t.currency === 'KHR')
    .reduce((balance, t) => {
      return t.type === 'income' ? balance + Number(t.amount) : balance - Number(t.amount);
    }, 0);

  // Check balance when amount or currency changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if ((name === 'amount' || name === 'currency' || name === 'type') && value.type === 'expense' && value.amount) {
        const amount = parseFloat(value.amount);
        if (!isNaN(amount) && amount > 0) {
          const currentBalance = value.currency === 'USD' ? balanceUSD : balanceKHR;
          if (amount > currentBalance) {
            setBalanceWarning(`Insufficient balance. Available: ${amount.toLocaleString()} ${value.currency}`);
          } else {
            setBalanceWarning('');
          }
        }
      } else {
        setBalanceWarning('');
      }
    });
    return () => subscription.unsubscribe();
  }, [form, balanceUSD, balanceKHR]);

  const handleClose = () => {
    form.reset();
    setBalanceWarning('');
    onClose();
  };

  const onSubmit = async (data: any) => {
    // Check balance for expenses
    if (data.type === 'expense') {
      const amount = parseFloat(data.amount);
      const currentBalance = data.currency === 'USD' ? balanceUSD : balanceKHR;
      if (amount > currentBalance) {
        toast({
          title: "Insufficient Balance",
          description: `Insufficient ${data.currency} balance. Available: ${currentBalance.toLocaleString()} ${data.currency}`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const amount = parseFloat(data.amount);
      
      const transactionData = {
        type: data.type,
        amount: amount,
        currency: data.currency,
        category_id: data.category_id || null,
        description: data.description,
        transaction_date: data.transaction_date,
      };

      if (transaction) {
        await updateTransaction.mutateAsync({
          id: transaction.id,
          ...transactionData,
        });
      } else {
        await createTransaction.mutateAsync(transactionData);
        
        // Dispatch custom event for auto-refresh
        window.dispatchEvent(new Event('transactionAdded'));
      }

      handleClose();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-black/60 flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {balanceWarning && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">{balanceWarning}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="KHR">KHR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ''} disabled={isLoadingCategories}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {categories?.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description"
                        className="resize-none bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transaction_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Transaction Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !!balanceWarning}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
