import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import EmergencyContactModal from '../components/EmergencyContactModal';

const DISTRICTS = ['Dhaka', 'Rajshahi', 'Chattogram', 'Khulna', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'];

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const { lang, t } = useLanguage();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  function deleteMyData() {
    if (!confirm('This permanently deletes all locally stored triage, period, and pregnancy data on this device. Continue?')) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith('ea_'))
      .forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  }

  function exportAllData() {
    const data: Record<string, unknown> = {};
    Object.keys(localStorage)
      .filter((k) => k.startsWith('ea_'))
      .forEach((k) => { data[k] = JSON.parse(localStorage.getItem(k) ?? 'null'); });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'my-emergency-ai-data.json'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-xl space-y-6 font-body animate-fade-in">
      <h1 className="font-display text-3xl font-extrabold text-slate-900">{t('settings')}</h1>

      {/* Mandatory Emergency Contact Card */}
      <section className="p-6 bg-white border border-pink-200 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-2 rounded-xl bg-pink-50 border border-pink-200">🚨</span>
            <div>
              <h2 className="font-display font-bold text-slate-900 text-base">{t('emergencyContact')}</h2>
              <p className="text-xs text-slate-600 font-medium">{t('emergencyContactSub')}</p>
            </div>
          </div>
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#E85A91] hover:bg-[#D4437B] text-white text-xs font-bold shadow-xs transition-all"
          >
            {user.emergencyContact ? 'Edit Contact' : 'Add Contact'}
          </button>
        </div>

        {user.emergencyContact ? (
          <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-200 text-xs text-slate-900 font-bold flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase tracking-wider">{t('contactPhone')}</span>
              <span className="font-mono text-sm font-extrabold text-[#E85A91]">{user.emergencyContact.phone}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px] uppercase tracking-wider">{t('relationship')}</span>
              <span className="font-bold text-slate-900">{user.emergencyContact.relationship}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 font-bold">
            ⚠️ {t('mandatoryNotice')}
          </p>
        )}
      </section>

      {/* Medical History & Background Section */}
      <section className="p-6 bg-white border border-pink-200 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl p-2 rounded-xl bg-pink-50 border border-pink-200">🩺</span>
          <div>
            <h2 className="font-display font-bold text-slate-900 text-base">Medical History & Clinical Background</h2>
            <p className="text-xs text-slate-600 font-medium">Used for AI triage risk checks and printed under SBAR PDF Background.</p>
          </div>
        </div>
        <textarea
          rows={3}
          defaultValue={user.medicalHistoryText ?? ''}
          placeholder="E.g. Chronic Hypertension, Asthma, Gestational Diabetes, Drug Allergies, Past C-Section..."
          onBlur={(e) => updateProfile({ medicalHistoryText: e.target.value })}
          className="w-full bg-pink-50/50 border border-pink-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#E85A91] transition-all resize-none"
        />
      </section>

      {/* Profile Section */}
      <section className="p-6 bg-white border border-pink-200 rounded-3xl shadow-sm space-y-4">
        <h2 className="font-display font-bold text-slate-900 text-base">Profile Settings</h2>
        <label className="text-xs font-bold text-slate-700 block">Name
          <input
            defaultValue={user.name}
            onBlur={(e) => updateProfile({ name: e.target.value })}
            className="w-full mt-1 bg-pink-50/50 border border-pink-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#E85A91]"
          />
        </label>
        <label className="text-xs font-bold text-slate-700 block">District (Drives Local Emergency Department Lookup)
          <select
            defaultValue={user.district}
            onChange={(e) => updateProfile({ district: e.target.value })}
            className="w-full mt-1 bg-pink-50/50 border border-pink-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#E85A91]"
          >
            <option value="">Select district</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </section>

      {/* Privacy Section */}
      <section className="p-6 bg-white border border-pink-200 rounded-3xl shadow-sm space-y-3">
        <h2 className="font-display font-bold text-slate-900 text-base">Privacy & Local Data Control</h2>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          Your emergency contact, medical history, triage, period, and pregnancy records are securely stored on your local browser device. You can export or erase your data at any time.
        </p>
        <div className="flex gap-2 pt-1">
          <button onClick={exportAllData} className="text-xs px-4 py-2 rounded-full bg-pink-50 border border-pink-200 text-slate-900 font-bold hover:bg-pink-100">
            Export My Data
          </button>
          <button onClick={deleteMyData} className="text-xs px-4 py-2 rounded-full bg-rose-100 text-rose-700 border border-rose-300 font-bold hover:bg-rose-200">
            Delete My Data
          </button>
        </div>
      </section>

      {!user.isGuest && (
        <button onClick={logout} className="text-xs text-rose-600 font-bold hover:underline">
          Log out from account
        </button>
      )}

      {/* Emergency Contact Edit Modal */}
      <EmergencyContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}
