import { useEffect, useMemo, useState } from 'react';
import type { PregnancyProfile, Vitals, HospitalResult } from '../../types';
import { useAuth } from '../../auth/AuthContext';
import { getWeekData, gestationalAgeFromLMP, dueDateFromLMP, FETAL_GROWTH_BY_WEEK } from './fetalGrowthData';
import { DEFAULT_ANC_SCHEDULE, DEFAULT_HOSPITAL_BAG_CHECKLIST, BD_NUTRITION_GUIDANCE } from './ancScheduleData';
import KickCounter from './KickCounter';
import TriageForm from '../../components/TriageForm';
import HospitalList from '../../components/HospitalList';
import GrowthGlyph from './GrowthGlyph';
import GrowthSlider from './GrowthSlider';

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

  // Active current week
  const currentWeek = useMemo(() => {
    if (!profile?.lmpDate) return 4;
    return gestationalAgeFromLMP(profile.lmpDate);
  }, [profile?.lmpDate]);

  // Selected interactive week state
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  // Sync selected week when profile LMP updates
  useEffect(() => {
    setSelectedWeek(currentWeek);
  }, [currentWeek]);

  if (!profile) {
    return (
      <div className="card p-6 max-w-md mx-auto animate-fade-in">
        <h2 className="font-display font-semibold text-xl mb-2 text-clinical-text">Set up pregnancy tracking</h2>
        <p className="text-sm text-clinical-muted mb-4">Enter your last menstrual period (LMP) date to calculate your due date and gestational age.</p>
        <label className="text-xs font-semibold text-clinical-muted uppercase tracking-wider block mb-1">
          Last menstrual period date
        </label>
        <input 
          type="date" 
          value={lmpInput} 
          onChange={(e) => setLmpInput(e.target.value)}
          className="w-full bg-clinical-panel2 border border-clinical-border rounded-lg p-2.5 text-sm text-clinical-text focus:outline-none focus:ring-2 focus:ring-pregnancy-accent transition-all" 
        />
        <button
          disabled={!lmpInput}
          onClick={() => setupProfile(lmpInput)}
          className="w-full mt-4 px-4 py-2.5 rounded-lg bg-pregnancy-accent text-white font-semibold text-sm transition-all hover:bg-pregnancy-accent/90 disabled:opacity-40"
        >
          Start tracking
        </button>
      </div>
    );
  }

  const weekData = getWeekData(selectedWeek);
  const trimester = selectedWeek < 13 ? 1 : selectedWeek < 28 ? 2 : 3;

  return (
    <div className="space-y-5">
      {/* Navigation tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button 
            key={t} 
            onClick={() => setTab(t)}
            className={`text-sm px-3.5 py-2 rounded-lg font-medium whitespace-nowrap border transition-all duration-200 ${
              tab === t 
                ? 'bg-pregnancy-bg text-pregnancy-accent border-pregnancy-border' 
                : 'bg-clinical-panel border-clinical-border text-clinical-muted hover:text-clinical-text hover:border-clinical-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'Overview' && (
        <div className="space-y-4 animate-fade-in">
          {/* Dynamic interactive SVG section */}
          <div className="grid gap-4 md:grid-cols-2">
            <GrowthGlyph 
              weekData={weekData} 
              onNext={() => {
                const idx = FETAL_GROWTH_BY_WEEK.findIndex((w) => w.week === selectedWeek);
                if (idx < FETAL_GROWTH_BY_WEEK.length - 1) setSelectedWeek(FETAL_GROWTH_BY_WEEK[idx + 1].week);
              }}
              onPrev={() => {
                const idx = FETAL_GROWTH_BY_WEEK.findIndex((w) => w.week === selectedWeek);
                if (idx > 0) setSelectedWeek(FETAL_GROWTH_BY_WEEK[idx - 1].week);
              }}
            />
            
            <div className="card p-5 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-xs text-clinical-muted font-semibold uppercase tracking-wider">
                  Week {selectedWeek} · Trimester {trimester}
                </p>
                <h3 className="text-2xl font-display font-semibold text-clinical-text mt-1.5">
                  About the size of <span className="text-pregnancy-accent font-semibold">{weekData.sizeComparison}</span>
                </h3>
                
                {weekData.milestone && (
                  <div className="mt-3 p-3.5 bg-pregnancy-bg border border-pregnancy-border rounded-lg text-sm text-pregnancy-accent stagger-item">
                    <span className="font-semibold block mb-0.5">✦ Milestone reached:</span> {weekData.milestone}
                  </div>
                )}
              </div>

              <div className="border-t border-clinical-border pt-3">
                <p className="text-xs text-clinical-muted">
                  Estimated due date: <span className="font-semibold text-clinical-text">{profile.dueDate}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Interactive slider timeline */}
          <div className="card p-5">
            <h4 className="font-display font-medium text-clinical-text text-sm mb-1">Growth progression timeline</h4>
            <GrowthSlider 
              currentWeek={currentWeek} 
              selectedWeek={selectedWeek} 
              onWeekChange={setSelectedWeek} 
            />
          </div>

          <KickCounter userId={user.id} />
        </div>
      )}

      {/* Care schedule tab */}
      {tab === 'Care schedule' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-4">
            <h3 className="font-display font-semibold text-clinical-text text-base mb-3">ANC visits (Bangladesh minimum protocol: 4 visits)</h3>
            <ul className="space-y-2.5">
              {profile.ancVisits.map((v, i) => (
                <li key={v.id} className="flex items-center justify-between text-sm text-clinical-text stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
                  <span>Visit {v.visitNumber} — around week {v.scheduledWeek}</span>
                  <button
                    onClick={() => setProfile({ ...profile, ancVisits: profile.ancVisits.map((x) => x.id === v.id ? { ...x, completedAt: x.completedAt ? undefined : new Date().toISOString() } : x) })}
                    className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 active:scale-95 ${
                      v.completedAt 
                        ? 'bg-severity-normal/10 text-severity-normal border-severity-normal/30 font-medium' 
                        : 'bg-clinical-panel2 border-clinical-border text-clinical-muted hover:text-clinical-text'
                    }`}
                  >
                    {v.completedAt ? 'Completed' : 'Mark done'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="card p-4">
            <h3 className="font-display font-semibold text-clinical-text text-base mb-3">Tetanus toxoid (TT) doses</h3>
            <ul className="space-y-2.5">
              {profile.ttVaccinations.map((t, i) => (
                <li key={t.doseNumber} className="flex items-center justify-between text-sm text-clinical-text stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
                  <span>Dose {t.doseNumber} — scheduled {t.scheduledDate}</span>
                  <button
                    onClick={() => setProfile({ ...profile, ttVaccinations: profile.ttVaccinations.map((x) => x.doseNumber === t.doseNumber ? { ...x, completedAt: x.completedAt ? undefined : new Date().toISOString() } : x) })}
                    className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 active:scale-95 ${
                      t.completedAt 
                        ? 'bg-severity-normal/10 text-severity-normal border-severity-normal/30 font-medium' 
                        : 'bg-clinical-panel2 border-clinical-border text-clinical-muted hover:text-clinical-text'
                    }`}
                  >
                    {t.completedAt ? 'Completed' : 'Mark done'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Vitals tab */}
      {tab === 'Vitals' && <VitalsLog profile={profile} onUpdate={setProfile} />}

      {/* Nutrition tab */}
      {tab === 'Nutrition' && (
        <div className="space-y-3 animate-fade-in">
          {BD_NUTRITION_GUIDANCE.map((g, i) => (
            <div key={g.category} className="card p-4 stagger-item" style={{ animationDelay: `${i * 60}ms` }}>
              <h3 className="font-display font-semibold text-clinical-text text-base">{g.category}</h3>
              <p className="text-sm mt-1.5 text-clinical-text">{g.foods.join(', ')}</p>
              <p className="text-xs text-clinical-muted mt-1.5">{g.note}</p>
            </div>
          ))}
        </div>
      )}

      {/* Delivery prep tab */}
      {tab === 'Delivery prep' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-4">
            <h3 className="font-display font-semibold text-clinical-text text-base mb-3">Choose a preferred delivery facility</h3>
            <HospitalList
              district={user.district}
              onSelect={(h: HospitalResult) => setProfile({ ...profile, preferredDeliveryFacility: h })}
            />
            {profile.preferredDeliveryFacility && (
              <p className="text-sm text-pregnancy-accent font-semibold mt-3">Saved: {profile.preferredDeliveryFacility.name}</p>
            )}
          </div>
          
          <div className="card p-4">
            <h3 className="font-display font-semibold text-clinical-text text-base mb-3">Hospital bag checklist</h3>
            <ul className="space-y-2">
              {profile.hospitalBagChecklist.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3 text-sm text-clinical-text stagger-item" style={{ animationDelay: `${i * 30}ms` }}>
                  <input 
                    type="checkbox" 
                    checked={c.checked}
                    id={`bag-item-${c.id}`}
                    onChange={() => setProfile({ ...profile, hospitalBagChecklist: profile.hospitalBagChecklist.map((x) => x.id === c.id ? { ...x, checked: !x.checked } : x) })}
                    className="w-4 h-4 rounded text-pregnancy-accent focus:ring-pregnancy-accent border-clinical-border transition-all"
                  />
                  <label htmlFor={`bag-item-${c.id}`} className={`select-none transition-all ${c.checked ? 'line-through text-clinical-muted opacity-60' : 'cursor-pointer hover:text-pregnancy-accent'}`}>
                    {c.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Symptom check tab */}
      {tab === 'Symptom check' && (
        <div className="card p-4 animate-fade-in">
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
    <div className="space-y-4 animate-fade-in">
      <form onSubmit={addLog} className="card p-4 grid grid-cols-3 gap-3">
        <label className="text-xs font-semibold text-clinical-muted uppercase tracking-wider block">
          Systolic
          <input 
            value={sys} 
            onChange={(e) => setSys(e.target.value)} 
            type="number" 
            className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-lg p-2.5 text-sm text-clinical-text focus:outline-none focus:ring-2 focus:ring-pregnancy-accent transition-all" 
          />
        </label>
        <label className="text-xs font-semibold text-clinical-muted uppercase tracking-wider block">
          Diastolic
          <input 
            value={dia} 
            onChange={(e) => setDia(e.target.value)} 
            type="number" 
            className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-lg p-2.5 text-sm text-clinical-text focus:outline-none focus:ring-2 focus:ring-pregnancy-accent transition-all" 
          />
        </label>
        <label className="text-xs font-semibold text-clinical-muted uppercase tracking-wider block">
          Glucose (mg/dL)
          <input 
            value={glucose} 
            onChange={(e) => setGlucose(e.target.value)} 
            type="number" 
            className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-lg p-2.5 text-sm text-clinical-text focus:outline-none focus:ring-2 focus:ring-pregnancy-accent transition-all" 
          />
        </label>
        <button 
          type="submit" 
          className="col-span-3 px-4 py-2.5 mt-2 rounded-lg bg-pregnancy-accent text-white font-semibold text-sm transition-all hover:bg-pregnancy-accent/90 focus:outline-none focus:ring-2 focus:ring-pregnancy-accent/50 active:scale-[0.99]"
        >
          Log reading
        </button>
      </form>

      {highBP && (
        <p className="text-sm bg-severity-emergency/10 border border-severity-emergency/30 text-severity-emergency rounded-lg p-3.5 stagger-item">
          One or more of your blood pressure readings is at or above 140/90, which can be a pre-eclampsia warning sign. Please contact your provider promptly, and use the symptom check if you also have headache, vision changes, or swelling.
        </p>
      )}

      <div className="card p-4">
        <h3 className="font-display font-semibold text-clinical-text text-base mb-2">History</h3>
        {profile.bpGlucoseLogs.length === 0 ? (
          <p className="text-sm text-clinical-muted italic">No vital logs recorded yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-clinical-muted">
            {[...profile.bpGlucoseLogs].reverse().map((v, i) => (
              <li key={v.id} className="stagger-item flex items-center justify-between border-b border-clinical-border/50 pb-1.5 last:border-0 last:pb-0" style={{ animationDelay: `${i * 30}ms` }}>
                <span className="font-medium text-clinical-text">{new Date(v.capturedAt).toLocaleDateString()}</span>
                <span className="space-x-3">
                  {v.bloodPressureSystolic && (
                    <span className="bg-clinical-panel2 px-2 py-0.5 rounded text-xs">BP: <strong className="text-clinical-text">{v.bloodPressureSystolic}/{v.bloodPressureDiastolic}</strong> mmHg</span>
                  )}
                  {v.bloodGlucoseMgDl && (
                    <span className="bg-clinical-panel2 px-2 py-0.5 rounded text-xs">Glucose: <strong className="text-clinical-text">{v.bloodGlucoseMgDl}</strong> mg/dL</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
