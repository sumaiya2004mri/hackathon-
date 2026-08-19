import { useState } from 'react';
import TriageForm from '../../components/TriageForm';
import { useLanguage } from '../../context/LanguageContext';

const TOPICS = [
  {
    icon: '🩺',
    title: 'UTIs (urinary tract infections)',
    titleBn: 'ইউটিআই (মূত্রনালীর সংক্রমণ)',
    body: 'Common signs include burning during urination, needing to urinate often, and lower belly discomfort. Drinking water and urinating after intimacy can help prevent them. If you also have fever or back pain, prompt medical review is recommended.',
    bodyBn: 'সাধারণ লক্ষণগুলির মধ্যে রয়েছে প্রস্রাবের সময় জ্বালা, ঘন ঘন প্রস্রাবের অনুভূতি এবং তলপেটে অস্বস্তি। প্রচুর পানি পান করা এবং পরিচ্ছন্নতা রক্ষা করা প্রতিরোধে সহায়ক।',
    url: 'https://en.wikipedia.org/wiki/Urinary_tract_infection',
  },
  {
    icon: '🌸',
    title: 'Menstrual disorders',
    titleBn: 'ঋতুস্রাব বা পিরিয়ডের সমস্যা',
    body: 'Cycles that are consistently very heavy, very painful, or highly unpredictable are worth discussing with a doctor — our Period module can help you track patterns to bring to your consultation.',
    bodyBn: 'অতিরিক্ত রক্তস্রাব, তীব্র ব্যথা বা অনিয়মিত পিরিয়ডের ক্ষেত্রে ডাক্তারের পরামর্শ নেওয়া উচিত। আমাদের পিরিয়ড মডিউল এ ধরনের প্যাটার্ন ট্র্যাক করতে সাহায্য করে।',
    url: 'https://en.wikipedia.org/wiki/Menstrual_disorder',
  },
  {
    icon: '🧬',
    title: 'PCOS / PCOD indicators',
    body: 'Irregular periods, acne, excess hair growth, and weight changes can sometimes be associated with PCOS/PCOD. This is informational only — a physician can evaluate with blood tests and ultrasound.',
    bodyBn: 'অনিয়মিত পিরিয়ড, ব্রণ, অনাকাঙ্ক্ষিত চুল এবং ওজন বৃদ্ধি পিসিওএস/পিসিওডির লক্ষণ হতে পারে। রক্ত পরীক্ষা ও আল্ট্রাসাউন্ডের মাধ্যমে ডাক্তার এটি সঠিক মূল্যায়ন করেন।',
    url: 'https://en.wikipedia.org/wiki/Polycystic_ovary_syndrome',
  },
  {
    icon: '🎗️',
    title: 'Breast health self-checks',
    body: 'Breast Self-Checks: A monthly self-check a few days after your period ends helps you learn what is normal for you. Consult a doctor promptly for any new lump, dimpling, unusual discharge, or persistent pain.',
    bodyBn: 'স্তন স্ব-পরীক্ষা: পিরিয়ড শেষ হওয়ার কয়েক দিন পর প্রতি মাসে স্ব-পরীক্ষা করুন। কোনো নতুন চাকা, ব্যথা বা তরল নির্গমনের ক্ষেত্রে অবিলম্বে ডাক্তারের পরামর্শ নিন।',
    url: 'https://en.wikipedia.org/wiki/Breast_self-examination',
  },
];

export default function FemaleHealthModule() {
  const [showCheck, setShowCheck] = useState(false);
  const { lang, t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Solid Pink Hero Container Box (Ensuring White Text is Crystal Clear) */}
      <div 
        className="p-6 md:p-8 text-white rounded-3xl shadow-md space-y-3"
        style={{ backgroundColor: '#E85A91' }}
      >
        <span className="inline-block px-3.5 py-1 rounded-full bg-white/25 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
          {t('educationalGuidance')}
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white">
          {t('femaleHealthTitle')}
        </h1>
        <p className="text-sm md:text-base text-white font-medium leading-relaxed max-w-2xl">
          {t('femaleHealthSub')}
        </p>
      </div>

      {/* Safety Disclaimer Strip */}
      <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 text-xs text-slate-900 font-bold flex items-center gap-2.5">
        <span className="text-[#E85A91] font-extrabold text-base">ℹ️</span>
        <span>
          {t('femaleHealthDisclaimer')}
        </span>
      </div>

      {/* Topics Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {TOPICS.map((tItem) => (
          <div
            key={tItem.title}
            className="p-5 bg-white border border-pink-200 rounded-2xl space-y-3 hover:border-[#E85A91] transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xl p-2 rounded-xl bg-pink-50 border border-pink-200">{tItem.icon}</span>
                <h3 className="font-display font-bold text-[#E85A91] text-base">
                  {lang === 'bn' ? tItem.titleBn : tItem.title}
                </h3>
              </div>
              <p className="text-xs text-slate-900 font-medium leading-relaxed">
                {lang === 'bn' ? tItem.bodyBn : tItem.body}
              </p>
            </div>

            {/* Interactive Hyperlink Redirecting to Medical Reference Page */}
            <a
              href={tItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#E85A91] hover:underline inline-flex items-center gap-1.5 pt-2 group"
            >
              <span>{t('learnMore')}</span>
              <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">↗</span>
            </a>
          </div>
        ))}
      </div>

      {/* Prominent Symptom Check Section */}
      <div className="p-6 bg-white border border-pink-200 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-lg text-slate-900">
              {t('notFeelingYourself')}
            </h2>
            <p className="text-xs text-slate-800 font-medium">
              {t('symptomCheckSub')}
            </p>
          </div>
          {!showCheck && (
            <button
              onClick={() => setShowCheck(true)}
              className="px-5 py-2.5 rounded-full bg-[#E85A91] hover:bg-[#D4437B] text-white text-xs font-bold shadow-md transition-all shrink-0"
            >
              {t('startSymptomCheck')}
            </button>
          )}
        </div>

        {showCheck && (
          <div className="pt-3 border-t border-pink-200">
            <TriageForm module="female_health" />
          </div>
        )}
      </div>
    </div>
  );
}
