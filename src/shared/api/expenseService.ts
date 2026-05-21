import type {
    TransactionFilters,
    TransactionInput,
    TransactionRecord,
} from "@/entities/finance/model/types";
import { supabase } from "@/shared/api/supabase";

const TRANSACTIONS_TABLE = "transactions";

const normalizeDescription = (value: string) => value.trim();

const buildTransactionsQuery = (userId: string, filters: TransactionFilters) => {
  let query = supabase
    .from(TRANSACTIONS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.search?.trim()) {
    query = query.ilike("description", `%${filters.search.trim()}%`);
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  return query;
};

export const expenseService = {
  async list(userId: string, filters: TransactionFilters) {
    const { data, error } = await buildTransactionsQuery(userId, filters);
    if (error) throw error;
    return (data ?? []) as TransactionRecord[];
  },

  async create(userId: string, input: TransactionInput) {
    const payload = {
      user_id: userId,
      description: normalizeDescription(input.description),
      amount: input.amount,
      category: input.category,
      type: input.type,
      transaction_date: input.transaction_date,
    };

    const { data, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    return data as TransactionRecord;
  },

  async update(userId: string, transactionId: string, input: TransactionInput) {
    const { data, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .update({
        description: normalizeDescription(input.description),
        amount: input.amount,
        category: input.category,
        type: input.type,
        transaction_date: input.transaction_date,
      })
      .eq("id", transactionId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return data as TransactionRecord;
  },

  async remove(userId: string, transactionId: string) {
    const { error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .delete()
      .eq("id", transactionId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

  async updateProfile(input: { email: string; fullName: string; phone: string; avatarUrl?: string | null }) {
    const { data, error } = await supabase.auth.updateUser({
      email: input.email.trim(),
      data: {
        full_name: input.fullName.trim(),
        phone: input.phone.trim(),
        avatar_url: input.avatarUrl ?? null,
      },
    });

    if (error) throw error;
    return data;
  },
};