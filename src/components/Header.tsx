import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, LogOut, Settings, Menu, X } from 'lucide-react';
import { useSupabaseApp } from '../contexts/SupabaseAppContext';

export default function Header() {
  const { state, setCurrentView, logout } = useSupabaseApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Clock className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">PlantonControl</span>
            </div>
            <nav className="ml-6 hidden md:flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${state.currentView === 'dashboard' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('timesheet')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${state.currentView === 'timesheet' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                Registro de Ponto
              </button>
              <button
                onClick={() => setCurrentView('calendar')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${state.currentView === 'calendar' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                Calendário
              </button>
              <button
                onClick={() => setCurrentView('reports')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${state.currentView === 'reports' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                Relatórios
              </button>
            </nav>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full p-1"
              >
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <span className="font-medium">{state.user?.name?.split(' ')[0]}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      setCurrentView('settings');
                      setShowUserMenu(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                  >
                    <Settings className="w-4 h-4 text-primary-600" />
                    <span>Configurações</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      navigate('/');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-danger-600" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-base font-medium rounded-md ${state.currentView === 'dashboard' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setCurrentView('timesheet');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-base font-medium rounded-md ${state.currentView === 'timesheet' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              Registro de Ponto
            </button>
            <button
              onClick={() => {
                setCurrentView('calendar');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-base font-medium rounded-md ${state.currentView === 'calendar' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              Calendário
            </button>
            <button
              onClick={() => {
                setCurrentView('reports');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-base font-medium rounded-md ${state.currentView === 'reports' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              Relatórios
            </button>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  <User className="w-6 h-6" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{state.user?.name}</div>
                <div className="text-sm font-medium text-gray-500">{state.user?.email}</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={() => {
                  setCurrentView('settings');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                Configurações
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}