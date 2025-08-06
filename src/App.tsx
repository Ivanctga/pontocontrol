import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import AuthPage from './components/AuthPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TimeSheet from './components/TimeSheet';
import Calendar from './components/Calendar';
import Reports from './components/Reports';
import Settings from './components/Settings';
import DBChecker from './components/DBChecker';
import AuthTester from './components/AuthTester';

// Componente protegido que requer autenticação
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useApp();
  
  if (!state.user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Componente para o layout principal da aplicação
const MainLayout = () => {
  const { state } = useApp();
  
  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'timesheet':
        return <TimeSheet />;
      case 'calendar':
        return <Calendar />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fadeIn">
          {renderCurrentView()}
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            PlantonControl © {new Date().getFullYear()} - Sistema de controle de ponto para escalas diferenciadas
          </p>
        </div>
      </footer>
    </div>
  );
};

function AppContent() {
  const { state } = useApp();

  // Importar fonte Inter do Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={state.user ? <Navigate to="/app" replace /> : <AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        } />
        <Route path="/db-check" element={<DBChecker />} />
          <Route path="/auth-test" element={<AuthTester />} />
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;