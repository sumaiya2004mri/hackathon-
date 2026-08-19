import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    triage: 'Triage',
    pregnancy: 'Pregnancy',
    period: 'Period',
    femaleHealth: 'Female Health',
    dashboard: 'Dashboard',
    settings: 'Settings',
    login: 'Log in',
    signedIn: 'Signed in',

    // Emergency Banner
    emergencyWarning: 'Emergency Warning: If you experience any of these symptoms, call',
    callNow: 'immediately:',
    showList: 'Show list',
    hideSymptoms: 'Hide symptoms',

    // Female Health
    femaleHealthTitle: 'Your Women\'s Health',
    femaleHealthSub: 'Understand your body, track changes, and know when it\'s time to seek professional care.',
    educationalGuidance: 'EDUCATIONAL GUIDANCE',
    femaleHealthDisclaimer: 'This section is educational and helps route you to the right level of care — it does not diagnose any condition.',
    notFeelingYourself: 'Not feeling like yourself?',
    symptomCheckSub: 'Use our symptom check to understand the appropriate level of care. Runs through local clinical rules + AI triage.',
    startSymptomCheck: 'Start symptom check',
    learnMore: 'Learn more →',

    // Pregnancy
    pregnancyJourney: 'Your Pregnancy Journey',
    maternalCompanion: 'Maternal Companion',
    estimatedDueDate: 'Estimated due date',
    babySize: 'Baby is about the size of',
    pregnancyTimeline: 'Your Pregnancy Timeline',
    timelineSub: 'Drag or click points to explore week-by-week development from Week 4 to Week 40.',
    calcGestationalAge: 'Calculated gestational age',
    milestoneReached: 'Milestone Reached',
    tabOverview: 'Overview',
    tabCareSchedule: 'Care schedule',
    tabVitals: 'Vitals',
    tabNutrition: 'Nutrition',
    tabDeliveryPrep: 'Delivery prep',
    tabSymptomCheck: 'Symptom check',
    babyDevelopment: 'Baby\'s Development',
    babyDevSub: 'Your baby is growing rapidly this week. Major organ and tissue structures are continuing to mature.',
    motherChanges: 'Mother\'s Changes',
    motherChangesSub: 'Your body is adapting every week. Track physical changes, energy levels, and essential hydration.',
    importantAppointments: 'Important Appointments',
    importantApptSub: 'Keep track of your ANC visits and TT vaccination schedules per BD health guidelines.',
    nutritionGuidance: 'Nutrition Guidance',
    nutritionSub: 'Focus on iron, folate, and calcium-rich local foods for optimal maternal & fetal health.',
    deliveryPreparation: 'Delivery Preparation',
    deliverySub: 'Prepare your hospital bag checklist and select your preferred emergency delivery hospital.',
    symptomTracker: 'Symptom Check',
    symptomTrackerSub: 'Log physical symptoms or check warning signs to route into instant emergency evaluation.',
    viewSchedule: 'View schedule →',
    viewNutrition: 'View nutrition →',
    prepareNow: 'Prepare now →',
    trackVitals: 'Track vitals →',
    checkSymptoms: 'Check symptoms →',

    // Period Module
    logCycle: 'Log a Period Cycle',
    startDate: 'Start Date',
    endDate: 'End Date (Optional)',
    flow: 'Flow Intensity',
    mood: 'Mood (Optional)',
    symptomsLabel: 'Symptoms (Comma Separated)',
    saveCycleLog: 'Save cycle log',
    isSomethingWrong: 'Is something wrong?',
    checkPeriodSymptom: 'Check a period symptom',
    periodSymptomSub: 'Symptom check runs through the same triage engine as the emergency module — anything urgent routes to hospital lookup automatically.',
    history: 'Cycle History',
    noPeriodLogs: 'No period logs recorded yet. Set up logging to track cycle averages, predict next start, and log symptoms.',
    cycleStats: 'Cycle Statistics',
    avgCycleLength: 'Average cycle length',
    avgPeriodLength: 'Average period length',
    predictedNextStart: 'Predicted next start',
    predictedFertileWindow: 'Predicted fertile window',

    // Dashboard
    dashboardSub: 'Personalized maternal history, vitals, and emergency contact details.',
    tabTriageHistory: 'Triage History',
    tabPeriodHistory: 'Period History',
    tabPregnancyTracking: 'Pregnancy Tracking',
    noTriageRecorded: 'No triage sessions recorded yet. When you perform a symptom check, your results & SBAR summaries will appear here.',
    noPregnancySetup: 'Pregnancy tracking not set up. Enter your Last Menstrual Period in the Pregnancy module to compute due dates.',

    // Settings
    editContact: 'Edit Contact',
    addContact: 'Add Contact',
    medicalHistoryTitle: 'Medical History & Clinical Background',
    medicalHistorySub: 'Used for AI triage risk checks and printed under SBAR PDF Background.',
    profileSettings: 'Profile Settings',
    name: 'Name',
    districtLabel: 'District (Drives Local Emergency Department Lookup)',
    privacyTitle: 'Privacy & Local Data Control',
    privacySub: 'Your emergency contact, medical history, triage, period, and pregnancy records are securely stored on your local browser device.',
    exportData: 'Export My Data',
    deleteData: 'Delete My Data',
    logout: 'Log out from account',

    // Emergency Contact
    emergencyContact: 'Emergency Contact',
    emergencyContactSub: 'Mandatory emergency phone & relationship for swift crisis response.',
    contactPhone: 'Contact Phone Number',
    relationship: 'Relationship with Contact',
    saveContact: 'Save Emergency Contact',
    contactSaved: 'Emergency contact saved successfully!',
    enterPhone: 'Enter phone number (+880...)',
    selectRelationship: 'Select relationship',
    spouse: 'Spouse / Partner',
    parent: 'Parent / Guardian',
    sibling: 'Sibling',
    friend: 'Friend',
    other: 'Other',
    mandatoryNotice: 'Please provide a valid emergency contact phone number and relationship.',

    // Common
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
  },
  bn: {
    // Nav
    triage: 'জরুরি মূল্যায়ন',
    pregnancy: 'গর্ভাবস্থা',
    period: 'ঋতুস্রাব',
    femaleHealth: 'নারী স্বাস্থ্য',
    dashboard: 'ড্যাশবোর্ড',
    settings: 'সেটিংস',
    login: 'লগ ইন',
    signedIn: 'সাইন ইন',

    // Emergency Banner
    emergencyWarning: 'জরুরি সতর্কতা: মারাত্মক শারীরিক উপসর্গ দেখা দিলে অবিলম্বে কল করুন',
    callNow: 'নম্বরে:',
    showList: 'তালিকা দেখুন',
    hideSymptoms: 'তালিকা লুকান',

    // Female Health
    femaleHealthTitle: 'আপনার নারী স্বাস্থ্য ও যত্ন',
    femaleHealthSub: 'আপনার শরীরকে জানুন, পরিবর্তন ট্র্যাক করুন এবং কখন বিশেষজ্ঞ ডাক্তারের পরামর্শ নিতে হবে তা জানুন।',
    educationalGuidance: 'স্বাস্থ্যমূলক নির্দেশিকা',
    femaleHealthDisclaimer: 'এই বিভাগটি শিক্ষামূলক এবং সঠিক চিকিৎসা সহায়তায় নির্দেশ করে — এটি সরাসরি কোনো রোগ নির্ণয় করে না।',
    notFeelingYourself: 'শারীরিক অস্বস্তি বোধ করছেন?',
    symptomCheckSub: 'সঠিক স্তরের স্বাস্থ্যসেবা জানতে আমাদের উপসর্গ মূল্যায়ন ব্যবহার করুন। এটি ক্লিনিক্যাল রুলস ও AI ট্রায়াজ দ্বারা পরিচালিত।',
    startSymptomCheck: 'উপসর্গ পরীক্ষা শুরু করুন',
    learnMore: 'বিস্তারিত জানুন →',

    // Pregnancy
    pregnancyJourney: 'আপনার গর্ভাবস্থার সফর',
    maternalCompanion: 'মাতৃত্ব সঙ্গী',
    estimatedDueDate: 'আনুমানিক প্রসবের তারিখ',
    babySize: 'সন্তানের বর্তমান আকার প্রায়',
    pregnancyTimeline: 'গর্ভাবস্থার সময়রেখা',
    timelineSub: 'সপ্তাহ ভিত্তিক ভ্রূণের বিকাশ দেখতে ড্রেগ বা ক্লিক করুন (৪ থেকে ৪০ সপ্তাহ)।',
    calcGestationalAge: 'হিসাবকৃত গর্ভাবস্থার সপ্তাহ',
    milestoneReached: 'গুরুত্বপূর্ণ মাইলফলক অর্জিত',
    tabOverview: 'সংক্ষিপ্ত বিবরণ',
    tabCareSchedule: 'পরিচর্য সারণী',
    tabVitals: 'রক্তচাপ ও রক্তে শর্করা',
    tabNutrition: 'পুষ্টি নির্দেশিকা',
    tabDeliveryPrep: 'প্রসব প্রস্তুতি',
    tabSymptomCheck: 'লক্ষণ পরীক্ষা',
    babyDevelopment: 'সন্তানের শারীরিক বিকাশ',
    babyDevSub: 'এই সপ্তাহে আপনার সন্তান দ্রুত বৃদ্ধি পাচ্ছে। প্রধান অঙ্গ ও টিস্যুর গঠন পরিপক্ক হচ্ছে।',
    motherChanges: 'মায়ের শারীরিক পরিবর্তন',
    motherChangesSub: 'প্রতি সপ্তাহে মায়ের শরীর পরিবর্তিত হয়। শারীরিক শক্তি, পানিশূন্যতা ও বিশ্রাম পর্যবেক্ষণ করুন।',
    importantAppointments: 'জরুরি ডাক্তার চেকআপ',
    importantApptSub: 'সরকারি স্বাস্থ্য নির্দেশিকা অনুযায়ী ৪টি ANC ভিজিট এবং টিটি টিকার সময়সূচী ট্র্যাক করুন।',
    nutritionGuidance: 'খাদ্য ও পুষ্টি নির্দেশিকা',
    nutritionSub: 'মা ও শিশুর সুস্বাস্থ্যের জন্য আয়রন, ফোলেট ও ক্যালসিয়াম সমৃদ্ধ স্থানীয় খাবারের ওপর জোর দিন।',
    deliveryPreparation: 'হাসপাতাল ব্যাগের প্রস্তুতি',
    deliverySub: 'প্রসবের প্রস্তুতি হিসেবে হাসপাতাল ব্যাগ তালিকা এবং পছন্দের ডেলিভারি হাসপাতাল নিশ্চিত করুন।',
    symptomTracker: 'লক্ষণ মূল্যায়ন',
    symptomTrackerSub: 'শারীরিক কোনো বিপদচিহ্ন দেখা দিলে তাৎক্ষণিক জরুরি মূল্যায়নে তথ্য দিন।',
    viewSchedule: 'সময়সূচী দেখুন →',
    viewNutrition: 'পুষ্টি দেখুন →',
    prepareNow: 'প্রস্তুতি নিন →',
    trackVitals: 'ভাইটালস দিন →',
    checkSymptoms: 'লক্ষণ পরীক্ষা করুন →',

    // Period Module
    logCycle: 'পিরিয়ড চক্র রেকর্ড করুন',
    startDate: 'পিরিয়ড শুরুর তারিখ',
    endDate: 'শেষের তারিখ (ঐচ্ছিক)',
    flow: 'রক্তস্রাবের পরিমাণ',
    mood: 'মানসিক অবস্থা (ঐচ্ছিক)',
    symptomsLabel: 'শারীরিক লক্ষণ (কমা দিয়ে লিখুন)',
    saveCycleLog: 'পিরিয়ড তথ্য সংরক্ষণ করুন',
    isSomethingWrong: 'কোনো শারীরিক সমস্যা হচ্ছে?',
    checkPeriodSymptom: 'পিরিয়ডের লক্ষণ পরীক্ষা করুন',
    periodSymptomSub: 'আমাদের ট্রায়াজ ইঞ্জিনের মাধ্যমে লক্ষণ পরীক্ষা করুন — জটিল সমস্যা হলে স্বয়ংক্রিয়ভাবে নিকটস্থ হাসপাতাল খুঁজে পাবেন।',
    history: 'পিরিয়ড ইতিহাস',
    noPeriodLogs: 'এখনো কোনো পিরিয়ড রেকর্ড সংরক্ষণ করা হয়নি। তথ্য ইনপুট দিলে পিরিয়ডের সময়সূচী পূর্বাভাস পাওয়া যাবে।',
    cycleStats: 'পিরিয়ড চক্রের পরিসংখ্যান',
    avgCycleLength: 'গড় চক্রের দৈর্ঘ্য',
    avgPeriodLength: 'গড় পিরিয়ডের স্থায়িত্ব',
    predictedNextStart: 'পরবর্তী সম্ভাব্য পিরিয়ড তারিখ',
    predictedFertileWindow: 'গর্ভধারণের সম্ভাব্য উর্বর সময়',

    // Dashboard
    dashboardSub: 'আপনার গর্ভাবস্থা, পিরিয়ড ইতিহাস ও জরুরি যোগাযোগ তথ্য।',
    tabTriageHistory: 'জরুরি ট্রায়াজ ইতিহাস',
    tabPeriodHistory: 'পিরিয়ডের ইতিহাস',
    tabPregnancyTracking: 'গর্ভাবস্থার ট্র্যাকিং',
    noTriageRecorded: 'এখনো কোনো ট্রায়াজ সেশন রেকর্ড নেই। লক্ষণ মূল্যায়ন করলে আপনার SBAR রিপোর্ট এখানে দেখাবে।',
    noPregnancySetup: 'গর্ভাবস্থা ট্র্যাকিং চালু করা হয়নি। প্রেগন্যান্সি মডিউলে পিরিয়ডের শেষ তারিখ প্রদান করুন।',

    // Settings
    editContact: 'পরিবর্তন করুন',
    addContact: 'যোগ করুন',
    medicalHistoryTitle: 'মেডিকেল ইতিহাস ও শারীরিক তথ্য',
    medicalHistorySub: 'AI ট্রায়াজ ঝুঁকি মূল্যায়ন ও SBAR পিডিএফে এই মেডিকেল ইতিহাস যুক্ত করা হয়।',
    profileSettings: 'প্রোফাইল সেটিংস',
    name: 'নাম',
    districtLabel: 'জেলা (নিকটস্থ হাসপাতাল খুঁজে পেতে সহায়তা করে)',
    privacyTitle: 'তথ্য সুরক্ষা ও গোপনীয়তা',
    privacySub: 'আপনার সব মেডিকেল ইতিহাস ও স্বাস্থ্য তথ্য এই ডিভাইসের লোকাল স্টোরেজে সুরক্ষিতভাবে সংরক্ষিত।',
    exportData: 'ডাটা এক্সপোর্ট করুন',
    deleteData: 'ডাটা মুছে ফেলুন',
    logout: 'অ্যাকাউন্ট থেকে লগ আউট করুন',

    // Emergency Contact
    emergencyContact: 'জরুরি যোগাযোগ তথ্য',
    emergencyContactSub: 'জরুরি অবস্থায় দ্রুত যোগাযোগের জন্য ফোন নম্বর ও সম্পর্ক নির্বাচন করুন।',
    contactPhone: 'জরুরি যোগাযোগের ফোন নম্বর',
    relationship: 'যোগাযোগকারীর সাথে সম্পর্ক',
    saveContact: 'জরুরি যোগাযোগ সংরক্ষণ করুন',
    contactSaved: 'জরুরি যোগাযোগ তথ্য সফলভাবে সংরক্ষিত হয়েছে!',
    enterPhone: 'ফোন নম্বর লিখুন (+৮৮০...)',
    selectRelationship: 'সম্পর্ক নির্বাচন করুন',
    spouse: 'স্বামী / সঙ্গী',
    parent: 'পিতামাতা / অভিভাবক',
    sibling: 'ভাই / বোন',
    friend: 'বন্ধু',
    other: 'অন্যান্য',
    mandatoryNotice: 'অনুগ্রহ করে একটি সঠিক জরুরি যোগাযোগের ফোন নম্বর এবং সম্পর্ক প্রদান করুন।',

    // Common
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    loading: 'লোড হচ্ছে...',
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('ea_lang') as Language;
    return saved === 'bn' ? 'bn' : 'en';
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('ea_lang', l);
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'bn' : 'en');
  };

  const t = (key: string): string => {
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['en']?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
