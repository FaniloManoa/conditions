import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, Building2, Settings, UserPlus } from 'lucide-react';
import ClientList from './components/ClientList';
import ClientDetail from './components/ClientDetail';
import GlobalSettings from './components/GlobalSettings';
import NewClient from './components/NewClient';
import { clientService } from './api';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDetailPage = location.pathname.startsWith('/client/');

  useEffect(() => {
    // Attempt to seed on first load
    clientService.seed().catch(() => {});
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shrink-0 border-b border-slate-200 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-red-600 p-2 rounded-lg group-hover:rotate-6 transition-transform shadow-lg shadow-red-200">
                <Building2 className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800">
                CondiBank
              </span>
            </Link>
            <div className="flex space-x-8">
              <Link to="/" className={`flex items-center gap-2 transition-colors font-bold text-[11px] uppercase tracking-widest ${location.pathname === '/' ? 'text-red-600 border-b-2 border-red-600 h-16' : 'text-slate-400 hover:text-slate-600'}`}>
                <Users size={18} /> Portefeuille Clients
              </Link>
              <Link to="/settings" className={`flex items-center gap-2 transition-colors font-bold text-[11px] uppercase tracking-widest ${location.pathname === '/settings' ? 'text-red-600 border-b-2 border-red-600 h-16' : 'text-slate-400 hover:text-slate-600'}`}>
                <Settings size={18} /> Standards
              </Link>
            </div>
            
            <Link to="/new-client" className="hidden border-2 border-red-600 md:flex items-center gap-2 bg-white text-red-600 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-0.5 active:scale-95">
              <UserPlus size={18} /> Nouveau Client
            </Link>
          </div>
        </div>
      </nav>

      <main className={`flex-grow min-h-0 ${isDetailPage ? '' : 'overflow-y-auto'}`}>
        <div className={`${isDetailPage ? 'h-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
          <Routes>
            <Route path="/" element={<ClientList />} />
            <Route path="/client/:id" element={<ClientDetail />} />
            <Route path="/settings" element={<GlobalSettings />} />
            <Route path="/new-client" element={<NewClient />} />
          </Routes>
        </div>
      </main>

      {!isDetailPage && (
        <footer className="shrink-0 border-t border-slate-200 py-4 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-white">
          &copy; 2026 CondiBank Management System &bull; <span className="text-red-300">Configuration Centrale Active</span>
        </footer>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
