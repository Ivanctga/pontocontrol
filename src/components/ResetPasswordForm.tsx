import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check, Lock } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { supabase } from '../config/supabase';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Verifica se há um hash na URL para redefinição de senha
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes('type=recovery')) {
      setError('Link de redefinição de senha inválido ou expirado');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validação básica
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redireciona para a página de login após 3 segundos
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Ocorreu um erro ao redefinir sua senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-0">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Redefinir Senha
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg flex items-start mb-4">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-danger-500" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg flex items-start mb-4">
              <Check className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-success-500" />
              <span className="text-sm">Senha redefinida com sucesso! Redirecionando para a página de login...</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Digite sua nova senha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Confirme sua nova senha"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={<Lock className="w-5 h-5" />}
              >
                Redefinir Senha
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}