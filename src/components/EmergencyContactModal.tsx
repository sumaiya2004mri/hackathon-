import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface EmergencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
}

const RELATIONSHIPS = [
  'Spouse / Partner',
  'Parent / Guardian',
  'Sibling',
  'Child',
  'Friend',
  'Relative',
  'Other',
];

export default function EmergencyContactModal({ isOpen, onClose, isMandatory = false }: EmergencyContactModalProps) {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [phone, setPhone] = useState(user.emergencyContact?.phone ?? '');
  const [relationship, setRelationship] = useState(user.emergencyContact?.relationship ?? RELATIONSHIPS[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 6) {
      setErrorMsg('Please enter a valid emergency contact phone number.');
      return;
    }
    setErrorMsg('');

    updateProfile({
      emergencyContact: {
        phone: phone.trim(),
        relationship,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-body">
      <div className="relative w-full max-w-md bg-white border border-pink-200 rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 border border-pink-300 flex items-center justify-center text-2xl shrink-0">
            🚨
          </div>
          <div>
            <h2 className="font-display font-extrabold text-lg text-slate-900">
              {t('emergencyContact')}
            </h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {t('emergencyContactSub')}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        {savedSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold text-center space-y-1 animate-fade-in">
            <span className="text-lg">✓</span>
            <p>{t('contactSaved')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">
                1. {t('contactPhone')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1700-000000"
                required
                className="w-full bg-pink-50/60 border border-pink-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#E85A91] transition-all"
              />
            </div>

            {/* Field 2: Relationship */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">
                2. {t('relationship')} <span className="text-red-500">*</span>
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full bg-pink-50/60 border border-pink-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#E85A91] transition-all"
              >
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              {!isMandatory && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full border border-pink-200 text-xs font-bold text-slate-700 hover:bg-pink-50"
                >
                  {t('cancel')}
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-[#E85A91] hover:bg-[#D4437B] text-white text-xs font-bold shadow-md transition-all"
              >
                {t('saveContact')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
