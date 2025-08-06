import { useState, useEffect } from 'react';
import { useAppDB } from './useIndexedDB';
import { User } from '../types';

export function useLocalAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const db = useAppDB();

  // Carrega o usuário atual do localStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verifica se há um usuário autenticado no localStorage
        const storedUserId = localStorage.getItem('currentUserId');

        if (storedUserId) {
          // Busca o usuário no banco de dados
          const user = await db.getUser(storedUserId);
          
          if (user) {
            setUser(user);
          } else {
            // Se o usuário não for encontrado, limpa o localStorage
            localStorage.removeItem('currentUserId');
            setUser(null);
          }
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
  }, []);

  // Função para login com email e senha
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const user = await db.authenticateUser(email, password);

      if (user) {
        // Armazena o ID do usuário no localStorage
        localStorage.setItem('currentUserId', user.id);
        setUser(user);
        return { success: true, user };
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao fazer login' };
    } finally {
      setLoading(false);
    }
  };

  // Função para cadastro de novo usuário
  const signUp = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Verifica se o email já está em uso
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      // Cria o novo usuário
      const userId = await db.saveUser(
        {
          name,
          email,
          role: 'Profissional',
          profileImage: ''
        },
        password
      );

      if (userId) {
        // Busca o usuário recém-criado
        const newUser = await db.getUser(userId);
        
        if (newUser) {
          // Armazena o ID do usuário no localStorage
          localStorage.setItem('currentUserId', newUser.id);
          setUser(newUser);
          return { success: true, user: newUser };
        } else {
          throw new Error('Erro ao criar usuário');
        }
      } else {
        throw new Error('Erro ao criar usuário');
      }
    } catch (err) {
      console.error('Erro ao cadastrar:', err);
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao cadastrar' };
    } finally {
      setLoading(false);
    }
  };

  // Função para logout
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      // Remove o ID do usuário do localStorage
      localStorage.removeItem('currentUserId');
      setUser(null);

      return { success: true };
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer logout');
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao fazer logout' };
    } finally {
      setLoading(false);
    }
  };

  // Função para solicitar redefinição de senha
  const requestPasswordReset = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      // Verifica se o email existe
      const user = await db.getUserByEmail(email);
      if (!user) {
        throw new Error('Email não cadastrado');
      }

      // Em um sistema real, aqui seria enviado um email com um link para redefinição de senha
      // Como estamos usando um banco de dados local, vamos apenas simular o processo
      // armazenando o email no localStorage para uso posterior
      localStorage.setItem('resetPasswordEmail', email);

      return { success: true };
    } catch (err) {
      console.error('Erro ao solicitar redefinição de senha:', err);
      setError(err instanceof Error ? err.message : 'Erro ao solicitar redefinição de senha');
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao solicitar redefinição de senha' };
    } finally {
      setLoading(false);
    }
  };

  // Função para redefinir a senha
  const resetPassword = async (newPassword: string) => {
    try {
      setLoading(true);
      setError(null);

      // Recupera o email do localStorage
      const email = localStorage.getItem('resetPasswordEmail');
      if (!email) {
        throw new Error('Nenhuma solicitação de redefinição de senha encontrada');
      }

      // Busca o usuário pelo email
      const user = await db.getUserByEmail(email);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Altera a senha
      const success = await db.changePassword(user.id, newPassword);
      if (!success) {
        throw new Error('Erro ao redefinir senha');
      }

      // Remove o email do localStorage
      localStorage.removeItem('resetPasswordEmail');

      return { success: true };
    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha');
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao redefinir senha' };
    } finally {
      setLoading(false);
    }
  };

  // Função para alterar a senha do usuário atual
  const changePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Altera a senha
      const success = await db.changePassword(user.id, newPassword);
      if (!success) {
        throw new Error('Erro ao alterar senha');
      }

      return { success: true };
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao alterar senha' };
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
    requestPasswordReset,
    resetPassword,
    changePassword
  };
}