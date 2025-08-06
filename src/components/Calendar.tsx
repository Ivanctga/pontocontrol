import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { isWorkDay, getWeekDates, formatTime, getWeeksInMonth, calculateProportionalHours } from '../utils/timeCalculations';

export default function Calendar() {
  const { state } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDayInfo = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    const entry = state.timeEntries.find(e => e.date === dateString);
    const isWork = isWorkDay(date);
    const isToday = date.toDateString() === new Date().toDateString();
    
    return { entry, isWork, isToday, date };
  };

  const getDayClass = (dayInfo: ReturnType<typeof getDayInfo>) => {
    let classes = 'relative w-full h-20 p-2 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ';
    
    if (dayInfo.isToday) {
      classes += 'ring-2 ring-blue-500 ';
    }
    
    if (dayInfo.isWork && !dayInfo.entry) {
      classes += 'bg-blue-50 border-blue-200 ';
    }
    
    if (dayInfo.entry) {
      if (dayInfo.entry.type === 'extraordinary') {
        classes += 'bg-purple-50 border-purple-200 ';
      } else {
        classes += 'bg-blue-50 border-blue-200 ';
      }
    }
    
    return classes;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
              <CalendarIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Calendário de Plantões</h2>
              <p className="text-sm text-gray-600">Visualize suas escalas e registros</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
            <span>Dia de Plantão</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Plantão Regular</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
            <span>Convocação Extraordinária</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
            <span>Hoje</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 bg-gray-50">
          {weekDays.map((day) => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="h-20 border-r border-b border-gray-200 bg-gray-50"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayInfo = getDayInfo(day);
            
            return (
              <div key={day} className={getDayClass(dayInfo)}>
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${
                    dayInfo.isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {day}
                  </span>
                  
                  {dayInfo.isWork && (
                    <Clock className="w-3 h-3 text-blue-500" />
                  )}
                </div>

                {dayInfo.entry && (
                  <div className="mt-1">
                    <div className={`text-xs font-medium ${dayInfo.entry.type === 'extraordinary' ? 'text-purple-700' : 'text-blue-700'}`}>
                      {dayInfo.entry.type === 'extraordinary' ? 'Extraordinária' : 'Regular'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {dayInfo.entry.clockIn} - {dayInfo.entry.clockOut}
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      {formatTime(dayInfo.entry.totalFinal)}
                    </div>
                  </div>
                )}

                {dayInfo.isWork && !dayInfo.entry && (
                  <div className="mt-1">
                    <div className="text-xs text-blue-600 font-medium">
                      Plantão
                    </div>
                    <div className="text-xs text-gray-500">
                      Não registrado
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Month Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Mês</h3>
        
        {(() => {
          const monthEntries = state.timeEntries.filter(entry => {
            const entryDate = new Date(entry.date + 'T00:00:00');
            return entryDate.getMonth() === currentDate.getMonth() && 
                   entryDate.getFullYear() === currentDate.getFullYear();
          });

          const totalHours = monthEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
          const totalFinalHours = monthEntries.reduce((sum, entry) => sum + entry.totalFinal, 0);
          const extraordinaryEntries = monthEntries.filter(entry => entry.type === 'extraordinary');
          const workDaysInMonth = Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
            return isWorkDay(date);
          }).filter(Boolean).length;

          return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{monthEntries.length}</div>
                <div className="text-sm text-gray-600">Plantões Registrados</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{formatTime(totalHours)}</div>
                <div className="text-sm text-gray-600">Total de Horas</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{extraordinaryEntries.length}</div>
                <div className="text-sm text-gray-600">Convocações Extraordinárias</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{formatTime(totalFinalHours)}</div>
                <div className="text-sm text-gray-600">Total com Bônus</div>
              </div>
            </div>
          );
        })()}
      </div>
      
      {/* Informative Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Cálculo das 40 Horas Semanais (Semanas Parciais)</h3>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2">Fórmula utilizada:</h4>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Considera-se uma base de 40 horas por semana completa (7 dias).</li>
            <li>Calcula-se o valor proporcional por dia:
              <div className="bg-white rounded p-2 my-1 inline-block ml-2 border border-blue-200">
                <span className="font-mono">40 ÷ 7 ≈ 5,71 horas por dia (5 horas e 43 minutos)</span>
              </div>
            </li>
            <li>Multiplica-se esse valor pela quantidade de dias da semana parcial:
              <div className="bg-white rounded p-2 my-1 inline-block ml-2 border border-blue-200">
                <span className="font-mono">5,71 horas (5h 43min) × número de dias</span>
              </div>
            </li>
          </ol>
          <div className="mt-3 bg-blue-100 p-3 rounded-lg">
            <p className="font-medium text-blue-800">Exemplo:</p>
            <p className="text-blue-700">5,71 × 2 dias = 11,42 horas (11 horas e 25 minutos)</p>
          </div>
        </div>
      </div>
      
      {/* Weekly Hours Calculation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cálculo de Semanas e Distribuição de Horas</h3>
        <p className="text-sm text-gray-600 mb-4">
          Cálculo baseado em 40 horas por semana completa (7 dias). Para semanas parciais, o cálculo é proporcional ao número de dias.
        </p>
        
        {(() => {
          // Obter as semanas do mês atual
          const weeks = getWeeksInMonth(currentDate.getFullYear(), currentDate.getMonth());
          
          // Calcular o total de horas esperadas no mês
          let totalMonthlyHours = 0;
          
          // Processar as semanas para cálculo
          const processedWeeks = weeks.map((week, index) => {
            // Verificar se a semana está parcialmente no mês atual
            const weekStartInMonth = week.startDate.getMonth() === currentDate.getMonth();
            const weekEndInMonth = week.endDate.getMonth() === currentDate.getMonth();
            
            // Ajustar as datas para considerar apenas os dias dentro do mês atual
            const adjustedStartDate = weekStartInMonth ? week.startDate : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const adjustedEndDate = weekEndInMonth ? week.endDate : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            
            // Calcular horas proporcionais para a semana
            const proportionalHours = calculateProportionalHours(adjustedStartDate, adjustedEndDate);
            
            // Adicionar ao total mensal
            totalMonthlyHours += proportionalHours;
            
            // Formatar as datas para exibição
            const startDateFormatted = adjustedStartDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            const endDateFormatted = adjustedEndDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            
            // Calcular o número de dias na semana (incluindo o início e o fim)
            const daysDiff = Math.floor((adjustedEndDate.getTime() - adjustedStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            
            // Determinar a classe de cor com base na semana (alternando cores)
            const colorClass = index % 2 === 0 ? 'bg-blue-50' : 'bg-indigo-50';
            const textColorClass = index % 2 === 0 ? 'text-blue-600' : 'text-indigo-600';
            
            return {
              index,
              startDateFormatted,
              endDateFormatted,
              daysDiff,
              proportionalHours,
              colorClass,
              textColorClass
            };
          });
          
          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {processedWeeks.map((week) => (
                  <div key={week.index} className={`p-4 ${week.colorClass} rounded-lg border border-gray-200 shadow-sm`}>
                    <div className="flex flex-col">
                      <div className="mb-3">
                        <h4 className={`text-lg font-bold ${week.textColorClass}`}>Semana {week.index + 1}</h4>
                        <p className="text-sm text-gray-600">
                          {week.startDateFormatted} a {week.endDateFormatted} ({week.daysDiff} dias)
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Dias</div>
                          <div className={`text-xl font-bold ${week.textColorClass}`}>{week.daysDiff}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Horas Esperadas</div>
                          <div className={`text-xl font-bold ${week.textColorClass}`}>{formatTime(week.proportionalHours)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total Monthly Hours */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-3 md:mb-0">
                    <h4 className="text-lg font-bold text-green-700">Soma da Carga Horária no Mês</h4>
                    <p className="text-sm text-green-600">
                      Baseado na distribuição proporcional de 40h/semana
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-green-600">Total de Horas</div>
                    <div className="text-2xl font-bold text-green-700">{formatTime(totalMonthlyHours)}</div>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}