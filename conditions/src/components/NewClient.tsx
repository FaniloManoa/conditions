import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Building2, User, Landmark, Save, ArrowLeft, CreditCard, Briefcase } from 'lucide-react';
import { clientService } from '../api';
import type { ClientCategory } from '../types';
import { motion } from 'framer-motion';

export default function NewClient() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        identifier: '',
        name: '',
        activity: '',
        category: 'PARTICULIER' as ClientCategory,
        account_number: '',
        account_currency: 'MGA'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newClient = await clientService.createClient(formData);
            navigate(`/client/${newClient.id}`);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={16} /> Retour
                </button>
                <div className="text-right">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 justify-end">
                        Nouveau Client
                        <div className="p-2 bg-red-600 rounded-xl shadow-lg shadow-red-200">
                            <UserPlus className="text-white w-5 h-5" />
                        </div>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">Enregistrez un nouveau client dans le portefeuille</p>
                </div>
            </div>

            <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
            >
                {/* Section: Informations Générales */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <CreditCard size={14} className="text-red-500" /> Code Identifiant
                            </label>
                            <input 
                                required
                                type="text"
                                value={formData.identifier}
                                onChange={e => setFormData({...formData, identifier: e.target.value.toUpperCase()})}
                                placeholder="ex: C001"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-lg font-bold placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all font-mono"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} className="text-red-500" /> Nom ou Raison Sociale
                            </label>
                            <input 
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="ex: SONATEL SA ou Jean DUPONT"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-lg font-bold placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all font-mono"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase size={14} className="text-red-500" /> Secteur d'Activité
                            </label>
                            <input 
                                required
                                type="text"
                                value={formData.activity}
                                onChange={e => setFormData({...formData, activity: e.target.value})}
                                placeholder="ex: Télécommunications"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-lg font-bold placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all font-mono"
                            />
                        </div>
                    </div>

                    {/* Catégorie */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Segment de Clientèle</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {(['PARTICULIER', 'CORPORATE', 'INSTITUTIONNEL'] as ClientCategory[]).map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFormData({...formData, category: cat})}
                                    className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-4 group ${
                                        formData.category === cat 
                                        ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-200' 
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-red-200 hover:bg-red-50/30'
                                    }`}
                                >
                                    <div className={`p-3 rounded-2xl transition-colors ${formData.category === cat ? 'bg-white/20' : 'bg-slate-50'}`}>
                                        {cat === 'PARTICULIER' && <User size={24} />}
                                        {cat === 'CORPORATE' && <Building2 size={24} />}
                                        {cat === 'INSTITUTIONNEL' && <Landmark size={24} />}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">{cat}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section: Compte Initial */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-xl">
                            <CreditCard size={18} className="text-red-500" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Compte Bancaire (Optionnel)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Numéro de Compte</label>
                            <input 
                                type="text"
                                value={formData.account_number}
                                onChange={e => setFormData({...formData, account_number: e.target.value})}
                                placeholder="ex: SN062 01001 123456789 45"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-lg font-bold placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Devise</label>
                            <select 
                                value={formData.account_currency}
                                onChange={e => setFormData({...formData, account_currency: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-lg font-bold outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all appearance-none"
                            >
                                <option value="MGA text-red-600">MGA (Ariary)</option>
                                <option value="XOF">XOF (Franc CFA)</option>
                                <option value="EUR">EUR (Euro)</option>
                                <option value="USD">USD (Dollar)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-3xl py-6 text-lg font-black uppercase tracking-widest shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <><Save size={24} /> Créer le dossier client</>
                    )}
                </button>
            </motion.form>
        </div>
    );
}
