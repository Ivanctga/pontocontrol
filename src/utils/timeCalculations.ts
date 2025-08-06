export function calculateHours(clockIn: string, clockOut: string, dateIn: string, dateOut: string = ''): {
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  overtimeWithBonus: number;
  totalFinal: number;
} {
  // Parse dates with times
  const startDate = new Date(dateIn + 'T' + clockIn);
  const endDate = dateOut 
    ? new Date(dateOut + 'T' + clockOut) 
    : new Date(dateIn + 'T' + clockOut);
  
  // Handle overnight shifts - if end time is before start time and no dateOut specified
  if (endDate < startDate && !dateOut) {
    endDate.setDate(endDate.getDate() + 1);
  }
  
  // Validate that end date/time is after start date/time
  if (endDate < startDate) {
    throw new Error('O horário de saída deve ser posterior ao horário de entrada');
  }
  
  const diffMs = endDate.getTime() - startDate.getTime();
  const totalHours = diffMs / (1000 * 60 * 60);
  
  // Regular hours (up to 24 hours for extended shifts)
  const regularLimit = 24; // For medical shifts
  const regularHours = Math.min(totalHours, regularLimit);
  const overtimeHours = Math.max(0, totalHours - regularLimit);
  
  // Calculate overtime with 50% bonus
  const overtimeWithBonus = overtimeHours * 1.5;
  
  // Calculate total final (regular hours + overtime with bonus)
  const totalFinal = regularHours + overtimeWithBonus;
  
  return {
    totalHours: Math.round(totalHours * 100) / 100,
    regularHours: Math.round(regularHours * 100) / 100,
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    overtimeWithBonus: Math.round(overtimeWithBonus * 100) / 100,
    totalFinal: Math.round(totalFinal * 100) / 100
  };
}

export function formatTime(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h${minutes > 0 ? ` ${minutes.toString().padStart(2, '0')}min` : ''}`;
}

export function formatTimeAsDuration(hours: number): string {
  // Garantir que não temos valores negativos para formatação
  const absHours = Math.abs(hours);
  const wholeHours = Math.floor(absHours);
  const minutes = Math.round((absHours - wholeHours) * 60);
  
  // Adicionar o sinal negativo apenas se o valor original for negativo
  const sign = hours < 0 ? '-' : '';
  return `${sign}${wholeHours}:${minutes.toString().padStart(2, '0')}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function isWorkDay(date: Date): boolean {
  // Simulate 24h work, 72h off schedule
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return daysSinceEpoch % 4 === 0; // Every 4th day is a work day
}

export function getWeekDates(date: Date): Date[] {
  const week: Date[] = [];
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    week.push(day);
  }
  
  return week;
}

export function getWeeksInMonth(year: number, month: number): { startDate: Date; endDate: Date }[] {
  const weeks: { startDate: Date; endDate: Date }[] = [];
  
  // Primeiro dia do mês
  const firstDay = new Date(year, month, 1);
  
  // Encontrar o primeiro domingo (início da primeira semana)
  const firstSunday = new Date(firstDay);
  const dayOfWeek = firstDay.getDay();
  
  // Se o primeiro dia do mês não for domingo, ajustar para o domingo anterior
  if (dayOfWeek !== 0) {
    firstSunday.setDate(firstDay.getDate() - dayOfWeek);
  }
  
  // Último dia do mês
  const lastDay = new Date(year, month + 1, 0);
  
  // Começar do primeiro domingo e iterar por semanas até passar do último dia do mês
  let currentWeekStart = new Date(firstSunday);
  
  while (currentWeekStart <= lastDay) {
    // Calcular o fim da semana (sábado)
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    
    weeks.push({
      startDate: new Date(currentWeekStart),
      endDate: new Date(currentWeekEnd)
    });
    
    // Avançar para o próximo domingo
    currentWeekStart = new Date(currentWeekStart);
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
  
  return weeks;
}

export function calculateProportionalHours(startDate: Date, endDate: Date): number {
  // Base: 40 horas por semana completa (7 dias)
  // 40 ÷ 7 ≈ 5,71 horas por dia (5 horas e 43 minutos)
  const hoursPerDay = 40 / 7; // 5.714285714285714
  
  // Converter para horas e minutos exatos (5 horas e 43 minutos = 5.716666...)
  const hoursPerDayExact = 5 + (43 / 60); // 5.716666...
  
  // Calcular o número de dias na semana (incluindo o início e o fim)
  const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Calcular horas proporcionais usando o valor exato em horas e minutos
  const proportionalHours = hoursPerDayExact * daysDiff;
  
  // Arredondar para 2 casas decimais
  return Math.round(proportionalHours * 100) / 100;
}

/**
 * Calcula a diferença precisa entre dois valores de horas, considerando horas e minutos separadamente.
 * @param hours1 Primeiro valor em horas (pode incluir fração para minutos)
 * @param hours2 Segundo valor em horas (pode incluir fração para minutos)
 * @returns A diferença em horas (valor decimal)
 */
export function calculateHoursDifference(hours1: number, hours2: number): number {
  // Extrair horas e minutos do primeiro valor
  const hours1Whole = Math.floor(hours1);
  const minutes1 = Math.round((hours1 - hours1Whole) * 60);
  
  // Extrair horas e minutos do segundo valor
  const hours2Whole = Math.floor(hours2);
  const minutes2 = Math.round((hours2 - hours2Whole) * 60);
  
  // Calcular a diferença em minutos totais
  const totalMinutes1 = hours1Whole * 60 + minutes1;
  const totalMinutes2 = hours2Whole * 60 + minutes2;
  const diffMinutes = totalMinutes1 - totalMinutes2;
  
  // Converter de volta para horas decimais
  return diffMinutes / 60;
}