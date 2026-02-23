import { useState, useMemo } from 'react';
import { C, serif } from './data/theme';
import { DEFAULT_PATIENTS, DEFAULT_HOSPITAL } from './data/sampleData';
import { processPatients }     from './engine/clinicalEngine';
import { computeHospitalMetrics, applySurgeMode, generateSurgeReport, generateStaffAlerts } from './engine/hospitalEngine';

import LoginPage    from './pages/LoginPage';
import DashboardTab from './pages/DashboardTab';
import HeatmapTab   from './pages/HeatmapTab';
import PatientsTab  from './pages/PatientsTab';
import HospitalTab  from './pages/HospitalTab';
import SurgeTab     from './pages/SurgeTab';
import O2CrisisTab  from './pages/O2CrisisTab';
import AlertsTab    from './pages/AlertsTab';
import DataEntryTab from './pages/DataEntryTab';
import TopBar       from './components/TopBar';
import NavTabs      from './components/NavTabs';

export default function App() {
  // ── Auth ────────────────────────────────────────────────────────
  const [loggedIn,  setLoggedIn]  = useState(false);
  const [loggedHId, setLoggedHId] = useState('');

  // ── Data state ──────────────────────────────────────────────────
  const [patients,    setPatients]    = useState(DEFAULT_PATIENTS);
  const [hospital,    setHospital]    = useState(DEFAULT_HOSPITAL);
  const [activeTab,   setActiveTab]   = useState('dashboard');
  const [selectedPid, setSelectedPid] = useState(null);
  const [editingPid,  setEditingPid]  = useState(null);

  // ── Feature 1: Surge Mode ───────────────────────────────────────
  const [surgeMode,   setSurgeMode]   = useState(false);
  const [surgeFactor, setSurgeFactor] = useState(0.30); // default 30%

  // ── Feature 2: O2 Crisis ────────────────────────────────────────
  const [o2Crisis, setO2Crisis] = useState(false);

  // ── Dismissed alerts ────────────────────────────────────────────
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  // ── Auth handlers ───────────────────────────────────────────────
  const handleLogin  = (id) => { setLoggedIn(true); setLoggedHId(id); };
  const handleLogout = ()   => { setLoggedIn(false); setLoggedHId(''); setActiveTab('dashboard'); };

  if (!loggedIn) return <LoginPage onLogin={handleLogin} />;

  // ── O(n) processing ─────────────────────────────────────────────
  // Apply surge flags BEFORE processing
  const actualO2Crisis = o2Crisis || hospital.oxygen_supply_level_percent < 40;
  const patientsWithSurge = surgeMode ? applySurgeMode(patients, surgeFactor) : patients;
  const processed = processPatients(patientsWithSurge, surgeMode, surgeFactor, actualO2Crisis);

  // ── Hospital metrics ────────────────────────────────────────────
  const hm = computeHospitalMetrics(hospital, processed, surgeMode, actualO2Crisis);

  // ── Surge report ────────────────────────────────────────────────
  const surgeReport = surgeMode ? generateSurgeReport(processed, hospital) : null;

  // ── Staff alerts ────────────────────────────────────────────────
  const allAlerts = generateStaffAlerts(processed, hospital, hm)
    .filter(a => !dismissedAlerts.has(a.id));

  // ── Patient mutations ───────────────────────────────────────────
  const addPatient = () => {
    const newP = {
      patient_id: `P${String(patients.length+1).padStart(3,'0')}`,
      age:40, gender:'M', heart_rate_bpm:75,
      systolic_bp_mmHg:115, diastolic_bp_mmHg:75,
      oxygen_saturation_percent:98, body_temperature_celsius:37.0,
      respiratory_rate_bpm:16, blood_sugar_mg_dl:100, bmi:22.5,
      chronic_disease_flag:0, emergency_case_flag:0, icu_required_flag:0,
      admission_type:'Elective', diagnosis_category:'General',
      hydration_level_percent:70, hemoglobin_g_dl:14.0,
    };
    setPatients([...patients, newP]);
    setEditingPid(newP.patient_id);
    setActiveTab('data-entry');
  };

  const updatePatient = (pid, field, val) =>
    setPatients(patients.map(p => p.patient_id===pid ? {...p,[field]:val} : p));

  const updateHospital = (field, val) => setHospital({...hospital,[field]:val});

  const handlePatientClick = (pid) => { setSelectedPid(pid); setActiveTab('patients'); };

  const dismissAlert = (id) => setDismissedAlerts(prev => new Set([...prev, id]));

  return (
    <div style={{ background:C.bg, minHeight:'100vh', color:C.text, fontFamily:serif,
      backgroundImage:`radial-gradient(ellipse at 0% 0%, #001828 0%, transparent 45%),
        radial-gradient(ellipse at 100% 100%, #100020 0%, transparent 45%)` }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        input:focus { border-color: ${C.accent} !important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:${C.bgDeep}; }
        ::-webkit-scrollbar-thumb { background:${C.borderHi}; border-radius:4px; }
      `}</style>

      <TopBar
        hospitalId={loggedHId}
        patientCount={patients.length}
        stressClass={hm.stressClass}
        stress={hm.stress}
        surgeMode={surgeMode}
        o2Crisis={actualO2Crisis}
        onLogout={handleLogout}
      />

      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} alertCount={allAlerts.length} />

      <div style={{ padding:'18px 24px', maxWidth:1300, margin:'0 auto' }}>

        {activeTab==='dashboard' && (
          <DashboardTab processed={processed} hm={hm} patientCount={patients.length}
            surgeMode={surgeMode} o2Crisis={actualO2Crisis} onPatientClick={handlePatientClick} />
        )}

        {activeTab==='heatmap' && <HeatmapTab processed={processed} />}

        {activeTab==='patients' && (
          <PatientsTab processed={processed} selectedPid={selectedPid}
            onSelectPid={setSelectedPid} onAddPatient={addPatient} />
        )}

        {activeTab==='hospital' && (
          <HospitalTab hm={hm} hospital={hospital} onUpdateHospital={updateHospital} />
        )}

        {activeTab==='surge' && (
          <SurgeTab
            processed={processed} surgeMode={surgeMode} surgeFactor={surgeFactor}
            onToggleSurge={()=>setSurgeMode(!surgeMode)}
            onSurgeFactorChange={setSurgeFactor}
            surgeReport={surgeReport} hm={hm}
          />
        )}

        {activeTab==='o2crisis' && (
          <O2CrisisTab
            processed={processed} hospital={hospital}
            o2Crisis={actualO2Crisis}
            onToggleO2={()=>setO2Crisis(!o2Crisis)}
            onUpdateHospital={updateHospital} hm={hm}
          />
        )}

        {activeTab==='alerts' && (
          <AlertsTab alerts={allAlerts} onDismiss={dismissAlert} />
        )}

        {activeTab==='data-entry' && (
          <DataEntryTab patients={patients} onAddPatient={addPatient}
            onUpdatePatient={updatePatient} editingPid={editingPid}
            onSetEditingPid={setEditingPid} />
        )}
      </div>
    </div>
  );
}
