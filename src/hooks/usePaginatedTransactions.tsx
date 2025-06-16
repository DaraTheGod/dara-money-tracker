
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from './useTransactions';

export const usePaginatedTransactions = (type?: 'income' | 'expense', pageSize = 5) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['paginated-transactions', user?.id, type, pageSize],
    queryFn: async () => {
      if (!user) return { data: [], hasMore: false };

      let query = supabase
        .from('transactions')
        .select(`
          *,
          categories (
            id,
            name
          )
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(pageSize);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as Transaction[],
        hasMore: (count || 0) > pageSize,
        total: count || 0
      };
    },
    enabled: !!user,
  });
};

export const useLoadMoreTransactions = (type?: 'income' | 'expense', currentData: Transaction[] = []) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['load-more-transactions', user?.id, type, currentData.length],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('transactions')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(currentData.length, currentData.length + 4);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: false,
  });
};
