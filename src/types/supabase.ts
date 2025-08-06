export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          name: string | null;
          role: string | null;
          profile_image: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          name?: string | null;
          role?: string | null;
          profile_image?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          name?: string | null;
          role?: string | null;
          profile_image?: string | null;
          created_at?: string;
        };
      };
      time_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          date_out: string | null;
          clock_in: string | null;
          clock_out: string | null;
          type: string;
          description: string | null;
          total_hours: number;
          regular_hours: number;
          overtime_hours: number;
          overtime_with_bonus: number;
          total_final: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          date_out?: string | null;
          clock_in?: string | null;
          clock_out?: string | null;
          type: string;
          description?: string | null;
          total_hours: number;
          regular_hours: number;
          overtime_hours: number;
          overtime_with_bonus: number;
          total_final: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          date_out?: string | null;
          clock_in?: string | null;
          clock_out?: string | null;
          type?: string;
          description?: string | null;
          total_hours?: number;
          regular_hours?: number;
          overtime_hours?: number;
          overtime_with_bonus?: number;
          total_final?: number;
          created_at?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          type: string;
          shift: string;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          type: string;
          shift: string;
          start_time: string;
          end_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          type?: string;
          shift?: string;
          start_time?: string;
          end_time?: string;
          created_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          project_name: string;
          start_date: string | null;
          end_date: string | null;
          regular_hours_limit: number;
          sheet_password: string | null;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          project_name: string;
          start_date?: string | null;
          end_date?: string | null;
          regular_hours_limit: number;
          sheet_password?: string | null;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          project_name?: string;
          start_date?: string | null;
          end_date?: string | null;
          regular_hours_limit?: number;
          sheet_password?: string | null;
          updated_at?: string;
          created_by?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};