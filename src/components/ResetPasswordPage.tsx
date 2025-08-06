import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { FiLock, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { changePassword, supabaseLoading } = useApp();
  const navigate = useNavigate();

  // Verificar se há um token de redefinição de senha na URL
  useEffect(() => {
    // O Supabase gerencia automaticamente o token na URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (!hashParams.get('access_token')) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      const { success, error } = await changePassword(password);
      
      if (success) {
        setSuccess(true);
        // Redirecionar para a página de login após 3 segundos
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        throw new Error(error || 'Não foi possível redefinir sua senha');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao redefinir sua senha');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Redefinir Senha</h2>
          
          {success ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center">
                  <FiCheck className="text-success-500 text-3xl" />
                </div>
              </div>
              <p className="text-success-600 font-medium mb-2">Senha redefinida com sucesso!</p>
              <p className="text-gray-600">Você será redirecionado para a página de login em instantes...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Digite sua nova senha"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Confirme sua nova senha"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={supabaseLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {supabaseLoading ? 'Processando...' : 'Redefinir Senha'}
              </button>
              
              <div className="mt-4 text-center">
                <button 
                  type="button" 
                  onClick={() => navigate('/')} 
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium focus:outline-none"
                >
                  Voltar para o login
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;