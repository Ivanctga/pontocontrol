import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, User, TimeEntry, Schedule, Settings } from '../types';
import { useAppDB } from '../hooks/useIndexedDB';
import { useLocalAuth } from '../hooks/useLocalAuth';

interface AppContextType {
  state: AppState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => void;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;
  setCurrentView: (view: AppState['currentView']) => void;
  getMonthlyReport: (month: number, year: number) => any;
  updateSettings: (settings: Settings) => void;
  updateUserProfile: (updates: Partial<User>) => Promise<boolean>;
  clearTimeEntries: () => void;
  requestPasswordReset: (email: string) => Promise<{success: boolean, error?: string}>;
  changePassword: (newPassword: string) => Promise<{success: boolean, error?: string}>;
  currentUser: User | null;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TIME_ENTRIES'; payload: TimeEntry[] }
  | { type: 'ADD_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'UPDATE_TIME_ENTRY'; payload: { id: string; updates: Partial<TimeEntry> } }
  | { type: 'DELETE_TIME_ENTRY'; payload: string }
  | { type: 'SET_SCHEDULES'; payload: Schedule[] }
  | { type: 'SET_CURRENT_VIEW'; payload: AppState['currentView'] }
  | { type: 'UPDATE_SETTINGS'; payload: Settings }
  | { type: 'CLEAR_TIME_ENTRIES' };

const initialState: AppState = {
  user: null,
  timeEntries: [],
  schedules: [],
  settings: {
    projectName: 'PlantonControl',
    regularHoursLimit: 24,
    updatedAt: new Date().toISOString()
  },
  currentView: 'dashboard'
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_TIME_ENTRIES':
      // Ordena as entradas por data ao carregá-las
      const sortedTimeEntries = [...action.payload].sort((a, b) => a.date.localeCompare(b.date));
      return { ...state, timeEntries: sortedTimeEntries };
    case 'ADD_TIME_ENTRY':
      // Adiciona a nova entrada e ordena todas as entradas por data
      const updatedEntries = [...state.timeEntries, action.payload];
      const sortedEntries = updatedEntries.sort((a, b) => a.date.localeCompare(b.date));
      return { ...state, timeEntries: sortedEntries };
    case 'UPDATE_TIME_ENTRY':
      // Atualiza a entrada e depois reordena todas as entradas por data
      const updatedTimeEntries = state.timeEntries.map(entry =>
        entry.id === action.payload.id
          ? { ...entry, ...action.payload.updates }
          : entry
      );
      // Ordena as entradas por data após a atualização
      const sortedAfterUpdate = [...updatedTimeEntries].sort((a, b) => a.date.localeCompare(b.date));
      return {
        ...state,
        timeEntries: sortedAfterUpdate
      };
    case 'DELETE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.filter(entry => entry.id !== action.payload)
      };
    case 'SET_SCHEDULES':
      return { ...state, schedules: action.payload };
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    case 'CLEAR_TIME_ENTRIES':
      return { ...state, timeEntries: [] };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Inicializa o hook do banco de dados local para operações de banco de dados
  const db = useAppDB();
  
  // Inicializa o hook de autenticação local
  const { 
    user: currentUser, 
    loading, 
    login: signIn, 
    signUp, 
    signOut,
    updateProfile,
    resetPassword,
    updatePassword 
  } = useLocalAuth();

  // Carrega dados do banco de dados local ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      try {
        if (currentUser) {
          // Tenta carregar as configurações
          const settings = await db.getSettings();
          if (settings) {
            dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
          }

          // Carrega os registros de ponto do usuário atual
          const timeEntries = await db.getTimeEntries(currentUser.id);
          if (timeEntries.length > 0) {
            dispatch({ type: 'SET_TIME_ENTRIES', payload: timeEntries });
          }

          // Carrega os agendamentos do usuário atual
          const schedules = await db.getSchedules(currentUser.id);
          if (schedules.length > 0) {
            dispatch({ type: 'SET_SCHEDULES', payload: schedules });
          }

          // Atualiza o usuário no estado da aplicação
          dispatch({ type: 'SET_USER', payload: currentUser });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do banco de dados local:', error);
      }
    };

    loadData();
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Usa a autenticação local
      const { success, error } = await signIn(email, password);
      
      if (!success) {
        console.error('Erro ao fazer login:', error);
        return false;
      }
      
      // O carregamento dos dados do usuário é feito automaticamente pelo useEffect
      // que observa mudanças em currentUser
      return true;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Usa a autenticação local para registrar o usuário
      const { success, error } = await signUp(email, password, name);
      
      if (!success) {
        console.error('Erro ao registrar usuário:', error);
        return false;
      }
      
      // O carregamento dos dados do usuário é feito automaticamente pelo useEffect
      // que observa mudanças em currentUser
      
      return true;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Usa a autenticação local para fazer logout
      const { success } = await signOut();
      
      if (success) {
        // Limpa o usuário do estado da aplicação
        dispatch({ type: 'SET_USER', payload: null });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const addTimeEntry = async (entryData: Omit<TimeEntry, 'id' | 'createdAt'>) => {
    try {
      // Salva a entrada no banco de dados local e obtém o ID gerado
      const newId = await db.saveTimeEntry(entryData);
      
      if (newId) {
        const entry: TimeEntry = {
          ...entryData,
          id: newId,
          createdAt: new Date().toISOString()
        };
        
        // Adiciona a entrada ao estado e ordena todas as entradas por data
        dispatch({ type: 'ADD_TIME_ENTRY', payload: entry });
      }
    } catch (error) {
      console.error('Erro ao adicionar registro de ponto:', error);
    }
  };

  const updateTimeEntry = async (id: string, updates: Partial<TimeEntry>) => {
    try {
      // Primeiro atualiza o estado
      dispatch({ type: 'UPDATE_TIME_ENTRY', payload: { id, updates } });
      
      // Encontra a entrada atualizada no estado
      const updatedEntry = state.timeEntries.find(entry => entry.id === id);
      
      // Se encontrou, atualiza no banco de dados local
      if (updatedEntry) {
        await db.updateTimeEntry({ ...updatedEntry, ...updates });
      }
    } catch (error) {
      console.error('Erro ao atualizar registro de ponto:', error);
    }
  };

  const setCurrentView = (view: AppState['currentView']) => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
  };

  const getMonthlyReport = (month: number, year: number) => {
    // Filtra as entradas do mês e ano selecionados
    const monthEntries = state.timeEntries.filter(entry => {
      const entryDate = new Date(entry.date + 'T00:00:00');
      return entryDate.getMonth() === month && entryDate.getFullYear() === year;
    });

    // Ordena as entradas por data em ordem cronológica crescente
    const sortedEntries = [...monthEntries].sort((a, b) => {
      // Compara as datas no formato ISO (YYYY-MM-DD)
      return a.date.localeCompare(b.date);
    });

    const totalHours = sortedEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
    const regularHours = sortedEntries.reduce((sum, entry) => sum + entry.regularHours, 0);
    const overtimeHours = sortedEntries.reduce((sum, entry) => sum + entry.overtimeHours, 0);
    
    // Calcular horas extras com bônus (50%)
    const overtimeWithBonus = sortedEntries.reduce((sum, entry) => {
      // Se o campo existir, use-o, caso contrário calcule
      const bonus = entry.overtimeWithBonus !== undefined ? entry.overtimeWithBonus : entry.overtimeHours * 1.5;
      return sum + bonus;
    }, 0);
    
    // Calcular total final (horas regulares + horas extras com bônus)
    const totalFinal = sortedEntries.reduce((sum, entry) => {
      // Se o campo existir, use-o, caso contrário calcule
      const final = entry.totalFinal !== undefined ? entry.totalFinal : entry.regularHours + (entry.overtimeHours * 1.5);
      return sum + final;
    }, 0);
    
    const extraordinaryHours = sortedEntries
      .filter(entry => entry.type === 'extraordinary')
      .reduce((sum, entry) => sum + entry.totalHours, 0);

    return {
      month: new Date(year, month).toLocaleString('pt-BR', { month: 'long' }),
      year,
      totalHours,
      regularHours,
      overtimeHours,
      overtimeWithBonus,
      totalFinal,
      extraordinaryHours,
      entries: sortedEntries // Retorna as entradas ordenadas por data
    };
  };

  const updateSettings = async (settings: Settings) => {
    try {
      // Atualiza o estado
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      
      // Salva no banco de dados local
      await db.saveSettings(settings);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
    }
  };

  const deleteTimeEntry = async (id: string) => {
    try {
      // Primeiro remove do estado
      dispatch({ type: 'DELETE_TIME_ENTRY', payload: id });
      
      // Depois remove do banco de dados local
      await db.deleteTimeEntry(id);
    } catch (error) {
      console.error('Erro ao excluir registro de ponto:', error);
    }
  };

  const clearTimeEntries = async () => {
    try {
      // Limpa do estado
      dispatch({ type: 'CLEAR_TIME_ENTRIES' });
      
      // Limpa do banco de dados local para o usuário atual
      if (currentUser) {
        await db.clearTimeEntries(currentUser.id);
      }
    } catch (error) {
      console.error('Erro ao limpar registros de ponto:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!state.user) {
        console.error('Nenhum usuário logado para atualizar');
        return false;
      }
      
      // Atualiza o usuário com as novas informações
      const updatedUser = { ...state.user, ...updates };
      
      // Atualiza o estado
      dispatch({ type: 'SET_USER', payload: updatedUser });
      
      // Atualiza o perfil no banco de dados local
      if (currentUser) {
        // Atualiza o perfil usando o hook de autenticação
        await updateProfile({
          name: updates.name,
          role: updates.role,
          profileImage: updates.profileImage,
        });
        
        // Também atualiza usando o hook de banco de dados
        await db.updateUser(updatedUser);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil do usuário:', error);
      return false;
    }
  };

  // Função para solicitar redefinição de senha
  const requestPasswordReset = async (email: string) => {
    try {
      const { success, error } = await resetPassword(email);
      
      if (!success) {
        throw new Error(error);
      }
      
      return { success };
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao solicitar redefinição de senha' };
    }
  };

  // Função para atualizar a senha do usuário
  const changePassword = async (newPassword: string) => {
    try {
      const { success, error } = await updatePassword(newPassword);
      
      if (!success) {
        throw new Error(error);
      }
      
      return { success };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao atualizar senha' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        addTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        setCurrentView,
        getMonthlyReport,
        updateSettings,
        updateUserProfile,
        clearTimeEntries,
        requestPasswordReset,
        changePassword,
        currentUser,
        loading
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};