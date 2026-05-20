export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "alimentacion"
  | "transporte"
  | "servicios"
  | "educacion"
  | "salario"
  | "otros";

export interface TransactionRecord {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionInput {
  description: string;
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  transaction_date: string;
}

export interface TransactionFilters {
  search?: string;
  category?: TransactionCategory | "all";
  type?: TransactionType | "all";
}