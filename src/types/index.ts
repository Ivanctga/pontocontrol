export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  profileImage?: string; // URL da imagem de perfil ou base64
  password?: string; // Senha do usuário (não deve ser exposta na interface)
}

export interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  dateOut?: string; // Data de saída (quando diferente da data de entrada)
  clockIn?: string;
  clockOut?: string;
  type: 'regular' | 'extraordinary';
  description?: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  overtimeWithBonus: number; // Horas extras com acréscimo de 50%
  totalFinal: number; // Total final (horas regulares + horas extras com bônus)
  createdAt: string;
}

export interface Schedule {
  id: string;
  userId: string;
  date: string;
  type: 'work' | 'off';
  shift: '24h' | '12h' | 'custom';
  startTime: string;
  endTime: string;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  extraordinaryHours: number;
  entries: TimeEntry[];
}

export interface Settings {
  projectName: string;
  startDate?: string;
  endDate?: string;
  regularHoursLimit: number;
  sheetPassword?: string;
  updatedAt: string;
}

export interface AppState {
  user: User | null;
  timeEntries: TimeEntry[];
  schedules: Schedule[];
  settings?: Settings;
  currentView: 'dashboard' | 'timesheet' | 'calendar' | 'reports' | 'settings';
}