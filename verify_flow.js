/**
 * Kalyaan Bharat - Test Verification Suite
 * Verifies core database workflows, alert triggers, and state transitions.
 */

// Mock localStorage for Node.js environment
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    clear: () => { store = {}; }
  };
})();

global.localStorage = mockLocalStorage;
global.window = {};

// Load db.js to load the state machinery
const fs = require('fs');
const path = require('path');
const dbCode = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');

// Evaluate dbCode in this context to expose window.KB_DB
eval(dbCode);
const KB_DB = window.KB_DB;

// Assert Helper
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

console.log("--------------------------------------------------");
console.log("🔍 Running Kalyaan Bharat Validation Suite...");
console.log("--------------------------------------------------");

// Test 1: Initialize DB and verify default mock users
KB_DB.reset();
const state = KB_DB.getState();
assert(state.users.length === 7, "Should initialize 7 default users.");
assert(state.patients.length === 1, "Should initialize 1 patient profile.");
assert(state.patients[0].name === "Kamla Bai", "Patient should be Kamla Bai.");
console.log("✅ Test 1 Passed: Database initialized with correct demo records.");

// Test 2: Voice interaction logging
const testVoice = KB_DB.addVoiceInteraction(
  'usr_kamla',
  'Severe knee pain reported',
  'Hindi',
  'Severe bilateral osteoarthritis discomfort'
);
const voiceLogs = KB_DB.getVoiceInteractions('usr_kamla');
assert(voiceLogs.length === 2, "Should have 2 voice interactions logged now.");
assert(voiceLogs[0].id === testVoice.id, "Most recent voice log should be first.");
console.log("✅ Test 2 Passed: Voice interaction logged and transcribed.");

// Test 3: Doctor Consultation notes & Care Plan generation
const meds = [
  { name: 'Amlodipine 5mg', instructions: 'Morning after breakfast', scheduleTime: '08:00 AM' },
  { name: 'Naproxen 250mg', instructions: 'Evening after dinner', scheduleTime: '09:00 PM' }
];
const carePlan = {
  title: 'Osteoarthritis Flare-up plan',
  activities: ['Knee stretches', 'Warm compress']
};
KB_DB.addConsultation('usr_kamla', 'usr_anjali', 'Clinical flare up notes', meds, carePlan, 5);

const updatedPatient = KB_DB.getPatient('usr_kamla');
assert(updatedPatient.medications.length === 2, "Should have 2 updated medications.");
assert(updatedPatient.medications[1].name === 'Naproxen 250mg', "Medication should be Naproxen.");
assert(updatedPatient.riskLevel === 'low', "Risk level should reset to low on prescription active update.");

const newReminders = KB_DB.getReminders('usr_kamla');
const scheduledReminders = newReminders.filter(r => r.status === 'scheduled');
assert(scheduledReminders.length === 3, "Should have 2 med reminders and 1 follow-up reminder scheduled.");
console.log("✅ Test 3 Passed: Consultation saved, medications assigned, and reminders scheduled.");

// Test 4: Missed medication triggers High-Risk Alert
const medReminder = newReminders.find(r => r.type === 'medication');
assert(medReminder !== undefined, "Medication reminder should exist.");

// Simulate missing medication twice
KB_DB.updateReminderStatus(medReminder.id, 'missed');
// Inject a second missed dose
const secondReminder = newReminders.filter(r => r.type === 'medication')[1];
if (secondReminder) {
  KB_DB.updateReminderStatus(secondReminder.id, 'missed');
}

const activeAlerts = KB_DB.getAlerts();
assert(activeAlerts.length > 0, "High-Risk Alert should trigger when medications are missed.");
assert(activeAlerts[0].severity === 'high', "Alert severity should be high.");

const alertedPatient = KB_DB.getPatient('usr_kamla');
assert(alertedPatient.riskLevel === 'high', "Patient risk level should elevate to high.");
console.log("✅ Test 4 Passed: Missed doses successfully triggered a High-Risk Alert.");

// Test 5: Asha Worker resolves alert
const alertId = activeAlerts[0].id;
KB_DB.resolveAlert(alertId, 'usr_suresh', 'Visited home, vitals check BP: 130/85, medication given.');

const resolvedAlerts = KB_DB.getAlerts();
assert(resolvedAlerts.length === 0, "No active alerts should remain.");

const finalPatient = KB_DB.getPatient('usr_kamla');
assert(finalPatient.riskLevel === 'low', "Patient risk level should reset to low after alert resolution.");
console.log("✅ Test 5 Passed: Community worker check-in resolved the alert and restored patient status.");

console.log("--------------------------------------------------");
console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
console.log("--------------------------------------------------");
