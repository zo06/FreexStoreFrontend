'use client';

import { useState } from 'react';
import { hrApi } from '../../lib/api/hr-api';
import { useLanguage } from '../../lib/contexts/LanguageContext';

interface Props {
  targetId: string;
  targetName: string;
  sessionId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdjustmentModal({ targetId, targetName, sessionId, onClose, onSuccess }: Props) {
  const [type, setType] = useState<'BONUS' | 'DEDUCTION'>('BONUS');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalSeconds = (parseInt(hours || '0') * 3600) + (parseInt(minutes || '0') * 60);
    if (totalSeconds <= 0) { setError(t('hr.adjustment.specifyMinute')); return; }
    if (!reason.trim()) { setError(t('hr.adjustment.reasonRequired')); return; }

    setLoading(true);
    setError('');
    try {
      await hrApi.admin.createAdjustment({ targetHrProfileId: targetId, type, seconds: totalSeconds, reason, sessionId });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message || t('hr.adjustment.failedToCreate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div>
            <h3 className="text-white font-semibold text-lg">{t('hr.adjustment.title')}</h3>
            <p className="text-gray-400 text-sm">{t('hr.adjustment.for')} {targetName}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2 p-1 bg-gray-800 rounded-lg">
            <button
              type="button"
              onClick={() => setType('BONUS')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${type === 'BONUS' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {t('hr.adjustment.bonusHours')}
            </button>
            <button
              type="button"
              onClick={() => setType('DEDUCTION')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${type === 'DEDUCTION' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {t('hr.adjustment.deduction')}
            </button>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">{t('hr.adjustment.duration')}</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number" min="0" max="23" placeholder="0"
                  value={hours} onChange={e => setHours(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
                <div className="text-gray-500 text-xs mt-1 text-center">{t('hr.adjustment.hours')}</div>
              </div>
              <div className="flex-1">
                <input
                  type="number" min="0" max="59" placeholder="0"
                  value={minutes} onChange={e => setMinutes(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
                <div className="text-gray-500 text-xs mt-1 text-center">{t('hr.adjustment.minutes')}</div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">{t('hr.adjustment.reason')}</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={t('hr.adjustment.reasonPlaceholder')}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition">
              {t('hr.adjustment.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 font-semibold rounded-lg text-sm transition disabled:opacity-50 ${type === 'BONUS' ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
            >
              {loading ? t('hr.adjustment.saving') : (type === 'BONUS' ? t('hr.adjustment.applyBonus') : t('hr.adjustment.applyDeduction'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
