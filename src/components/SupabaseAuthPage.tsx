import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { FiUser, FiMail, FiLock, FiLogIn, FiUserPlus, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Clock, Shield, Calendar, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';

const SupabaseAuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { user, loading, signIn, signUp, resetPassword } = useSupabaseAuth();
  const navigate = useNavigate();

  // Redireciona se o usuário já estiver autenticado
  useEffect(() => {
    if (user && !loading) {
      navigate('/app');
    }
  }, [user, loading, navigate]);

  // Limpa mensagens quando o modo muda
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [isLogin, isResetPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (isResetPassword) {
      if (!formData.email) {
        setError('Por favor, informe seu e-mail');
        return false;
      }
      if (!formData.email.includes('@') || !formData.email.includes('.')) {
        setError('Por favor, informe um e-mail válido');
        return false;
      }
      return true;
    }

    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return false;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Por favor, informe um e-mail válido');
      return false;
    }

    if (!isLogin) {
      if (!formData.name || formData.name.trim().length < 2) {
        setError('Por favor, informe seu nome completo');
        return false;
      }

      if (formData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setFormLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isResetPassword) {
        const { success, error } = await resetPassword(formData.email);
        
        if (success) {
          setSuccess('Instruções de redefinição de senha foram enviadas para seu e-mail.');
          setTimeout(() => {
            setIsResetPassword(false);
            setIsLogin(true);
          }, 3000);
        } else {
          setError(error || 'Não foi possível enviar o e-mail de redefinição de senha.');
        }
      } else if (isLogin) {
        const { success, error } = await signIn(formData.email, formData.password);
        
        if (success) {
          // O redirecionamento é feito pelo useEffect que observa o user
        } else {
          setError(error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
        }
      } else {
        const { success, error } = await signUp(formData.email, formData.password, formData.name);
        
        if (success) {
          setSuccess('Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.');
          setTimeout(() => {
            setIsLogin(true);
          }, 3000);
        } else {
          setError(error || 'Não foi possível criar sua conta. Tente novamente.');
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError(null);
    setSuccess(null);
  };

  const toggleResetPassword = () => {
    setIsResetPassword(!isResetPassword);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4 shadow-lg">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PlantonControl
          </h1>
          <p className="text-gray-600">
            Sistema de controle de ponto para escalas diferenciadas
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-6">
          {/* Features Header */}
          <div className="bg-primary-50 border-b border-primary-100 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full">
                <Shield className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Recursos do Sistema</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100">
                  <Shield className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-sm text-gray-700">Cálculo automático de horas extras</span>
              </div>
              <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success-100">
                  <Calendar className="w-4 h-4 text-success-600" />
                </div>
                <span className="text-sm text-gray-700">Visualização de escalas 24x72h</span>
              </div>
              <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-warning-100">
                  <BarChart3 className="w-4 h-4 text-warning-600" />
                </div>
                <span className="text-sm text-gray-700">Relatórios mensais dinâmicos</span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {isResetPassword ? 'Recuperar Senha' : isLogin ? 'Bem-vindo de volta' : 'Criar Conta'}
              </h2>
              <p className="text-gray-600">
                {isResetPassword 
                  ? 'Informe seu e-mail para receber instruções de recuperação' 
                  : isLogin 
                    ? 'Faça login para acessar sua conta' 
                    : 'Preencha os dados abaixo para se cadastrar'}
              </p>
            </div>

            {/* Messages */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg flex items-start mb-4"
              >
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-danger-500" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg flex items-start mb-4"
              >
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-success-500" />
                <span className="text-sm">{success}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome (apenas para cadastro) */}
              {!isLogin && !isResetPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required={!isLogin && !isResetPassword}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>
              )}

              {/* E-mail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Senha */}
              {!isResetPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required={!isResetPassword}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      placeholder="Sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmar Senha (apenas para cadastro) */}
              {!isLogin && !isResetPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required={!isLogin && !isResetPassword}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      placeholder="Confirme sua senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Link para recuperação de senha (apenas para login) */}
              {isLogin && !isResetPassword && (
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
                disabled={formLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {formLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </span>
                ) : isResetPassword ? (
                  'Enviar instruções'
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
            </form>

            {/* Navigation Links */}
            <div className="mt-6 text-center space-y-2">
              {isResetPassword ? (
                <button
                  type="button"
                  onClick={toggleResetPassword}
                  className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <FiArrowLeft className="mr-1" /> Voltar ao login
                </button>
              ) : (
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
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          Sistema desenvolvido para profissionais em escalas diferenciadas
        </p>
      </div>
    </div>
  );
};

export default SupabaseAuthPage;