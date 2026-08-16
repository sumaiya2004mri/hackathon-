import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/* ------------------------------------------------------------------ */
/*  Pregnancy module                                                   */
/* ------------------------------------------------------------------ */

export interface PregnancyProfile {
  lmpDate: string; // last menstrual period, ISO date — used to derive week
}

export interface PregnancySymptomCheck {
  id?: string;
  text: string;
  classification: "Normal" | "Monitor" | "See Doctor" | "Emergency";
  createdAt?: Timestamp;
}

export async function savePregnancyProfile(
  uid: string,
  profile: PregnancyProfile
) {
  await setDoc(doc(db, "users", uid, "meta", "pregnancy"), profile);
}

export async function logPregnancySymptomCheck(
  uid: string,
  entry: PregnancySymptomCheck
) {
  await addDoc(collection(db, "users", uid, "pregnancySymptomChecks"), {
    ...entry,
    createdAt: Timestamp.now(),
  });
}

export async function getPregnancySymptomHistory(
  uid: string
): Promise<PregnancySymptomCheck[]> {
  const q = query(
    collection(db, "users", uid, "pregnancySymptomChecks"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as PregnancySymptomCheck) }));
}

/* ------------------------------------------------------------------ */
/*  Female health / cycle module                                       */
/* ------------------------------------------------------------------ */

export interface CycleEntry {
  id?: string;
  startDate: string; // ISO date
  periodLengthDays: number;
  flow: "light" | "medium" | "heavy";
  symptoms: string[];
  mood?: string;
  createdAt?: Timestamp;
}

export async function logCycleEntry(uid: string, entry: CycleEntry) {
  await addDoc(collection(db, "users", uid, "cycleEntries"), {
    ...entry,
    createdAt: Timestamp.now(),
  });
}

export async function getCycleHistory(uid: string): Promise<CycleEntry[]> {
  const q = query(
    collection(db, "users", uid, "cycleEntries"),
    orderBy("startDate", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as CycleEntry) }));
}
