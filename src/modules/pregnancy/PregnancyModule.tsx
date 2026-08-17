import { useEffect, useMemo, useState } from 'react';
import type { PregnancyProfile, Vitals, HospitalResult } from '../../types';
import { useAuth } from '../../auth/AuthContext';
import { getWeekData, gestationalAgeFromLMP, dueDateFromLMP } from './fetalGrowthData';
import { DEFAULT_ANC_SCHEDULE, DEFAULT_HOSPITAL_BAG_CHECKLIST, BD_NUTRITION_GUIDANCE } from './ancScheduleData';
import KickCounter from './KickCounter';
import TriageForm from '../../components/TriageForm';
import HospitalList from '../../components/HospitalList';

const STORAGE_KEY = 'ea_pregnancy_profile';

function loadProfile(userId: string): PregnancyProfile | null {
  const raw = localStorage.getItem(`${STORAGE_KEY}:${userId}`);
  return raw ? JSON.parse(raw) : null;
}
function saveProfile(userId: string, profile: PregnancyProfile) {
  localStorage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(profile));
}

const TABS = ['Overview', 'Care schedule', 'Vitals', 'Nutrition', 'Delivery prep', 'Symptom check'] as const;

export default function PregnancyModule() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PregnancyProfile | null>(() => loadProfile(user.id));
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const [lmpInput, setLmpInput] = useState('');

  useEffect(() => { if (profile) saveProfile(user.id, profile); }, [profile, user.id]);

  function setupProfile(lmp: string) {
    const dueDate = dueDateFromLMP(lmp);
    const newProfile: PregnancyProfile = {
      id: crypto.randomUUID(),
      userId: user.id,
      lmpDate: lmp,
      dueDate,
      gestationalAgeWeeks: gestationalAgeFromLMP(lmp),
      ancVisits: DEFAULT_ANC_SCHEDULE.map((v) => ({ ...v, id: crypto.randomUUID() })),
      ttVaccinations: [
        { doseNumber: 1, scheduledDate: lmp },
        { doseNumber: 2, scheduledDate: dueDateFromLMP(lmp) },
      ],
      bpGlucoseLogs: [],
      kickCounterSessions: [],
      hospitalBagChecklist: DEFAULT_HOSPITAL_BAG_CHECKLIST.map((c) => ({ ...c, id: crypto.randomUUID(), checked: false })),
    };
    setProfile(newProfile);
  }

  if (!profile) {
    return (
      <div className="card p-6 max-w-md">
        <h2 className="font-display font-semibold text-lg mb-2">Set up pregnancy tracking</h2>
        <p className="text-sm text-clinical-muted mb-4">Enter your last menstrual period (LMP) date to calculate your due date and gestational age.</p>
        <label className="text-xs text-clinical-muted">Last menstrual period date
          <input type="date" value={lmpInput} onChange={(e) => setLmpInput(e.target.value)}
            className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-md p-2 text-sm" />
        </label>
        <button
          disabled={!lmpInput}
          onClick={() => setupProfile(lmpInput)}
          className="mt-4 px-4 py-2 rounded-md bg-clinical-accent text-clinical-bg font-medium text-sm disabled:opacity-40"
        >
          Start tracking
        </button>
      </div>
    );
  }

  const week = gestationalAgeFromLMP(profile.lmpDate!);
  const weekData = getWeekData(week);
  const trimester = week < 13 ? 1 : week < 28 ? 2 : 3;

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-sm px-3 py-1.5 rounded-md whitespace-nowrap border ${tab === t ? 'bg-clinical-accent/15 text-clinical-accent border-clinical-accent/30' : 'bg-clinical-panel2 border-clinical-border text-clinical-muted'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="space-y-4">
          <div className="card p-5">
            <p className="text-xs text-clinical-muted">Week {week} · Trimester {trimester}</p>
            <p className="text-2xl font-display font-semibold mt-1">About the size of {weekData.sizeComparison}</p>
            {weekData.milestone && <p className="text-sm text-clinical-teal mt-2">✦ {weekData.milestone}</p>}
            <p className="text-xs text-clinical-muted mt-3">Estimated due date: {profile.dueDate}</p>
          </div>
          <KickCounter userId={user.id} />
        </div>
      )}

      {tab === 'Care schedule' && (
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-medium mb-3">ANC visits (Bangladesh minimum protocol: 4 visits)</h3>
            <ul className="space-y-2">
              {profile.ancVisits.map((v) => (
                <li key={v.id} className="flex items-center justify-between text-sm">
                  <span>Visit {v.visitNumber} — around week {v.scheduledWeek}</span>
                  <button
                    onClick={() => setProfile({ ...profile, ancVisits: profile.ancVisits.map((x) => x.id === v.id ? { ...x, completedAt: x.completedAt ? undefined : new Date().toISOString() } : x) })}
                    className={`text-xs px-3 py-1 rounded-md border ${v.completedAt ? 'bg-severity-NORMAL/15 text-severity-NORMAL border-severity-NORMAL/30' : 'bg-clinical-panel2 border-clinical-border'}`}
                  >
                    {v.completedAt ? 'Completed' : 'Mark done'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-4">
            <h3 className="font-medium mb-3">Tetanus toxoid (TT) doses</h3>
            <ul className="space-y-2">
              {profile.ttVaccinations.map((t) => (
                <li key={t.doseNumber} className="flex items-center justify-between text-sm">
                  <span>Dose {t.doseNumber} — scheduled {t.scheduledDate}</span>
                  <button
                    onClick={() => setProfile({ ...profile, ttVaccinations: profile.ttVaccinations.map((x) => x.doseNumber === t.doseNumber ? { ...x, completedAt: x.completedAt ? undefined : new Date().toISOString() } : x) })}
                    className={`text-xs px-3 py-1 rounded-md border ${t.completedAt ? 'bg-severity-NORMAL/15 text-severity-NORMAL border-severity-NORMAL/30' : 'bg-clinical-panel2 border-clinical-border'}`}
                  >
                    {t.completedAt ? 'Completed' : 'Mark done'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'Vitals' && <VitalsLog profile={profile} onUpdate={setProfile} />}

      {tab === 'Nutrition' && (
        <div className="space-y-3">
          {BD_NUTRITION_GUIDANCE.map((g) => (
            <div key={g.category} className="card p-4">
              <h3 className="font-medium">{g.category}</h3>
              <p className="text-sm mt-1">{g.foods.join(', ')}</p>
              <p className="text-xs text-clinical-muted mt-1">{g.note}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'Delivery prep' && (
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-medium mb-3">Choose a preferred delivery facility</h3>
            <HospitalList
              district={user.district}
              onSelect={(h: HospitalResult) => setProfile({ ...profile, preferredDeliveryFacility: h })}
            />
            {profile.preferredDeliveryFacility && (
              <p className="text-sm text-clinical-teal mt-3">Saved: {profile.preferredDeliveryFacility.name}</p>
            )}
          </div>
          <div className="card p-4">
            <h3 className="font-medium mb-3">Hospital bag checklist</h3>
            <ul className="space-y-1">
              {profile.hospitalBagChecklist.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={c.checked}
                    onChange={() => setProfile({ ...profile, hospitalBagChecklist: profile.hospitalBagChecklist.map((x) => x.id === c.id ? { ...x, checked: !x.checked } : x) })} />
                  <span className={c.checked ? 'line-through text-clinical-muted' : ''}>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'Symptom check' && (
        <div className="card p-4">
          <p className="text-xs text-clinical-muted mb-3">Danger signs (heavy bleeding, severe headache, vision changes, reduced fetal movement, severe abdominal pain) route straight into the emergency flow below.</p>
          <TriageForm module="pregnancy" />
        </div>
      )}
    </div>
  );
}

function VitalsLog({ profile, onUpdate }: { profile: PregnancyProfile; onUpdate: (p: PregnancyProfile) => void }) {
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [glucose, setGlucose] = useState('');

  function addLog(e: React.FormEvent) {
    e.preventDefault();
    const entry: Vitals = {
      id: crypto.randomUUID(),
      userId: profile.userId,
      bloodPressureSystolic: sys ? Number(sys) : undefined,
      bloodPressureDiastolic: dia ? Number(dia) : undefined,
      bloodGlucoseMgDl: glucose ? Number(glucose) : undefined,
      capturedAt: new Date().toISOString(),
    };
    onUpdate({ ...profile, bpGlucoseLogs: [...profile.bpGlucoseLogs, entry] });
    setSys(''); setDia(''); setGlucose('');
  }

  const highBP = profile.bpGlucoseLogs.some((v) => (v.bloodPressureSystolic ?? 0) >= 140 || (v.bloodPressureDiastolic ?? 0) >= 90);

  return (
    <div className="space-y-4">
      <form onSubmit={addLog} className="card p-4 grid grid-cols-3 gap-3">
        <label className="text-xs text-clinical-muted">Systolic
          <input value={sys} onChange={(e) => setSys(e.target.value)} type="number" className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-md p-2 text-sm" />
        </label>
        <label className="text-xs text-clinical-muted">Diastolic
          <input value={dia} onChange={(e) => setDia(e.target.value)} type="number" className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-md p-2 text-sm" />
        </label>
        <label className="text-xs text-clinical-muted">Glucose (mg/dL)
          <input value={glucose} onChange={(e) => setGlucose(e.target.value)} type="number" className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-md p-2 text-sm" />
        </label>
        <button type="submit" className="col-span-3 px-4 py-2 rounded-md bg-clinical-accent text-clinical-bg font-medium text-sm">Log reading</button>
      </form>

      {highBP && (
        <p className="text-sm bg-severity-URGENT/10 border border-severity-URGENT/30 text-severity-URGENT rounded-md p-3">
          One or more of your blood pressure readings is at or above 140/90, which can be a pre-eclampsia warning sign. Please contact your provider promptly, and use the symptom check if you also have headache, vision changes, or swelling.
        </p>
      )}

      <div className="card p-4">
        <h3 className="font-medium mb-2">History</h3>
        <ul className="space-y-1 text-sm text-clinical-muted">
          {[...profile.bpGlucoseLogs].reverse().map((v) => (
            <li key={v.id}>
              {new Date(v.capturedAt).toLocaleDateString()} —
              {v.bloodPressureSystolic ? ` BP ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}` : ''}
              {v.bloodGlucoseMgDl ? ` Glucose ${v.bloodGlucoseMgDl} mg/dL` : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
