import React, { useState, useEffect } from 'react';
import { Calculator, UserPlus, Info, CheckCircle2 } from 'lucide-react';
import { clientService } from '../api';
import { type Client, CommissionType, type FeeCalculationResponse } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const FeeSimulator: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [type, setType] = useState<CommissionType>(CommissionType.TRANSFER);
  const [amount, setAmount] = useState<number>(10000);
  const [result, setResult] = useState<FeeCalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clientService.getClients().then(setClients);
  }, []);

  const handleSimulate = async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      const data = await clientService.calculateFee(selectedClientId, type, amount, 1.0);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Simulateur de Frais</h1>
        <p className="text-slate-500 mt-1">Testez les configurations de commissions en temps réel pour un client donné.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <UserPlus size={16} /> Sélectionner un Client
              </label>
              <select 
                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                value={selectedClientId || ''}
                onChange={e => setSelectedClientId(parseInt(e.target.value))}
              >
                <option value="" disabled>Choisir un client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Type d'opération</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.values(CommissionType).map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`text-left p-3 px-4 rounded-xl text-sm font-bold transition-all border-2 ${type === t ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Montant de la transaction</label>
              <input 
                type="number" 
                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-2xl font-bold"
                value={amount}
                onChange={e => setAmount(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={!selectedClientId || loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Calcul en cours...' : <><Calculator size={20} /> Calculer les frais</>}
          </button>
        </div>

        {/* Result Panel */}
        <div className="flex flex-col">
           <AnimatePresence mode="wait">
             {result ? (
               <motion.div 
                 key="result"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200 flex-grow flex flex-col justify-center text-center space-y-4"
               >
                 <div className="mx-auto bg-white/20 p-4 rounded-full w-20 h-20 flex items-center justify-center backdrop-blur-md border border-white/30">
                    <CheckCircle2 size={40} />
                 </div>
                 <div>
                    <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-1">Montant de la commission</p>
                    <p className="text-5xl font-extrabold">{result.fee.toLocaleString()} <span className="text-2xl font-medium opacity-80">CFA</span></p>
                 </div>
                 
                 <div className="bg-white/10 p-4 rounded-2xl border border-white/20 mt-4 text-left">
                    <div className="flex items-start gap-3">
                       <Info size={20} className="shrink-0 mt-1" />
                       <div>
                          <p className="font-bold">Détails du calcul</p>
                          <p className="text-sm text-indigo-100">{result.description}</p>
                          {result.is_flat_override && (
                            <p className="mt-2 text-xs bg-amber-500/30 border border-amber-500/50 p-2 rounded-lg font-bold">
                               ⚠️ Commission FLAT appliquée (Change/Transfert ignorés)
                            </p>
                          )}
                       </div>
                    </div>
                 </div>
               </motion.div>
             ) : (
               <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-3xl flex-grow flex items-center justify-center p-12 text-center text-slate-400">
                  <div className="space-y-4">
                    <Calculator size={48} className="mx-auto opacity-20" />
                    <p>Sélectionnez un client et lancez la simulation pour voir les résultats ici.</p>
                  </div>
               </div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FeeSimulator;
