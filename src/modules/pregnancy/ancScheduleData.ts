import type { ANCVisit, TTRecord, ChecklistItem } from '../../types';

// Bangladesh DGHS minimum ANC protocol: at least 4 visits at these
// approximate gestational windows.
export const DEFAULT_ANC_SCHEDULE: Omit<ANCVisit, 'id'>[] = [
  { visitNumber: 1, scheduledWeek: 12 },
  { visitNumber: 2, scheduledWeek: 26 },
  { visitNumber: 3, scheduledWeek: 32 },
  { visitNumber: 4, scheduledWeek: 36 },
];

// TT (tetanus toxoid) schedule per BD EPI guidance for pregnant women without
// prior full immunization — doses spaced per protocol.
export const DEFAULT_TT_SCHEDULE: Omit<TTRecord, 'completedAt'>[] = [
  { doseNumber: 1, scheduledDate: '' }, // as early as possible in pregnancy
  { doseNumber: 2, scheduledDate: '' }, // 4+ weeks after dose 1
];

export const DEFAULT_HOSPITAL_BAG_CHECKLIST: Omit<ChecklistItem, 'id' | 'checked'>[] = [
  { label: 'NID / birth registration & ANC card' },
  { label: 'Money for hospital fees / transport' },
  { label: '2–3 saree/gown or comfortable clothes for mother' },
  { label: 'Sanitary pads (heavy flow)' },
  { label: 'Baby clothes (newborn size, a few sets)' },
  { label: 'Baby blanket / wrap' },
  { label: 'Phone + charger' },
  { label: 'Water bottle and light snacks' },
  { label: 'Toiletries (toothbrush, soap, towel)' },
  { label: 'List of emergency contacts and preferred hospital' },
];

export const BD_NUTRITION_GUIDANCE: { category: string; foods: string[]; note: string }[] = [
  { category: 'Iron-rich foods', foods: ['Red meat (small amounts)', 'Liver', 'Lentils (masoor dal)', 'Spinach (palong shak)', 'Kalo jam (jamun)', 'Dates (khejur)'], note: 'Pair with vitamin C (lemon, guava) to improve absorption.' },
  { category: 'Folate-rich foods', foods: ['Leafy greens (lal shak, kolmi shak)', 'Lentils', 'Beans', 'Orange (fortified)', 'Papaya'], note: 'Especially important in the first trimester for neural tube development.' },
  { category: 'Calcium-rich foods', foods: ['Small fish eaten with bones (mola, dhela)', 'Milk and dahi', 'Sesame seeds (til)'], note: 'Supports bone development.' },
  { category: 'Protein sources', foods: ['Fish', 'Eggs', 'Dal', 'Chicken', 'Milk'], note: 'Aim for a source at most meals.' },
  { category: 'Foods to limit', foods: ['Excess tea/coffee near meals (reduces iron absorption)', 'Raw or undercooked fish/meat', 'Unpasteurized dairy'], note: 'Ask your ANC provider about any specific restrictions for you.' },
];
