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

  useEffect(() => {
    if (profile) saveProfile(user.id, profile);
  }, [profile, user.id]);

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

  const currentWeek = useMemo(() => {
    if (!profile?.lmpDate) return 4;
    return gestationalAgeFromLMP(profile.lmpDate);
  }, [profile?.lmpDate]);

  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  useEffect(() => {
    setSelectedWeek(currentWeek);
  }, [currentWeek]);

  if (!profile) {
    return (
      <div className="card p-6 max-w-md mx-auto bg-white border border-maternal-border rounded-3xl shadow-sm space-y-4 animate-fade-in text-center">
        <div className="w-14 h-14 rounded-full bg-maternal-blush border border-pink-200 flex items-center justify-center mx-auto text-2xl">
          🤰
        </div>
        <h2 className="font-display font-bold text-xl text-maternal-text">Set Up Your Pregnancy Journey</h2>
        <p className="text-xs text-maternal-muted leading-relaxed">
          Enter your last menstrual period (LMP) date to calculate gestational age, estimated due date, and personalized care schedules.
        </p>
        <div className="text-left space-y-1">
          <label className="text-xs font-semibold text-maternal-muted uppercase tracking-wider block">
            Last Menstrual Period (LMP) Date
          </label>
          <input
            type="date"
            value={lmpInput}
            onChange={(e) => setLmpInput(e.target.value)}
            className="w-full bg-maternal-blush border border-maternal-border rounded-xl p-3 text-sm text-maternal-text focus:outline-none focus:border-maternal-primary transition-all"
          />
        </div>
        <button
          disabled={!lmpInput}
          onClick={() => setupProfile(lmpInput)}
          className="w-full px-4 py-3 rounded-full bg-maternal-primary hover:bg-maternal-hover text-white font-semibold text-sm transition-all shadow-sm disabled:opacity-40"
        >
          Start tracking pregnancy
        </button>
      </div>
    );
  }

  const weekData = getWeekData(selectedWeek);
  const trimester = selectedWeek < 13 ? 1 : selectedWeek < 28 ? 2 : 3;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Pregnancy Hero & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-maternal-border shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-maternal-primary">Maternal Companion</span>
          <h1 className="font-display text-2xl font-bold text-maternal-text">Your Pregnancy Journey</h1>
          <p className="text-xs text-maternal-muted">
            Estimated due date: <span className="font-semibold text-maternal-primary">{profile.dueDate}</span>
          </p>
        </div>

        {/* Soft Pink Navigation Pills */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs px-3.5 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200 ${
                tab === t
                  ? 'bg-maternal-primary text-white shadow-xs'
                  : 'bg-maternal-blush text-maternal-muted hover:text-maternal-text hover:bg-pink-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {tab === 'Overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main 30-Second Womb Growth Visualizer & Week Banner */}
          <div className="grid gap-5 md:grid-cols-2 items-stretch">
            {/* 30-Second Womb Animation Component */}
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

            {/* Information Card */}
            <div className="card p-6 bg-white border border-maternal-border rounded-3xl shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-block px-3.5 py-1 rounded-full bg-maternal-blush border border-pink-200 text-maternal-primary text-xs font-bold uppercase tracking-wider">
                  Week {selectedWeek} · Trimester {trimester}
                </div>

                <h2 className="text-2xl font-display font-bold text-maternal-text">
                  Baby is about the size of <span className="text-maternal-primary font-bold">{weekData.sizeComparison}</span>
                </h2>

                <p className="text-xs text-maternal-muted leading-relaxed">
                  Your baby is making rapid developmental strides this week. Neural connections and organ systems are maturing smoothly.
                </p>

                {weekData.milestone && (
                  <div className="p-4 bg-maternal-blush border border-pink-200 rounded-2xl text-xs text-maternal-primary font-medium space-y-1">
                    <span className="font-bold flex items-center gap-1 text-sm">✦ Milestone Reached:</span>
                    <p>{weekData.milestone}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-maternal-border pt-3 flex items-center justify-between text-xs text-maternal-muted">
                <span>Calculated gestational age:</span>
                <span className="font-bold text-maternal-primary">{currentWeek} Weeks</span>
              </div>
            </div>
          </div>

          {/* Timeline Slider */}
          <div className="card p-5 bg-white border border-maternal-border rounded-3xl shadow-xs space-y-2">
            <h3 className="font-display font-semibold text-maternal-text text-sm">Your Pregnancy Timeline</h3>
            <p className="text-xs text-maternal-muted">Drag or click points to explore week-by-week development from Week 4 to Week 40.</p>
            <GrowthSlider
              currentWeek={currentWeek}
              selectedWeek={selectedWeek}
              onWeekChange={setSelectedWeek}
            />
          </div>

          {/* Information Cards Grid (Matching Section 7) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card p-4 bg-white border border-maternal-border rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-maternal-blush text-maternal-primary">👶</span>
                <h4 className="font-semibold text-maternal-primary text-sm">Baby's Development</h4>
              </div>
              <p className="text-xs text-maternal-muted leading-relaxed">
                Your baby is growing rapidly this week. Major organ and tissue structures are continuing to mature.
              </p>
              <button onClick={() => setTab('Overview')} className="text-xs font-semibold text-maternal-primary hover:underline text-left pt-1">
                Learn more →
              </button>
            </div>

            <div className="card p-4 bg-white border border-maternal-border rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-maternal-blush text-maternal-primary">🌸</span>
                <h4 className="font-semibold text-maternal-primary text-sm">Mother's Changes</h4>
              </div>
              <p className="text-xs text-maternal-muted leading-relaxed">
                Your body is adapting every week. Track physical changes, energy levels, and essential hydration.
              </p>
              <button onClick={() => setTab('Vitals')} className="text-xs font-semibold text-maternal-primary hover:underline text-left pt-1">
                Track vitals →
              </button>
            </div>

            <div className="card p-4 bg-white border border-maternal-border rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-maternal-blush text-maternal-primary">🏥</span>
                <h4 className="font-semibold text-maternal-primary text-sm">Important Appointments</h4>
              </div>
              <p className="text-xs text-maternal-muted leading-relaxed">
                Keep track of your ANC visits and TT vaccination schedules per BD health guidelines.
              </p>
              <button onClick={() => setTab('Care schedule')} className="text-xs font-semibold text-maternal-primary hover:underline text-left pt-1">
                View schedule →
              </button>
            </div>

            <div className="card p-4 bg-white border border-maternal-border rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-maternal-blush text-maternal-primary">🥗</span>
                <h4 className="font-semibold text-maternal-primary text-sm">Nutrition Guidance</h4>
              </div>
              <p className="text-xs text-maternal-muted leading-relaxed">
                Focus on iron, folate, and calcium-rich local foods for optimal maternal & fetal health.
              </p>
              <button onClick={() => setTab('Nutrition')} className="text-xs font-semibold text-maternal-primary hover:underline text-left pt-1">
                View nutrition →
              </button>
            </div>

            <div className="card p-4 bg-white border border-maternal-border rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-maternal-blush text-maternal-primary">💼</span>
                <h4 className="font-semibold text-maternal-primary text-sm">Delivery Preparation</h4>
              </div>
              <p className="text-xs text-maternal-muted leading-relaxed">
                Prepare your hospital bag checklist and select your preferred emergency delivery hospital.
              </p>
              <button onClick={() => setTab('Delivery prep')} className="text-xs font-semibold text-maternal-primary hover:underline text-left pt-1">
                Prepare now →
              </button>
            </div>

            <div className="card p-4 bg-white border border-maternal-border rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-maternal-blush text-maternal-primary">🚨</span>
                <h4 className="font-semibold text-maternal-primary text-sm">Symptom Check</h4>
              </div>
              <p className="text-xs text-maternal-muted leading-relaxed">
                Log physical symptoms or check warning signs to route into instant emergency evaluation.
              </p>
              <button onClick={() => setTab('Symptom check')} className="text-xs font-semibold text-maternal-primary hover:underline text-left pt-1">
                Check symptoms →
              </button>
            </div>
          </div>

          <KickCounter userId={user.id} />
        </div>
      )}

      {/* Care Schedule Tab */}
      {tab === 'Care schedule' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5 bg-white border border-maternal-border rounded-3xl shadow-xs space-y-3">
            <h3 className="font-display font-semibold text-maternal-text text-base">ANC Visits (BD Protocol: Minimum 4 Visits)</h3>
            <ul className="space-y-3">
              {profile.ancVisits.map((v) => (
                <li key={v.id} className="flex items-center justify-between text-xs text-maternal-text p-2.5 rounded-xl bg-maternal-blush/60 border border-maternal-border">
                  <span className="font-medium">Visit {v.visitNumber} — Around Week {v.scheduledWeek}</span>
                  <button
                    onClick={() =>
                      setProfile({
                        ...profile,
                        ancVisits: profile.ancVisits.map((x) =>
                          x.id === v.id ? { ...x, completedAt: x.completedAt ? undefined : new Date().toISOString() } : x
                        ),
                      })
                    }
                    className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                      v.completedAt
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white border-maternal-border text-maternal-muted hover:text-maternal-primary'
                    }`}
                  >
                    {v.completedAt ? '✓ Completed' : 'Mark Done'}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5 bg-white border border-maternal-border rounded-3xl shadow-xs space-y-3">
            <h3 className="font-display font-semibold text-maternal-text text-base">Tetanus Toxoid (TT) Immunization</h3>
            <ul className="space-y-3">
              {profile.ttVaccinations.map((t) => (
                <li key={t.doseNumber} className="flex items-center justify-between text-xs text-maternal-text p-2.5 rounded-xl bg-maternal-blush/60 border border-maternal-border">
                  <span className="font-medium">Dose {t.doseNumber} — Scheduled {t.scheduledDate}</span>
                  <button
                    onClick={() =>
                      setProfile({
                        ...profile,
                        ttVaccinations: profile.ttVaccinations.map((x) =>
                          x.doseNumber === t.doseNumber ? { ...x, completedAt: x.completedAt ? undefined : new Date().toISOString() } : x
                        ),
                      })
                    }
                    className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                      t.completedAt
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white border-maternal-border text-maternal-muted hover:text-maternal-primary'
                    }`}
                  >
                    {t.completedAt ? '✓ Completed' : 'Mark Done'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Vitals Tab */}
      {tab === 'Vitals' && <VitalsLog profile={profile} onUpdate={setProfile} />}

      {/* Nutrition Tab */}
      {tab === 'Nutrition' && (
        <div className="space-y-4 animate-fade-in">
          {BD_NUTRITION_GUIDANCE.map((g) => (
            <div key={g.category} className="card p-5 bg-white border border-maternal-border rounded-3xl shadow-xs space-y-2">
              <h3 className="font-display font-bold text-maternal-primary text-base">{g.category}</h3>
              <p className="text-xs text-maternal-text leading-relaxed font-medium">{g.foods.join(', ')}</p>
              <p className="text-xs text-maternal-muted">{g.note}</p>
            </div>
          ))}
        </div>
      )}

      {/* Delivery Prep Tab */}
      {tab === 'Delivery prep' && (
        <div className="space-y-5 animate-fade-in">
          <div className="card p-5 bg-white border border-maternal-border rounded-3xl shadow-xs space-y-3">
            <h3 className="font-display font-semibold text-maternal-text text-base">Select Preferred Delivery Hospital</h3>
            <HospitalList
              district={user.district}
              onSelect={(h: HospitalResult) => setProfile({ ...profile, preferredDeliveryFacility: h })}
            />
            {profile.preferredDeliveryFacility && (
              <p className="text-xs text-maternal-primary font-bold mt-2">Saved Facility: {profile.preferredDeliveryFacility.name}</p>
            )}
          </div>

          <div className="card p-5 bg-white border border-maternal-border rounded-3xl shadow-xs space-y-3">
            <h3 className="font-display font-semibold text-maternal-text text-base">Hospital Bag Checklist</h3>
            <ul className="space-y-2.5">
              {profile.hospitalBagChecklist.map((c) => (
                <li key={c.id} className="flex items-center gap-3 text-xs text-maternal-text">
                  <input
                    type="checkbox"
                    checked={c.checked}
                    id={`bag-item-${c.id}`}
                    onChange={() =>
                      setProfile({
                        ...profile,
                        hospitalBagChecklist: profile.hospitalBagChecklist.map((x) => (x.id === c.id ? { ...x, checked: !x.checked } : x)),
                      })
                    }
                    className="w-4 h-4 rounded text-maternal-primary focus:ring-maternal-primary border-maternal-border"
                  />
                  <label
                    htmlFor={`bag-item-${c.id}`}
                    className={`select-none transition-all ${
                      c.checked ? 'line-through text-maternal-muted opacity-60' : 'cursor-pointer hover:text-maternal-primary font-medium'
                    }`}
                  >
                    {c.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Symptom Check Tab */}
      {tab === 'Symptom check' && (
        <div className="card p-6 bg-white border border-maternal-border rounded-3xl shadow-xs space-y-3 animate-fade-in">
          <p className="text-xs text-maternal-muted">
            Danger signs (heavy bleeding, severe headache, vision changes, reduced fetal movement, severe abdominal pain) route straight into the emergency triage evaluation below.
          </p>
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
    setSys('');
    setDia('');
    setGlucose('');
  }

  const highBP = profile.bpGlucoseLogs.some((v) => (v.bloodPressureSystolic ?? 0) >= 140 || (v.bloodPressureDiastolic ?? 0) >= 90);

  return (
    <div className="space-y-4 animate-fade-in">
      <form onSubmit={addLog} className="card p-5 bg-white border border-maternal-border rounded-3xl shadow-xs grid grid-cols-3 gap-3">
        <label className="text-xs font-semibold text-maternal-muted block">
          Systolic BP
          <input
            value={sys}
            onChange={(e) => setSys(e.target.value)}
            type="number"
            placeholder="120"
            className="w-full mt-1 bg-maternal-blush border border-maternal-border rounded-xl p-2.5 text-xs text-maternal-text focus:outline-none focus:border-maternal-primary transition-all"
          />
        </label>
        <label className="text-xs font-semibold text-maternal-muted block">
          Diastolic BP
          <input
            value={dia}
            onChange={(e) => setDia(e.target.value)}
            type="number"
            placeholder="80"
            className="w-full mt-1 bg-maternal-blush border border-maternal-border rounded-xl p-2.5 text-xs text-maternal-text focus:outline-none focus:border-maternal-primary transition-all"
          />
        </label>
        <label className="text-xs font-semibold text-maternal-muted block">
          Glucose (mg/dL)
          <input
            value={glucose}
            onChange={(e) => setGlucose(e.target.value)}
            type="number"
            placeholder="95"
            className="w-full mt-1 bg-maternal-blush border border-maternal-border rounded-xl p-2.5 text-xs text-maternal-text focus:outline-none focus:border-maternal-primary transition-all"
          />
        </label>
        <button
          type="submit"
          className="col-span-3 px-4 py-2.5 mt-2 rounded-full bg-maternal-primary text-white font-semibold text-xs transition-all shadow-xs hover:bg-maternal-hover"
        >
          Log Reading
        </button>
      </form>

      {highBP && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-2xl space-y-1">
          <span className="font-bold block">⚠️ High Blood Pressure Warning:</span>
          <p>
            One or more of your blood pressure readings is at or above 140/90, which can be a pre-eclampsia warning sign. Please contact your provider promptly, and use symptom check if you experience headache, vision changes, or sudden swelling.
          </p>
        </div>
      )}

      <div className="card p-5 bg-white border border-maternal-border rounded-3xl shadow-xs space-y-3">
        <h3 className="font-display font-semibold text-maternal-text text-base">Recorded Readings History</h3>
        {profile.bpGlucoseLogs.length === 0 ? (
          <p className="text-xs text-maternal-muted italic">No vital logs recorded yet.</p>
        ) : (
          <ul className="space-y-2 text-xs text-maternal-muted">
            {[...profile.bpGlucoseLogs].reverse().map((v) => (
              <li key={v.id} className="flex items-center justify-between border-b border-maternal-border/60 pb-2 last:border-0 last:pb-0">
                <span className="font-medium text-maternal-text">{new Date(v.capturedAt).toLocaleDateString()}</span>
                <span className="space-x-2">
                  {v.bloodPressureSystolic && (
                    <span className="bg-maternal-blush px-2.5 py-1 rounded-full text-xs font-semibold text-maternal-text border border-maternal-border">
                      BP: {v.bloodPressureSystolic}/{v.bloodPressureDiastolic} mmHg
                    </span>
                  )}
                  {v.bloodGlucoseMgDl && (
                    <span className="bg-maternal-blush px-2.5 py-1 rounded-full text-xs font-semibold text-maternal-text border border-maternal-border">
                      Glucose: {v.bloodGlucoseMgDl} mg/dL
                    </span>
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
