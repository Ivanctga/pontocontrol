import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Inicializa o cliente Supabase com as variáveis de ambiente
// Estas URLs devem ser substituídas pelas suas credenciais reais do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verifica se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL e Anon Key são necessários. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
}

// Cria e exporta o cliente Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);