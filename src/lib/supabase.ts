import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          is_cse_student: boolean;
          year_of_study: number | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          is_cse_student?: boolean;
          year_of_study?: number | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          is_cse_student?: boolean;
          year_of_study?: number | null;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          frequency: 'daily' | 'weekly';
          target_count: number;
          difficulty: 'easy' | 'medium' | 'hard';
          is_active: boolean;
          created_at: string;
          updated_at: string;
          icon: string;
          color: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category: string;
          frequency: 'daily' | 'weekly';
          target_count?: number;
          difficulty: 'easy' | 'medium' | 'hard';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          icon: string;
          color: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          frequency?: 'daily' | 'weekly';
          target_count?: number;
          difficulty?: 'easy' | 'medium' | 'hard';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          icon?: string;
          color?: string;
        };
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_at: string;
          proof_image_url: string | null;
          notes: string | null;
          mood_rating: number | null;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          completed_at?: string;
          proof_image_url?: string | null;
          notes?: string | null;
          mood_rating?: number | null;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          completed_at?: string;
          proof_image_url?: string | null;
          notes?: string | null;
          mood_rating?: number | null;
        };
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          creator_id: string;
          start_date: string;
          end_date: string;
          is_active: boolean;
          max_participants: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          creator_id: string;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          max_participants?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          creator_id?: string;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          max_participants?: number | null;
          created_at?: string;
        };
      };
    };
  };
};