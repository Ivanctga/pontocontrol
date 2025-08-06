import React from 'react';
import { Clock, TrendingUp, Calendar, AlertCircle, BarChart3, User, CheckCircle } from 'lucide-react';
import { useSupabaseApp } from '../contexts/SupabaseAppContext';
import { formatTime } from '../utils/timeCalculations';
import DBStatus from './DBStatus';
import { Card, CardHeader, CardTitle, CardContent, StatCard } from './ui/Card';

export default function Dashboard() {
  const { state } = useSupabaseApp();
  
  // Calculate current month stats
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthEntries = state.timeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  });

  const totalHours = currentMonthEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
  const overtimeHours = currentMonthEntries.reduce((sum, entry) => sum + entry.overtimeHours, 0);
  const totalEntries = currentMonthEntries.length;

  // Recent entries (last 5)
  const recentEntries = state.timeEntries
    .slice(-5)
    .reverse();

  // Today's entry
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = state.timeEntries.find(entry => entry.date === today);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-none overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 -mt-12 -mr-12 opacity-10">
          <Clock className="w-full h-full" />
        </div>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">
                Bem-vindo, {state.user?.name.split(' ')[0]}!
              </h2>
              <p className="text-primary-100 text-lg">
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Database Status */}
      <Card className="bg-primary-50 border border-primary-100">
        <CardHeader>
          <CardTitle icon={<BarChart3 className="w-5 h-5" />}>
            Status do Banco de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DBStatus />
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Horas do Mês" 
          value={formatTime(totalHours)} 
          icon={<Clock />} 
          iconBgColor="bg-primary-100" 
          iconColor="text-primary-600"
          trend={{
            value: `+${formatTime(totalHours - (totalHours - overtimeHours))} regulares`,
            positive: true
          }}
        />

        <StatCard 
          title="Horas Extras" 
          value={formatTime(overtimeHours)} 
          icon={<TrendingUp />} 
          iconBgColor="bg-warning-100" 
          iconColor="text-warning-600"
          trend={{
            value: "50% de acréscimo",
            positive: true
          }}
        />

        <StatCard 
          title="Plantões" 
          value={totalEntries} 
          icon={<Calendar />} 
          iconBgColor="bg-success-100" 
          iconColor="text-success-600"
          trend={{
            value: "Este mês",
            positive: true
          }}
        />

        <StatCard 
          title="Status Hoje" 
          value={todayEntry ? 'Registrado' : 'Pendente'} 
          icon={todayEntry ? <CheckCircle /> : <AlertCircle />} 
          iconBgColor={todayEntry ? 'bg-success-100' : 'bg-danger-100'} 
          iconColor={todayEntry ? 'text-success-600' : 'text-danger-600'}
          trend={{
            value: todayEntry ? formatTime(todayEntry.totalHours) : 'Sem registro',
            positive: !!todayEntry
          }}
        />
      </div>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle icon={<Clock className="w-5 h-5" />}>
            Últimos Registros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {recentEntries.length > 0 ? (
              recentEntries.map((entry) => (
                <div key={entry.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          entry.type === 'regular' ? 'bg-primary-500' : 'bg-secondary-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {entry.clockIn} - {entry.clockOut}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatTime(entry.totalHours)}
                      </p>
                      {entry.overtimeHours > 0 && (
                        <p className="text-xs text-warning-600">
                          +{formatTime(entry.overtimeHours)} extras
                        </p>
                      )}
                    </div>
                  </div>
                  {entry.description && (
                    <p className="mt-2 text-sm text-gray-600 ml-6">
                      {entry.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum registro encontrado</p>
                <p className="text-sm text-gray-400 mt-1">
                  Comece registrando seu primeiro ponto
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}