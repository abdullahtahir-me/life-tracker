// src/lib/types/database.ts

export interface Domain {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface FinanceTransaction {
  id: string;
  user_id: string;
  entity_name: string;
  description: string | null;
  amount: number;
  transaction_type: "lent" | "borrowed";
  is_settled: boolean;
  created_at: string;
}


export interface Person {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  role_company: string | null;
}

export interface Project {
  id: string;
  user_id: string;
  domain_id: string | null;

  name: string;
  description: string | null;

  created_at: string;
}

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  user_id: string;

  project_id: string | null;
  domain_id: string | null;

  title: string;
  description: string | null;

  due_date: string | null;
  priority: TaskPriority;

  is_completed: boolean;

  created_at: string;
}
