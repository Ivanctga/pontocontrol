import React, { useState } from 'react';
import { BarChart3, Download, TrendingUp, Clock, PlusCircle, Calendar, ArrowUp, ArrowDown, Edit, Trash2, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { formatTime, formatTimeAsDuration, getWeeksInMonth, calculateProportionalHours, calculateHoursDifference, calculateHours } from '../utils/timeCalculations';
import { TimeEntry } from '../types';

export default function Reports() {
  const { state, getMonthlyReport, updateTimeEntry, deleteTimeEntry } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [editFormData, setEditFormData] = useState({
    date: '',
    dateOut: '',
    clockIn: '',
    clockOut: '',
    type: 'regular' as 'regular' | 'extraordinary',
    description: '',
    isOvernightShift: false
  });

  const report = getMonthlyReport(selectedMonth, selectedYear);
  
  // Calcular novos valores para os cards resumo
  const completedShifts = report.entries.filter(entry => entry.totalHours >= 24).length;
  const contractualHours = completedShifts * 24;
  const totalWorkedHours = report.totalHours;
  const extraHours = report.overtimeHours;
  const extraHoursWithBonus = report.overtimeWithBonus;
  // Usar o valor total final das horas trabalhadas
  const finalTotalHours = report.totalFinal;
  
  // Cálculo da carga horária mensal usando o mesmo método do Calendar.tsx
  // Obter as semanas do mês selecionado
  const weeks = getWeeksInMonth(selectedYear, selectedMonth);
  
  // Calcular o total de horas esperadas no mês
  let monthlyWorkload = 0;
  
  // Processar as semanas para cálculo
  weeks.forEach((week) => {
    // Verificar se a semana está parcialmente no mês selecionado
    const weekStartInMonth = week.startDate.getMonth() === selectedMonth;
    const weekEndInMonth = week.endDate.getMonth() === selectedMonth;
    
    // Ajustar as datas para considerar apenas os dias dentro do mês selecionado
    const adjustedStartDate = weekStartInMonth ? week.startDate : new Date(selectedYear, selectedMonth, 1);
    const adjustedEndDate = weekEndInMonth ? week.endDate : new Date(selectedYear, selectedMonth + 1, 0);
    
    // Calcular horas proporcionais para a semana
    const proportionalHours = calculateProportionalHours(adjustedStartDate, adjustedEndDate);
    
    // Adicionar ao total mensal
    monthlyWorkload += proportionalHours;
  });
  
  // Balanço de horas (diferença entre o total final de horas e a carga horária do mês)
  // Usar a função específica para calcular a diferença precisa entre horas
  const hoursBalance = calculateHoursDifference(finalTotalHours, monthlyWorkload);
  
  // Remover cálculos de ganhos estimados que não são mais necessários

  // Get data for chart visualization
  const chartData = report.entries.map(entry => ({
    date: entry.date,
    hours: entry.totalHours,
    overtime: entry.overtimeHours
  }));

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Função para abrir o modal de edição
  const handleEditEntry = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    const isOvernightShift = entry.dateOut !== undefined && entry.dateOut !== '';
    
    setEditFormData({
      date: entry.date,
      dateOut: entry.dateOut || '',
      clockIn: entry.clockIn || '',
      clockOut: entry.clockOut || '',
      type: entry.type,
      description: entry.description || '',
      isOvernightShift: isOvernightShift
    });
    setIsEditModalOpen(true);
  };

  // Função para fechar o modal de edição
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedEntry(null);
  };

  // Função para atualizar os dados do formulário de edição
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para salvar as alterações
  const handleSaveEdit = () => {
    if (!selectedEntry) return;

    // Verificar se os campos obrigatórios estão preenchidos
    if (!editFormData.date || !editFormData.clockIn || !editFormData.clockOut) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      // Definir a data de saída para turnos noturnos
      let dateOut = '';
      if (editFormData.isOvernightShift) {
        // Se já existe uma data de saída no formulário, usá-la
        // Senão, calcular o dia seguinte à data de entrada
        dateOut = editFormData.dateOut || (() => {
          const date = new Date(editFormData.date + 'T00:00:00');
          date.setDate(date.getDate() + 1);
          return date.toISOString().split('T')[0];
        })();
      }
      
      // Calcular as horas com base nos novos horários
      const hours = calculateHours(
        editFormData.clockIn,
        editFormData.clockOut,
        editFormData.date,
        editFormData.isOvernightShift ? dateOut : ''
      );

      // Atualizar a entrada
      updateTimeEntry(selectedEntry.id, {
        date: editFormData.date,
        dateOut: editFormData.isOvernightShift ? dateOut : undefined,
        clockIn: editFormData.clockIn,
        clockOut: editFormData.clockOut,
        type: editFormData.type,
        description: editFormData.description,
        totalHours: hours.totalHours,
        regularHours: hours.regularHours,
        overtimeHours: hours.overtimeHours,
        overtimeWithBonus: hours.overtimeWithBonus,
        totalFinal: hours.totalFinal
      });

      // Fechar o modal
      handleCloseModal();
    } catch (error) {
      if (error instanceof Error) {
        alert(`Erro ao atualizar registro: ${error.message}`);
      } else {
        alert('Erro ao atualizar registro');
      }
    }
  };

  // Função para confirmar e excluir uma entrada
  const handleDeleteEntry = (entryId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.')) {
      deleteTimeEntry(entryId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Relatórios Mensais</h2>
              <p className="text-sm text-gray-600">Análise detalhada das suas horas trabalhadas</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Plantões</p>
              <p className="text-2xl font-bold text-gray-900">{completedShifts}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">
              Plantões completos de 24h
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Horas Contratuais</p>
              <p className="text-2xl font-bold text-gray-900">{formatTimeAsDuration(contractualHours)}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">
              {completedShifts} plantões x 24h
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Horas Totais Trabalhadas</p>
              <p className="text-2xl font-bold text-blue-600">{formatTimeAsDuration(totalWorkedHours)}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">
              Soma de todas as horas registradas
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hora Extra</p>
              <p className="text-2xl font-bold text-orange-600">{formatTimeAsDuration(extraHours)}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">
              Excedente às 24h por plantão
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">HE c/50%</p>
              <p className="text-2xl font-bold text-orange-600">{formatTimeAsDuration(extraHoursWithBonus)}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full">
              <PlusCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-amber-600 font-medium">
              +50% de acréscimo
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Final de Horas</p>
              <p className="text-2xl font-bold text-purple-600">{formatTimeAsDuration(finalTotalHours)}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-purple-600 font-medium">
              Horas contratuais + HE c/50%
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Soma da Carga Horária no Mês</p>
              <p className="text-2xl font-bold text-gray-900">{formatTimeAsDuration(monthlyWorkload)}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
              <Calendar className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">
              Valor de referência mensal
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Balanço de Horas</p>
              <p className={`text-2xl font-bold ${hoursBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {hoursBalance >= 0 ? '+' : ''}{formatTimeAsDuration(hoursBalance)}
              </p>
            </div>
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${hoursBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {hoursBalance >= 0 ? 
                <ArrowUp className="w-6 h-6 text-green-600" /> : 
                <ArrowDown className="w-6 h-6 text-red-600" />}
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-sm font-medium ${hoursBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Total Final de Horas - Soma da Carga Horária no Mês
            </div>
          </div>
        </div>
      </div>

      {/* Removed Chart: Horas por Dia */}

      {/* Detailed Entries */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Registros Detalhados</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horário
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas Totais
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora Extra
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HE c/50%
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Final
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.entries.map((entry) => (
                
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                      {entry.clockIn} - {entry.clockOut}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.type === 'regular' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {entry.type === 'regular' ? 'Plantão Regular' : 'Convocação Extraordinária'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                      {formatTimeAsDuration(entry.totalHours)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 text-center">
                      {entry.overtimeHours > 0 ? formatTimeAsDuration(entry.overtimeHours) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 text-center">
                      {entry.overtimeHours > 0 ? formatTimeAsDuration(entry.overtimeWithBonus || (entry.overtimeHours * 1.5)) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 text-center">
                      {formatTimeAsDuration(entry.totalFinal || (entry.regularHours + (entry.overtimeHours * 1.5)))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button 
                          onClick={() => handleEditEntry(entry)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Editar registro"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Excluir registro"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          
          {report.entries.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum registro encontrado para este período</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Editar Registro de Plantão</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrada</label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isOvernightShift"
                  checked={editFormData.isOvernightShift}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    isOvernightShift: e.target.checked
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isOvernightShift" className="text-sm font-medium text-gray-700">
                  Turno de um dia para o outro
                </label>
              </div>
              
              {editFormData.isOvernightShift && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Saída</label>
                  <input
                    type="date"
                    name="dateOut"
                    value={editFormData.dateOut || (() => {
                      const date = new Date(editFormData.date + 'T00:00:00');
                      date.setDate(date.getDate() + 1);
                      return date.toISOString().split('T')[0];
                    })()}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Entrada</label>
                  <input
                    type="time"
                    name="clockIn"
                    value={editFormData.clockIn}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Saída</label>
                  <input
                    type="time"
                    name="clockOut"
                    value={editFormData.clockOut}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Plantão</label>
                <select
                  name="type"
                  value={editFormData.type}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="regular">Plantão Regular</option>
                  <option value="extraordinary">Convocação Extraordinária</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}