import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, Clock, Shield, Calendar, AlertCircle, BarChart3, Mail } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState(false);
  const { login, register, requestPasswordReset, loading: appLoading } = useApp();
  
  // Limpa mensagens quando o modo muda
  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
  }, [isLogin, resetPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Modo de redefinição de senha
      if (resetPassword) {
        const { success, error } = await requestPasswordReset(formData.email);
        
        if (!success) {
          setError(error || 'Erro ao solicitar redefinição de senha');
        } else {
          setSuccessMessage('Enviamos um email com instruções para redefinir sua senha.');
          // Volta para o modo de login após 3 segundos
          setTimeout(() => {
            setResetPassword(false);
          }, 3000);
        }
        setLoading(false);
        return;
      }
      
      let success = false;
      
      if (isLogin) {
        success = await login(formData.email, formData.password);
        if (!success) {
          setError('Email ou senha incorretos');
        }
      } else {
        // Validações básicas
        if (formData.name.trim().length < 3) {
          setError('Nome deve ter pelo menos 3 caracteres');
          setLoading(false);
          return;
        }
        
        if (!formData.email.includes('@') || !formData.email.includes('.')) {
          setError('Email inválido');
          setLoading(false);
          return;
        }
        
        if (formData.password.length < 6) {
          setError('Senha deve ter pelo menos 6 caracteres');
          setLoading(false);
          return;
        }
        
        success = await register(formData.name, formData.email, formData.password);
        if (success) {
          setSuccessMessage('Cadastro realizado com sucesso!');
        } else {
          setError('Email já cadastrado ou ocorreu um erro no registro');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Erro ao processar a solicitação');
    } finally {
      setLoading(false);
    }
  };
  
  // Alterna entre os modos de login, cadastro e redefinição de senha
  const toggleMode = () => {
    if (resetPassword) {
      setResetPassword(false);
      setIsLogin(true);
    } else {
      setIsLogin(!isLogin);
    }
    
    setError(null);
    setSuccessMessage(null);
    setFormData({
      name: '',
      email: '',
      password: ''
    });
  };
  
  // Alterna para o modo de redefinição de senha
  const toggleResetPassword = () => {
    setResetPassword(true);
    setError(null);
    setSuccessMessage(null);
    setFormData({
      ...formData,
      password: ''
    });
  };

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
        <Card className="mb-6 overflow-hidden">
          {/* Features */}
          <CardHeader className="bg-primary-50 border-b border-primary-100">
            <CardTitle icon={<Shield className="w-5 h-5" />}>
              Recursos do Sistema
            </CardTitle>
            <div className="grid grid-cols-1 gap-3 mt-3">
              <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-card">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100">
                  <Shield className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-sm">Cálculo automático de horas extras</span>
              </div>
              <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-card">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success-100">
                  <Calendar className="w-4 h-4 text-success-600" />
                </div>
                <span className="text-sm">Visualização de escalas 24x72h</span>
              </div>
              <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-card">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-warning-100">
                  <BarChart3 className="w-4 h-4 text-warning-600" />
                </div>
                <span className="text-sm">Relatórios mensais dinâmicos</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg flex items-start mb-4">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-danger-500" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            {successMessage && (
              <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg flex items-start mb-4">
                <Mail className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-success-500" />
                <span className="text-sm">{successMessage}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !resetPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required={!isLogin && !resetPassword}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="Seu nome completo"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="seu@email.com"
                />
              </div>

              {!resetPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    required={!resetPassword}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="Sua senha"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || appLoading}
                variant="primary"
                size="lg"
                fullWidth
                loading={loading || appLoading}
                icon={
                  resetPassword ? <Mail className="w-5 h-5" /> : 
                  isLogin ? <LogIn className="w-5 h-5" /> : 
                  <UserPlus className="w-5 h-5" />
                }
              >
                {resetPassword ? 'Enviar Email de Recuperação' : isLogin ? 'Entrar' : 'Cadastrar'}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <Button
                onClick={toggleMode}
                variant="ghost"
                size="sm"
              >
                {resetPassword ? 'Voltar para o login' : 
                 isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
              </Button>
              
              {isLogin && !resetPassword && (
                <div>
                  <Button
                    onClick={toggleResetPassword}
                    variant="link"
                    size="sm"
                  >
                    Esqueceu sua senha?
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500">
          Sistema desenvolvido para profissionais em escalas diferenciadas
        </p>
      </div>
    </div>
  );
}