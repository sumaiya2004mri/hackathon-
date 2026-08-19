import { useEffect, useMemo, useState } from 'react';
import type { PregnancyProfile, Vitals, HospitalResult } from '../../types';
import { useAuth } from '../../auth/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
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

export default function PregnancyModule() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [profile, setProfile] = useState<PregnancyProfile | null>(() => loadProfile(user.id));
  const [tab, setTab] = useState<string>('Overview');
  const [lmpInput, setLmpInput] = useState('');

  const TABS = [
    { key: 'Overview', label: t('tabOverview') },
    { key: 'Care schedule', label: t('tabCareSchedule') },
    { key: 'Vitals', label: t('tabVitals') },
    { key: 'Nutrition', label: t('tabNutrition') },
    { key: 'Delivery prep', label: t('tabDeliveryPrep') },
    { key: 'Symptom check', label: t('tabSymptomCheck') },
  ];

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
      <div className="card p-8 max-w-lg mx-auto bg-white border border-pink-200 rounded-3xl shadow-sm space-y-4 animate-fade-in text-center font-body">
        <div className="w-16 h-16 rounded-full bg-pink-100 border border-pink-300 flex items-center justify-center mx-auto text-3xl">
          🤰
        </div>
        <h2 className="font-display font-extrabold text-2xl text-slate-900">
          {lang === 'bn' ? 'গর্ভাবস্থা ট্র্যাকিং শুরু করুন' : 'Set Up Your Pregnancy Journey'}
        </h2>
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          {lang === 'bn'
            ? 'আপনার শেষ পিরিয়ডের তারিখ প্রদান করুন যাতে প্রসবের সম্ভাব্য তারিখ ও সন্তানের বিকাশ ট্র্যাক করা যায়।'
            : 'Enter your last menstrual period (LMP) date to calculate gestational age, estimated due date, and personalized care schedules.'}
        </p>
        <div className="text-left space-y-1 pt-2">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            {lang === 'bn' ? 'শেষ পিরিয়ডের তারিখ (LMP)' : 'Last Menstrual Period (LMP) Date'}
          </label>
          <input
            type="date"
            value={lmpInput}
            onChange={(e) => setLmpInput(e.target.value)}
            className="w-full bg-pink-50/60 border border-pink-200 rounded-xl p-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#E85A91] transition-all"
          />
        </div>
        <button
          disabled={!lmpInput}
          onClick={() => setupProfile(lmpInput)}
          className="w-full px-5 py-3.5 rounded-full bg-[#E85A91] hover:bg-[#D4437B] text-white font-bold text-sm transition-all shadow-md disabled:opacity-40"
        >
          {lang === 'bn' ? 'ট্র্যাকিং চালু করুন' : 'Start tracking pregnancy'}
        </button>
      </div>
    );
  }

  const weekData = getWeekData(selectedWeek);
  const trimester = selectedWeek < 13 ? 1 : selectedWeek < 28 ? 2 : 3;

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Pregnancy Hero & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-pink-200 shadow-xs">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#E85A91]">
            {t('maternalCompanion')}
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900">
            {t('pregnancyJourney')}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
            {t('estimatedDueDate')}: <span className="font-extrabold text-[#E85A91]">{profile.dueDate}</span>
          </p>
        </div>

        {/* Soft Pink Navigation Pills */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {TABS.map((tItem) => (
            <button
              key={tItem.key}
              onClick={() => setTab(tItem.key)}
              className={`text-xs md:text-sm px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all duration-200 ${
                tab === tItem.key
                  ? 'bg-[#E85A91] text-white shadow-md'
                  : 'bg-white border border-pink-200 text-slate-900 hover:text-[#E85A91] hover:bg-pink-50 font-bold'
              }`}
            >
              {tItem.label}
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
            <div className="p-6 bg-white border border-pink-200 rounded-3xl shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="inline-block px-4 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-[#E85A91] text-xs font-extrabold uppercase tracking-wider">
                  {lang === 'bn' ? `সপ্তাহ ${selectedWeek} · ট্রাইমেস্টার ${trimester}` : `Week ${selectedWeek} · Trimester ${trimester}`}
                </div>

                <h2 className="text-2xl font-display font-extrabold text-slate-900 leading-snug">
                  {t('babySize')} <span className="text-[#E85A91] font-extrabold">{weekData.sizeComparison}</span>
                </h2>

                <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                  {lang === 'bn'
                    ? 'আপনার সন্তান এই সপ্তাহে দ্রুত শারীরিক ও স্নায়বিক বৃদ্ধি সম্পন্ন করছে। সকল প্রধান অঙ্গ পরিপক্ক হচ্ছে।'
                    : 'Your baby is making rapid developmental strides this week. Neural connections and organ systems are maturing smoothly.'}
                </p>

                {weekData.milestone && (
                  <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl text-xs md:text-sm text-[#E85A91] font-bold space-y-1">
                    <span className="font-extrabold flex items-center gap-1.5 text-sm">✦ {t('milestoneReached')}:</span>
                    <p className="font-medium text-slate-900">{weekData.milestone}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-pink-100 pt-3 flex items-center justify-between text-xs md:text-sm text-slate-600 font-bold">
                <span>{t('calcGestationalAge')}:</span>
                <span className="font-extrabold text-[#E85A91] text-sm md:text-base">
                  {lang === 'bn' ? `${currentWeek} সপ্তাহ` : `${currentWeek} Weeks`}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Slider */}
          <div className="p-6 bg-white border border-pink-200 rounded-3xl shadow-xs space-y-2">
            <h3 className="font-display font-extrabold text-slate-900 text-base md:text-lg">{t('pregnancyTimeline')}</h3>
            <p className="text-xs md:text-sm text-slate-600 font-medium">{t('timelineSub')}</p>
            <GrowthSlider
              currentWeek={currentWeek}
              selectedWeek={selectedWeek}
              onWeekChange={setSelectedWeek}
            />
          </div>

          {/* Information Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-5 bg-white border border-pink-200 rounded-2xl space-y-2 shadow-xs hover:border-[#E85A91] transition-all">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-pink-50 text-[#E85A91] text-lg">👶</span>
                <h4 className="font-bold text-[#E85A91] text-base">{t('babyDevelopment')}</h4>
              </div>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                {t('babyDevSub')}
              </p>
              <button onClick={() => setTab('Overview')} className="text-xs md:text-sm font-bold text-[#E85A91] hover:underline text-left pt-1">
                {t('learnMore')}
              </button>
            </div>

            <div className="p-5 bg-white border border-pink-200 rounded-2xl space-y-2 shadow-xs hover:border-[#E85A91] transition-all">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-pink-50 text-[#E85A91] text-lg">🌸</span>
                <h4 className="font-bold text-[#E85A91] text-base">{t('motherChanges')}</h4>
              </div>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                {t('motherChangesSub')}
              </p>
              <button onClick={() => setTab('Vitals')} className="text-xs md:text-sm font-bold text-[#E85A91] hover:underline text-left pt-1">
                {t('trackVitals')}
              </button>
            </div>

            <div className="p-5 bg-white border border-pink-200 rounded-2xl space-y-2 shadow-xs hover:border-[#E85A91] transition-all">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-pink-50 text-[#E85A91] text-lg">🏥</span>
                <h4 className="font-bold text-[#E85A91] text-base">{t('importantAppointments')}</h4>
              </div>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                {t('importantApptSub')}
              </p>
              <button onClick={() => setTab('Care schedule')} className="text-xs md:text-sm font-bold text-[#E85A91] hover:underline text-left pt-1">
                {t('viewSchedule')}
              </button>
            </div>

            <div className="p-5 bg-white border border-pink-200 rounded-2xl space-y-2 shadow-xs hover:border-[#E85A91] transition-all">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-pink-50 text-[#E85A91] text-lg">🥗</span>
                <h4 className="font-bold text-[#E85A91] text-base">{t('nutritionGuidance')}</h4>
              </div>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                {t('nutritionSub')}
              </p>
              <button onClick={() => setTab('Nutrition')} className="text-xs md:text-sm font-bold text-[#E85A91] hover:underline text-left pt-1">
                {t('viewNutrition')}
              </button>
            </div>

            <div className="p-5 bg-white border border-pink-200 rounded-2xl space-y-2 shadow-xs hover:border-[#E85A91] transition-all">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-pink-50 text-[#E85A91] text-lg">💼</span>
                <h4 className="font-bold text-[#E85A91] text-base">{t('deliveryPreparation')}</h4>
              </div>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                {t('deliverySub')}
              </p>
              <button onClick={() => setTab('Delivery prep')} className="text-xs md:text-sm font-bold text-[#E85A91] hover:underline text-left pt-1">
                {t('prepareNow')}
              </button>
            </div>

            <div className="p-5 bg-white border border-pink-200 rounded-2xl space-y-2 shadow-xs hover:border-[#E85A91] transition-all">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-pink-50 text-[#E85A91] text-lg">🚨</span>
                <h4 className="font-bold text-[#E85A91] text-base">{t('symptomTracker')}</h4>
              </div>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                {t('symptomTrackerSub')}
              </p>
              <button onClick={() => setTab('Symptom check')} className="text-xs md:text-sm font-bold text-[#E85A91] hover:underline text-left pt-1">
                {t('checkSymptoms')}
              </button>
            </div>
          </div>

          <KickCounter userId={user.id} />
        </div>
      )}

      {/* Care Schedule Tab */}
      {tab === 'Care schedule' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-6 bg-white border border-pink-200 rounded-3xl shadow-xs space-y-3">
            <h3 className="font-display font-extrabold text-slate-900 text-base md:text-lg">
              {lang === 'bn' ? 'ANC ভিজিট (সরকারি ন্যূনতম ৪টি চেকআপ সময়সূচী)' : 'ANC Visits (BD Protocol: Minimum 4 Visits)'}
            </h3>
            <ul className="space-y-3">
              {profile.ancVisits.map((v) => (
                <li key={v.id} className="flex items-center justify-between text-xs md:text-sm text-slate-900 p-3 rounded-2xl bg-pink-50/60 border border-pink-200 font-medium">
                  <span>{lang === 'bn' ? `ভিজিট ${v.visitNumber} — প্রায় সপ্তাহ ${v.scheduledWeek}` : `Visit ${v.visitNumber} — Around Week ${v.scheduledWeek}`}</span>
                  <button
                    onClick={() =>
                      setProfile({
                        ...profile,
                        ancVisits: profile.ancVisits.map((x) =>
                          x.id === v.id ? { ...x, completedAt: x.completedAt ? undefined : new Date().toISOString() } : x
                        ),
                      })
                    }
                    className={`text-xs px-4 py-1.5 rounded-full border font-bold transition-all ${
                      v.completedAt
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white border-pink-300 text-slate-700 hover:text-[#E85A91]'
                    }`}
                  >
                    {v.completedAt ? '✓ Completed' : 'Mark Done'}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-white border border-pink-200 rounded-3xl shadow-xs space-y-3">
            <h3 className="font-display font-extrabold text-slate-900 text-base md:text-lg">
              {lang === 'bn' ? 'টিটেনাস টক্সয়েড (টিটি) টিকা সময়সূচী' : 'Tetanus Toxoid (TT) Immunization'}
            </h3>
            <ul className="space-y-3">
              {profile.ttVaccinations.map((tItem) => (
                <li key={tItem.doseNumber} className="flex items-center justify-between text-xs md:text-sm text-slate-900 p-3 rounded-2xl bg-pink-50/60 border border-pink-200 font-medium">
                  <span>{lang === 'bn' ? `ডোজ ${tItem.doseNumber} — তারিখ: ${tItem.scheduledDate}` : `Dose ${tItem.doseNumber} — Scheduled ${tItem.scheduledDate}`}</span>
                  <button
                    onClick={() =>
                      setProfile({
                        ...profile,
                        ttVaccinations: profile.ttVaccinations.map((x) =>
                          x.doseNumber === tItem.doseNumber ? { ...x, completedAt: x.completedAt ? undefined : new Date().toISOString() } : x
                        ),
                      })
                    }
                    className={`text-xs px-4 py-1.5 rounded-full border font-bold transition-all ${
                      tItem.completedAt
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white border-pink-300 text-slate-700 hover:text-[#E85A91]'
                    }`}
                  >
                    {tItem.completedAt ? '✓ Completed' : 'Mark Done'}
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
            <div key={g.category} className="p-6 bg-white border border-pink-200 rounded-3xl shadow-xs space-y-2">
              <h3 className="font-display font-extrabold text-[#E85A91] text-base md:text-lg">{g.category}</h3>
              <p className="text-xs md:text-sm text-slate-900 leading-relaxed font-bold">{g.foods.join(', ')}</p>
              <p className="text-xs text-slate-600 font-medium">{g.note}</p>
            </div>
          ))}
        </div>
      )}

      {/* Delivery Prep Tab */}
      {tab === 'Delivery prep' && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-6 bg-white border border-pink-200 rounded-3xl shadow-xs space-y-3">
            <h3 className="font-display font-extrabold text-slate-900 text-base md:text-lg">
              {lang === 'bn' ? 'পছন্দের প্রসব হাসপাতাল নির্বাচন করুন' : 'Select Preferred Delivery Hospital'}
            </h3>
            <HospitalList
              district={user.district}
              onSelect={(h: HospitalResult) => setProfile({ ...profile, preferredDeliveryFacility: h })}
            />
            {profile.preferredDeliveryFacility && (
              <p className="text-xs md:text-sm text-[#E85A91] font-extrabold mt-2">Saved Facility: {profile.preferredDeliveryFacility.name}</p>
            )}
          </div>

          <div className="p-6 bg-white border border-pink-200 rounded-3xl shadow-xs space-y-3">
            <h3 className="font-display font-extrabold text-slate-900 text-base md:text-lg">
              {lang === 'bn' ? 'হাসপাতাল ব্যাগের প্রয়োজনীয় জিনিসপত্র' : 'Hospital Bag Checklist'}
            </h3>
            <ul className="space-y-3">
              {profile.hospitalBagChecklist.map((c) => (
                <li key={c.id} className="flex items-center gap-3 text-xs md:text-sm text-slate-900">
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
                    className="w-4 h-4 rounded text-[#E85A91] focus:ring-[#E85A91] border-pink-300"
                  />
                  <label
                    htmlFor={`bag-item-${c.id}`}
                    className={`select-none transition-all ${
                      c.checked ? 'line-through text-slate-400 opacity-60' : 'cursor-pointer hover:text-[#E85A91] font-bold'
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
        <div className="p-6 bg-white border border-pink-200 rounded-3xl shadow-xs space-y-3 animate-fade-in">
          <p className="text-xs md:text-sm text-slate-600 font-medium">
            Danger signs (heavy bleeding, severe headache, vision changes, reduced fetal movement, severe abdominal pain) route straight into the emergency triage evaluation below.
          </p>
          <TriageForm module="pregnancy" />
        </div>
      )}
    </div>
  );
}

function VitalsLog({ profile, onUpdate }: { profile: PregnancyProfile; onUpdate: (p: PregnancyProfile) => void }) {
  const { lang, t } = useLanguage();
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
    <div className="space-y-4 animate-fade-in font-body">
      <form onSubmit={addLog} className="p-6 bg-white border border-pink-200 rounded-3xl shadow-xs grid grid-cols-3 gap-3">
        <label className="text-xs font-bold text-slate-700 block">
          Systolic BP
          <input
            value={sys}
            onChange={(e) => setSys(e.target.value)}
            type="number"
            placeholder="120"
            className="w-full mt-1 bg-pink-50/60 border border-pink-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#E85A91]"
          />
        </label>
        <label className="text-xs font-bold text-slate-700 block">
          Diastolic BP
          <input
            value={dia}
            onChange={(e) => setDia(e.target.value)}
            type="number"
            placeholder="80"
            className="w-full mt-1 bg-pink-50/60 border border-pink-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#E85A91]"
          />
        </label>
        <label className="text-xs font-bold text-slate-700 block">
          Glucose (mg/dL)
          <input
            value={glucose}
            onChange={(e) => setGlucose(e.target.value)}
            type="number"
            placeholder="95"
            className="w-full mt-1 bg-pink-50/60 border border-pink-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#E85A91]"
          />
        </label>
        <button
          type="submit"
          className="col-span-3 px-5 py-3 mt-2 rounded-full bg-[#E85A91] text-white font-bold text-xs shadow-xs hover:bg-[#D4437B]"
        >
          Log Reading
        </button>
      </form>

      {highBP && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-2xl space-y-1 font-medium">
          <span className="font-bold block text-sm">⚠️ High Blood Pressure Warning:</span>
          <p>
            One or more of your blood pressure readings is at or above 140/90, which can be a pre-eclampsia warning sign. Please contact your provider promptly, and use symptom check if you experience headache, vision changes, or sudden swelling.
          </p>
        </div>
      )}

      <div className="p-6 bg-white border border-pink-200 rounded-3xl shadow-xs space-y-3">
        <h3 className="font-display font-extrabold text-slate-900 text-base">Recorded Readings History</h3>
        {profile.bpGlucoseLogs.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No vital logs recorded yet.</p>
        ) : (
          <ul className="space-y-2.5 text-xs text-slate-700">
            {[...profile.bpGlucoseLogs].reverse().map((v) => (
              <li key={v.id} className="flex items-center justify-between border-b border-pink-100 pb-2 last:border-0 last:pb-0 font-medium">
                <span className="font-bold text-slate-900">{new Date(v.capturedAt).toLocaleDateString()}</span>
                <span className="space-x-2">
                  {v.bloodPressureSystolic && (
                    <span className="bg-pink-50 px-3 py-1 rounded-full text-xs font-extrabold text-[#E85A91] border border-pink-200">
                      BP: {v.bloodPressureSystolic}/{v.bloodPressureDiastolic} mmHg
                    </span>
                  )}
                  {v.bloodGlucoseMgDl && (
                    <span className="bg-pink-50 px-3 py-1 rounded-full text-xs font-extrabold text-[#E85A91] border border-pink-200">
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
