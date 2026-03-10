import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Settings2, 
  Info, XCircle, Edit3, Landmark,
  Calculator, Activity, CreditCard,
  Copy, Check, User, Building2
} from 'lucide-react';
import { clientService } from '../api';
import { type Client, CommissionType, type FeeCalculationResponse } from '../types';
import CommissionEditor from './CommissionEditor';
import { motion, AnimatePresence } from 'framer-motion';

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<CommissionType | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Simulation State
  const [amountStr, setAmountStr] = useState<string>('');
  const [exchangeRateStr, setExchangeRateStr] = useState<string>('');
  const [results, setResults] = useState<Record<string, FeeCalculationResponse>>({});

  useEffect(() => {
    if (id) {
      fetchClient();
    }
  }, [id]);

  const fetchClient = async () => {
    try {
      const data = await clientService.getClient(parseInt(id!));
      setClient(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-calculate all fees on change
  useEffect(() => {
    const amount = parseFloat(amountStr);
    const exchangeRate = parseFloat(exchangeRateStr);

    if (client && !isNaN(amount) && amount > 0) {
      const types = Object.values(CommissionType);
      
      const calculateAll = async () => {
        const newResults: Record<string, FeeCalculationResponse> = {};
        for (const type of types) {
          try {
            const currentRate = isNaN(exchangeRate) || exchangeRate <= 0 ? 1.0 : exchangeRate;
            const res = await clientService.calculateFee(client.id, type, amount, currentRate);
            newResults[type] = res;
          } catch (e) {
            console.error(`Error calculating ${type}`, e);
          }
        }
        setResults(newResults);
      };

      const timer = setTimeout(calculateAll, 300); // 300ms debounce
      return () => clearTimeout(timer);
    } else {
      setResults({});
    }
  }, [client, amountStr, exchangeRateStr]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!client) return (
    <div className="h-full flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Client introuvable.</h2>
      <Link to="/" className="text-indigo-600 font-bold underline underline-offset-4">Retour à l'accueil</Link>
    </div>
  );

  const flatResult = results[CommissionType.FLAT];
  const hasFlatOverride = flatResult && flatResult.fee > 0 && flatResult.description !== "Commission disabled or not configured";

  // Calculate total fees
  const totalFees = Object.entries(results).reduce((acc, [type, res]) => {
    const isBypassed = hasFlatOverride && 
      [CommissionType.EXCHANGE_VIREMENT, CommissionType.TRANSFER].includes(type as CommissionType);
      
    if (isBypassed) return acc;
    return acc + (res.fee || 0);
  }, 0);

  return (
    <div className="h-full max-w-[1600px] mx-auto flex flex-col gap-4 overflow-hidden px-4 py-4">
      
      {/* 1. HEADER */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between shrink-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
        <div className="flex items-center gap-6">
            <Link to="/" className="p-3 bg-slate-50 hover:bg-red-50 rounded-2xl transition-all text-slate-400 hover:text-red-600">
                <ArrowLeft size={20} />
            </Link>
            <div className="h-10 w-[1px] bg-slate-100 italic"></div>
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-red-600 px-2 py-0.5 bg-red-50 rounded-lg uppercase tracking-wider border border-red-100">
                        {client.identifier || `ID #${client.id}`}
                    </span>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">{client.name}</h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Activity size={16} className="text-slate-300" />
                    {client.activity}
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-2xl flex items-center gap-3 border text-[11px] font-black tracking-widest uppercase shadow-sm ${
                client.category === 'CORPORATE' ? 'bg-red-50 border-red-100 text-red-700' : 
                client.category === 'PARTICULIER' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                'bg-amber-50 border-amber-100 text-amber-700'
            }`}>
                {client.category === 'CORPORATE' && <Building2 size={16} />}
                {client.category === 'PARTICULIER' && <User size={16} />}
                {client.category === 'INSTITUTIONNEL' && <Landmark size={16} />}
                {client.category}
            </div>
            {hasFlatOverride && (
                <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-2xl text-[11px] font-black uppercase border border-red-700 shadow-md shadow-red-900/10">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    FORFAIT FLAT ACTIF
                </div>
            )}
        </div>
      </div>

      {/* 2. MAIN HUB */}
      <div className="flex-grow grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
        
        {/* LEFT: COMMISSIONS GRID */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-full overflow-y-auto no-scrollbar content-start pb-4">
                {Object.values(CommissionType).map((type, idx) => {
                    const result = results[type];
                    const isBypassed = hasFlatOverride && 
                        [CommissionType.EXCHANGE_VIREMENT, CommissionType.TRANSFER].includes(type);
                    
                    if (isBypassed) return (
                        <div key={type} className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-5 flex flex-col items-center justify-center text-center opacity-40 grayscale h-[120px]">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{typeLabels[type]}</p>
                            <p className="text-[10px] font-bold text-slate-300">Désactivé par FLAT</p>
                        </div>
                    );

                    const feeValue = result?.fee || 0;
                    const isCopied = copiedId === type;

                    return (
                        <motion.div 
                            key={type}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`bg-white p-5 rounded-[2rem] border transition-all flex flex-col justify-between group shadow-sm h-full min-h-[110px] ${feeValue > 0 ? 'border-red-100 hover:border-red-400' : 'border-slate-50 opacity-60'}`}
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-tighter group-hover:text-red-700 transition-colors truncate pr-8 leading-none mb-1">{typeLabels[type]}</h4>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${result?.is_specific ? 'bg-amber-400 animate-pulse' : 'bg-slate-200'}`}></div>
                                            <span className={`text-[9px] font-black uppercase tracking-wider ${result?.is_specific ? 'text-amber-600' : 'text-slate-300'}`}>
                                                {result?.is_specific ? 'Condition Particulière' : 'Standard Banque'}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setEditingType(type)}
                                        className="text-slate-300 hover:text-red-600 transition-colors p-1.5 bg-slate-50 rounded-lg group-hover:bg-white border border-transparent hover:border-slate-100"
                                    >
                                        <Edit3 size={15} />
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 font-medium leading-tight line-clamp-1">
                                    {result?.description || 'En attente...'}
                                </p>
                            </div>

                            <div className="pt-3 mt-3 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-baseline gap-1.5">
                                    <span className={`text-2xl font-black tabular-nums transition-colors ${feeValue > 0 ? 'text-slate-900' : 'text-slate-200'}`}>
                                        {feeValue.toLocaleString('fr-FR')}
                                    </span>
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">MGA</span>
                                </div>
                                {feeValue > 0 && (
                                    <button 
                                        onClick={() => copyToClipboard(feeValue.toString(), type)}
                                        className={`p-2 rounded-xl transition-all shadow-sm ${isCopied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white/50 hover:text-white hover:scale-110 active:scale-95'}`}
                                    >
                                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* INFO BAR */}
            <div className="bg-red-950 text-red-100 p-4 rounded-3xl flex items-center gap-4 shrink-0 shadow-lg shadow-red-100/50">
                <Info size={24} className="text-red-400" />
                <p className="text-xs font-semibold opacity-90 leading-relaxed font-mono">
                    MONTANTS EN <b className="text-white">MGA ARIARY</b>. LA COMMISSION <b className="text-white uppercase">FLAT</b> PRÉVAUT SI ELLE EST CONFIGURÉE (&gt;0).
                </p>
            </div>
        </div>

        {/* RIGHT: SIMULATOR + COMPACT ACCOUNTS */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0 overflow-hidden">
            
            {/* COMPACT SIMULATOR */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shrink-0 relative overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative space-y-7">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-600 rounded-2xl shadow-lg shadow-red-900/50">
                            <Calculator size={22} className="text-white" />
                        </div>
                        <h3 className="text-lg font-black tracking-tight uppercase">Dashboard Simulation</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-red-400 uppercase tracking-widest pl-1">Montant Opération</label>
                            <input 
                                type="text" inputMode="decimal" placeholder="0.00"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-2xl font-black text-white outline-none focus:ring-2 focus:ring-red-500 focus:bg-white/10 transition-all font-mono"
                                value={amountStr}
                                onChange={e => {
                                    const val = e.target.value.replace(',', '.').replace(/\s/g, '');
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) setAmountStr(val);
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-red-400 uppercase tracking-widest pl-1">Cours de Change</label>
                            <input 
                                type="text" inputMode="decimal" placeholder="1.00"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-2xl font-black text-white outline-none focus:ring-2 focus:ring-red-500 focus:bg-white/10 transition-all font-mono"
                                value={exchangeRateStr}
                                onChange={e => {
                                    const val = e.target.value.replace(',', '.');
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) setExchangeRateStr(val);
                                }}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-red-400 uppercase tracking-widest leading-none">Total Frais Cumulés</p>
                            <div className="flex items-center gap-5">
                                <span className="text-5xl font-black text-white tabular-nums tracking-tighter leading-none">
                                    {totalFees.toLocaleString().replace(/\s/g, '\u00A0')}
                                </span>
                                {totalFees > 0 && (
                                    <button 
                                        onClick={() => copyToClipboard(totalFees.toString(), 'total')}
                                        className={`p-3 rounded-2xl transition-all ${copiedId === 'total' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/50' : 'bg-white/10 text-white/30 hover:bg-white/30 hover:text-white'}`}
                                    >
                                        {copiedId === 'total' ? <Check size={20} /> : <Copy size={20} />}
                                    </button>
                                )}
                            </div>
                        </div>
                        <span className="text-lg font-black text-white/10 uppercase tracking-widest pl-2">MGA</span>
                    </div>
                </div>
            </div>

            {/* ADAPTIVE ACCOUNTS BOARD */}
            <div className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm flex flex-col min-h-[140px] max-h-[350px] h-fit overflow-hidden">
                <div className="flex items-center gap-3 mb-5 shrink-0 px-1 font-black text-slate-900 uppercase">
                    <div className="p-2 bg-slate-50 rounded-xl">
                        <CreditCard size={20} className="text-red-400" />
                    </div>
                    <h3 className="text-sm tracking-wider">Comptes & Devises</h3>
                </div>
                
                <div className="overflow-y-auto no-scrollbar space-y-2.5 pr-1 flex-grow">
                    {client.accounts.map(acc => (
                        <div key={acc.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-red-50/50 transition-all rounded-3xl border border-slate-100/50 group">
                            <span className="text-base font-mono font-bold text-slate-700 tracking-tighter group-hover:text-red-600 transition-colors uppercase">{acc.account_number}</span>
                            <span className="text-[13px] font-black bg-white px-3 py-2 rounded-2xl border border-slate-100 text-red-600 shadow-sm uppercase">{acc.currency}</span>
                        </div>
                    ))}
                    {client.accounts.length === 0 && (
                        <p className="text-sm text-slate-400 italic text-center py-6">Aucun compte configuré.</p>
                    )}
                </div>
            </div>
        </div>
      </div>

      <AnimatePresence>
        {editingType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
              onClick={() => setEditingType(null)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white rounded-[3.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
            >
                <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-red-600 text-white rounded-3xl shadow-lg shadow-red-100">
                             <Settings2 size={24} />
                        </div>
                        <div>
                             <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Configuration</h3>
                             <p className="text-sm font-black text-red-600 uppercase tracking-widest">{typeLabels[editingType]}</p>
                        </div>
                    </div>
                    <button onClick={() => setEditingType(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <XCircle size={32} />
                    </button>
                </div>
                <div className="p-12">
                  <CommissionEditor 
                    clientId={client.id} type={editingType} 
                    onClose={() => { setEditingType(null); fetchClient(); }}
                  />
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const typeLabels: Record<CommissionType, string> = {
  [CommissionType.EXCHANGE_CESSION]: 'Change Cession',
  [CommissionType.EXCHANGE_VIREMENT]: 'Change Virement',
  [CommissionType.TRANSFER]: 'Transfert',
  [CommissionType.SWIFT]: 'Swift (Message)',
  [CommissionType.CORRESPONDENT]: 'Correspondant',
  [CommissionType.FLAT]: 'Flat Fee (Forfait)',
  [CommissionType.EXCHANGE_IN]: 'Change IN',
};

export default ClientDetail;
