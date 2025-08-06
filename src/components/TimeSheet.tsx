import React, { useState, useEffect } from 'react';
import { Clock, Plus, Save, AlertCircle, Lock, Calendar, Timer, ClipboardCheck, CheckCircle, Info, LogIn, LogOut } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { calculateHours, formatTime, formatTimeAsDuration } from '../utils/timeCalculations';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

export default function TimeSheet() {
  const { addTimeEntry, updateTimeEntry, state } = useApp();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    dateOut: '', // Data de saída (quando diferente da data de entrada)
    clockIn: '',
    clockOut: '',
    type: 'regular' as 'regular' | 'extraordinary',
    description: '',
    isOvernightShift: false // Indica se o turno é de um dia para outro
  });
  
  const [previewHours, setPreviewHours] = useState<{
    totalHours: number;
    regularHours: number;
    overtimeHours: number;
    overtimeWithBonus: number;
    totalFinal: number;
  } | null>(null);

  // Calculate hours when clock in/out or dates change
  useEffect(() => {
    if (formData.clockIn && formData.clockOut && formData.date) {
      try {
        const dateOut = formData.isOvernightShift ? (formData.dateOut || getNextDay(formData.date)) : formData.date;
        let hours = calculateHours(formData.clockIn, formData.clockOut, formData.date, formData.isOvernightShift ? dateOut : '');
        
        // Aplicar regra para Convocação Extraordinária: 50% de acréscimo sobre todas as horas
        if (formData.type === 'extraordinary') {
          hours = {
            ...hours,
            regularHours: 0, // Zera horas regulares
            overtimeHours: hours.totalHours, // Todas as horas são consideradas extras
            overtimeWithBonus: hours.totalHours * 1.5, // 50% de acréscimo
            totalFinal: hours.totalHours * 1.5 // Total final com acréscimo
          };
        }
        
        setPreviewHours(hours);
      } catch (error) {
        console.error(error);
        setPreviewHours(null);
      }
    } else {
      setPreviewHours(null);
    }
  }, [formData.clockIn, formData.clockOut, formData.date, formData.dateOut, formData.isOvernightShift]);
  
  // Helper function to get the next day
  const getNextDay = (dateString: string): string => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clockIn || !formData.clockOut) {
      alert('Por favor, preencha os horários de entrada e saída');
      return;
    }
    
    try {
      const dateOut = formData.isOvernightShift ? (formData.dateOut || getNextDay(formData.date)) : formData.date;
      let hours = calculateHours(formData.clockIn, formData.clockOut, formData.date, formData.isOvernightShift ? dateOut : '');
      
      // Aplicar regra para Convocação Extraordinária: 50% de acréscimo sobre todas as horas
      if (formData.type === 'extraordinary') {
        hours = {
          ...hours,
          regularHours: 0, // Zera horas regulares
          overtimeHours: hours.totalHours, // Todas as horas são consideradas extras
          overtimeWithBonus: hours.totalHours * 1.5, // 50% de acréscimo
          totalFinal: hours.totalHours * 1.5 // Total final com acréscimo
        };
      }
      
      const entry = {
        userId: state.user!.id,
        date: formData.date,
        dateOut: formData.isOvernightShift ? dateOut : undefined,
        clockIn: formData.clockIn,
        clockOut: formData.clockOut,
        type: formData.type,
        description: formData.description,
        totalHours: hours.totalHours,
        regularHours: hours.regularHours,
        overtimeHours: hours.overtimeHours,
        overtimeWithBonus: hours.overtimeWithBonus,
        totalFinal: hours.totalFinal
      };

      addTimeEntry(entry);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        dateOut: '',
        clockIn: '',
        clockOut: '',
        type: 'regular' as 'regular' | 'extraordinary',
        description: '',
        isOvernightShift: false
      });
      
      alert('Registro de ponto salvo com sucesso!');
    } catch (error) {
      if (error instanceof Error) {
        alert(`Erro ao salvar registro: ${error.message}`);
      } else {
        alert('Erro ao salvar registro');
      }
    }
  };

  // Check if there's already an entry for the selected date
  const existingEntry = state.timeEntries.find(entry => entry.date === formData.date);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <Card className="p-8 border-t-4 border-primary-600">
        <div>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center justify-center w-14 h-14 bg-primary-100 rounded-full">
              <Clock className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Registro de Ponto</h2>
              <p className="text-md text-gray-600 font-medium">Registre suas horas trabalhadas com precisão</p>
            </div>
          </div>

          {existingEntry && (
            <div className="mb-6 p-5 bg-warning-50 border border-warning-200 rounded-xl shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-warning-600" />
                </div>
                <div>
                  <p className="text-base font-medium text-warning-800">
                    Já existe um registro para esta data
                  </p>
                  <p className="text-sm text-warning-700 mt-1">
                    Total de horas: <span className="font-semibold">{formatTime(existingEntry.totalHours)}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-gray-50 hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <label className="flex items-center text-base font-semibold text-gray-800 mb-3">
                      <Calendar className="h-5 w-5 text-primary-600 mr-2" />
                      Data de Entrada
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm text-gray-900 font-medium transition-colors duration-200"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <label className="flex items-center text-base font-semibold text-gray-800 mb-3">
                      <ClipboardCheck className="h-5 w-5 text-primary-600 mr-2" />
                      Tipo de Registro
                    </label>
                    <div className="relative">
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm text-gray-900 font-medium appearance-none transition-colors duration-200"
                      >
                        <option value="regular">Plantão Regular</option>
                        <option value="extraordinary">Convocação Extraordinária</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {formData.type === 'extraordinary' && (
                      <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-start space-x-2">
                        <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-primary-700">
                          Todas as horas serão calculadas com acréscimo de 50%
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
                          <Clock className="w-5 h-5 text-primary-600" />
                        </div>
                        <label htmlFor="overnightShift" className="text-base font-medium text-gray-800">
                          Turno de um dia para outro
                        </label>
                      </div>
                      <div className="relative inline-block w-14 h-7 transition duration-200 ease-in-out">
                        <input
                          type="checkbox"
                          id="overnightShift"
                          checked={formData.isOvernightShift}
                          onChange={(e) => setFormData({ ...formData, isOvernightShift: e.target.checked })}
                          className="opacity-0 w-0 h-0"
                        />
                        <label 
                          htmlFor="overnightShift"
                          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-300 ${formData.isOvernightShift ? 'bg-primary-600' : 'bg-gray-300'}`}
                        >
                          <span 
                            className={`absolute left-1 bottom-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 ${formData.isOvernightShift ? 'transform translate-x-7' : ''}`}
                          ></span>
                        </label>
                      </div>
                    </div>
                    
                    {formData.isOvernightShift && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <label className="flex items-center text-base font-semibold text-gray-800 mb-3">
                          <Calendar className="h-5 w-5 text-primary-600 mr-2" />
                          Data de Saída
                        </label>
                        <input
                          type="date"
                          value={formData.dateOut || getNextDay(formData.date)}
                          onChange={(e) => setFormData({ ...formData, dateOut: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm text-gray-900 font-medium transition-colors duration-200"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-gray-50 hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-6">
                      <label className="flex items-center text-base font-semibold text-gray-800 mb-3">
                        <Timer className="h-5 w-5 text-primary-600 mr-2" />
                        Horário de Entrada
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          required
                          value={formData.clockIn}
                          onChange={(e) => setFormData({ ...formData, clockIn: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm text-gray-900 font-medium transition-colors duration-200"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-6">
                      <label className="flex items-center text-base font-semibold text-gray-800 mb-3">
                        <Timer className="h-5 w-5 text-primary-600 mr-2" />
                        Horário de Saída
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          required
                          value={formData.clockOut}
                          onChange={(e) => setFormData({ ...formData, clockOut: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm text-gray-900 font-medium transition-colors duration-200"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <label className="flex items-center text-base font-semibold text-gray-800 mb-3">
                      <ClipboardCheck className="h-5 w-5 text-primary-600 mr-2" />
                      Observações (opcional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm text-gray-900 font-medium transition-colors duration-200"
                      placeholder="Descreva atividades especiais, convocações, etc."
                    />
                  </CardContent>
                </Card>

                {previewHours && (
                  <Card className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-100 shadow-md">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full mr-3">
                          <CheckCircle className="w-5 h-5 text-primary-600" />
                        </div>
                        Prévia do Cálculo
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                        <Card className="bg-white border border-gray-100 hover:shadow-md transition-shadow duration-300">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-medium">Total de Horas</span>
                              <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
                                <Clock className="w-4 h-4 text-primary-600" />
                              </div>
                            </div>
                            <span className="font-bold text-gray-900 text-xl block mt-2">
                              {formatTimeAsDuration(previewHours.totalHours)}
                            </span>
                          </CardContent>
                        </Card>
                        {(previewHours.overtimeHours > 0 || formData.type === 'extraordinary') && (
                          <Card className="bg-white border border-gray-100 hover:shadow-md transition-shadow duration-300">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium">Hora Extra</span>
                                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                                  <Timer className="w-4 h-4 text-orange-600" />
                                </div>
                              </div>
                              <span className="font-bold text-orange-600 text-xl block mt-2">
                                {formatTimeAsDuration(previewHours.overtimeHours)}
                              </span>
                            </CardContent>
                          </Card>
                        )}
                        {(previewHours.overtimeHours > 0 || formData.type === 'extraordinary') && (
                          <Card className="bg-white border border-gray-100 hover:shadow-md transition-shadow duration-300">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 font-medium">HE c/50%</span>
                                <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full">
                                  <Plus className="w-4 h-4 text-amber-600" />
                                </div>
                              </div>
                              <span className="font-bold text-amber-600 text-xl block mt-2">
                                {formatTimeAsDuration(previewHours.overtimeWithBonus)}
                              </span>
                            </CardContent>
                          </Card>
                        )}
                        <Card className="bg-white border border-gray-100 hover:shadow-md transition-shadow duration-300">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-medium">Total Final</span>
                              <div className="flex items-center justify-center w-8 h-8 bg-success-100 rounded-full">
                                <CheckCircle className="w-4 h-4 text-success-600" />
                              </div>
                            </div>
                            <span className="font-bold text-success-600 text-xl block mt-2">
                              {formatTimeAsDuration(previewHours.totalFinal)}
                            </span>
                          </CardContent>
                        </Card>
                      </div>
                      {(previewHours.overtimeHours > 0 || formData.type === 'extraordinary') && (
                        <Card className="mt-5 bg-primary-50 border border-primary-100 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-primary-800 font-medium">
                                  Horas extras com acréscimo de 50%
                                </p>
                                <p className="text-gray-600 text-sm mt-1">
                                  Formato de duração: [hh]:mm
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full py-4 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Save className="w-6 h-6 mr-2" />
                <span className="text-lg">Salvar Registro</span>
              </Button>
            </form>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg border-l-4 border-amber-500">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mr-3">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button
              onClick={() => {
                const now = new Date();
                const time = now.toTimeString().slice(0, 5);
                setFormData({ 
                  ...formData, 
                  date: now.toISOString().split('T')[0],
                  clockIn: time 
                });
              }}
              variant="outline"
              className="flex items-center justify-center space-x-3 p-5 bg-white border border-success-200 rounded-xl hover:bg-success-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-success-100 rounded-full">
                <LogIn className="w-5 h-5 text-success-600" />
              </div>
              <span className="font-medium text-gray-800">Registrar Entrada Agora</span>
            </Button>

            <Button
              onClick={() => {
                const now = new Date();
                const time = now.toTimeString().slice(0, 5);
                
                // Se for turno de um dia para outro e a data de saída não estiver definida
                if (formData.isOvernightShift && !formData.dateOut) {
                  setFormData({ 
                    ...formData, 
                    dateOut: now.toISOString().split('T')[0],
                    clockOut: time 
                  });
                } else {
                  setFormData({ ...formData, clockOut: time });
                }
              }}
              variant="outline"
              className="flex items-center justify-center space-x-3 p-5 bg-white border border-primary-200 rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
                <LogOut className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-medium text-gray-800">Registrar Saída Agora</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Informações de Proteção */}
      <Card className="bg-gradient-to-r from-primary-50 to-indigo-50 shadow-lg border-l-4 border-primary-600">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full flex-shrink-0">
                <Lock className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Proteção da Planilha</h3>
                <p className="text-base text-gray-600 leading-relaxed">A planilha está protegida contra alterações indesejadas, garantindo a integridade dos seus dados.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full flex-shrink-0">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Adaptação ao Calendário</h3>
                <p className="text-base text-gray-600 leading-relaxed">A planilha se adapta automaticamente para meses com 30 ou 31 dias, facilitando seu controle de horas.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}