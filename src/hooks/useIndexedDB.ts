import { useState } from 'react';
import { useIndexedDB } from 'react-indexed-db-hook';
import { User, TimeEntry, Schedule, Settings } from '../types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Hook para gerenciar usuários
export const useUsersDB = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const usersDB = useIndexedDB('users');
  const authDB = useIndexedDB('auth');
  const profileImagesDB = useIndexedDB('profileImages');

  const getUser = async (id: string): Promise<User | undefined> => {
    try {
      setLoading(true);
      setError(null);

      const user = await usersDB.getByID(id);
      return user as User;
    } catch (err) {
      console.error('Error getting user:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuário');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const getUserByEmail = async (email: string): Promise<User | undefined> => {
    try {
      setLoading(true);
      setError(null);

      const auth = await authDB.getAll();
      const authRecord = auth.find(a => a.email === email);
      
      if (authRecord) {
        const user = await usersDB.getByID(authRecord.userId);
        return user as User;
      }
      
      return undefined;
    } catch (err) {
      console.error('Error getting user by email:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuário por email');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async (): Promise<User[]> => {
    try {
      setLoading(true);
      setError(null);

      const users = await usersDB.getAll();
      return users as User[];
    } catch (err) {
      console.error('Error getting users:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuários');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (userData: Omit<User, 'id' | 'createdAt'>, password: string): Promise<string | undefined> => {
    try {
      setLoading(true);
      setError(null);

      // Verifica se o email já existe
      const existingUser = await getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      // Gera um ID único para o usuário
      const userId = uuidv4();
      const now = new Date().toISOString();

      // Cria o objeto de usuário
      const user: User = {
        id: userId,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'Profissional',
        profileImage: userData.profileImage || '',
        createdAt: now
      };

      // Salva o usuário
      await usersDB.add(user);

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Salva as credenciais de autenticação
      await authDB.add({
        id: uuidv4(),
        email: userData.email,
        password: hashedPassword,
        userId: userId
      });

      return userId;
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar usuário');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User> & { id: string }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Busca o usuário atual
      const currentUser = await usersDB.getByID(userData.id);
      if (!currentUser) {
        throw new Error('Usuário não encontrado');
      }

      // Atualiza o usuário
      await usersDB.update({
        ...currentUser,
        ...userData,
        updated_at: new Date().toISOString()
      });

      return true;
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const authenticateUser = async (email: string, password: string): Promise<User | undefined> => {
    try {
      setLoading(true);
      setError(null);

      // Busca as credenciais de autenticação
      const auth = await authDB.getAll();
      const authRecord = auth.find(a => a.email === email);
      
      if (!authRecord) {
        throw new Error('Credenciais inválidas');
      }

      // Verifica a senha
      const isPasswordValid = await bcrypt.compare(password, authRecord.password);
      if (!isPasswordValid) {
        throw new Error('Credenciais inválidas');
      }

      // Busca o usuário
      const user = await usersDB.getByID(authRecord.userId);
      return user as User;
    } catch (err) {
      console.error('Error authenticating user:', err);
      setError(err instanceof Error ? err.message : 'Erro ao autenticar usuário');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (userId: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Busca o usuário
      const user = await usersDB.getByID(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Busca as credenciais de autenticação
      const auth = await authDB.getAll();
      const authRecord = auth.find(a => a.userId === userId);
      
      if (!authRecord) {
        throw new Error('Credenciais não encontradas');
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Atualiza a senha
      await authDB.update({
        ...authRecord,
        password: hashedPassword
      });

      return true;
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveProfileImage = async (userId: string, imageData: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Verifica se já existe uma imagem para este usuário
      const existingImages = await profileImagesDB.getAll();
      const existingImage = existingImages.find(img => img.userId === userId);

      if (existingImage) {
        // Atualiza a imagem existente
        await profileImagesDB.update({
          ...existingImage,
          imageData,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Cria um novo registro de imagem
        await profileImagesDB.add({
          id: uuidv4(),
          userId,
          imageData,
          updatedAt: new Date().toISOString()
        });
      }

      // Atualiza a referência no usuário
      const user = await usersDB.getByID(userId);
      if (user) {
        await usersDB.update({
          ...user,
          profileImage: 'local',
          updated_at: new Date().toISOString()
        });
      }

      return true;
    } catch (err) {
      console.error('Error saving profile image:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar imagem de perfil');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getProfileImage = async (userId: string): Promise<string | undefined> => {
    try {
      setLoading(true);
      setError(null);

      const images = await profileImagesDB.getAll();
      const image = images.find(img => img.userId === userId);
      
      return image?.imageData;
    } catch (err) {
      console.error('Error getting profile image:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar imagem de perfil');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return {
    getUser,
    getUserByEmail,
    getUsers,
    saveUser,
    updateUser,
    authenticateUser,
    changePassword,
    saveProfileImage,
    getProfileImage,
    loading,
    error
  };
};

// Hook para gerenciar registros de ponto
export const useTimeEntriesDB = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeEntriesDB = useIndexedDB('timeEntries');

  const getTimeEntries = async (userId?: string): Promise<TimeEntry[]> => {
    try {
      setLoading(true);
      setError(null);

      const entries = await timeEntriesDB.getAll();
      
      // Filtra por usuário se um ID for fornecido
      const filteredEntries = userId
        ? entries.filter(entry => entry.userId === userId)
        : entries;
      
      return filteredEntries as TimeEntry[];
    } catch (err) {
      console.error('Error getting time entries:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar registros de ponto');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const saveTimeEntry = async (entry: Omit<TimeEntry, 'id' | 'createdAt'>): Promise<string | undefined> => {
    try {
      setLoading(true);
      setError(null);

      const newId = uuidv4();
      const now = new Date().toISOString();

      const newEntry: TimeEntry = {
        id: newId,
        userId: entry.userId,
        date: entry.date,
        dateOut: entry.dateOut,
        clockIn: entry.clockIn,
        clockOut: entry.clockOut,
        type: entry.type,
        description: entry.description,
        totalHours: entry.totalHours,
        regularHours: entry.regularHours,
        overtimeHours: entry.overtimeHours,
        overtimeWithBonus: entry.overtimeWithBonus,
        totalFinal: entry.totalFinal,
        createdAt: now
      };

      await timeEntriesDB.add(newEntry);

      return newId;
    } catch (err) {
      console.error('Error saving time entry:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar registro de ponto');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const updateTimeEntry = async (id: string, updates: Partial<TimeEntry>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Busca o registro atual
      const currentEntry = await timeEntriesDB.getByID(id);
      if (!currentEntry) {
        throw new Error('Registro não encontrado');
      }

      // Atualiza o registro
      await timeEntriesDB.update({
        ...currentEntry,
        ...updates
      });

      return true;
    } catch (err) {
      console.error('Error updating time entry:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar registro de ponto');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTimeEntry = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await timeEntriesDB.deleteRecord(id);
      return true;
    } catch (err) {
      console.error('Error deleting time entry:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir registro de ponto');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearTimeEntries = async (userId?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      if (userId) {
        // Exclui apenas os registros do usuário específico
        const entries = await timeEntriesDB.getAll();
        const userEntries = entries.filter(entry => entry.userId === userId);
        
        for (const entry of userEntries) {
          await timeEntriesDB.deleteRecord(entry.id);
        }
      } else {
        // Exclui todos os registros
        const entries = await timeEntriesDB.getAll();
        for (const entry of entries) {
          await timeEntriesDB.deleteRecord(entry.id);
        }
      }

      return true;
    } catch (err) {
      console.error('Error clearing time entries:', err);
      setError(err instanceof Error ? err.message : 'Erro ao limpar registros de ponto');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    getTimeEntries,
    saveTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    clearTimeEntries,
    loading,
    error
  };
};

// Hook para gerenciar agendamentos
export const useSchedulesDB = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const schedulesDB = useIndexedDB('schedules');

  const getSchedules = async (userId?: string): Promise<Schedule[]> => {
    try {
      setLoading(true);
      setError(null);

      const schedules = await schedulesDB.getAll();
      
      // Filtra por usuário se um ID for fornecido
      const filteredSchedules = userId
        ? schedules.filter(schedule => schedule.userId === userId)
        : schedules;
      
      return filteredSchedules as Schedule[];
    } catch (err) {
      console.error('Error getting schedules:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar agendamentos');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async (schedule: Omit<Schedule, 'id'>): Promise<string | undefined> => {
    try {
      setLoading(true);
      setError(null);

      const newId = uuidv4();

      const newSchedule: Schedule = {
        id: newId,
        userId: schedule.userId,
        date: schedule.date,
        type: schedule.type,
        shift: schedule.shift,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      };

      await schedulesDB.add(newSchedule);

      return newId;
    } catch (err) {
      console.error('Error saving schedule:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar agendamento');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async (id: string, updates: Partial<Schedule>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Busca o agendamento atual
      const currentSchedule = await schedulesDB.getByID(id);
      if (!currentSchedule) {
        throw new Error('Agendamento não encontrado');
      }

      // Atualiza o agendamento
      await schedulesDB.update({
        ...currentSchedule,
        ...updates
      });

      return true;
    } catch (err) {
      console.error('Error updating schedule:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar agendamento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await schedulesDB.deleteRecord(id);
      return true;
    } catch (err) {
      console.error('Error deleting schedule:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir agendamento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    getSchedules,
    saveSchedule,
    updateSchedule,
    deleteSchedule,
    loading,
    error
  };
};

// Hook para gerenciar configurações
export const useSettingsDB = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const settingsDB = useIndexedDB('settings');

  const getSettings = async (): Promise<Settings | undefined> => {
    try {
      setLoading(true);
      setError(null);

      const allSettings = await settingsDB.getAll();
      
      // Retorna as primeiras configurações encontradas
      if (allSettings.length > 0) {
        return allSettings[0] as Settings;
      }
      
      return undefined;
    } catch (err) {
      console.error('Error getting settings:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar configurações');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (settings: Settings): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const allSettings = await settingsDB.getAll();
      const now = new Date().toISOString();

      if (allSettings.length > 0) {
        // Atualiza as configurações existentes
        const currentSettings = allSettings[0];
        await settingsDB.update({
          ...currentSettings,
          projectName: settings.projectName,
          startDate: settings.startDate,
          endDate: settings.endDate,
          regularHoursLimit: settings.regularHoursLimit,
          sheetPassword: settings.sheetPassword,
          updatedAt: now
        });
      } else {
        // Cria novas configurações
        await settingsDB.add({
          id: uuidv4(),
          projectName: settings.projectName,
          startDate: settings.startDate,
          endDate: settings.endDate,
          regularHoursLimit: settings.regularHoursLimit,
          sheetPassword: settings.sheetPassword,
          updatedAt: now
        });
      }

      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar configurações');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    getSettings,
    saveSettings,
    loading,
    error
  };
};

// Hook principal que combina todos os hooks de banco de dados
export const useAppDB = () => {
  const usersDB = useUsersDB();
  const timeEntriesDB = useTimeEntriesDB();
  const schedulesDB = useSchedulesDB();
  const settingsDB = useSettingsDB();

  return {
    // Usuários
    getUser: usersDB.getUser,
    getUserByEmail: usersDB.getUserByEmail,
    getUsers: usersDB.getUsers,
    saveUser: usersDB.saveUser,
    updateUser: usersDB.updateUser,
    authenticateUser: usersDB.authenticateUser,
    changePassword: usersDB.changePassword,
    saveProfileImage: usersDB.saveProfileImage,
    getProfileImage: usersDB.getProfileImage,

    // Registros de ponto
    getTimeEntries: timeEntriesDB.getTimeEntries,
    saveTimeEntry: timeEntriesDB.saveTimeEntry,
    updateTimeEntry: timeEntriesDB.updateTimeEntry,
    deleteTimeEntry: timeEntriesDB.deleteTimeEntry,
    clearTimeEntries: timeEntriesDB.clearTimeEntries,

    // Agendamentos
    getSchedules: schedulesDB.getSchedules,
    saveSchedule: schedulesDB.saveSchedule,
    updateSchedule: schedulesDB.updateSchedule,
    deleteSchedule: schedulesDB.deleteSchedule,

    // Configurações
    getSettings: settingsDB.getSettings,
    saveSettings: settingsDB.saveSettings,

    // Estado
    loading: usersDB.loading || timeEntriesDB.loading || schedulesDB.loading || settingsDB.loading,
    error: usersDB.error || timeEntriesDB.error || schedulesDB.error || settingsDB.error
  };
};