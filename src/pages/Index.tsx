import { useState } from 'react';
import { C, serif } from '../data/theme';
import { DEFAULT_PATIENTS, DEFAULT_HOSPITAL } from '../data/sampleData';
import type { Patient } from '../data/sampleData';
import { processPatients } from '../engine/clinicalEngine';
import { computeHospitalMetrics, applySurgeMode, generateSurgeReport, generateStaffAlerts } from '../engine/hospitalEngine';

import LoginPage from './LoginPage';
import DashboardTab from './DashboardTab';
import HeatmapTab from './HeatmapTab';
import PatientsTab from './PatientsTab';
import HospitalTab from './HospitalTab';
import SurgeTab from './SurgeTab';
import O2CrisisTab from './O2CrisisTab';
import AlertsTab from './AlertsTab';
import DataEntryTab from './DataEntryTab';
import ClinicalTopBar from '../components/ClinicalTopBar';
import ClinicalNavTabs from '../components/ClinicalNavTabs';

export default function CarePulseApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedHId, setLoggedHId] = useState('');

  const [patients, setPatients] = useState<Patient[]>(DEFAULT_PATIENTS);
  const [hospital, setHospital] = useState(DEFAULT_HOSPITAL);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPid, setSelectedPid] = useState<string | null>(null);
  const [editingPid, setEditingPid] = useState<string | null>(null);

  const [surgeMode, setSurgeMode] = useState(false);
  const [surgeFactor, setSurgeFactor] = useState(0.30);
  const [o2Crisis, setO2Crisis] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const handleLogin = (id: string) => { setLoggedIn(true); setLoggedHId(id); };
  const handleLogout = () => { setLoggedIn(false); setLoggedHId(''); setActiveTab('dashboard'); };

  if (!loggedIn) return <LoginPage onLogin={handleLogin} />;

  const actualO2Crisis = o2Crisis || hospital.oxygen_supply_level_percent < 40;
  const patientsWithSurge = surgeMode ? applySurgeMode(patients, surgeFactor) : patients;
  const processed = processPatients(patientsWithSurge, surgeMode, surgeFactor, actualO2Crisis);

  const hm = computeHospitalMetrics(hospital, processed, surgeMode, actualO2Crisis);
  const surgeReport = surgeMode ? generateSurgeReport(processed, hospital) : null;
  const allAlerts = generateStaffAlerts(processed, hospital, hm)
    .filter(a => !dismissedAlerts.has(a.id));

  const addPatient = () => {
    const newP: Patient = {
      patient_id: `P${String(patients.length + 1).padStart(3, '0')}`,
      age: 40, gender: 'M', heart_rate_bpm: 75,
      systolic_bp_mmHg: 115, diastolic_bp_mmHg: 75,
      oxygen_saturation_percent: 98, body_temperature_celsius: 37.0,
      respiratory_rate_bpm: 16, blood_sugar_mg_dl: 100, bmi: 22.5,
      chronic_disease_flag: 0, emergency_case_flag: 0, icu_required_flag: 0,
      admission_type: 'Elective', diagnosis_category: 'General',
      hydration_level_percent: 70, hemoglobin_g_dl: 14.0,
    };
    setPatients([...patients, newP]);
    setEditingPid(newP.patient_id);
    setActiveTab('data-entry');
  };

  const updatePatient = (pid: string, field: string, val: number) =>
    setPatients(patients.map(p => p.patient_id === pid ? { ...p, [field]: val } : p));

  const updateHospital = (field: string, val: number) => setHospital({ ...hospital, [field]: val });

  const handlePatientClick = (pid: string) => { setSelectedPid(pid); setActiveTab('patients'); };

  const dismissAlert = (id: string) => setDismissedAlerts(prev => new Set([...prev, id]));

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: serif }}>
      <ClinicalTopBar
        hospitalId={loggedHId}
        patientCount={patients.length}
        stressClass={hm.stressClass}
        stress={hm.stress}
        surgeMode={surgeMode}
        o2Crisis={actualO2Crisis}
        onLogout={handleLogout}
      />

      <ClinicalNavTabs activeTab={activeTab} onTabChange={setActiveTab} alertCount={allAlerts.length} />

      <div style={{ padding: '18px 24px', maxWidth: 1300, margin: '0 auto' }}>
        {activeTab === 'dashboard' && (
          <DashboardTab processed={processed} hm={hm} patientCount={patients.length}
            surgeMode={surgeMode} o2Crisis={actualO2Crisis} onPatientClick={handlePatientClick} />
        )}
        {activeTab === 'heatmap' && <HeatmapTab processed={processed} />}
        {activeTab === 'patients' && (
          <PatientsTab processed={processed} selectedPid={selectedPid}
            onSelectPid={setSelectedPid} onAddPatient={addPatient} />
        )}
        {activeTab === 'hospital' && (
          <HospitalTab hm={hm} hospital={hospital} onUpdateHospital={updateHospital} />
        )}
        {activeTab === 'surge' && (
          <SurgeTab processed={processed} surgeMode={surgeMode} surgeFactor={surgeFactor}
            onToggleSurge={() => setSurgeMode(!surgeMode)}
            onSurgeFactorChange={setSurgeFactor}
            surgeReport={surgeReport} hm={hm} />
        )}
        {activeTab === 'o2crisis' && (
          <O2CrisisTab processed={processed} hospital={hospital}
            o2Crisis={actualO2Crisis} onToggleO2={() => setO2Crisis(!o2Crisis)}
            onUpdateHospital={updateHospital} hm={hm} />
        )}
        {activeTab === 'alerts' && (
          <AlertsTab alerts={allAlerts} onDismiss={dismissAlert} />
        )}
        {activeTab === 'data-entry' && (
          <DataEntryTab patients={patients} onAddPatient={addPatient}
            onUpdatePatient={updatePatient} editingPid={editingPid}
            onSetEditingPid={setEditingPid} />
        )}
      </div>
    </div>
  );
}
