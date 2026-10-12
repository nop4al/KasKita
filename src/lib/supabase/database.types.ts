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
          status: "pending" | "paid";
          receipt_number: string | null;
          payment_method: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          period: string;
          due_date: string;
          amount: number;
          cleaning_fee: number;
          security_fee: number;
          status?: "pending" | "paid";
          receipt_number?: string | null;
          payment_method?: string | null;
          paid_at?: string | null;
          created_at?: string;
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
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
