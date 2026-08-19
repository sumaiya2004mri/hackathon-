import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import TriageForm from '../components/TriageForm';

export default function HomePage() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in font-body">
      {/* Upfront Hero Banner introducing Quick_care & Motto */}
      <section className="relative overflow-hidden p-8 md:p-12 bg-gradient-to-br from-pink-100/90 via-white to-rose-50/80 border border-pink-200/90 rounded-3xl shadow-sm text-center flex flex-col items-center space-y-4">
        {/* Subtle Background Glow Spheres */}
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-pink-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-rose-200/30 blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-full bg-white border border-pink-300 p-2 shadow-md flex items-center justify-center animate-bounce">
          <img src="/logo.png" alt="Quick_care Logo" className="w-full h-full object-contain rounded-full" />
        </div>

        <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-slate-900 tracking-wide">
          Quick_care
        </h1>

        <p className="font-subheading text-lg md:text-xl text-[#E85A91] font-semibold tracking-wider uppercase">
          {lang === 'bn' ? 'যে সেবা সবার আগে আপনার কাছে পৌঁছায়।' : 'Care that reaches you first.'}
        </p>

        <p className="max-w-xl text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
          {lang === 'bn'
            ? 'জরুরি স্বাস্থ্য ট্রায়াজ, মাতৃত্ব সফর, পিরিয়ড ট্র্যাকিং এবং নারী স্বাস্থ্যের তাত্ক্ষণিক চিকিৎসা নির্দেশনা সমন্বিত প্ল্যাটফর্ম।'
            : 'Instant clinical triage, maternal pregnancy companion, period cycle stats, and emergency healthcare navigation tailored for Bangladesh.'}
        </p>

        {/* Action Button Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/triage')}
            className="px-6 py-3 rounded-full bg-[#E85A91] hover:bg-[#D4437B] text-white font-bold text-xs md:text-sm shadow-md transition-all active:scale-95"
          >
            🚨 {lang === 'bn' ? 'জরুরি ট্রায়াজ শুরু করুন' : 'Start Emergency Triage'}
          </button>
          <button
            onClick={() => navigate('/pregnancy')}
            className="px-6 py-3 rounded-full bg-white border border-pink-300 text-slate-900 hover:text-[#E85A91] hover:bg-pink-50 font-bold text-xs md:text-sm shadow-xs transition-all"
          >
            🤰 {lang === 'bn' ? 'গর্ভাবস্থার সফর' : 'Pregnancy Journey'}
          </button>
        </div>
      </section>

      {/* Upfront Emergency Triage Input Section */}
      <section className="p-6 md:p-8 bg-white border border-pink-200 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-pink-100 pb-4">
          <span className="text-3xl p-2.5 rounded-2xl bg-pink-50 border border-pink-200">🩺</span>
          <div>
            <h2 className="font-subheading text-lg md:text-xl font-bold text-slate-900">
              {lang === 'bn' ? 'উপসর্গ ট্রায়াজ ও মূল্যায়ন' : 'Instant Symptom Check & Clinical Triage'}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 font-medium">
              {lang === 'bn' ? 'শারীরিক লক্ষণ লিখুন — জরুরি সমস্যা হলে সরাসরি হাসপাতাল ম্যাপ ওপেন হবে।' : 'Describe your symptoms for instant local clinical rule matching & AI risk assessment.'}
            </p>
          </div>
        </div>

        <TriageForm module="general" />
      </section>

      {/* Feature Modules Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          onClick={() => navigate('/pregnancy')}
          className="p-6 bg-white border border-pink-200 rounded-3xl shadow-xs hover:border-[#E85A91] hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            🤰
          </div>
          <h3 className="font-subheading font-bold text-slate-900 text-base md:text-lg group-hover:text-[#E85A91] transition-colors">
            {t('pregnancyJourney')}
          </h3>
          <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
            {lang === 'bn'
              ? '৩০-সেকেন্ডের ভ্রূণের অ্যানিমেশন, সপ্তাহভিত্তিক বিকাশ, ANC অ্যাপয়েন্টমেন্ট ও খাদ্য পুষ্টি সময়সূচী।'
              : '30-second womb growth visualizer, week-by-week development, ANC checkups, and nutrition guidance.'}
          </p>
        </div>

        <div
          onClick={() => navigate('/period')}
          className="p-6 bg-white border border-pink-200 rounded-3xl shadow-xs hover:border-[#E85A91] hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            🌸
          </div>
          <h3 className="font-subheading font-bold text-slate-900 text-base md:text-lg group-hover:text-[#E85A91] transition-colors">
            {t('period')} Tracking
          </h3>
          <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
            {lang === 'bn'
              ? 'পিরিয়ড চক্র ইনপুট, পরবর্তী সম্ভাব্য তারিখের পূর্বাভাস, লক্ষণ ইতিহাস ও ডাক্তারদের উপযোগী PDF রিপোর্ট।'
              : 'Cycle logging, next period predictions, fertile window tracking, and shareable medical PDFs.'}
          </p>
        </div>

        <div
          onClick={() => navigate('/female-health')}
          className="p-6 bg-white border border-pink-200 rounded-3xl shadow-xs hover:border-[#E85A91] hover:shadow-md transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            🏥
          </div>
          <h3 className="font-subheading font-bold text-slate-900 text-base md:text-lg group-hover:text-[#E85A91] transition-colors">
            {t('femaleHealth')}
          </h3>
          <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
            {lang === 'bn'
              ? 'UTI, পিসিওএস (PCOS), ঋতুস্রাবের সমস্যা এবং স্তন স্বাস্থ্যের জন্য বিস্তারিত চিকিৎসা তথ্য নির্দেশিকা।'
              : 'Educational guidance for UTIs, PCOS, menstrual disorders, and breast self-examinations.'}
          </p>
        </div>
      </div>
    </div>
  );
}
