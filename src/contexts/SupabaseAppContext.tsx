import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, User, TimeEntry, Schedule, Settings } from '../types';
import { useSupabaseDB } from '../hooks/useSupabaseDB';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface SupabaseAppContextType {
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
  supabaseLoading: boolean;
}

const SupabaseAppContext = createContext<SupabaseAppContextType | undefined>(undefined);

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
      const sortedTimeEntries = [...action.payload].sort((a, b) => a.date.localeCompare(b.date));
      return { ...state, timeEntries: sortedTimeEntries };
    case 'ADD_TIME_ENTRY':
      const updatedEntries = [...state.timeEntries, action.payload];
      const sortedEntries = updatedEntries.sort((a, b) => a.date.localeCompare(b.date));
      return { ...state, timeEntries: sortedEntries };
    case 'UPDATE_TIME_ENTRY':
      const updatedTimeEntries = state.timeEntries.map(entry =>
        entry.id === action.payload.id
          ? { ...entry, ...action.payload.updates }
          : entry
      );
      const sortedAfterUpdate = [...updatedTimeEntries].sort((a, b) => a.date.localeCompare(b.date));
      return { ...state, timeEntries: sortedAfterUpdate };
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

export function SupabaseAppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Hooks do Supabase
  const { 
    user: supabaseUser, 
    loading: supabaseLoading, 
    signIn, 
    signUp, 
    signOut,
    updateProfile,
    resetPassword,
    updatePassword 
  } = useSupabaseAuth();

  const db = useSupabaseDB();

  // Converte o usuário do Supabase para o formato da aplicação
  const convertSupabaseUserToAppUser = (supabaseUser: any): User | null => {
    if (!supabaseUser) return null;

    return {
      id: supabaseUser.id,
      name: supabaseUser.profile?.name || supabaseUser.user_metadata?.name || '',
      email: supabaseUser.email || '',
      role: supabaseUser.profile?.role || 'Profissional',
      profileImage: supabaseUser.profile?.profile_image || '',
      createdAt: supabaseUser.created_at || new Date().toISOString()
    };
  };

  // Carrega dados quando o usuário muda
  useEffect(() => {
    const loadData = async () => {
      if (supabaseUser) {
        try {
          // Converte e define o usuário
          const appUser = convertSupabaseUserToAppUser(supabaseUser);
          dispatch({ type: 'SET_USER', payload: appUser });

          // Carrega configurações
          const settings = await db.getSettings();
          if (settings) {
            dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
          }

          // Carrega registros de ponto
          const timeEntries = await db.getTimeEntries(supabaseUser.id);
          if (timeEntries.length > 0) {
            dispatch({ type: 'SET_TIME_ENTRIES', payload: timeEntries });
          }

          // Carrega agendamentos
          const schedules = await db.getSchedules(supabaseUser.id);
          if (schedules.length > 0) {
            dispatch({ type: 'SET_SCHEDULES', payload: schedules });
          }
        } catch (error) {
          console.error('Erro ao carregar dados do Supabase:', error);
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_TIME_ENTRIES', payload: [] });
        dispatch({ type: 'SET_SCHEDULES', payload: [] });
      }
    };

    loadData();
  }, [supabaseUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { success } = await signIn(email, password);
      return success;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { success } = await signUp(email, password, name);
      return success;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const addTimeEntry = async (entryData: Omit<TimeEntry, 'id' | 'createdAt'>) => {
    try {
      const newId = await db.saveTimeEntry(entryData);
      
      if (newId) {
        const entry: TimeEntry = {
          ...entryData,
          id: newId,
          createdAt: new Date().toISOString()
        };
        
        dispatch({ type: 'ADD_TIME_ENTRY', payload: entry });
      }
    } catch (error) {
      console.error('Erro ao adicionar registro de ponto:', error);
    }
  };

  const updateTimeEntry = async (id: string, updates: Partial<TimeEntry>) => {
    try {
      dispatch({ type: 'UPDATE_TIME_ENTRY', payload: { id, updates } });
      
      const updatedEntry = state.timeEntries.find(entry => entry.id === id);
      
      if (updatedEntry) {
        await db.updateTimeEntry({ ...updatedEntry, ...updates });
      }
    } catch (error) {
      console.error('Erro ao atualizar registro de ponto:', error);
    }
  };

  const deleteTimeEntry = async (id: string) => {
    try {
      dispatch({ type: 'DELETE_TIME_ENTRY', payload: id });
      await db.deleteTimeEntry(id);
    } catch (error) {
      console.error('Erro ao excluir registro de ponto:', error);
    }
  };

  const setCurrentView = (view: AppState['currentView']) => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
  };

  const getMonthlyReport = (month: number, year: number) => {
    const monthEntries = state.timeEntries.filter(entry => {
      const entryDate = new Date(entry.date + 'T00:00:00');
      return entryDate.getMonth() === month && entryDate.getFullYear() === year;
    });

    const sortedEntries = [...monthEntries].sort((a, b) => a.date.localeCompare(b.date));

    const totalHours = sortedEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
    const regularHours = sortedEntries.reduce((sum, entry) => sum + entry.regularHours, 0);
    const overtimeHours = sortedEntries.reduce((sum, entry) => sum + entry.overtimeHours, 0);
    
    const overtimeWithBonus = sortedEntries.reduce((sum, entry) => {
      const bonus = entry.overtimeWithBonus !== undefined ? entry.overtimeWithBonus : entry.overtimeHours * 1.5;
      return sum + bonus;
    }, 0);
    
    const totalFinal = sortedEntries.reduce((sum, entry) => {
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
      entries: sortedEntries
    };
  };

  const updateSettings = async (settings: Settings) => {
    try {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      await db.saveSettings(settings);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!state.user) {
        console.error('Nenhum usuário logado para atualizar');
        return false;
      }
      
      const updatedUser = { ...state.user, ...updates };
      dispatch({ type: 'SET_USER', payload: updatedUser });
      
      // Atualiza no Supabase
      await updateProfile({
        name: updates.name,
        role: updates.role,
        profile_image: updates.profileImage,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil do usuário:', error);
      return false;
    }
  };

  const clearTimeEntries = async () => {
    try {
      dispatch({ type: 'CLEAR_TIME_ENTRIES' });
      
      if (supabaseUser) {
        await db.clearTimeEntries(supabaseUser.id);
      }
    } catch (error) {
      console.error('Erro ao limpar registros de ponto:', error);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const { success, error } = await resetPassword(email);
      return { success, error };
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao solicitar redefinição de senha' };
    }
  };

  const changePassword = async (newPassword: string) => {
    try {
      const { success, error } = await updatePassword(newPassword);
      return { success, error };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao atualizar senha' };
    }
  };

  return (
    <SupabaseAppContext.Provider
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
        supabaseLoading
      }}
    >
      {children}
    </SupabaseAppContext.Provider>
  );
}

export const useSupabaseApp = () => {
  const context = useContext(SupabaseAppContext);
  if (!context) {
    throw new Error('useSupabaseApp must be used within a SupabaseAppProvider');
  }
  return context;
};