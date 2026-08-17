export interface EmergencyContact {
  label: string;
  number: string;
}

export const NATIONAL_EMERGENCY: EmergencyContact = { label: 'National Emergency Service', number: '999' };
export const NATIONAL_HEALTH_HELPLINE: EmergencyContact = { label: 'Health Batayon (Health Helpline)', number: '16263' };
export const NATIONAL_AMBULANCE: EmergencyContact = { label: 'Ambulance Service (Dhaka)', number: '199' };

// District -> primary referral hospital & local contact. Extend as needed;
// this is intentionally a flat, easily-editable table rather than buried logic.
export const DISTRICT_HOSPITALS: Record<string, EmergencyContact[]> = {
  Rajshahi: [
    { label: 'Rajshahi Medical College Hospital (RMCH)', number: '0721-772150' },
  ],
  Dhaka: [
    { label: 'Dhaka Medical College Hospital', number: '02-55165088' },
    { label: 'Bangabandhu Sheikh Mujib Medical University', number: '02-55165088' },
  ],
  Chattogram: [
    { label: 'Chattogram Medical College Hospital', number: '031-2502838' },
  ],
  Khulna: [
    { label: 'Khulna Medical College Hospital', number: '041-760320' },
  ],
  Sylhet: [
    { label: 'Sylhet MAG Osmani Medical College Hospital', number: '0821-713336' },
  ],
  Barishal: [
    { label: 'Sher-e-Bangla Medical College Hospital', number: '0431-2172017' },
  ],
  Rangpur: [
    { label: 'Rangpur Medical College Hospital', number: '0521-62679' },
  ],
  Mymensingh: [
    { label: 'Mymensingh Medical College Hospital', number: '091-66065' },
  ],
};

export function getContactsForDistrict(district?: string): EmergencyContact[] {
  const local = district && DISTRICT_HOSPITALS[district] ? DISTRICT_HOSPITALS[district] : [];
  return [NATIONAL_EMERGENCY, NATIONAL_HEALTH_HELPLINE, NATIONAL_AMBULANCE, ...local];
}
