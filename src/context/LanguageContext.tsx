import React, { createContext, useContext, useState, useEffect } from 'react';

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
