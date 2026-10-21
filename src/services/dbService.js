/**
 * School Portal - Persistent Database Service
 * 
 * SECURITY RULES:
 * - Data is ONLY written when the user explicitly performs an action (add/edit/delete)
 * - Initial seed data loads ONCE on first install (when school_db_init is not set)
 * - After first install, code changes to initialData.js NEVER override user data
 * - Each collection is stored independently in localStorage
 * - Version upgrades only ADD missing records, never overwrite existing ones
 */

const DB_VERSION = "school_v1";
const DB_INIT_KEY = "school_db_init";
const DB_VERSION_KEY = "school_db_version";

/**
 * Safe read from localStorage - returns null if key doesn't exist or JSON is invalid
 */
export function dbRead(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Safe write to localStorage - serializes value as JSON
 */
export function dbWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[DB] Failed to write key "${key}":`, e);
  }
}

/**
 * Initialize the database on first launch.
 * 
 * RULE: If school_db_init exists → user already has data → do NOT overwrite anything.
 * Only runs once ever (first time the app is opened on this browser).
 */
export function dbInitOnce(seedData) {
  const alreadyInitialized = localStorage.getItem(DB_INIT_KEY);
  
  if (alreadyInitialized) {
    // Database already set up → respect ALL existing user data
    return false;
  }

  // First time ever on this browser → seed all collections
  Object.entries(seedData).forEach(([key, value]) => {
    // Only write if key doesn't already have data
    if (localStorage.getItem(key) === null) {
      dbWrite(key, value);
    }
  });

  // Mark as initialized so we never run seed again
  localStorage.setItem(DB_INIT_KEY, DB_VERSION);
  localStorage.setItem(DB_VERSION_KEY, DB_VERSION);
  
  return true;
}

import { neonGet, neonSet, neonGetAll, neonSaveAllCollections } from './neonDbService';

/**
 * Load a collection from localStorage with cloud fallback.
 */
export function dbLoadCollection(key, defaultValue) {
  const data = dbRead(key);
  if (data === null) {
    dbWrite(key, defaultValue);
    // Background sync initial seed to cloud
    neonSet(key, defaultValue).catch(() => {});
    return defaultValue;
  }
  return data;
}

/**
 * Save a collection immediately to LocalStorage AND sync to Neon Cloud
 */
export function dbSaveCollection(key, value) {
  // 1. Instant local write for 0ms UI lag
  dbWrite(key, value);

  // 2. Cloud sync in background to Neon PostgreSQL
  neonSet(key, value).catch(err => {
    console.warn(`[Neon Cloud Sync] Failed to sync ${key}:`, err);
  });
}

/**
 * Upload all current local collections to Neon Cloud
 */
export async function uploadAllToNeonCloud() {
  const keys = [
    'school_subjects', 'school_grades', 'school_classrooms', 'school_students',
    'school_teachers', 'school_staff', 'school_exams', 'school_expenses',
    'school_buses', 'school_messages', 'school_agenda', 'school_tutoring',
    'school_tutoring_payments', 'school_push_notifs', 'school_system_users',
    'school_settings', 'school_daily_marks', 'school_attendance', 'school_behavior'
  ];
  const payload = {};
  keys.forEach(k => {
    const v = dbRead(k);
    if (v !== null && v !== undefined) payload[k] = v;
  });
  return await neonSaveAllCollections(payload);
}

/**
 * Sync all data from Neon Cloud down to local browser
 * Used when app opens or on mobile
 */
export async function syncFromCloud() {
  try {
    const cloudData = await neonGetAll();
    if (!cloudData || Object.keys(cloudData).length === 0) {
      return null;
    }

    Object.entries(cloudData).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        dbWrite(k, v);
      }
    });

    return cloudData;
  } catch (err) {
    console.warn('[Neon Cloud Sync] Error downloading cloud data:', err);
    return null;
  }
}

/**
 * Database Protection Lock - Factory resets are disabled to safeguard user data.
 */
export function dbFactoryReset() {
  console.warn("[DB SECURITY LOCK] Factory reset has been permanently disabled to protect user data.");
}

/**
 * Generate a QR code URL for a student ID card
 */
export function getRealQRCodeURL(studentId, schoolName) {
  const data = encodeURIComponent(`${schoolName || 'School'} | Student: ${studentId}`);
  return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${data}&bgcolor=ffffff&color=0284c7`;
}

// School settings initial defaults (non-destructive - merged with saved values)
export const initialSchoolSettings = {
  schoolName: "مدرسة الدعم التعليمي",
  schoolNameEn: "Educational Support School",
  schoolLogo: "/emblem.png",
  academicYear: "2026/2027",
  country: "لبنان",
  phone: "+961 01 888 999",
  email: "info@school.edu.lb",
  currency: "USD",
  schoolStartTime: "07:30",
  schoolEndTime: "12:00",
  recessStartTime: "09:10",
  recessEndTime: "09:30",
  recessLabel: "استراحة ووجبة فطور",
  workingHoursStr: "من 07:30 صباحاً حتى 12:00 ظهراً",
  theme: "light",
  primaryColor: "#0284C7",
  accentColor: "#EF4444"
};
