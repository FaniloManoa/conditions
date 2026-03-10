import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Building2, User, HelpCircle, Landmark } from 'lucide-react';
import { clientService } from '../api';
import { type Client } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const ClientList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientService.getClients()
      .then(data => {
        setClients(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const filteredClients = searchTerm.trim() === ''
    ? []
    : clients.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.identifier && c.identifier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.id.toString().includes(searchTerm)
    );

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      {/* Header & Hero Search */}
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Portefeuille Clients</h1>
          <p className="text-lg text-slate-500 font-medium">Recherchez un client pour accéder à son simulateur de frais personnalisé.</p>
        </div>

        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-red-800 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-red-600 transition-colors" />
            <input
              type="text"
              placeholder="Entrez le nom, l'activité ou l'identifiant du client..."
              className="w-full pl-16 pr-6 py-6 rounded-[1.8rem] border border-slate-200 bg-white text-xl font-medium focus:ring-4 focus:ring-red-600/5 focus:border-red-600 outline-none transition-all shadow-xl shadow-slate-200/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Dynamic Results Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {!searchTerm.trim() ? (
            // Initial State: Prompt to search
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-4"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <Search size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-slate-400">Prêt à rechercher ?</p>
                <p className="text-slate-400">Saisissez quelques caractères pour trouver un client.</p>
              </div>
            </motion.div>
          ) : filteredClients.length > 0 ? (
            // Results List
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between px-4 mb-4">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Résultats de recherche ({filteredClients.length})</h2>
              </div>

              {filteredClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    to={`/client/${client.id}`}
                    className="flex items-center bg-white p-5 rounded-3xl border border-slate-100 hover:border-red-500 hover:shadow-xl hover:shadow-red-500/5 transition-all group"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${client.category === 'CORPORATE' ? 'bg-red-50 text-red-600 shadow-sm shadow-red-100' :
                        client.category === 'PARTICULIER' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-amber-50 text-amber-600'
                      }`}>
                      {client.category === 'CORPORATE' && <Building2 size={24} />}
                      {client.category === 'PARTICULIER' && <User size={24} />}
                      {client.category === 'INSTITUTIONNEL' && <Landmark size={24} />}
                    </div>

                    <div className="ml-5 flex-grow">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-red-700 transition-colors uppercase tracking-tight">{client.name}</h3>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${client.category === 'CORPORATE' ? 'bg-red-50 border-red-100 text-red-600' :
                            client.category === 'PARTICULIER' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                              'bg-amber-50 border-amber-100 text-amber-600'
                          }`}>
                          {client.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium line-clamp-1 mt-0.5">{client.activity}</p>
                    </div>

                    <div className="flex items-center gap-6 px-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Identifiant</p>
                        <p className="text-xs font-mono font-bold text-slate-600">{client.identifier || `#${client.id.toString().padStart(4, '0')}`}</p>
                      </div>
                      <div className="h-8 w-[1px] bg-slate-100 hidden sm:block"></div>
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Conditions</p>
                        <p className="text-xs font-bold text-red-600">Simuler →</p>
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-red-600 transition-colors ml-2" size={20} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // No matches
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
                <HelpCircle size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-slate-900">Aucun client trouvé</p>
                <p className="text-slate-400">Nous n'avons trouvé aucun résultat pour "{searchTerm}"</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
