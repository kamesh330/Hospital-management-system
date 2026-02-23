export interface Patient {
  patient_id: string;
  age: number;
  gender: string;
  heart_rate_bpm: number;
  systolic_bp_mmHg: number;
  diastolic_bp_mmHg: number;
  oxygen_saturation_percent: number;
  body_temperature_celsius: number;
  respiratory_rate_bpm: number;
  blood_sugar_mg_dl: number;
  bmi: number;
  chronic_disease_flag: number;
  emergency_case_flag: number;
  icu_required_flag: number;
  admission_type: string;
  diagnosis_category: string;
  hydration_level_percent: number;
  hemoglobin_g_dl: number;
  _surgeFlagged?: boolean;
  [key: string]: any;
}

export const DEFAULT_PATIENTS: Patient[] = [
  {
    patient_id: 'P001', age: 72, gender: 'M',
    heart_rate_bpm: 118, systolic_bp_mmHg: 160, diastolic_bp_mmHg: 95,
    oxygen_saturation_percent: 88, body_temperature_celsius: 39.2,
    respiratory_rate_bpm: 26, blood_sugar_mg_dl: 280, bmi: 31.2,
    chronic_disease_flag: 1, emergency_case_flag: 1, icu_required_flag: 1,
    admission_type: 'Emergency', diagnosis_category: 'Cardiac',
    hydration_level_percent: 42, hemoglobin_g_dl: 9.1,
  },
  {
    patient_id: 'P002', age: 45, gender: 'F',
    heart_rate_bpm: 78, systolic_bp_mmHg: 122, diastolic_bp_mmHg: 78,
    oxygen_saturation_percent: 97, body_temperature_celsius: 37.0,
    respiratory_rate_bpm: 16, blood_sugar_mg_dl: 110, bmi: 23.4,
    chronic_disease_flag: 0, emergency_case_flag: 0, icu_required_flag: 0,
    admission_type: 'Elective', diagnosis_category: 'Routine',
    hydration_level_percent: 72, hemoglobin_g_dl: 13.5,
  },
  {
    patient_id: 'P003', age: 58, gender: 'M',
    heart_rate_bpm: 95, systolic_bp_mmHg: 155, diastolic_bp_mmHg: 90,
    oxygen_saturation_percent: 93, body_temperature_celsius: 38.8,
    respiratory_rate_bpm: 22, blood_sugar_mg_dl: 210, bmi: 28.7,
    chronic_disease_flag: 1, emergency_case_flag: 0, icu_required_flag: 0,
    admission_type: 'Urgent', diagnosis_category: 'Hypertension',
    hydration_level_percent: 55, hemoglobin_g_dl: 11.2,
  },
];

export interface Hospital {
  hospital_id: string;
  total_beds: number;
  occupied_beds: number;
  icu_beds_total: number;
  icu_beds_occupied: number;
  er_capacity: number;
  er_occupied: number;
  ongoing_operations_count: number;
  available_doctors: number;
  available_nurses: number;
  ventilators_available: number;
  ambulance_available_count: number;
  room_temperature_celsius: number;
  oxygen_supply_level_percent: number;
  total_patients_current: number;
  [key: string]: any;
}

export const DEFAULT_HOSPITAL: Hospital = {
  hospital_id: 'H001',
  total_beds: 200,
  occupied_beds: 185,
  icu_beds_total: 20,
  icu_beds_occupied: 18,
  er_capacity: 50,
  er_occupied: 44,
  ongoing_operations_count: 8,
  available_doctors: 10,
  available_nurses: 25,
  ventilators_available: 5,
  ambulance_available_count: 3,
  room_temperature_celsius: 23,
  oxygen_supply_level_percent: 78,
  total_patients_current: 185,
};
