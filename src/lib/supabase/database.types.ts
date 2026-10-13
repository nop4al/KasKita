export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nama: string;
          email: string;
          role: "admin" | "warga";
          status: "active" | "pending";
          no_rumah: string | null;
          no_hp: string | null;
          blok: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          nama: string;
          email: string;
          role?: "admin" | "warga";
          status?: "active" | "pending";
          no_rumah?: string | null;
          no_hp?: string | null;
          blok?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      ledger_transactions: {
        Row: {
          id: string;
          receipt_number: string;
          transaction_date: string;
          description: string;
          amount: number;
          type: "income" | "expense";
          category: string;
          person_in_charge: string;
          created_by: string | null;
          created_at: string;
          due_id: string | null;
          source_type: "manual" | "dues";
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          receipt_number: string;
          transaction_date: string;
          description: string;
          amount: number;
          type: "income" | "expense";
          category: string;
          person_in_charge: string;
          created_by?: string | null;
          created_at?: string;
          due_id?: string | null;
          source_type?: "manual" | "dues";
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ledger_transactions"]["Insert"]>;
        Relationships: [];
      };
      dues: {
        Row: {
          id: string;
          user_id: string;
          period: string;
          due_date: string;
          amount: number;
          cleaning_fee: number;
          security_fee: number;
          status: "pending" | "awaiting_verification" | "paid";
          receipt_number: string | null;
          payment_method: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string | null;
          source_transaction_id: string | null;
          idempotency_key: string | null;
          payment_reference: string | null;
          payment_submitted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          period: string;
          due_date: string;
          amount: number;
          cleaning_fee: number;
          security_fee: number;
          status?: "pending" | "awaiting_verification" | "paid";
          receipt_number?: string | null;
          payment_method?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
          source_transaction_id?: string | null;
          idempotency_key?: string | null;
          payment_reference?: string | null;
          payment_submitted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["dues"]["Insert"]>;
        Relationships: [];
      };
      app_settings: {
        Row: {
          id: number;
          monthly_dues: number;
          cleaning_fee: number;
          security_fee: number;
          due_day: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          monthly_dues?: number;
          cleaning_fee?: number;
          security_fee?: number;
          due_day?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["app_settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      ledger_summary: {
        Row: {
          total_income: number;
          total_expense: number;
          balance: number;
          month_income: number;
          month_expense: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      generate_due_invoices: {
        Args: {
          target_period?: string | null;
          target_user_id?: string | null;
          force_refresh?: boolean;
        };
        Returns: {
          generated_count: number;
          updated_count: number;
          skipped_count: number;
        }[];
      };
      pay_due_invoice: {
        Args: {
          due_id_param: string;
          payment_method: string;
          payment_reference?: string | null;
          idempotency_key?: string | null;
          paid_by_user_id?: string | null;
        };
        Returns: {
          due_id: string;
          status: string;
          receipt_number: string;
          transaction_id: string;
        }[];
      };
      request_due_payment: {
        Args: {
          due_id_param: string;
          payment_method_param: string;
          payment_reference_param?: string | null;
        };
        Returns: {
          due_id: string;
          status: string;
          payment_submitted_at: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
