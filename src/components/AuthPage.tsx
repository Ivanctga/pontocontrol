import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { FiUser, FiMail, FiLock, FiLogIn, FiUserPlus, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { checkIndexedDB } from '../utils/checkDB';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<string>('');
  const [dbError, setDbError] = useState<string>('');
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  
  const { login, register, requestPasswordReset, supabaseLoading } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    // Limpa mensagens de erro/sucesso quando o usuário muda de formulário
    setError(null);
    setSuccess(null);
  }, [isLogin, isResetPassword]);

  // Verifica o status do banco de dados
  useEffect(() => {
    const checkDB = async () => {
      try {
        setDbLoading(true);
        const result = await checkIndexedDB();
        setDbStatus(result as string);
        setDbError('');
      } catch (err) {
        setDbError(err as string);
        setDbStatus('');
      } finally {
        setDbLoading(false);
      }
    };

    checkDB();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isResetPassword) {
        // Lógica de redefinição de senha
        if (!email) {
          throw new Error('Por favor, informe seu e-mail');
        }
        
        // Lógica de redefinição de senha com Supabase
        const { success, error } = await requestPasswordReset(email);
        
        if (success) {
          setSuccess('Instruções de redefinição de senha foram enviadas para seu e-mail.');
        } else {
          throw new Error(error || 'Não foi possível enviar o e-mail de redefinição de senha.');
        }
      } else if (isLogin) {
        // Login
        if (!email || !password) {
          throw new Error('Por favor, preencha todos os campos');
        }
        
        const success = await login(email, password);
        if (success) {
          navigate('/app');
        } else {
          throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
        }
      } else {
        // Registro
        if (!name || !email || !password || !confirmPassword) {
          throw new Error('Por favor, preencha todos os campos');
        }
        
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem');
        }
        
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        }
        
        const success = await register(name, email, password);
        if (success) {
          setSuccess('Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.');
          // Volta para o formulário de login após o registro bem-sucedido
          setTimeout(() => {
            setIsLogin(true);
          }, 3000);
        } else {
          throw new Error('Não foi possível criar sua conta. Tente novamente.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const toggleResetPassword = () => {
    setIsResetPassword(!isResetPassword);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-700 flex items-center justify-center p-4">
      {/* Status do IndexedDB */}
      <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg z-50 max-w-xs">
        <h3 className="text-sm font-bold mb-2">Status do IndexedDB</h3>
        {dbLoading ? (
          <p className="text-xs">Verificando banco de dados...</p>
        ) : dbError ? (
          <div className="text-xs text-red-600">
            <p className="font-bold">Erro:</p>
            <p>{dbError}</p>
          </div>
        ) : (
          <div className="text-xs text-green-600">
            <p className="font-bold">Status:</p>
            <p>{dbStatus}</p>
          </div>
        )}
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isResetPassword ? 'Recuperar Senha' : isLogin ? 'Bem-vindo de volta' : 'Criar Conta'}
            </h1>
            <p className="text-gray-600">
              {isResetPassword 
                ? 'Informe seu e-mail para receber instruções de recuperação' 
                : isLogin 
                  ? 'Faça login para acessar sua conta' 
                  : 'Preencha os dados abaixo para se cadastrar'}
            </p>
          </div>

          {/* Mensagens de erro e sucesso */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-danger-100 border-l-4 border-danger-500 text-danger-700 p-4 mb-6 rounded"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-success-100 border-l-4 border-success-500 text-success-700 p-4 mb-6 rounded"
            >
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Formulário de redefinição de senha */}
            {isResetPassword ? (
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail"
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={toggleResetPassword}
                    className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <FiArrowLeft className="mr-1" /> Voltar ao login
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || supabaseLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading || supabaseLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </span>
                  ) : (
                    'Enviar instruções'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Campo de nome (apenas para registro) */}
                {!isLogin && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {/* Campo de e-mail */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail"
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Campo de senha */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Campo de confirmação de senha (apenas para registro) */}
                {!isLogin && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua senha"
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {/* Link para recuperação de senha (apenas para login) */}
                {isLogin && (
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={toggleResetPassword}
                      className="text-sm text-primary-600 hover:text-primary-800 transition-colors"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                )}

                {/* Botão de envio */}
                <button
                  type="submit"
                  disabled={loading || supabaseLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading || supabaseLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </span>
                  ) : isLogin ? (
                    <span className="flex items-center">
                      <FiLogIn className="mr-2" /> Entrar
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FiUserPlus className="mr-2" /> Cadastrar
                    </span>
                  )}
                </button>
              </div>
            )}
          </form>

          {/* Alternância entre login e registro */}
          {!isResetPassword && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {isLogin ? 'Ainda não tem uma conta?' : 'Já possui uma conta?'}
                <button
                  type="button"
                  onClick={toggleForm}
                  className="ml-1 text-primary-600 hover:text-primary-800 font-medium transition-colors"
                >
                  {isLogin ? 'Cadastre-se' : 'Faça login'}
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Rodapé com informações do sistema */}
        <div className="bg-gray-50 py-4 px-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            PlantonControl © {new Date().getFullYear()} - Sistema de controle de ponto para escalas diferenciadas
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;