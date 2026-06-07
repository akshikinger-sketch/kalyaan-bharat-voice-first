/**
 * Kalyaan Bharat - In-Memory Database & Persistence Layer
 * Persists data to localStorage to enable full continuity in browser-ready MVP.
 */

const DB_KEY = 'kalyaan_bharat_db_v1';

// Initial Mock Data
const initialData = {
  users: [
    { id: 'usr_kamla', mobileNumber: '9876543210', role: 'patient', preferredLanguage: 'hi', consentStatus: true, createdAt: new Date() },
    { id: 'usr_ramesh', mobileNumber: '9876543211', role: 'caregiver', preferredLanguage: 'en', consentStatus: true, createdAt: new Date() },
    { id: 'usr_priya', mobileNumber: '9876543212', role: 'caregiver', preferredLanguage: 'hi', consentStatus: true, createdAt: new Date() },
    { id: 'usr_anjali', mobileNumber: '9988776655', role: 'doctor', preferredLanguage: 'en', consentStatus: true, createdAt: new Date() },
    { id: 'usr_suresh', mobileNumber: '8877665544', role: 'worker', preferredLanguage: 'hi', consentStatus: true, createdAt: new Date() },
    { id: 'usr_ngo_mgr', mobileNumber: '7766554433', role: 'ngo', preferredLanguage: 'en', consentStatus: true, createdAt: new Date() },
    { id: 'usr_admin', mobileNumber: '1122334455', role: 'admin', preferredLanguage: 'en', consentStatus: true, createdAt: new Date() }
  ],
  patients: [
    {
      id: 'usr_kamla',
      name: 'Kamla Bai',
      age: 68,
      gender: 'Female',
      village: 'Sonepat',
      district: 'Rohtak',
      state: 'Haryana',
      mobileNumber: '9876543210',
      emergencyContact: '9876543211',
      assignedDoctorId: 'usr_anjali',
      assignedNgoId: 'ngo_seva',
      riskLevel: 'low',
      healthConditions: ['Hypertension', 'Mild Osteoarthritis'],
      medications: [
        { id: 'med_1', name: 'Amlodipine 5mg', instructions: 'Once daily after breakfast', scheduleTime: '08:00 AM', condition: 'Hypertension' },
        { id: 'med_2', name: 'Calcium + Vitamin D', instructions: 'Once daily after lunch', scheduleTime: '02:00 PM', condition: 'Bone Health' }
      ],
      caregiverIds: ['usr_ramesh', 'usr_priya']
    }
  ],
  caregivers: [
    { id: 'usr_ramesh', name: 'Ramesh Kumar', mobileNumber: '9876543211', relationship: 'Son', patientIds: ['usr_kamla'] },
    { id: 'usr_priya', name: 'Priya Devi', mobileNumber: '9876543212', relationship: 'Daughter-in-law', patientIds: ['usr_kamla'] }
  ],
  doctors: [
    { id: 'usr_anjali', name: 'Dr. Anjali Sharma', specialty: 'General Physician', hospital: 'Seva Community Health Center', mobileNumber: '9988776655', patientIds: ['usr_kamla'] }
  ],
  ngos: [
    { id: 'ngo_seva', name: 'Seva Elder Care Foundation', region: 'Haryana', programs: ['Elder Care & Chronic Pain Management', 'Rural Maternal Health'] }
  ],
  workers: [
    { id: 'usr_suresh', name: 'Suresh Kumar', village: 'Sonepat', ngoId: 'ngo_seva', patientIds: ['usr_kamla'] }
  ],
  voiceInteractions: [
    {
      id: 'voice_1',
      patientId: 'usr_kamla',
      audioUrl: '#',
      transcript: 'नमस्ते बहनजी, पिछले दो दिनों से मेरे घुटनों में बहुत तेज़ दर्द है। दवा खाने पर भी आराम नहीं मिल रहा और चलने में तकलीफ हो रही है।',
      language: 'Hindi',
      timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      aiSummary: 'Patient reports severe knee pain for the past 2 days, unresponsive to standard analgesics, causing limited mobility.'
    }
  ],
  consultations: [
    {
      id: 'cons_1',
      patientId: 'usr_kamla',
      doctorId: 'usr_anjali',
      date: new Date(Date.now() - 86400000 * 10), // 10 days ago
      notes: 'Initial checkup. Patient complained of mild knee pain and high blood pressure. Prescribed Amlodipine. Advised low salt diet.',
      medications: [
        { name: 'Amlodipine 5mg', instructions: 'Once daily after breakfast', scheduleTime: '08:00 AM' }
      ],
      carePlan: { title: 'Hypertension Management', activities: ['Daily morning vitals walk', 'Low sodium food'] },
      followUpDate: new Date(Date.now() - 86400000 * 3),
      aiSummary: 'Hypertension diagnostic review. Medications: Amlodipine 5mg. Dietary guidelines issued.'
    }
  ],
  reminders: [
    { id: 'rem_1', patientId: 'usr_kamla', type: 'medication', title: 'Take Amlodipine 5mg', time: '08:00 AM', status: 'completed', timestamp: new Date(new Date().setHours(8, 0, 0)) },
    { id: 'rem_2', patientId: 'usr_kamla', type: 'medication', title: 'Take Calcium + Vitamin D', time: '02:00 PM', status: 'completed', timestamp: new Date(new Date().setHours(14, 0, 0)) }
  ],
  alerts: []
};

// Database state accessor
let dbState = null;

// Listeners for reactive updates
const listeners = [];

function loadDB() {
  if (dbState) return dbState;

  const dataStr = localStorage.getItem(DB_KEY);
  if (dataStr) {
    try {
      dbState = JSON.parse(dataStr);
      // Re-convert date strings back to Date objects
      dbState.users.forEach(u => u.createdAt = new Date(u.createdAt));
      dbState.voiceInteractions.forEach(v => v.timestamp = new Date(v.timestamp));
      dbState.consultations.forEach(c => {
        c.date = new Date(c.date);
        c.followUpDate = new Date(c.followUpDate);
      });
      dbState.reminders.forEach(r => r.timestamp = new Date(r.timestamp));
      dbState.alerts.forEach(a => a.timestamp = new Date(a.timestamp));
    } catch (e) {
      console.error("Error parsing DB, resetting to defaults", e);
      dbState = JSON.parse(JSON.stringify(initialData));
      saveDB();
    }
  } else {
    dbState = JSON.parse(JSON.stringify(initialData));
    saveDB();
  }
  return dbState;
}

function saveDB() {
  localStorage.setItem(DB_KEY, JSON.stringify(dbState));
  // Notify all reactive listeners
  listeners.forEach(cb => cb(dbState));
}

// Global DB actions
window.KB_DB = {
  // Subscribe to changes
  subscribe(callback) {
    listeners.push(callback);
    callback(loadDB()); // Initial trigger
    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },

  reset() {
    dbState = JSON.parse(JSON.stringify(initialData));
    // Re-convert date strings back to Date objects on reset
    dbState.users.forEach(u => u.createdAt = new Date(u.createdAt));
    dbState.voiceInteractions.forEach(v => v.timestamp = new Date(v.timestamp));
    dbState.consultations.forEach(c => {
      c.date = new Date(c.date);
      c.followUpDate = new Date(c.followUpDate);
    });
    dbState.reminders.forEach(r => r.timestamp = new Date(r.timestamp));
    dbState.alerts.forEach(a => a.timestamp = new Date(a.timestamp));
    saveDB();
  },

  getState() {
    return loadDB();
  },

  // Users & Auth
  getUserByMobile(mobileNumber) {
    const db = loadDB();
    return db.users.find(u => u.mobileNumber === mobileNumber) || null;
  },

  createUser(mobileNumber, role, lang) {
    const db = loadDB();
    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      mobileNumber,
      role,
      preferredLanguage: lang || 'en',
      consentStatus: true,
      createdAt: new Date()
    };
    db.users.push(newUser);
    
    // Create corresponding profile
    if (role === 'patient') {
      db.patients.push({
        id: newUser.id,
        name: 'New Patient',
        age: 60,
        gender: 'Other',
        village: '',
        district: '',
        state: '',
        mobileNumber,
        emergencyContact: '',
        assignedDoctorId: 'usr_anjali',
        assignedNgoId: 'ngo_seva',
        riskLevel: 'low',
        healthConditions: [],
        medications: [],
        caregiverIds: []
      });
    } else if (role === 'caregiver') {
      db.caregivers.push({
        id: newUser.id,
        name: 'New Caregiver',
        mobileNumber,
        relationship: '',
        patientIds: []
      });
    }

    saveDB();
    return newUser;
  },

  updateUserProfile(userId, updates) {
    const db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (user) {
      Object.assign(user, updates);
    }
    
    // Also update patient/caregiver profiles
    const patient = db.patients.find(p => p.id === userId);
    if (patient) {
      if (updates.name) patient.name = updates.name;
      if (updates.age) patient.age = parseInt(updates.age);
      if (updates.gender) patient.gender = updates.gender;
      if (updates.preferredLanguage) patient.preferredLanguage = updates.preferredLanguage;
    }

    const caregiver = db.caregivers.find(c => c.id === userId);
    if (caregiver) {
      if (updates.name) caregiver.name = updates.name;
    }
    
    saveDB();
  },

  // Patients
  getPatient(id) {
    return loadDB().patients.find(p => p.id === id) || null;
  },

  getPatients() {
    return loadDB().patients;
  },

  updatePatient(id, updates) {
    const db = loadDB();
    const patient = db.patients.find(p => p.id === id);
    if (patient) {
      Object.assign(patient, updates);
      saveDB();
    }
  },

  // Caregivers
  getCaregiver(id) {
    return loadDB().caregivers.find(c => c.id === id) || null;
  },

  // Doctor
  getDoctor(id) {
    return loadDB().doctors.find(d => d.id === id) || null;
  },

  getDoctors() {
    return loadDB().doctors;
  },

  // Voice Interaction
  getVoiceInteractions(patientId) {
    const db = loadDB();
    return db.voiceInteractions
      .filter(v => v.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  addVoiceInteraction(patientId, transcript, lang, aiSummary) {
    const db = loadDB();
    const newInteraction = {
      id: 'voice_' + Math.random().toString(36).substring(2, 9),
      patientId,
      audioUrl: '#',
      transcript,
      language: lang,
      timestamp: new Date(),
      aiSummary: aiSummary || 'Processing summary...'
    };
    db.voiceInteractions.push(newInteraction);
    saveDB();
    return newInteraction;
  },

  // Consultations
  getConsultations(patientId) {
    const db = loadDB();
    return db.consultations
      .filter(c => c.patientId === patientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  addConsultation(patientId, doctorId, notes, medications, carePlan, followUpDays) {
    const db = loadDB();
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + parseInt(followUpDays || 5));

    const newCons = {
      id: 'cons_' + Math.random().toString(36).substring(2, 9),
      patientId,
      doctorId,
      date: new Date(),
      notes,
      medications,
      carePlan,
      followUpDate,
      aiSummary: 'AI generated consultation summary. Advised follow-up on ' + followUpDate.toDateString() + '. Plan updated.'
    };
    db.consultations.push(newCons);

    // Update patient medications and risk level
    const patient = db.patients.find(p => p.id === patientId);
    if (patient) {
      patient.medications = medications.map((med, idx) => ({
        id: 'med_' + Math.random().toString(36).substring(2, 9),
        name: med.name,
        instructions: med.instructions,
        scheduleTime: med.scheduleTime,
        condition: med.condition || 'General'
      }));
      patient.riskLevel = 'low'; // Resets on active medical advice
    }

    // Schedule reminders based on new care plan
    db.reminders = db.reminders.filter(r => r.patientId !== patientId || r.status === 'completed'); // clear future
    medications.forEach(med => {
      // Add scheduled reminders for today/tomorrow
      db.reminders.push({
        id: 'rem_' + Math.random().toString(36).substring(2, 9),
        patientId,
        type: 'medication',
        title: 'Take ' + med.name,
        time: med.scheduleTime,
        status: 'scheduled',
        timestamp: new Date(new Date().setHours(parseInt(med.scheduleTime), 0, 0))
      });
    });

    // Add consultation follow-up reminder
    db.reminders.push({
      id: 'rem_' + Math.random().toString(36).substring(2, 9),
      patientId,
      type: 'doctor_follow_up',
      title: 'Follow-up consultation with doctor',
      time: '11:00 AM',
      status: 'scheduled',
      timestamp: followUpDate
    });

    saveDB();
    return newCons;
  },

  // Reminders
  getReminders(patientId) {
    return loadDB().reminders.filter(r => r.patientId === patientId);
  },

  updateReminderStatus(reminderId, status) {
    const db = loadDB();
    const reminder = db.reminders.find(r => r.id === reminderId);
    if (reminder) {
      reminder.status = status;
      
      // If missed multiple times, trigger a high-risk alert
      if (status === 'missed') {
        const patientReminders = db.reminders.filter(r => r.patientId === reminder.patientId && r.type === 'medication');
        const missedCount = patientReminders.filter(r => r.status === 'missed').length;
        if (missedCount >= 2) {
          this.triggerAlert(reminder.patientId, 'high', 'Missed consecutive medications: ' + reminder.title);
        }
      }

      saveDB();
    }
  },

  // Alerts Center
  getAlerts(status = 'active') {
    const db = loadDB();
    return db.alerts.filter(a => a.status === status);
  },

  triggerAlert(patientId, severity, reason) {
    const db = loadDB();
    
    // Check if duplicate active alert exists
    const duplicate = db.alerts.find(a => a.patientId === patientId && a.reason === reason && a.status === 'active');
    if (duplicate) return duplicate;

    const newAlert = {
      id: 'alert_' + Math.random().toString(36).substring(2, 9),
      patientId,
      severity, // 'low' | 'medium' | 'high' | 'critical'
      reason,
      status: 'active',
      timestamp: new Date(),
      resolvedBy: null,
      resolutionNotes: ''
    };
    db.alerts.push(newAlert);

    // Update patient risk profile
    const patient = db.patients.find(p => p.id === patientId);
    if (patient) {
      patient.riskLevel = severity;
    }

    saveDB();
    return newAlert;
  },

  resolveAlert(alertId, userId, notes) {
    const db = loadDB();
    const alert = db.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedBy = userId;
      alert.resolutionNotes = notes;
      
      // Update patient risk level based on remaining active alerts
      const patient = db.patients.find(p => p.id === alert.patientId);
      if (patient) {
        const remainingAlerts = db.alerts.filter(a => a.patientId === alert.patientId && a.status === 'active');
        if (remainingAlerts.length === 0) {
          patient.riskLevel = 'low';
        } else {
          // set to highest remaining alert severity
          const severities = { low: 1, medium: 2, high: 3, critical: 4 };
          let maxSev = 'low';
          remainingAlerts.forEach(a => {
            if (severities[a.severity] > severities[maxSev]) {
              maxSev = a.severity;
            }
          });
          patient.riskLevel = maxSev;
        }
      }
      saveDB();
    }
  }
};
