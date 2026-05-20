import type {
    TransactionFilters,
    TransactionInput,
} from "@/entities/finance/model/types";
import { expenseService } from "@/shared/api/expenseService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const transactionsQueryKey = (userId: string, filters: TransactionFilters) => [
  "finance",
  "transactions",
  userId,
  filters.search ?? "",
  filters.category ?? "all",
  filters.type ?? "all",
] as const;

export const useFinance = (userId: string | undefined, filters: TransactionFilters) => {
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: userId ? transactionsQueryKey(userId, filters) : ["finance", "transactions", "anonymous"],
    queryFn: () => {
      if (!userId) {
        return Promise.resolve([]);
      }

      return expenseService.list(userId, filters);
    },
    enabled: Boolean(userId),
  });

  const invalidateTransactions = () => {
    if (!userId) return;
    queryClient.invalidateQueries({ queryKey: ["finance", "transactions", userId] });
  };

  const createTransaction = useMutation({
    mutationFn: async (input: TransactionInput) => {
      if (!userId) throw new Error("No hay usuario autenticado.");
      return expenseService.create(userId, input);
    },
    onSuccess: invalidateTransactions,
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ transactionId, input }: { transactionId: string; input: TransactionInput }) => {
      if (!userId) throw new Error("No hay usuario autenticado.");
      return expenseService.update(userId, transactionId, input);
    },
    onSuccess: invalidateTransactions,
  });

  const deleteTransaction = useMutation({
    mutationFn: async (transactionId: string) => {
      if (!userId) throw new Error("No hay usuario autenticado.");
      await expenseService.remove(userId, transactionId);
    },
    onSuccess: invalidateTransactions,
  });

  const changePassword = useMutation({
    mutationFn: async (newPassword: string) => expenseService.updatePassword(newPassword),
  });

  return {
    transactions: transactionsQuery.data ?? [],
    isTransactionsLoading: transactionsQuery.isLoading,
    isTransactionsFetching: transactionsQuery.isFetching,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    changePassword,
    refetchTransactions: transactionsQuery.refetch,
  };
};