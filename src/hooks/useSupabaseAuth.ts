import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { User } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface UserWithProfile extends User {
  profile?: Profile;
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega o usuário atual e seu perfil
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verifica se há um usuário autenticado
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          // Busca o perfil do usuário
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
            console.error('Erro ao buscar perfil:', profileError);
          }

          // Combina o usuário com seu perfil
          const userWithProfile: UserWithProfile = {
            ...session.user,
            profile: profile || undefined
          };

          setUser(userWithProfile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Configura o listener para mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Busca o perfil do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Combina o usuário com seu perfil
        const userWithProfile: UserWithProfile = {
          ...session.user,
          profile: profile || undefined
        };

        setUser(userWithProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Função para login com email e senha
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      return { success: true, data };
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao fazer login' };
    } finally {
      setLoading(false);
    }
  };

  // Função para registro com email e senha
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);

      // Registra o usuário
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name, // Armazena o nome nos metadados do usuário
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // O perfil é criado automaticamente pelo trigger handle_new_user
      // Não tentamos criar o perfil manualmente para evitar conflitos

      return { success: true, data };
    } catch (err) {
      console.error('Erro ao registrar:', err);
      setError(err instanceof Error ? err.message : 'Erro ao registrar');
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao registrar' };
    } finally {
      setLoading(false);
    }
  };

  // Função para logout
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      return { success: true };
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer logout');
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao fazer logout' };
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar o perfil do usuário
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Atualiza o perfil no Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Atualiza o usuário local com o perfil atualizado
      if (user.profile) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            ...updates,
            updated_at: new Date().toISOString(),
          },
        });
      }

      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar perfil' };
    } finally {
      setLoading(false);
    }
  };

  // Função para enviar e-mail de redefinição de senha
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (err) {
      console.error('Erro ao enviar e-mail de redefinição de senha:', err);
      setError(err instanceof Error ? err.message : 'Erro ao enviar e-mail de redefinição de senha');
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao enviar e-mail de redefinição de senha' };
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar a senha do usuário
  const updatePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar senha:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar senha');
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar senha' };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
  };
}