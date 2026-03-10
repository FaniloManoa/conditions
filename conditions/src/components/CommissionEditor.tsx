import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { clientService } from '../api';
import { type CommissionConfig, CommissionType } from '../types';

interface Props {
  clientId: number;
  type: CommissionType;
  onClose: () => void;
}

const CommissionEditor: React.FC<Props> = ({ clientId, type, onClose }) => {
  const [config, setConfig] = useState<CommissionConfig>({
    type,
    is_enabled: true,
    is_percentage: true,
    percentage_value: 0,
    fixed_amount: 0,
    has_floor: false,
    floor: 0,
    has_ceiling: false,
    ceiling: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    clientService.getCommission(clientId, type)
      .then(data => setConfig(data))
      .catch(() => {});
  }, [clientId, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await clientService.updateCommission(clientId, config);
      onClose();
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.is_enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-800">Activer la commission</p>
            <p className="text-xs text-slate-500">Si décoché, aucun frais ne sera appliqué</p>
          </div>
        </div>
        <input 
          type="checkbox" 
          className="w-6 h-6 rounded border-slate-300 text-red-600 focus:ring-red-500 transition-all cursor-pointer"
          checked={config.is_enabled}
          onChange={e => setConfig({...config, is_enabled: e.target.checked})}
        />
      </div>

      {config.is_enabled && (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setConfig({...config, is_percentage: true})}
              className={`py-3 px-4 rounded-xl font-bold transition-all border-2 ${config.is_percentage ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-100 text-slate-400'}`}
            >
              Pourcentage
            </button>
            <button
              type="button"
              onClick={() => setConfig({...config, is_percentage: false})}
              className={`py-3 px-4 rounded-xl font-bold transition-all border-2 ${!config.is_percentage ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-100 text-slate-400'}`}
            >
              Montant Fixe
            </button>
          </div>

          <div className="space-y-4">
            {config.is_percentage ? (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Valeur Pourcentage (%)</label>
                <input 
                  type="number" step="0.01" 
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none font-bold"
                  value={config.percentage_value}
                  onChange={e => setConfig({...config, percentage_value: parseFloat(e.target.value)})}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Montant Fixe (MGA)</label>
                <div className="relative">
                  <input 
                    type="number" step="0.01" 
                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none pr-12 font-bold"
                    value={config.fixed_amount}
                    onChange={e => setConfig({...config, fixed_amount: parseFloat(e.target.value)})}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">MGA</span>
                </div>
              </div>
            )}

            {config.is_percentage && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-red-600"
                      checked={config.has_floor}
                      onChange={e => setConfig({...config, has_floor: e.target.checked})}
                    />
                    <label className="text-sm font-bold text-slate-600">Minimum (MGA)</label>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" disabled={!config.has_floor}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none disabled:bg-slate-50 disabled:text-slate-400 pr-12 font-bold"
                      value={config.floor}
                      onChange={e => setConfig({...config, floor: parseFloat(e.target.value)})}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">MGA</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-red-600"
                      checked={config.has_ceiling}
                      onChange={e => setConfig({...config, has_ceiling: e.target.checked})}
                    />
                    <label className="text-sm font-bold text-slate-600">Maximum (MGA)</label>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" disabled={!config.has_ceiling}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none disabled:bg-slate-50 disabled:text-slate-400 pr-12 font-bold"
                      value={config.ceiling}
                      onChange={e => setConfig({...config, ceiling: parseFloat(e.target.value)})}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">MGA</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
      >
        {saving ? 'Enregistrement...' : <><Save size={20} /> Sauvegarder les modifications</>}
      </button>
    </form>
  );
};

export default CommissionEditor;
