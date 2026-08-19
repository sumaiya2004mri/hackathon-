import { useAuth } from '../auth/AuthContext';

const DISTRICTS = ['Dhaka', 'Rajshahi', 'Chattogram', 'Khulna', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'];

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();

  function deleteMyData() {
    if (!confirm('This permanently deletes all locally stored triage, period, and pregnancy data on this device. Continue?')) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith('ea_'))
      .forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  }

  function exportAllData() {
    const data: Record<string, unknown> = {};
    Object.keys(localStorage)
      .filter((k) => k.startsWith('ea_'))
      .forEach((k) => { data[k] = JSON.parse(localStorage.getItem(k) ?? 'null'); });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'my-emergency-ai-data.json'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>

      <section className="card p-4 space-y-3">
        <h2 className="font-medium">Profile</h2>
        <label className="text-xs text-clinical-muted block">Name
          <input defaultValue={user.name} onBlur={(e) => updateProfile({ name: e.target.value })}
            className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-md p-2 text-sm" />
        </label>
        <label className="text-xs text-clinical-muted block">District (drives localized emergency numbers)
          <select defaultValue={user.district} onChange={(e) => updateProfile({ district: e.target.value })}
            className="w-full mt-1 bg-clinical-panel2 border border-clinical-border rounded-md p-2 text-sm">
            <option value="">Select district</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </section>

      <section className="card p-4 space-y-2">
        <h2 className="font-medium">Privacy</h2>
        <p className="text-xs text-clinical-muted">
          Period, pregnancy, and symptom data is sensitive. In this prototype it's stored only on this device (browser local storage).
          In a production deployment backed by Firestore, this data would be encrypted at rest and readable only by your account —
          see the README for the security rules used. You can export or delete everything below at any time.
        </p>
        <div className="flex gap-2">
          <button onClick={exportAllData} className="text-xs px-3 py-1.5 rounded-md bg-clinical-panel2 border border-clinical-border">Export my data</button>
          <button onClick={deleteMyData} className="text-xs px-3 py-1.5 rounded-md bg-severity-EMERGENCY/15 text-severity-EMERGENCY border border-severity-EMERGENCY/30">Delete my data</button>
        </div>
      </section>

      {!user.isGuest && (
        <button onClick={logout} className="text-sm text-clinical-muted underline underline-offset-2">Log out</button>
      )}
    </div>
  );
}
