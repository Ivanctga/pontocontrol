import React, { useState, useEffect } from 'react';
import { useAppDB } from '../hooks/useIndexedDB';
import { useLocalAuth } from '../hooks/useLocalAuth';

const AuthTester: React.FC = () => {
  const [email, setEmail] = useState('teste@example.com');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('Usuário Teste');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<any>(null);
  
  const db = useAppDB();
  const auth = useLocalAuth();
  
  // Verifica o status do banco de dados
  useEffect(() => {
    const checkDB = async () => {
      try {
        const request = indexedDB.open('TimesheetDB');
        
        request.onsuccess = () => {
          const db = request.result;
          const stores = Array.from(db.objectStoreNames);
          setDbStatus({
            status: 'success',
            stores: stores
          });
          db.close();
        };
        
        request.onerror = (event) => {
          setDbStatus({
            status: 'error',
            message: 'Erro ao abrir o banco de dados'
          });
        };
      } catch (err) {
        setDbStatus({
          status: 'error',
          message: err instanceof Error ? err.message : 'Erro desconhecido'
        });
      }
    };
    
    checkDB();
  }, []);
  
  const handleCreateUser = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Verifica se o usuário já existe
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        setResult(`Usuário já existe: ${JSON.stringify(existingUser)}`);
        return;
      }
      
      // Cria o usuário
      const userId = await db.saveUser(
        {
          name,
          email,
          role: 'Profissional',
          profileImage: ''
        },
        password
      );
      
      if (userId) {
        setResult(`Usuário criado com sucesso. ID: ${userId}`);
      } else {
        throw new Error('Falha ao criar usuário');
      }
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await auth.signIn(email, password);
      
      if (result.success) {
        setResult(`Login realizado com sucesso: ${JSON.stringify(result.user)}`);
      } else {
        throw new Error(result.error || 'Credenciais inválidas');
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Teste de Autenticação</h2>
      
      {/* Status do banco de dados */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Status do IndexedDB</h3>
        {!dbStatus ? (
          <p>Verificando banco de dados...</p>
        ) : dbStatus.status === 'error' ? (
          <div className="text-red-600">
            <p className="font-bold">Erro:</p>
            <p>{dbStatus.message}</p>
          </div>
        ) : (
          <div>
            <p className="text-green-600 font-semibold">Banco de dados disponível</p>
            <p className="text-sm mt-2">Object Stores:</p>
            <ul className="list-disc list-inside text-sm">
              {dbStatus.stores.map((store: string) => (
                <li key={store}>{store}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Formulário de teste */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleCreateUser}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Criar Usuário
          </button>
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Fazer Login
          </button>
        </div>
      </div>
      
      {/* Resultado */}
      {loading && (
        <div className="mt-4 text-center">
          <p>Processando...</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p className="font-bold">Erro:</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          <p className="font-bold">Resultado:</p>
          <p className="break-all">{result}</p>
        </div>
      )}
    </div>
  );
};

export default AuthTester;