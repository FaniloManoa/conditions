import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, ShieldCheck, User, Building2, Landmark, HelpCircle } from 'lucide-react';
import { clientService } from '../api';
import { CommissionType, type ClientCategory } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const categories: ClientCategory[] = ['PARTICULIER', 'CORPORATE', 'INSTITUTIONNEL'];

const typeLabels: Record<CommissionType, string> = {
  [CommissionType.EXCHANGE_CESSION]: 'Change Cession',
  [CommissionType.EXCHANGE_VIREMENT]: 'Change Virement',
  [CommissionType.TRANSFER]: 'Transfert',
  [CommissionType.SWIFT]: 'Swift (Message)',
  [CommissionType.CORRESPONDENT]: 'Correspondant',
  [CommissionType.FLAT]: 'Flat Fee (Forfait)',
  [CommissionType.EXCHANGE_IN]: 'Change IN',
};

const GlobalSettings: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<ClientCategory>('CORPORATE');
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        fetchConfigs();
    }, [selectedCategory]);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const data = await clientService.getGlobalCommissions(selectedCategory);
            // Ensure all types are present
            const fullList = Object.values(CommissionType).map(type => {
                const existing = data.find((d: any) => d.type === type);
                return existing || {
                    type,
                    is_enabled: type !== CommissionType.FLAT,
                    is_percentage: true,
                    percentage_value: 0,
                    fixed_amount: 0,
                    has_floor: false,
                    floor: 0,
                    has_ceiling: false,
                    ceiling: 0
                };
            });
            setConfigs(fullList);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (type: CommissionType, updatedFields: any) => {
        setSaving(type);
        try {
            const current = configs.find(c => c.type === type);
            const newConfig = { ...current, ...updatedFields };
            await clientService.updateGlobalCommission(selectedCategory, newConfig);
            setConfigs(prev => prev.map(c => c.type === type ? newConfig : c));
            // Show success briefly
            setTimeout(() => setSaving(null), 1000);
        } catch (err) {
            console.error(err);
            setSaving(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-red-600 rounded-xl shadow-lg shadow-red-200">
                            <Settings className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Standards Bancaires</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Configurez les commissions par défaut appliquées à chaque segment de clientèle.</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${selectedCategory === cat ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                        >
                            {cat === 'PARTICULIER' && <User size={14} />}
                            {cat === 'CORPORATE' && <Building2 size={14} />}
                            {cat === 'INSTITUTIONNEL' && <Landmark size={14} />}
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {configs.map((config, idx) => (
                            <motion.div
                                key={config.type}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`bg-white rounded-[2.5rem] border p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-red-500/5 relative overflow-hidden group ${config.is_enabled ? 'border-slate-100' : 'border-slate-50 opacity-60 grayscale'}`}
                            >
                                {config.is_enabled && (
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                )}

                                <div className="flex items-start justify-between mb-8 relative">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">{typeLabels[config.type as CommissionType]}</h3>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${config.is_enabled ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-slate-300'}`}></div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{config.is_enabled ? 'Activé par défaut' : 'Désactivé'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUpdate(config.type, { is_enabled: !config.is_enabled })}
                                        className={`p-2.5 rounded-xl transition-all ${config.is_enabled ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-slate-100 text-slate-400'}`}
                                    >
                                        <ShieldCheck size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6 relative">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Mode</label>
                                            <select 
                                                className="w-full bg-transparent font-bold text-sm text-slate-800 outline-none"
                                                value={config.is_percentage ? 'pct' : 'fixed'}
                                                onChange={(e) => handleUpdate(config.type, { is_percentage: e.target.value === 'pct' })}
                                            >
                                                <option value="pct">Pourcentage</option>
                                                <option value="fixed">Montant Fixe</option>
                                            </select>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                                {config.is_percentage ? 'Valeur (%)' : 'Valeur (MGA)'}
                                            </label>
                                            <input 
                                                type="number"
                                                className="w-full bg-transparent font-bold text-sm text-slate-800 outline-none"
                                                value={config.is_percentage ? config.percentage_value : config.fixed_amount}
                                                onChange={(e) => handleUpdate(config.type, config.is_percentage ? { percentage_value: parseFloat(e.target.value) } : { fixed_amount: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    {config.is_percentage && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="checkbox" checked={config.has_floor} 
                                                        onChange={e => handleUpdate(config.type, { has_floor: e.target.checked })}
                                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plancher</span>
                                                </div>
                                                {config.has_floor && (
                                                    <input 
                                                        type="number" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm font-bold outline-none"
                                                        value={config.floor} onChange={e => handleUpdate(config.type, { floor: parseFloat(e.target.value) })}
                                                    />
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="checkbox" checked={config.has_ceiling} 
                                                        onChange={e => handleUpdate(config.type, { has_ceiling: e.target.checked })}
                                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plafond</span>
                                                </div>
                                                {config.has_ceiling && (
                                                    <input 
                                                        type="number" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm font-bold outline-none"
                                                        value={config.ceiling} onChange={e => handleUpdate(config.type, { ceiling: parseFloat(e.target.value) })}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <HelpCircle size={14} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Auto-enregistré</span>
                                    </div>
                                    {saving === config.type && (
                                        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                                            <Save size={14} className="animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-tighter">Sauvegarde...</span>
                                        </div>
                                    )}
                                    {!saving && (
                                        <div className="p-1 px-3 bg-emerald-50 rounded-lg text-emerald-600 flex items-center gap-1.5">
                                            <Check size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">À Jour</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default GlobalSettings;
