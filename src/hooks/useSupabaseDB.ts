import { useState } from 'react';
import { supabase } from '../config/supabase';
import { User, TimeEntry, Schedule, Settings } from '../types';
import { Database } from '../types/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';
import { v4 as uuidv4 } from 'uuid';

type TimeEntryRow = Database['public']['Tables']['time_entries']['Row'];
type ScheduleRow = Database['public']['Tables']['schedules']['Row'];
type SettingsRow = Database['public']['Tables']['settings']['Row'];

export const useSupabaseDB = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();

  // Funções para usuários
  const getUser = async (id: string): Promise<User | undefined> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      if (data) {
        // Converte o perfil do Supabase para o formato User da aplicação
        const user: User = {
          id: data.id,
          name: data.name || '',
          email: '', // Email não está no perfil, precisaria buscar de auth.users
          role: data.role || 'Profissional',
          profileImage: data.profile_image || '',
          createdAt: data.created_at
        };
        return user;
      }

      return undefined;
    } catch (err) {
      console.error('Error getting user:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuário');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async (): Promise<User[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      if (data) {
        // Converte os perfis do Supabase para o formato User da aplicação
        return data.map(profile => ({
          id: profile.id,
          name: profile.name || '',
          email: '', // Email não está no perfil, precisaria buscar de auth.users
          role: profile.role || 'Profissional',
          profileImage: profile.profile_image || '',
          createdAt: profile.created_at
        }));
      }

      return [];
    } catch (err) {
      console.error('Error getting users:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuários');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Não precisamos de saveUser pois isso é feito pelo processo de autenticação

  const updateUser = async (userData: User): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          role: userData.role,
          profile_image: userData.profileImage,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Funções para registros de ponto (time entries)
  const getTimeEntries = async (userId?: string): Promise<TimeEntry[]> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('time_entries').select('*');

      // Se um userId for fornecido, filtra por esse usuário
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: entriesError } = await query;

      if (entriesError) throw entriesError;

      if (data) {
        // Converte os registros do Supabase para o formato TimeEntry da aplicação
        return data.map((entry: TimeEntryRow) => ({
          id: entry.id,
          userId: entry.user_id,
          date: entry.date,
          dateOut: entry.date_out || undefined,
          clockIn: entry.clock_in || undefined,
          clockOut: entry.clock_out || undefined,
          type: entry.type as 'regular' | 'extraordinary',
          description: entry.description || undefined,
          totalHours: entry.total_hours,
          regularHours: entry.regular_hours,
          overtimeHours: entry.overtime_hours,
          overtimeWithBonus: entry.overtime_with_bonus,
          totalFinal: entry.total_final,
          createdAt: entry.created_at
        }));
      }

      return [];
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

      if (!user) throw new Error('Usuário não autenticado');

      const newId = uuidv4();
      const now = new Date().toISOString();

      const { error: insertError } = await supabase
        .from('time_entries')
        .insert({
          id: newId,
          user_id: entry.userId,
          date: entry.date,
          date_out: entry.dateOut || null,
          clock_in: entry.clockIn || null,
          clock_out: entry.clockOut || null,
          type: entry.type,
          description: entry.description || null,
          total_hours: entry.totalHours,
          regular_hours: entry.regularHours,
          overtime_hours: entry.overtimeHours,
          overtime_with_bonus: entry.overtimeWithBonus,
          total_final: entry.totalFinal,
          created_at: now
        });

      if (insertError) throw insertError;

      return newId;
    } catch (err) {
      console.error('Error saving time entry:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar registro de ponto');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const updateTimeEntry = async (entry: TimeEntry): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('time_entries')
        .update({
          date: entry.date,
          date_out: entry.dateOut || null,
          clock_in: entry.clockIn || null,
          clock_out: entry.clockOut || null,
          type: entry.type,
          description: entry.description || null,
          total_hours: entry.totalHours,
          regular_hours: entry.regularHours,
          overtime_hours: entry.overtimeHours,
          overtime_with_bonus: entry.overtimeWithBonus,
          total_final: entry.totalFinal
        })
        .eq('id', entry.id);

      if (updateError) throw updateError;

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

      const { error: deleteError } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

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

      let query = supabase.from('time_entries').delete();

      // Se um userId for fornecido, exclui apenas os registros desse usuário
      if (userId) {
        query = query.eq('user_id', userId);
      } else if (user) {
        // Se não for fornecido um userId, mas o usuário estiver autenticado,
        // exclui apenas os registros do usuário atual
        query = query.eq('user_id', user.id);
      } else {
        throw new Error('Usuário não autenticado');
      }

      const { error: deleteError } = await query;

      if (deleteError) throw deleteError;

      return true;
    } catch (err) {
      console.error('Error clearing time entries:', err);
      setError(err instanceof Error ? err.message : 'Erro ao limpar registros de ponto');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Funções para agendamentos (schedules)
  const getSchedules = async (userId?: string): Promise<Schedule[]> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('schedules').select('*');

      // Se um userId for fornecido, filtra por esse usuário
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: schedulesError } = await query;

      if (schedulesError) throw schedulesError;

      if (data) {
        // Converte os agendamentos do Supabase para o formato Schedule da aplicação
        return data.map((schedule: ScheduleRow) => ({
          id: schedule.id,
          userId: schedule.user_id,
          date: schedule.date,
          type: schedule.type as 'work' | 'off',
          shift: schedule.shift as '24h' | '12h' | 'custom',
          startTime: schedule.start_time,
          endTime: schedule.end_time
        }));
      }

      return [];
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

      if (!user) throw new Error('Usuário não autenticado');

      const newId = uuidv4();
      const now = new Date().toISOString();

      const { error: insertError } = await supabase
        .from('schedules')
        .insert({
          id: newId,
          user_id: schedule.userId,
          date: schedule.date,
          type: schedule.type,
          shift: schedule.shift,
          start_time: schedule.startTime,
          end_time: schedule.endTime,
          created_at: now
        });

      if (insertError) throw insertError;

      return newId;
    } catch (err) {
      console.error('Error saving schedule:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar agendamento');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async (schedule: Schedule): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('schedules')
        .update({
          date: schedule.date,
          type: schedule.type,
          shift: schedule.shift,
          start_time: schedule.startTime,
          end_time: schedule.endTime
        })
        .eq('id', schedule.id);

      if (updateError) throw updateError;

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

      const { error: deleteError } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      return true;
    } catch (err) {
      console.error('Error deleting schedule:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir agendamento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Funções para configurações (settings)
  const getSettings = async (): Promise<Settings | undefined> => {
    try {
      setLoading(true);
      setError(null);

      // Busca a configuração mais recente
      const { data, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
        throw settingsError;
      }

      if (data) {
        // Converte as configurações do Supabase para o formato Settings da aplicação
        return {
          id: data.id,
          projectName: data.project_name,
          startDate: data.start_date || undefined,
          endDate: data.end_date || undefined,
          regularHoursLimit: data.regular_hours_limit,
          sheetPassword: data.sheet_password || undefined,
          updatedAt: data.updated_at
        };
      }

      // Se não encontrar configurações, retorna as configurações padrão
      return {
        id: 'default',
        projectName: 'PlantonControl',
        regularHoursLimit: 24,
        updatedAt: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error getting settings:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar configurações');
      
      // Em caso de erro, retorna as configurações padrão
      return {
        id: 'default',
        projectName: 'PlantonControl',
        regularHoursLimit: 24,
        updatedAt: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (settings: Omit<Settings, 'id'>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      if (!user) throw new Error('Usuário não autenticado');

      const newId = uuidv4();
      const now = new Date().toISOString();

      const { error: insertError } = await supabase
        .from('settings')
        .insert({
          id: newId,
          project_name: settings.projectName,
          start_date: settings.startDate || null,
          end_date: settings.endDate || null,
          regular_hours_limit: settings.regularHoursLimit,
          sheet_password: settings.sheetPassword || null,
          updated_at: now,
          created_by: user.id
        });

      if (insertError) throw insertError;

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
    loading,
    error,
    // Usuários
    getUser,
    getUsers,
    updateUser,
    
    // Registros de ponto
    getTimeEntries,
    saveTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    clearTimeEntries,
    
    // Agendamentos
    getSchedules,
    saveSchedule,
    updateSchedule,
    deleteSchedule,
    
    // Configurações
    getSettings,
    saveSettings
  };
};