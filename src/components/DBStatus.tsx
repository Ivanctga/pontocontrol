import React, { useEffect, useState } from 'react';
import { useAppDB } from '../hooks/useIndexedDB';
import { Database, Calendar, Settings } from 'lucide-react';
import { useLocalAuth } from '../hooks/useLocalAuth';

const DBStatus: React.FC = () => {
  const db = useAppDB();
  const { user } = useLocalAuth();
  const [status, setStatus] = useState<{
    users: number;
    timeEntries: number;
    schedules: number;
    settings: boolean;
  }>({ users: 0, timeEntries: 0, schedules: 0, settings: false });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        if (user) {
          // Verifica usuários
          const users = await db.getUsers();
          
          // Verifica registros de ponto do usuário atual
          const timeEntries = await db.getTimeEntries(user.id);
          
          // Verifica agendamentos do usuário atual
          const schedules = await db.getSchedules(user.id);
          
          // Verifica configurações
          const settings = await db.getSettings();
          
          setStatus({
            users: users.length,
            timeEntries: timeEntries.length,
            schedules: schedules.length,
            settings: !!settings
          });
        }
      } catch (error) {
        console.error('Erro ao verificar status do banco de dados:', error);
      }
    };
    
    if (user) {
      checkStatus();
    }
  }, [user]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center mb-2">
          <Database className="h-5 w-5 mr-2 text-blue-500" />
          <h3 className="text-lg font-semibold">Banco de Dados Local</h3>
        </div>
        <p className="text-gray-600">Status: <span className="text-green-500 font-semibold">Ativo</span></p>
        <p className="text-gray-600">Usuários: {status.users}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center mb-2">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          <h3 className="text-lg font-semibold">Registros</h3>
        </div>
        <p className="text-gray-600">Registros de Ponto: {status.timeEntries}</p>
        <p className="text-gray-600">Agendamentos: {status.schedules}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center mb-2">
          <Settings className="h-5 w-5 mr-2 text-blue-500" />
          <h3 className="text-lg font-semibold">Configurações</h3>
        </div>
        <p className="text-gray-600">Status: 
          {status.settings ? 
            <span className="text-green-500 font-semibold">Configurado</span> : 
            <span className="text-yellow-500 font-semibold">Não configurado</span>
          }
        </p>
      </div>
    </div>
  );
};

export default DBStatus;