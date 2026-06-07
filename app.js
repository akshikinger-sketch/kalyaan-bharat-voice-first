/**
 * Kalyaan Bharat - App Controller & Routing Engine
 */

// Global App State
const state = {
  currentView: 'welcome',
  currentUser: null, // set during login
  selectedLanguage: 'hi', // default to Hindi
  otpMobile: '',
  otpInputValues: ['', '', '', ''],
  simulatedVoiceState: 'idle', // 'idle' | 'listening' | 'processing' | 'done'
  selectedVoiceLanguage: 'hi',
  walkthroughStep: 0,
  walkthroughActive: true
};

// Mappings for simulated speech interactions
const voiceSimulations = {
  hi: {
    phrase: "नमस्ते बहनजी, पिछले दो दिनों से मेरे घुटनों में बहुत तेज़ दर्द है। दवा खाने पर भी आराम नहीं मिल रहा और चलने में तकलीफ हो रही है।",
    translation: "Namaste behnji, pichle do dino se mere ghutno mein bahut tez dard hai...",
    aiSummary: "Patient reports severe bilateral knee pain for 2 days, unresponsive to standard analgesics, causing limited mobility.",
    languageName: "Hindi"
  },
  en: {
    phrase: "Hello doctor, I have been feeling very dizzy since yesterday evening and my chest feels slightly tight.",
    translation: "Hello doctor, I have been feeling very dizzy...",
    aiSummary: "Patient reports sudden onset of dizziness and mild chest tightness starting yesterday evening.",
    languageName: "English"
  },
  mr: {
    phrase: "नमस्कार डॉक्टर, माझ्या पायाला सूज आली आहे आणि मला ताप आल्यासारखं वाटतंय.",
    translation: "Namaskar doctor, mazya payala sooj aali aahe...",
    aiSummary: "Patient reports leg swelling accompanied by subjective feverishness.",
    languageName: "Marathi"
  },
  ta: {
    phrase: "வணக்கம் டாக்டர், எனக்கு இரண்டு நாட்களாக கடுமையான தலைவலி மற்றும் காய்ச்சல் உள்ளது.",
    translation: "Vanakkam doctor, enakku irandu naatkalaaga...",
    aiSummary: "Patient reports severe headache and fever persisting for 2 days.",
    languageName: "Tamil"
  },
  bn: {
    phrase: "নমস্কার ডাক্তারবাবু, আমার পেটে খুব যন্ত্রণা হচ্ছে এবং সকাল থেকে বমি বমি ভাব আছে।",
    translation: "Nomoshkar doctorbabu, amar pete khub jontrona hochhe...",
    aiSummary: "Patient reports acute abdominal pain and persistent morning nausea.",
    languageName: "Bengali"
  }
};

// Router Function
function navigateTo(viewId, params = {}) {
  state.currentView = viewId;
  state.viewParams = params;
  
  // Hide all view containers
  document.querySelectorAll('.app-view').forEach(el => {
    el.classList.add('hidden');
    el.style.opacity = '0';
  });
  
  // Show target container
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.remove('hidden');
    setTimeout(() => {
      target.style.opacity = '1';
    }, 50);
  }
  
  // Run custom render function if it exists
  const renderFuncName = `render_${viewId}`;
  if (typeof window[renderFuncName] === 'function') {
    window[renderFuncName](params);
  }
  
  // Update nav bar highlight
  updateNavbarHighlight();
  
  // Scroll to top
  window.scrollTo(0, 0);

  // Sync role selector in demo controller
  const roleSelect = document.getElementById('demo-role-select');
  if (roleSelect && state.currentUser) {
    roleSelect.value = state.currentUser.role;
  }
}

// Update active states on bottom nav
function updateNavbarHighlight() {
  const bottomNav = document.getElementById('bottom-nav-bar');
  if (!bottomNav) return;

  // Show bottom nav ONLY for main dashboard/action portals, hide for login/onboarding
  const onboardingViews = ['welcome', 'login', 'consent', 'profile_setup'];
  if (onboardingViews.includes(state.currentView)) {
    bottomNav.classList.add('hidden');
    return;
  }
  bottomNav.classList.remove('hidden');

  const navLinks = bottomNav.querySelectorAll('a');
  navLinks.forEach(link => {
    const action = link.getAttribute('data-view');
    // Simple check: active role determines patient menu behavior
    if (state.currentUser && state.currentUser.role === 'patient') {
      const isHome = state.currentView === 'patient_home' && action === 'home';
      const isReminders = state.currentView === 'patient_reminders' && action === 'reminders';
      const isRecords = state.currentView === 'patient_records' && action === 'records';
      const isProfile = state.currentView === 'patient_profile' && action === 'profile';

      if (isHome || isReminders || isRecords || isProfile) {
        link.className = "flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-xl px-5 py-1.5 active:scale-95 duration-200 cursor-pointer";
        link.querySelector('.material-symbols-outlined').style.fontVariationSettings = "'FILL' 1";
      } else {
        link.className = "flex flex-col items-center justify-center text-on-surface-variant p-2 opacity-75 hover:bg-surface-variant/40 rounded-xl transition-all cursor-pointer";
        link.querySelector('.material-symbols-outlined').style.fontVariationSettings = "'FILL' 0";
      }
    } else {
      // Non-patient dashboards are typically single page or bento, nav bar maps home
      if (action === 'home') {
        link.className = "flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-xl px-5 py-1.5 active:scale-95 duration-200 cursor-pointer";
      } else {
        link.className = "flex flex-col items-center justify-center text-on-surface-variant p-2 opacity-50 cursor-not-allowed";
      }
    }
  });
}

// Onboarding: Welcome Render
window.render_welcome = function() {
  // Clear OTP values
  state.otpInputValues = ['', '', '', ''];
  state.otpMobile = '';
};

// Onboarding: Login Render
window.render_login = function() {
  const container = document.getElementById('login');
  if (!container) return;

  const errorDiv = document.getElementById('otp-error');
  if (errorDiv) errorDiv.classList.add('hidden');

  // Register OTP box input listeners
  const inputs = container.querySelectorAll('.otp-input');
  inputs.forEach((input, index) => {
    input.value = '';
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
      state.otpInputValues[index] = e.target.value;
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
        state.otpInputValues[index] = '';
      }
    });
  });
};

// Perform OTP Verification
function verifyOtpLogin() {
  const container = document.getElementById('login');
  const mobileInput = container.querySelector('input[type="number"]');
  const mobile = mobileInput ? mobileInput.value : '';
  const otp = state.otpInputValues.join('');
  const errorDiv = document.getElementById('otp-error');

  if (!mobile || mobile.length < 10) {
    if (errorDiv) {
      errorDiv.classList.remove('hidden');
      errorDiv.querySelector('span:last-child').innerText = "Please enter a valid 10-digit mobile number.";
    }
    return;
  }

  // Demo shortcut: if OTP is wrong initially (simulation)
  if (otp !== '1234' && otp !== '') {
    if (errorDiv) {
      errorDiv.classList.remove('hidden');
      errorDiv.querySelector('span:last-child').innerText = "Invalid OTP. Please use '1234' for testing.";
    }
    return;
  }

  // Load existing or create new
  let user = window.KB_DB.getUserByMobile(mobile);
  if (!user) {
    // If new user, register as patient by default for the demo flow, or matching user input
    user = window.KB_DB.createUser(mobile, 'patient', state.selectedLanguage);
  }
  
  state.currentUser = user;
  
  // Proceed to Consent screen
  navigateTo('consent');
}

// Onboarding: Consent Screen Render
window.render_consent = function() {
  const consentText = document.getElementById('consent-text');
  if (consentText) {
    if (state.selectedLanguage === 'hi') {
      consentText.innerText = '"हम आपकी स्वास्थ्य जानकारी भविष्य की देखभाल के लिए सुरक्षित रखते हैं। यह डेटा केवल आप और आपके डॉक्टर ही देख सकते हैं।"';
    } else if (state.selectedLanguage === 'mr') {
      consentText.innerText = '"आम्ही तुमची आरोग्य माहिती भविष्यातील उपचारांसाठी सुरक्षित ठेवतो. हा डेटा फक्त तुम्ही आणि तुमचे डॉक्टरच पाहू शकतात."';
    } else {
      consentText.innerText = '"We store your health information to support future care. Only you and your doctor can see this data."';
    }
  }
};

// Play audios helper for consent
function playConsentVoice() {
  const btn = document.getElementById('consent-listen-btn');
  if (!btn) return;
  const original = btn.innerHTML;
  btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Speaking...';
  btn.classList.add('bg-secondary', 'text-white');

  // Simple simulated voice output via Web Speech API if supported, or fallback
  const speechText = document.getElementById('consent-text').innerText;
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = state.selectedLanguage === 'hi' ? 'hi-IN' : (state.selectedLanguage === 'mr' ? 'mr-IN' : 'en-IN');
    utterance.rate = 0.9;
    utterance.onend = () => {
      btn.innerHTML = original;
      btn.classList.remove('bg-secondary', 'text-white');
    };
    window.speechSynthesis.speak(utterance);
  } else {
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('bg-secondary', 'text-white');
    }, 2500);
  }
}

// Onboarding: Consent Accepted
function acceptConsent() {
  if (state.currentUser) {
    window.KB_DB.updateUserProfile(state.currentUser.id, { consentStatus: true });
  }
  navigateTo('profile_setup');
}

// Onboarding: Profile Setup Render
window.render_profile_setup = function() {
  if (!state.currentUser) return;
  
  // Populate form with existing data if patient
  const patient = window.KB_DB.getPatient(state.currentUser.id);
  if (patient) {
    document.getElementById('full_name').value = patient.name === 'New Patient' ? '' : patient.name;
    document.getElementById('age').value = patient.age || '';
    
    // Set active gender segment
    const genderVal = patient.gender || 'Female';
    const container = document.querySelector('.gender-segment-container');
    if (container) {
      container.querySelectorAll('button').forEach(btn => {
        if (btn.innerText === genderVal) {
          btn.className = "flex-1 h-touch-target-min rounded-lg flex items-center justify-center font-label-lg text-label-lg bg-primary text-on-primary transition-all shadow-sm";
        } else {
          btn.className = "flex-1 h-touch-target-min rounded-lg flex items-center justify-center font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-variant transition-all";
        }
      });
    }
  }

  // Render language card
  const langText = document.getElementById('profile-lang-text');
  if (langText) {
    const langNames = { hi: 'Hindi (हिंदी)', mr: 'Marathi (मराठी)', en: 'English' };
    langText.innerText = langNames[state.selectedLanguage] || 'Hindi';
  }
};

// Handle gender select
function selectProfileGender(btn) {
  const container = btn.parentElement;
  container.querySelectorAll('button').forEach(child => {
    child.className = "flex-1 h-touch-target-min rounded-lg flex items-center justify-center font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-variant transition-all";
  });
  btn.className = "flex-1 h-touch-target-min rounded-lg flex items-center justify-center font-label-lg text-label-lg bg-primary text-on-primary transition-all shadow-sm";
}

// Complete onboarding
function completeProfileSetup() {
  const name = document.getElementById('full_name').value || 'Kamla Bai';
  const age = document.getElementById('age').value || 68;
  
  // Find active gender
  let gender = 'Female';
  const activeGenderBtn = document.querySelector('.gender-segment-container button.bg-primary');
  if (activeGenderBtn) gender = activeGenderBtn.innerText;

  if (state.currentUser) {
    window.KB_DB.updateUserProfile(state.currentUser.id, {
      name,
      age: parseInt(age),
      gender,
      preferredLanguage: state.selectedLanguage
    });
  }

  // Redirect to correct dashboard based on role
  routeToDashboard();
}

function routeToDashboard() {
  if (!state.currentUser) {
    navigateTo('welcome');
    return;
  }

  const role = state.currentUser.role;
  if (role === 'patient') {
    navigateTo('patient_home');
  } else if (role === 'caregiver') {
    navigateTo('caregiver_home');
  } else if (role === 'doctor') {
    navigateTo('doctor_dashboard');
  } else if (role === 'ngo') {
    navigateTo('ngo_home');
  } else if (role === 'worker') {
    navigateTo('worker_home');
  } else if (role === 'admin') {
    navigateTo('admin_reporting');
  }
}

// ==========================================
// PATIENT PORTAL
// ==========================================

window.render_patient_home = function() {
  if (!state.currentUser) return;
  const patient = window.KB_DB.getPatient(state.currentUser.id);
  if (!patient) return;

  // Set greeting name
  const greeting = document.getElementById('patient-greeting');
  if (greeting) {
    greeting.innerText = state.selectedLanguage === 'hi' ? `नमस्ते, ${patient.name} जी` : `Namaste, ${patient.name}`;
  }

  // Set next medicine card
  const medSection = document.getElementById('patient-next-med-section');
  if (medSection) {
    const upcoming = window.KB_DB.getReminders(patient.id).find(r => r.status === 'scheduled');
    if (upcoming) {
      medSection.innerHTML = `
        <div class="bg-surface-container-lowest border-l-8 border-primary rounded-xl p-6 shadow-sm">
          <h3 class="font-label-lg text-label-lg text-primary uppercase">${state.selectedLanguage === 'hi' ? 'अगली दवाई' : 'Next Medicine'}</h3>
          <p class="font-headline-md text-headline-md mt-1">${upcoming.title.replace('Take ', '')}</p>
          <div class="mt-4 flex items-center gap-4">
            <div class="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg flex items-center gap-2">
              <span class="material-symbols-outlined">schedule</span>
              <span class="font-headline-md">${upcoming.time}</span>
            </div>
            <button class="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-lg" onclick="takeReminderNow('${upcoming.id}')">
              ${state.selectedLanguage === 'hi' ? 'ले ली' : 'Mark Taken'}
            </button>
          </div>
        </div>
      `;
    } else {
      medSection.innerHTML = `
        <div class="bg-surface-container-lowest border-l-8 border-tertiary rounded-xl p-6 shadow-sm text-center">
          <span class="material-symbols-outlined text-tertiary text-4xl mb-2">check_circle</span>
          <p class="font-headline-md">${state.selectedLanguage === 'hi' ? 'आज की सभी दवाइयाँ ले ली हैं!' : 'All medicines taken for today!'}</p>
        </div>
      `;
    }
  }

  // Alert Banner if Missed
  const alertSection = document.getElementById('patient-alert-section');
  if (alertSection) {
    const missed = window.KB_DB.getReminders(patient.id).find(r => r.status === 'missed');
    if (missed) {
      alertSection.innerHTML = `
        <div class="bg-surface border-l-8 border-secondary rounded-xl p-5 shadow-md flex items-center gap-4 cursor-pointer" onclick="navigateTo('patient_reminders')">
          <div class="bg-secondary-fixed p-3 rounded-full">
            <span class="material-symbols-outlined text-on-secondary-container">report_problem</span>
          </div>
          <div class="flex-1">
            <h3 class="font-label-lg text-label-lg text-secondary">${state.selectedLanguage === 'hi' ? 'दवाई छूट गई है' : 'Missed Medicine'}</h3>
            <p class="font-body-md text-body-md">${missed.title} - ${missed.time}</p>
          </div>
          <span class="material-symbols-outlined text-outline">chevron_right</span>
        </div>
      `;
      alertSection.classList.remove('hidden');
    } else {
      alertSection.classList.add('hidden');
    }
  }
};

// Take medication directly
function takeReminderNow(id) {
  window.KB_DB.updateReminderStatus(id, 'completed');
  routeToDashboard();
}

// Patient: Reminders Screen (Yad-dihani)
window.render_patient_reminders = function() {
  if (!state.currentUser) return;
  const list = document.getElementById('patient-reminders-list');
  if (!list) return;

  const reminders = window.KB_DB.getReminders(state.currentUser.id);
  if (reminders.length === 0) {
    list.innerHTML = `<p class="text-center py-10 text-on-surface-variant">No reminders scheduled for today.</p>`;
    return;
  }

  list.innerHTML = reminders.map(r => {
    let icon = 'pill';
    let colorClass = 'text-primary bg-primary-container';
    let statusLabel = 'Scheduled';
    let statusColor = 'text-on-surface-variant';
    let actions = `<button class="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold active:scale-95" onclick="changeReminderState('${r.id}', 'completed')">Take</button>`;

    if (r.type === 'doctor_follow_up') {
      icon = 'medical_services';
      colorClass = 'text-tertiary bg-tertiary-container';
    }

    if (r.status === 'completed') {
      statusLabel = 'Completed';
      statusColor = 'text-tertiary font-bold';
      actions = `<span class="material-symbols-outlined text-tertiary">check_circle</span>`;
    } else if (r.status === 'missed') {
      statusLabel = 'Missed';
      statusColor = 'text-error font-bold';
      actions = `
        <div class="flex gap-2">
          <button class="px-3 py-1 bg-primary text-on-primary rounded-lg text-xs" onclick="changeReminderState('${r.id}', 'completed')">Take Now</button>
          <button class="px-3 py-1 bg-outline-variant text-on-surface-variant rounded-lg text-xs" onclick="changeReminderState('${r.id}', 'scheduled')">Reset</button>
        </div>
      `;
    }

    return `
      <div class="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-xl ${colorClass}">
            <span class="material-symbols-outlined">${icon}</span>
          </div>
          <div>
            <h4 class="font-headline-md text-headline-md leading-tight">${r.title}</h4>
            <p class="text-sm text-on-surface-variant mt-1">Time: ${r.time} • <span class="${statusColor}">${statusLabel}</span></p>
          </div>
        </div>
        <div>${actions}</div>
      </div>
    `;
  }).join('');
};

function changeReminderState(id, status) {
  window.KB_DB.updateReminderStatus(id, status);
  window.render_patient_reminders();
}

// Patient: Records Screen (Swasthya Record)
window.render_patient_records = function() {
  if (!state.currentUser) return;
  const container = document.getElementById('patient-records-list');
  if (!container) return;

  const consultations = window.KB_DB.getConsultations(state.currentUser.id);
  if (consultations.length === 0) {
    container.innerHTML = `<p class="text-center py-10">No consultations logged yet.</p>`;
    return;
  }

  container.innerHTML = consultations.map(c => {
    const doc = window.KB_DB.getDoctor(c.doctorId);
    return `
      <div class="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm space-y-4">
        <div class="flex justify-between items-start border-b border-outline-variant/30 pb-3">
          <div>
            <h3 class="font-headline-md text-primary">${doc ? doc.name : 'Doctor'}</h3>
            <p class="text-xs text-on-surface-variant">${doc ? doc.specialty : ''} • ${doc ? doc.hospital : ''}</p>
          </div>
          <span class="bg-primary-container text-on-primary-container text-xs px-3 py-1.5 rounded-full font-bold">
            ${c.date.toLocaleDateString()}
          </span>
        </div>
        <div>
          <h4 class="font-label-lg text-primary uppercase text-xs">AI Consultation Summary</h4>
          <p class="text-body-md mt-1 font-medium">${c.aiSummary || c.notes}</p>
        </div>
        <div>
          <h4 class="font-label-lg text-primary uppercase text-xs">Prescribed Care Plan</h4>
          <ul class="list-disc pl-5 mt-1 text-on-surface-variant space-y-1">
            ${c.medications.map(m => `<li><strong>${m.name}</strong> - ${m.instructions} (Schedule: ${m.scheduleTime})</li>`).join('')}
          </ul>
        </div>
        <div class="bg-surface-container-low p-4 rounded-xl flex items-center justify-between text-sm">
          <span>Next Follow-up: <strong>${c.followUpDate.toLocaleDateString()}</strong></span>
          <button class="text-primary font-bold text-xs" onclick="navigateTo('consultation_summary', { consId: '${c.id}' })">VIEW FULL NOTE</button>
        </div>
      </div>
    `;
  }).join('');
};

// Patient: Voice interaction overlay
function startPatientVoiceRecord() {
  const overlay = document.getElementById('voice-record-overlay');
  if (!overlay) return;

  state.simulatedVoiceState = 'listening';
  overlay.classList.remove('hidden');

  // Trigger reactive layout update
  updateVoiceOverlayUI();
}

function updateVoiceOverlayUI() {
  const overlay = document.getElementById('voice-record-overlay');
  if (!overlay) return;

  const title = overlay.querySelector('#voice-overlay-title');
  const text = overlay.querySelector('#voice-overlay-text');
  const btn = overlay.querySelector('#voice-overlay-action-btn');
  const ripple = overlay.querySelector('.voice-pulse');

  const phraseData = voiceSimulations[state.selectedVoiceLanguage];

  if (state.simulatedVoiceState === 'listening') {
    title.innerText = "Listening...";
    title.className = "font-headline-lg-mobile text-secondary font-bold";
    text.innerText = `"..."`;
    ripple.classList.add('voice-pulse');
    btn.innerHTML = 'Stop Recording';
    btn.className = "w-full bg-error text-on-error font-label-lg py-4 rounded-xl shadow-lg";
    btn.onclick = () => {
      state.simulatedVoiceState = 'processing';
      updateVoiceOverlayUI();
    };

    // Simulate speech transcription starting after 1.5s
    setTimeout(() => {
      if (state.simulatedVoiceState === 'listening') {
        text.innerText = `"${phraseData.phrase}"`;
      }
    }, 1500);
  } else if (state.simulatedVoiceState === 'processing') {
    title.innerText = "Processing Speech...";
    title.className = "font-headline-lg-mobile text-primary font-bold animate-pulse";
    text.innerText = `"${phraseData.phrase}"`;
    ripple.classList.remove('voice-pulse');
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin mr-2">progress_activity</span> Generating AI Summary...';
    btn.className = "w-full bg-primary-container text-on-primary-container font-label-lg py-4 rounded-xl shadow-lg flex items-center justify-center";
    btn.onclick = null;

    // Simulate completion after 2s
    setTimeout(() => {
      state.simulatedVoiceState = 'done';
      updateVoiceOverlayUI();
    }, 2000);
  } else if (state.simulatedVoiceState === 'done') {
    title.innerText = "Interaction Saved!";
    title.className = "font-headline-lg-mobile text-tertiary font-bold";
    
    // Save to DB
    const saved = window.KB_DB.addVoiceInteraction(
      state.currentUser.id,
      phraseData.phrase,
      phraseData.languageName,
      phraseData.aiSummary
    );

    // Trigger high-risk alert if patient complains about severe walking issue (Hindi pathway in demo)
    if (state.selectedVoiceLanguage === 'hi') {
      window.KB_DB.triggerAlert(state.currentUser.id, 'high', 'Reported severe osteoarthritis pain via voice: "घुटनों में बहुत तेज़ दर्द है और चल नहीं पा रही हूँ"');
    }

    text.innerHTML = `
      <div class="space-y-3 text-left">
        <p class="text-xs uppercase text-outline font-bold">Speech Transcript (${phraseData.languageName})</p>
        <p class="italic font-voice-caption text-on-surface">"${phraseData.phrase}"</p>
        <div class="border-t border-outline-variant/50 my-2 pt-2">
          <p class="text-xs uppercase text-primary font-bold flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">auto_awesome</span> AI Clinical Summary</p>
          <p class="text-sm font-medium text-on-surface-variant">${phraseData.aiSummary}</p>
        </div>
      </div>
    `;
    
    btn.innerHTML = 'Done & View History';
    btn.className = "w-full bg-tertiary text-on-tertiary font-label-lg py-4 rounded-xl shadow-lg";
    btn.onclick = () => {
      overlay.classList.add('hidden');
      navigateTo('patient_records'); // Redirect to their medical record list
    };
  }
}

function cancelPatientVoiceRecord() {
  const overlay = document.getElementById('voice-record-overlay');
  if (overlay) overlay.classList.add('hidden');
  state.simulatedVoiceState = 'idle';
}

// Patient: Consultation Summary View
window.render_consultation_summary = function(params) {
  const consId = params.consId;
  const cons = window.KB_DB.getState().consultations.find(c => c.id === consId) || window.KB_DB.getState().consultations[0];
  if (!cons) return;

  const doc = window.KB_DB.getDoctor(cons.doctorId);
  const patient = window.KB_DB.getPatient(cons.patientId);

  document.getElementById('cons-summary-doc').innerText = doc ? doc.name : 'Dr. Anjali Sharma';
  document.getElementById('cons-summary-specialty').innerText = doc ? `${doc.specialty} • ${doc.hospital}` : '';
  document.getElementById('cons-summary-date').innerText = cons.date.toLocaleDateString();
  
  // Custom audio player label
  const audioText = document.getElementById('cons-summary-audio-transcript');
  if (audioText) {
    audioText.innerText = `"${cons.aiSummary}"`;
  }

  // Medications list
  const medContainer = document.getElementById('cons-summary-meds');
  if (medContainer) {
    medContainer.innerHTML = cons.medications.map(m => `
      <div class="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
        <span class="material-symbols-outlined text-primary text-3xl">pill</span>
        <div>
          <h4 class="font-bold text-on-surface">${m.name}</h4>
          <p class="text-sm text-on-surface-variant">${m.instructions}</p>
          <span class="inline-block mt-1 bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded">Time: ${m.scheduleTime}</span>
        </div>
      </div>
    `).join('');
  }

  // Care plan activities
  const actContainer = document.getElementById('cons-summary-care-plan');
  if (actContainer) {
    const activities = cons.carePlan.activities || ['Follow prescription', 'Adequate hydration'];
    actContainer.innerHTML = activities.map(act => `
      <li class="flex items-center gap-3">
        <span class="material-symbols-outlined text-tertiary text-lg">check_circle</span>
        <span class="text-on-surface-variant font-medium">${act}</span>
      </li>
    `).join('');
  }

  // Disclaimer
  document.getElementById('cons-summary-disclaimer').innerText = "Health guidance is informational and does not replace professional medical advice. AI-generated information is for assistance only.";
};


// ==========================================
// CAREGIVER PORTAL
// ==========================================

window.render_caregiver_home = function() {
  if (!state.currentUser) return;
  const caregiver = window.KB_DB.getCaregiver(state.currentUser.id);
  if (!caregiver || caregiver.patientIds.length === 0) return;

  // Let's grab first patient (Kamla Bai)
  const patientId = caregiver.patientIds[0];
  const patient = window.KB_DB.getPatient(patientId);
  if (!patient) return;

  document.getElementById('caregiver-parent-name').innerText = patient.name;
  document.getElementById('caregiver-parent-details').innerText = `Age: ${patient.age} | ${patient.village}, ${patient.district}`;

  // Parent status mapping
  const statusEl = document.getElementById('caregiver-parent-status');
  let statusText = 'Recovering';
  let statusColor = 'bg-tertiary text-on-tertiary';
  if (patient.riskLevel === 'high' || patient.riskLevel === 'critical') {
    statusText = 'Attention Required';
    statusColor = 'bg-error text-on-error animate-pulse';
  }
  statusEl.innerText = `Status: ${statusText}`;
  statusEl.className = `px-6 py-2 rounded-full font-bold text-sm ${statusColor}`;

  // Adherence Rate Calculation
  const reminders = window.KB_DB.getReminders(patient.id);
  const totalMed = reminders.filter(r => r.type === 'medication').length;
  const takenMed = reminders.filter(r => r.type === 'medication' && r.status === 'completed').length;
  const compliancePercent = totalMed > 0 ? Math.round((takenMed / totalMed) * 100) : 100;
  
  document.getElementById('caregiver-compliance-percent').innerText = `${compliancePercent}%`;
  document.getElementById('caregiver-compliance-bar').style.width = `${compliancePercent}%`;

  // Dynamic alerts
  const alertsList = document.getElementById('caregiver-alerts-list');
  if (alertsList) {
    const activeAlerts = window.KB_DB.getAlerts().filter(a => a.patientId === patient.id);
    if (activeAlerts.length === 0) {
      alertsList.innerHTML = `
        <div class="bg-surface-container-low p-4 rounded-xl text-center text-on-surface-variant flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-tertiary">verified</span>
          <span class="text-sm font-medium">All systems normal. No pending alerts.</span>
        </div>
      `;
    } else {
      alertsList.innerHTML = activeAlerts.map(a => `
        <div class="bg-error-container text-on-error-container border border-error p-4 rounded-xl flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-error">warning</span>
            <div>
              <p class="font-bold text-sm">Emergency Alert: Missed Dose</p>
              <p class="text-xs opacity-90">${a.reason}</p>
            </div>
          </div>
          <span class="text-xs font-bold bg-error text-on-error px-2 py-1 rounded">CRITICAL</span>
        </div>
      `).join('');
    }
  }

  // Next Appointment
  const upcomingCons = window.KB_DB.getReminders(patient.id).find(r => r.type === 'doctor_follow_up');
  const appointmentEl = document.getElementById('caregiver-next-appointment');
  if (appointmentEl) {
    if (upcomingCons) {
      appointmentEl.innerText = `Follow-up Consultation scheduled on ${upcomingCons.timestamp.toLocaleDateString()}`;
    } else {
      appointmentEl.innerText = "No follow-up consultations currently scheduled.";
    }
  }
};


// ==========================================
// NGO PORTAL
// ==========================================

window.render_ngo_home = function() {
  // Update bento analytics metrics
  const patients = window.KB_DB.getPatients();
  const activeAlerts = window.KB_DB.getAlerts();
  const consultations = window.KB_DB.getState().consultations;

  document.getElementById('ngo-total-beneficiaries').innerText = patients.length + 12479; // offset with large numbers for high fidelity
  document.getElementById('ngo-active-elderly').innerText = patients.filter(p => p.age >= 60).length + 4214;
  document.getElementById('ngo-consultations-count').innerText = consultations.length + 891;

  // Render alerts red indicator
  const alertCountBadge = document.getElementById('ngo-alerts-badge');
  if (alertCountBadge) {
    if (activeAlerts.length > 0) {
      alertCountBadge.innerText = `${activeAlerts.length} URGENT`;
      alertCountBadge.className = "bg-error text-on-error text-xs px-3 py-1 rounded-full font-bold pulse-red";
    } else {
      alertCountBadge.innerText = "0 ACTIVE";
      alertCountBadge.className = "bg-surface-container-high text-outline text-xs px-3 py-1 rounded-full font-bold";
    }
  }

  // Render recent activity feed
  const feed = document.getElementById('ngo-recent-activity');
  if (feed) {
    const voiceLogs = window.KB_DB.getState().voiceInteractions;
    const allActivity = [];

    // Bundle activities together
    voiceLogs.forEach(v => {
      const p = window.KB_DB.getPatient(v.patientId);
      allActivity.push({
        title: 'Voice Query Recorded',
        desc: `${p ? p.name : 'Patient'} from Village ${p ? p.village : ''}`,
        time: 'Just now',
        icon: 'record_voice_over',
        color: 'bg-secondary-container text-on-secondary-container'
      });
    });

    consultations.forEach(c => {
      const p = window.KB_DB.getPatient(c.patientId);
      allActivity.push({
        title: 'Health Checkup Logged',
        desc: `Vitals recorded for ${p ? p.name : 'Patient'}`,
        time: '1h ago',
        icon: 'assignment_turned_in',
        color: 'bg-primary-container text-on-primary-container'
      });
    });

    feed.innerHTML = allActivity.map(act => `
      <div class="p-6 flex items-center gap-4 hover:bg-surface-container-low transition-colors cursor-pointer min-h-[72px]">
        <div class="w-12 h-12 rounded-full ${act.color} flex items-center justify-center">
          <span class="material-symbols-outlined">${act.icon}</span>
        </div>
        <div class="flex-grow">
          <p class="font-body-lg text-body-lg font-bold">${act.title}</p>
          <p class="font-body-md text-body-md text-on-surface-variant">${act.desc}</p>
        </div>
        <span class="text-on-surface-variant font-label-lg text-label-lg">${act.time}</span>
      </div>
    `).join('');
  }
};

// NGO Alerts Center Render
window.render_ngo_alerts = function() {
  const activeAlerts = window.KB_DB.getAlerts();
  const listContainer = document.getElementById('ngo-alerts-list');
  if (!listContainer) return;

  if (activeAlerts.length === 0) {
    listContainer.innerHTML = `
      <div class="bg-surface-container-low p-8 rounded-xl text-center space-y-3">
        <span class="material-symbols-outlined text-tertiary text-5xl">verified</span>
        <h3 class="font-headline-md text-on-surface">No High-Risk Alerts Active</h3>
        <p class="text-sm text-on-surface-variant">All community elders are stable and adhering to their medical plans.</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = activeAlerts.map(alert => {
    const patient = window.KB_DB.getPatient(alert.patientId);
    let borderStyle = 'border-error border-l-8';
    let label = 'Critical Alert';

    if (alert.severity === 'high') {
      borderStyle = 'border-l-8 border-error';
      label = 'High Risk';
    } else if (alert.severity === 'medium') {
      borderStyle = 'border-l-8 border-secondary';
      label = 'Medium Risk';
    }

    return `
      <div class="bg-surface-container-lowest ${borderStyle} rounded-xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-start gap-4">
          <div class="bg-error-container p-3 rounded-full text-error">
            <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">report</span>
          </div>
          <div>
            <p class="font-label-lg text-error text-sm mb-1 uppercase tracking-wider">${label}</p>
            <h4 class="font-headline-md text-on-surface">${patient ? patient.name : 'Unknown Patient'} (Age: ${patient ? patient.age : ''})</h4>
            <p class="font-body-md text-on-surface-variant">${alert.reason}</p>
            <p class="text-xs text-outline mt-1">Village: ${patient ? patient.village : ''} • Triggered: ${alert.timestamp.toLocaleTimeString()}</p>
          </div>
        </div>
        <div class="flex gap-3">
          <a class="flex-1 md:flex-none flex items-center justify-center gap-2 min-h-[56px] px-6 bg-primary text-on-primary font-label-lg rounded-xl active:scale-95 duration-100 shadow-sm" href="tel:${patient ? patient.mobileNumber : ''}">
            <span class="material-symbols-outlined">call</span>
            CONTACT
          </a>
          <button class="flex-1 md:flex-none flex items-center justify-center gap-2 min-h-[56px] px-6 border-2 border-outline text-on-surface-variant font-label-lg rounded-xl active:scale-95 duration-100" onclick="ngoResolveAlert('${alert.id}')">
            <span class="material-symbols-outlined">check_circle</span>
            RESOLVE
          </button>
        </div>
      </div>
    `;
  }).join('');
};

function ngoResolveAlert(alertId) {
  const notes = prompt("Enter resolution notes (e.g. Community Health Worker visited patient):", "Community Health Worker Suresh Kumar visited and administered medication.");
  if (notes !== null) {
    window.KB_DB.resolveAlert(alertId, 'usr_ngo_mgr', notes);
    window.render_ngo_alerts();
    alert("Alert marked as resolved.");
  }
}

// NGO Beneficiary Directory
window.render_ngo_beneficiaries = function() {
  const patients = window.KB_DB.getPatients();
  const listContainer = document.getElementById('ngo-beneficiary-list');
  if (!listContainer) return;

  listContainer.innerHTML = patients.map(p => {
    let riskBadge = 'bg-primary-container text-on-primary-container';
    if (p.riskLevel === 'high' || p.riskLevel === 'critical') {
      riskBadge = 'bg-error-container text-on-error-container';
    }

    return `
      <div class="bg-surface-container-low border border-outline-variant p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-shadow">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-primary font-bold">
            ${p.name.charAt(0)}
          </div>
          <div>
            <h4 class="font-bold text-on-surface">${p.name}</h4>
            <p class="text-xs text-on-surface-variant">Age: ${p.age} • Village: ${p.village}</p>
            <p class="text-xs text-outline mt-0.5">Meds: ${p.medications.length} active</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold uppercase px-3 py-1 rounded-full ${riskBadge}">Risk: ${p.riskLevel}</span>
          <span class="material-symbols-outlined text-outline">chevron_right</span>
        </div>
      </div>
    `;
  }).join('');
};

function registerNewBeneficiary() {
  const name = prompt("Enter Beneficiary Full Name:", "Shanti Devi");
  if (!name) return;
  const age = prompt("Enter Age:", "72");
  const village = prompt("Enter Village:", "Sonepat");
  const mobile = prompt("Enter Mobile Number:", "9112233445");

  if (name && mobile) {
    const user = window.KB_DB.createUser(mobile, 'patient', 'hi');
    window.KB_DB.updateUserProfile(user.id, {
      name,
      age: parseInt(age || 65),
      gender: 'Female'
    });
    
    // update village details on patient record
    const patient = window.KB_DB.getPatient(user.id);
    if (patient) {
      patient.village = village || 'Sonepat';
      patient.district = 'Rohtak';
      patient.state = 'Haryana';
      window.KB_DB.updatePatient(user.id, patient);
    }
    
    window.render_ngo_beneficiaries();
    alert("New beneficiary registered successfully!");
  }
}

// ==========================================
// DOCTOR PORTAL
// ==========================================

window.render_doctor_dashboard = function() {
  // Alert counters
  const activeAlerts = window.KB_DB.getAlerts();
  const alertCountText = document.getElementById('doctor-alert-count-text');
  const alertSection = document.getElementById('doctor-alert-section');

  if (alertSection && alertCountText) {
    if (activeAlerts.length > 0) {
      alertCountText.innerText = `${activeAlerts.length} High-Risk Alert(s) Active`;
      alertSection.classList.remove('hidden');
      
      // Populate alert banner
      const a = activeAlerts[0];
      const p = window.KB_DB.getPatient(a.patientId);
      alertSection.innerHTML = `
        <div class="bg-error-container text-on-error-container p-4 rounded-xl flex justify-between items-center cursor-pointer hover:opacity-90 active:scale-95 transition-all" onclick="navigateTo('doctor_patient_profile', { patientId: '${a.patientId}' })">
          <div class="flex items-center gap-4">
            <span class="material-symbols-outlined text-4xl text-error">warning</span>
            <div>
              <h3 class="font-bold">Patient Alert (${p ? p.name : 'Unknown'})</h3>
              <p class="text-sm">${a.reason}</p>
            </div>
          </div>
          <span class="material-symbols-outlined">chevron_right</span>
        </div>
      `;
    } else {
      alertSection.classList.add('hidden');
    }
  }

  // Appointments list
  const patient = window.KB_DB.getPatient('usr_kamla');
  const appointmentsList = document.getElementById('doctor-appointments-list');
  if (appointmentsList && patient) {
    appointmentsList.innerHTML = `
      <div class="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer" onclick="navigateTo('doctor_patient_profile', { patientId: '${patient.id}' })">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">K</div>
          <div>
            <h4 class="font-bold text-on-surface">${patient.name} (Age: ${patient.age})</h4>
            <p class="text-xs text-on-surface-variant">Village: ${patient.village} • Scheduled: 10:30 AM</p>
          </div>
        </div>
        <span class="material-symbols-outlined text-outline">chevron_right</span>
      </div>
    `;
  }
};

// Doctor Patient Directory
window.render_doctor_patients = function() {
  const container = document.getElementById('doctor-patient-directory');
  if (!container) return;

  const patients = window.KB_DB.getPatients();
  container.innerHTML = patients.map(p => `
    <div class="bg-surface-container-low border border-outline-variant p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-all" onclick="navigateTo('doctor_patient_profile', { patientId: '${p.id}' })">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">${p.name.charAt(0)}</div>
        <div>
          <h3 class="font-bold text-on-surface text-lg">${p.name}</h3>
          <p class="text-xs text-on-surface-variant">Age: ${p.age} • Village: ${p.village}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold uppercase px-3 py-1 rounded-full ${p.riskLevel === 'low' ? 'bg-primary/10 text-primary' : 'bg-error-container text-on-error-container'}">
          ${p.riskLevel} Risk
        </span>
        <span class="material-symbols-outlined text-outline">chevron_right</span>
      </div>
    </div>
  `).join('');
};

// Doctor: Patient Profile Details View
window.render_doctor_patient_profile = function(params) {
  const patientId = params.patientId || 'usr_kamla';
  const patient = window.KB_DB.getPatient(patientId);
  if (!patient) return;

  document.getElementById('doc-profile-p-name').innerText = patient.name;
  document.getElementById('doc-profile-p-demographics').innerText = `Age: ${patient.age} | Gender: ${patient.gender} | Village: ${patient.village}, ${patient.district}`;
  document.getElementById('doc-profile-p-risk').innerText = `Risk Level: ${patient.riskLevel.toUpperCase()}`;
  
  // Set risk badge colors
  const badge = document.getElementById('doc-profile-p-risk');
  if (patient.riskLevel === 'low') {
    badge.className = "px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold";
  } else {
    badge.className = "px-3 py-1.5 bg-error-container text-on-error-container rounded-full text-xs font-bold animate-pulse";
  }

  // Caregivers
  const caregiverContainer = document.getElementById('doc-profile-p-caregivers');
  if (caregiverContainer) {
    const caregivers = patient.caregiverIds.map(cid => window.KB_DB.getCaregiver(cid)).filter(Boolean);
    caregiverContainer.innerHTML = caregivers.map(c => `
      <div class="bg-surface-container p-3 rounded-lg text-sm">
        <p class="font-bold text-on-surface">${c.name} (${c.relationship})</p>
        <p class="text-xs text-on-surface-variant">Mobile: ${c.mobileNumber}</p>
      </div>
    `).join('');
  }

  // Medications
  const medsContainer = document.getElementById('doc-profile-p-meds');
  if (medsContainer) {
    if (patient.medications.length === 0) {
      medsContainer.innerHTML = `<p class="text-sm text-outline">No active medications.</p>`;
    } else {
      medsContainer.innerHTML = patient.medications.map(m => `
        <div class="flex justify-between items-center bg-surface-container p-3 rounded-lg text-sm">
          <div>
            <p class="font-bold">${m.name}</p>
            <p class="text-xs text-on-surface-variant">${m.instructions}</p>
          </div>
          <span class="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-xs">${m.scheduleTime}</span>
        </div>
      `).join('');
    }
  }

  // Voice history review block
  const voiceContainer = document.getElementById('doc-profile-p-voice');
  if (voiceContainer) {
    const voiceLogs = window.KB_DB.getVoiceInteractions(patient.id);
    if (voiceLogs.length === 0) {
      voiceContainer.innerHTML = `<p class="text-sm text-outline">No voice interactions recorded.</p>`;
    } else {
      voiceContainer.innerHTML = voiceLogs.map(v => `
        <div class="bg-white border border-outline-variant p-4 rounded-xl space-y-2 cursor-pointer hover:bg-surface-container-low transition-colors" onclick="navigateTo('doctor_voice_history', { voiceId: '${v.id}' })">
          <div class="flex justify-between items-center">
            <span class="font-bold text-sm text-primary">Audio Query #${v.id.substring(6)}</span>
            <span class="text-xs text-outline">${new Date(v.timestamp).toLocaleDateString()}</span>
          </div>
          <p class="text-xs text-on-surface-variant italic truncate">"${v.transcript}"</p>
          <div class="flex justify-between items-center text-xs border-t border-outline-variant/30 pt-2">
            <span class="font-semibold text-secondary flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">auto_awesome</span> Summary Generated</span>
            <span class="material-symbols-outlined text-primary">play_circle</span>
          </div>
        </div>
      `).join('');
    }
  }

  // Consultation notes timeline
  const timeline = document.getElementById('doc-profile-p-timeline');
  if (timeline) {
    const consultations = window.KB_DB.getConsultations(patient.id);
    if (consultations.length === 0) {
      timeline.innerHTML = `<p class="text-sm text-outline">No consultation timeline found.</p>`;
    } else {
      timeline.innerHTML = consultations.map(c => `
        <div class="border-l-4 border-primary pl-4 py-2 relative">
          <div class="w-3 h-3 bg-primary rounded-full absolute -left-2 top-3"></div>
          <p class="text-xs text-outline">${c.date.toLocaleDateString()}</p>
          <h4 class="font-bold text-sm text-on-surface mt-0.5">${c.aiSummary || 'Consultation Logged'}</h4>
          <p class="text-xs text-on-surface-variant mt-1">${c.notes}</p>
        </div>
      `).join('');
    }
  }

  // Action buttons
  const actionsContainer = document.getElementById('doc-profile-actions');
  if (actionsContainer) {
    actionsContainer.innerHTML = `
      <button class="w-full h-touch-target-min bg-primary text-on-primary rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md" onclick="startDoctorConsultation('${patient.id}')">
        <span class="material-symbols-outlined">edit_note</span>
        START NEW CONSULTATION
      </button>
    `;
  }
};

// Doctor: Voice History detailed playback view
window.render_doctor_voice_history = function(params) {
  const voiceId = params.voiceId;
  const voice = window.KB_DB.getState().voiceInteractions.find(v => v.id === voiceId) || window.KB_DB.getState().voiceInteractions[0];
  if (!voice) return;

  const patient = window.KB_DB.getPatient(voice.patientId);
  document.getElementById('voice-history-p-name').innerText = patient ? patient.name : 'Kamla Bai';
  document.getElementById('voice-history-timestamp').innerText = new Date(voice.timestamp).toLocaleString();
  document.getElementById('voice-history-transcript').innerText = voice.transcript;
  document.getElementById('voice-history-ai-summary').innerText = voice.aiSummary;
  
  // Back button mapping
  const backBtn = document.querySelector('#doctor_voice_history button');
  if (backBtn && patient) {
    backBtn.onclick = () => navigateTo('doctor_patient_profile', { patientId: patient.id });
  }
};

function playAudioHistory() {
  const audioText = document.getElementById('voice-history-transcript').innerText;
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(audioText);
    utterance.lang = 'hi-IN'; // hindi accent for simulated voice log
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Audio playback simulation started.");
  }
}

// Doctor: Consultation Workspace Render
function startDoctorConsultation(patientId) {
  navigateTo('doctor_consultation', { patientId });
}

window.render_doctor_consultation = function(params) {
  const patientId = params.patientId || 'usr_kamla';
  const patient = window.KB_DB.getPatient(patientId);
  if (!patient) return;

  document.getElementById('cons-patient-title').innerText = `Consultation for ${patient.name}`;
  
  // Set input placeholder or auto-fill notes from voice summary history
  const voiceLogs = window.KB_DB.getVoiceInteractions(patient.id);
  const notesArea = document.getElementById('cons-clinical-notes');
  if (notesArea) {
    if (voiceLogs.length > 0) {
      notesArea.value = `Patient complained of: ${voiceLogs[0].aiSummary}. Prescribed Naproxen for pain relief. Advised regular stretches and medication compliance.`;
    } else {
      notesArea.value = "Patient reports joints soreness. Reviewing prescription.";
    }
  }

  // Next CTA
  const completeBtn = document.getElementById('cons-complete-btn');
  if (completeBtn) {
    completeBtn.onclick = () => {
      // Collect values and proceed to Care Plan Builder
      const notes = notesArea.value;
      navigateTo('doctor_care_plan', { patientId, notes });
    };
  }
};

// Doctor: Care Plan Builder Render
window.render_doctor_care_plan = function(params) {
  const patientId = params.patientId;
  const notes = params.notes;
  const patient = window.KB_DB.getPatient(patientId);
  if (!patient) return;

  document.getElementById('care-plan-patient-title').innerText = `Care Plan: ${patient.name}`;

  // Pre-fill care plan draft with osteo inputs matching demo journey
  const carePlanActivities = document.getElementById('care-plan-activities');
  if (carePlanActivities) {
    carePlanActivities.innerHTML = `
      <div class="flex items-center gap-3">
        <input type="checkbox" id="act_rice" checked class="rounded border-outline-variant text-primary focus:ring-primary">
        <label for="act_rice" class="font-medium">Daily morning joints stretches</label>
      </div>
      <div class="flex items-center gap-3 mt-3">
        <input type="checkbox" id="act_walk" checked class="rounded border-outline-variant text-primary focus:ring-primary">
        <label for="act_walk" class="font-medium">Evening warm oil compression</label>
      </div>
    `;
  }

  // Pre-fill prescription draft
  const presContainer = document.getElementById('care-plan-meds-draft');
  if (presContainer) {
    presContainer.innerHTML = `
      <div class="p-4 bg-surface-container rounded-xl flex items-center justify-between border border-outline-variant">
        <div>
          <p class="font-bold">Amlodipine 5mg</p>
          <p class="text-xs text-on-surface-variant">Once daily after breakfast (Morning)</p>
        </div>
        <span class="bg-primary text-on-primary text-xs px-2.5 py-1 rounded">08:00 AM</span>
      </div>
      <div class="p-4 bg-surface-container rounded-xl flex items-center justify-between border border-outline-variant mt-2">
        <div>
          <p class="font-bold text-secondary">Naproxen 250mg</p>
          <p class="text-xs text-on-surface-variant">Twice daily after breakfast and dinner (Morning/Evening)</p>
        </div>
        <span class="bg-secondary text-on-secondary text-xs px-2.5 py-1 rounded">09:00 AM, 09:00 PM</span>
      </div>
    `;
  }

  // Complete CTA
  const submitBtn = document.getElementById('care-plan-save-btn');
  if (submitBtn) {
    submitBtn.onclick = () => {
      // Assemble Care plan and Save to DB
      const medsList = [
        { name: 'Amlodipine 5mg', instructions: 'Once daily after breakfast', scheduleTime: '08:00 AM', condition: 'Hypertension' },
        { name: 'Naproxen 250mg', instructions: 'Twice daily after breakfast and dinner', scheduleTime: '09:00 AM', condition: 'Osteoarthritis' }
      ];
      const carePlan = {
        title: 'Osteoarthritis Knee Support Recovery',
        activities: ['Daily morning joints stretches', 'Evening warm oil compression']
      };

      const newCons = window.KB_DB.addConsultation(
        patientId,
        state.currentUser.id,
        notes,
        medsList,
        carePlan,
        5 // 5 follow up days
      );

      alert("Consultation logged and Care Plan generated!");
      navigateTo('doctor_patient_profile', { patientId });
    };
  }
};


// ==========================================
// CHW (COMMUNITY HEALTH WORKER) PORTAL
// ==========================================

window.render_worker_home = function() {
  const container = document.getElementById('worker-tasks-list');
  if (!container) return;

  const patient = window.KB_DB.getPatient('usr_kamla');
  const activeAlerts = window.KB_DB.getAlerts().filter(a => a.patientId === 'usr_kamla');

  if (activeAlerts.length > 0) {
    // High risk task alert is active
    container.innerHTML = `
      <div class="bg-error-container text-on-error-container border border-error p-5 rounded-2xl shadow-sm space-y-4">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-3xl text-error">report_problem</span>
          <div>
            <h4 class="font-bold text-lg">Urgent Home Visit Needed: ${patient.name}</h4>
            <p class="text-xs">${activeAlerts[0].reason}</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button class="flex-1 bg-error text-on-error py-2.5 rounded-xl text-sm font-bold active:scale-95" onclick="triggerChwHomeCheckin()">
            BEGIN CHECK-IN
          </button>
          <a class="flex-1 border border-error text-error py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95" href="tel:${patient.mobileNumber}">
            <span class="material-symbols-outlined text-[16px]">call</span> CALL
          </a>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="bg-surface-container-low p-6 rounded-2xl text-center space-y-2">
        <span class="material-symbols-outlined text-tertiary text-4xl">check_circle</span>
        <h4 class="font-bold text-on-surface">No High-Risk Home Visits Scheduled</h4>
        <p class="text-xs text-on-surface-variant">All village elders in Sonepat are accounted for and stable.</p>
      </div>
    `;
  }
};

function triggerChwHomeCheckin() {
  const notes = prompt("Perform home check-in. Enter observed vitals and check-in summary (e.g. BP: 130/85, Pill administered):", "Visited Kamla Bai. She was feeling weak. Administered her Naproxen pill. BP: 130/85, Pulse: 72.");
  if (notes !== null) {
    // Resolve patient alerts
    const alerts = window.KB_DB.getAlerts().filter(a => a.patientId === 'usr_kamla');
    alerts.forEach(a => {
      window.KB_DB.resolveAlert(a.id, state.currentUser.id, notes);
    });

    // Reset reminders back to completed for simulation
    const reminders = window.KB_DB.getReminders('usr_kamla');
    reminders.forEach(r => {
      if (r.status === 'missed') {
        r.status = 'completed';
      }
    });

    alert("Check-in logged and Alert resolved.");
    routeToDashboard();
  }
}


// ==========================================
// SYSTEM ADMIN / ANALYTICS PORTAL
// ==========================================

window.render_admin_reporting = function() {
  const patients = window.KB_DB.getPatients();
  const activeAlerts = window.KB_DB.getAlerts();
  
  document.getElementById('admin-active-patients').innerText = patients.length + 12480;
  document.getElementById('admin-alert-metric').innerText = activeAlerts.length;
};


// ==========================================
// DEMO CONTROLLER & WALKTHROUGH OVERLAY
// ==========================================

// Handle role switcher change
function handleDemoRoleSwitch(select) {
  const role = select.value;
  const user = window.KB_DB.getState().users.find(u => u.role === role);
  if (user) {
    state.currentUser = user;
    state.selectedLanguage = user.preferredLanguage || 'hi';
    routeToDashboard();
  }
}

// Event injection: simulate missed medication
function injectMissedMedicationAlert() {
  // Grab patient Kamla Bai
  const patient = window.KB_DB.getPatient('usr_kamla');
  if (!patient) return;

  // Make at least two reminders 'missed' to trigger high risk alert
  const reminders = window.KB_DB.getReminders(patient.id);
  if (reminders.length >= 2) {
    reminders[0].status = 'missed';
    reminders[1].status = 'missed';
  } else {
    // Add missed reminders
    window.KB_DB.subscribe((db) => {}); // Ensure DB load
    window.KB_DB.getState().reminders.push({
      id: 'rem_miss_1',
      patientId: patient.id,
      type: 'medication',
      title: 'Take Amlodipine 5mg',
      time: '08:00 AM',
      status: 'missed',
      timestamp: new Date()
    });
  }

  // Trigger high-risk alert
  window.KB_DB.triggerAlert(patient.id, 'high', 'Missed consecutive morning doses (Amlodipine 5mg & Naproxen 250mg). Risk level elevated.');
  
  alert("Alert Injected: Kamla Bai missed medication. Risk level set to HIGH.");
  routeToDashboard();
}

// Event injection: reset DB
function resetDemoDatabase() {
  window.KB_DB.reset();
  alert("Database reset to initial demo values.");
  state.currentUser = window.KB_DB.getState().users[0]; // Set back to patient Kamla Bai
  state.selectedLanguage = 'hi';
  navigateTo('welcome');
}

// Walkthrough next steps
function nextWalkthroughStep() {
  state.walkthroughStep++;
  updateWalkthroughText();
}

function updateWalkthroughText() {
  const guide = document.getElementById('demo-guide-text');
  if (!guide) return;

  const steps = [
    "<strong>Step 1: Patient Voice Entry.</strong> Select the role <strong>Elderly Patient</strong> in the control panel. Click the orange 'Boliye' button and speak to simulate reporting severe joint pain.",
    "<strong>Step 2: Voice Interaction history.</strong> Change role to <strong>Doctor</strong>. Look at the dashboard alert, search 'Kamla Bai', view her profile, and listen to the voice log and AI summary.",
    "<strong>Step 3: Clinical Care Plan.</strong> As the <strong>Doctor</strong>, click 'Start Consultation', add notes, configure her recovery path inside the Care Plan Builder, and save.",
    "<strong>Step 4: Medication Missed.</strong> Go to the Demo Controller. Click <strong>Simulate Missed Doses</strong> to trigger an alert. This propagates to the Caregiver and NGO portals.",
    "<strong>Step 5: Alert Intervention.</strong> Log in as the <strong>NGO Manager</strong> or <strong>Community Health Worker</strong>. Select the Alert and assign Suresh to resolve it by visiting Kamla's home.",
    "<strong>Step 6: Caregiver Reassurance.</strong> Switch to the <strong>Caregiver (Son)</strong> dashboard. Review her status: check vitals, compliance metrics, and see the alert resolution."
  ];

  if (state.walkthroughStep >= steps.length) {
    state.walkthroughStep = 0; // wrap around
  }

  guide.innerHTML = steps[state.walkthroughStep];
}

// Global initialization when script loads
document.addEventListener('DOMContentLoaded', () => {
  // Initial DB subscription
  window.KB_DB.subscribe(db => {
    // If user changes from outside, we can sync
    if (state.currentUser) {
      state.currentUser = db.users.find(u => u.id === state.currentUser.id) || state.currentUser;
    }
  });

  // Set initial user as Patient (Kamla Bai) for standard workflow entry
  state.currentUser = window.KB_DB.getState().users[0];
  state.selectedLanguage = state.currentUser.preferredLanguage || 'hi';
  
  // Set default voice simulations language matching patient preferred lang
  state.selectedVoiceLanguage = 'hi';

  // Render initial guide text
  updateWalkthroughText();
});
