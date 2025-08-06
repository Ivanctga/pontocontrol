import React, { useState, useRef, useEffect } from 'react';
import { Settings as SettingsIcon, Calendar, Clock, Lock, Save, Trash2, AlertTriangle, User, Camera, Key, Building, Info, Mail } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Settings as SettingsType } from '../types';

export default function Settings() {
  const { state, updateSettings, clearTimeEntries, updateUserProfile } = useApp();
  
  // Estados para os campos de configuração
  const [formData, setFormData] = useState({
    projectName: state.settings?.projectName || 'PlantonControl',
    startDate: state.settings?.startDate || '',
    endDate: state.settings?.endDate || '',
    regularHoursLimit: state.settings?.regularHoursLimit || 24,
    sheetPassword: state.settings?.sheetPassword || '',
    confirmPassword: '',
    showPasswordWarning: false,
    showClearWarning: false
  });
  
  const [userFormData, setUserFormData] = useState({
    name: state.user?.name || '',
    email: state.user?.email || '',
    profileImage: state.user?.profileImage || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    showPasswordMismatch: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manipulador de alterações nos campos de configurações
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? Number(value) : value;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: newValue };
      
      // Verificar se as senhas coincidem
      if (name === 'sheetPassword' || name === 'confirmPassword') {
        const passwordsMatch = 
          (name === 'sheetPassword' && newValue === prev.confirmPassword) ||
          (name === 'confirmPassword' && newValue === prev.sheetPassword);
        
        newData.showPasswordWarning = 
          (newData.sheetPassword || newData.confirmPassword) && !passwordsMatch;
      }
      
      return newData;
    });
  };

  // Manipulador de alterações nos campos de usuário
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setUserFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Verificar se as senhas coincidem
      if (name === 'newPassword' || name === 'confirmNewPassword') {
        const passwordsMatch = 
          (name === 'newPassword' && value === prev.confirmNewPassword) ||
          (name === 'confirmNewPassword' && value === prev.newPassword);
        
        newData.showPasswordMismatch = 
          (newData.newPassword || newData.confirmNewPassword) && !passwordsMatch;
      }
      
      return newData;
    });
  };

  // Manipulador para upload de imagem de perfil
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserFormData(prev => ({
        ...prev,
        profileImage: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  // Salvar configurações
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se as senhas coincidem ao definir uma nova senha
    if (formData.sheetPassword && formData.sheetPassword !== formData.confirmPassword) {
      setFormData(prev => ({ ...prev, showPasswordWarning: true }));
      return;
    }
    
    // Preparar objeto de configurações para salvar
    const settings: SettingsType = {
      projectName: formData.projectName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      regularHoursLimit: formData.regularHoursLimit,
      sheetPassword: formData.sheetPassword,
      updatedAt: new Date().toISOString()
    };
    
    // Atualizar configurações no contexto
    updateSettings(settings);
    
    // Resetar avisos
    setFormData(prev => ({ 
      ...prev, 
      showPasswordWarning: false,
      confirmPassword: ''
    }));
    
    // Mostrar feedback de sucesso
    alert('Configurações salvas com sucesso!');
  };

  // Manipulador de envio do formulário de usuário
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica se as senhas coincidem
    if (userFormData.newPassword && userFormData.newPassword !== userFormData.confirmNewPassword) {
      setUserFormData(prev => ({ ...prev, showPasswordMismatch: true }));
      return;
    }
    
    // Prepara os dados para atualização
    const updates: any = {
      name: userFormData.name,
      profileImage: userFormData.profileImage
    };
    
    // Adiciona a senha apenas se uma nova senha foi fornecida
    if (userFormData.newPassword) {
      updates.password = userFormData.newPassword;
    }
    
    // Atualiza o perfil do usuário
    const success = await updateUserProfile(updates);
    
    if (success) {
      alert('Perfil atualizado com sucesso!');
      // Limpa os campos de senha após a atualização
      setUserFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
    } else {
      alert('Erro ao atualizar o perfil. Tente novamente.');
    }
  };

  // Limpar dados da planilha
  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os registros de ponto? Esta ação não pode ser desfeita.')) {
      clearTimeEntries();
      setFormData(prev => ({ ...prev, showClearWarning: false }));
      alert('Todos os registros foram removidos com sucesso.');
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seção: Dados do Usuário */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Dados do Usuário
          </h3>
          
          <form onSubmit={handleUserSubmit} className="space-y-6">
            {/* Foto de Perfil */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md mb-2">
                  {userFormData.profileImage ? (
                    <img 
                      src={userFormData.profileImage} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50">
                      <User className="w-16 h-16 text-blue-300" />
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">Clique no ícone para alterar sua foto</p>
            </div>
            
            {/* Nome Completo */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userFormData.name}
                  onChange={handleUserChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userFormData.email}
                  onChange={handleUserChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  O e-mail não pode ser alterado após o cadastro
                </p>
              </div>
            </div>
            
            {/* Alterar Senha */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-md font-medium text-gray-700 flex items-center">
                <Key className="w-4 h-4 mr-2 text-blue-600" />
                Alterar Senha
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={userFormData.currentPassword}
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={userFormData.newPassword}
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    value={userFormData.confirmNewPassword}
                    onChange={handleUserChange}
                    className={`w-full px-3 py-2 border ${userFormData.showPasswordMismatch ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {userFormData.showPasswordMismatch && (
                    <p className="text-xs text-red-500 mt-1">
                      As senhas não coincidem
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Botão de Salvar */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Atualizar Perfil
              </button>
            </div>
          </form>
        </div>
        
        {/* Seção: Parâmetros Gerais */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2 text-purple-600" />
            Parâmetros Gerais
          </h3>
          
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Nome do Projeto */}
            <div className="space-y-2">
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                Nome do Projeto
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Info className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
            </div>

            {/* Datas de Início e Fim */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <h4 className="text-md font-medium text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                Período do Projeto
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Limites de Horas */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <h4 className="text-md font-medium text-gray-700 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-purple-600" />
                Limites de Horas
              </h4>
              
              <div>
                <label htmlFor="regularHoursLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Limite de Horas Normais
                </label>
                <input
                  type="number"
                  id="regularHoursLimit"
                  name="regularHoursLimit"
                  value={formData.regularHoursLimit}
                  onChange={handleChange}
                  min="1"
                  max="24"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Horas trabalhadas acima deste limite serão consideradas como horas extras
                </p>
              </div>
            </div>

            {/* Proteção da Planilha */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <h4 className="text-md font-medium text-gray-700 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-purple-600" />
                Proteção da Planilha
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sheetPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha de Proteção
                  </label>
                  <input
                    type="password"
                    id="sheetPassword"
                    name="sheetPassword"
                    value={formData.sheetPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe em branco para não usar senha
                  </p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${formData.showPasswordWarning ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  {formData.showPasswordWarning && (
                    <p className="text-xs text-red-500 mt-1">
                      As senhas não coincidem
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="pt-4 border-t border-gray-100 flex justify-between">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, showClearWarning: true }))}
                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Dados
              </button>
              
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Confirmação para Limpar Dados */}
      {formData.showClearWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Atenção</h3>
            </div>
            
            <p className="text-gray-700 mb-6">
              Esta ação irá remover permanentemente todos os registros de ponto. Esta operação não pode ser desfeita.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setFormData(prev => ({ ...prev, showClearWarning: false }))}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Sim, limpar tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}