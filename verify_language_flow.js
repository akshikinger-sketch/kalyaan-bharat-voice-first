/**
 * Kalyaan Bharat - Multi-lingual Translation & Voice Flow Verification Suite
 */

const fs = require('fs');
const path = require('path');

// 1. Mock minimal DOM Environment for Node.js
const mockStore = {};
const mockLocalStorage = {
  getItem: (key) => mockStore[key] || null,
  setItem: (key, value) => { mockStore[key] = String(value); },
  clear: () => { for (let k in mockStore) delete mockStore[k]; }
};

class MockElement {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this._innerText = '';
    this._innerHTML = '';
    this.placeholder = '';
    this.className = '';
    this.classList = {
      classes: new Set(),
      add: (c) => this.classList.classes.add(c),
      remove: (c) => this.classList.classes.delete(c),
      contains: (c) => this.classList.classes.has(c)
    };
    this.value = '';
    this.style = {};
    this.attributes = {};
  }

  get innerText() {
    return this._innerText;
  }
  set innerText(val) {
    this._innerText = String(val);
  }

  get innerHTML() {
    return this._innerHTML || this._innerText;
  }
  set innerHTML(val) {
    this._innerHTML = String(val);
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
  }
  getAttribute(name) {
    return this.attributes[name] || null;
  }

  querySelector(selector) {
    // Basic mock selector resolver
    if (selector === 'span:last-child') {
      if (!this._spanLast) this._spanLast = new MockElement('', 'span');
      return this._spanLast;
    }
    if (selector.includes('data-gender')) {
      const match = selector.match(/data-gender="([^"]+)"/);
      if (match) {
        const gender = match[1];
        if (!this._genderBtns) this._genderBtns = {};
        if (!this._genderBtns[gender]) {
          this._genderBtns[gender] = new MockElement('');
          this._genderBtns[gender].setAttribute('data-gender', gender);
        }
        return this._genderBtns[gender];
      }
    }
    return new MockElement('');
  }

  querySelectorAll(selector) {
    if (selector === 'button' || selector === '.lang-btn' || selector === 'a') {
      return [new MockElement(''), new MockElement(''), new MockElement('')];
    }
    return [];
  }

  addEventListener(event, callback) {}
}

const elementsDb = {};
const documentMock = {
  getElementById: (id) => {
    if (!elementsDb[id]) {
      elementsDb[id] = new MockElement(id);
    }
    return elementsDb[id];
  },
  querySelector: (selector) => {
    return new MockElement('');
  },
  querySelectorAll: (selector) => {
    if (selector === '.app-view') {
      return [new MockElement('welcome'), new MockElement('login'), new MockElement('consent')];
    }
    if (selector === '.lang-btn') {
      return [new MockElement('lang-en'), new MockElement('lang-hi'), new MockElement('lang-mr')];
    }
    return [];
  },
  addEventListener: (event, callback) => {}
};

// Expose globals
global.localStorage = mockLocalStorage;
global.window = {
  scrollTo: () => {},
  speechSynthesis: {
    speak: (utterance) => {
      global.lastSpokenUtterance = utterance;
    }
  },
  SpeechSynthesisUtterance: class {
    constructor(text) {
      this.text = text;
      this.lang = 'en-US';
    }
  }
};
global.document = documentMock;
global.navigator = { userAgent: 'node' };
global.SpeechSynthesisUtterance = global.window.SpeechSynthesisUtterance;

// Expose function templates on window
global.window.render_welcome = null;
global.window.render_login = null;
global.window.render_consent = null;
global.window.render_profile_setup = null;
global.window.render_patient_home = null;
global.window.render_patient_reminders = null;

// 2. Load and evaluate db.js
const dbCode = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
eval(dbCode);

// 3. Load and evaluate app.js
const appCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8')
  .replace('const state =', 'global.state =')
  .replace('const translations =', 'global.translations =')
  .replace('const voiceSimulations =', 'global.voiceSimulations =');
eval(appCode);

// 4. Load and evaluate index.html inline script block
const htmlCode = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const scriptBlocks = [...htmlCode.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if (scriptBlocks.length > 0) {
  // The last script block has the togglers and navigation DOM listeners
  const lastScript = scriptBlocks[scriptBlocks.length - 1][1];
  eval(lastScript);
}

// 5. Assert Helper
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

console.log("--------------------------------------------------");
console.log("🔍 Running Multi-lingual & Speech Validation...");
console.log("--------------------------------------------------");

// Initialize DB and mock state
window.KB_DB.reset();
const defaultUser = window.KB_DB.getState().users[0];
state.currentUser = defaultUser;

// Test Case 1: Default Selected Language should be Hindi ('hi')
assert(state.selectedLanguage === 'hi', "Default language should be 'hi'.");
console.log("✅ Test 1 Passed: Default language is Hindi ('hi').");

// Test Case 2: Render Welcome Screen in Hindi
navigateTo('welcome');
const welcomeH1 = document.getElementById('welcome-h1');
assert(welcomeH1.innerText === "नमस्ते!", "Welcome Header 1 should be 'नमस्ते!' in Hindi.");
const welcomeH2 = document.getElementById('welcome-h2');
assert(welcomeH2.innerText === "कल्याण भारत में आपका स्वागत है", "Welcome Header 2 should be 'कल्याण भारत में आपका स्वागत है'.");
console.log("✅ Test 2 Passed: Welcome view correctly rendered Hindi strings.");

// Test Case 3: Toggle language to English ('en') and recheck text
toggleLanguageGlobal();
assert(state.selectedLanguage === 'en', "Global toggle should cycle language to 'en'.");
assert(welcomeH1.innerText === "Namaste!", "Welcome Header 1 should be 'Namaste!' in English.");
assert(welcomeH2.innerText === "Welcome to Kalyaan Bharat", "Welcome Header 2 should be 'Welcome to Kalyaan Bharat' in English.");
console.log("✅ Test 3 Passed: Global toggle cycled successfully to English ('en') and updated UI text.");

// Test Case 4: Toggle language back to Hindi ('hi')
toggleLanguageGlobal();
assert(state.selectedLanguage === 'hi', "Global toggle should cycle language back to 'hi'.");
assert(welcomeH1.innerText === "नमस्ते!", "Welcome Header 1 should be 'नमस्ते!' in Hindi.");
assert(welcomeH2.innerText === "कल्याण भारत में आपका स्वागत है", "Welcome Header 2 should be 'कल्याण भारत में आपका स्वागत है' in Hindi.");
console.log("✅ Test 4 Passed: Global toggle cycled successfully back to Hindi ('hi') and updated UI text.");

// Test Case 5: Verify Consent Speech Lang matches selectedLanguage
// Let's set language to Hindi ('hi') and trigger consent render & play speech
state.selectedLanguage = 'hi';
navigateTo('consent');
const consentText = document.getElementById('consent-text');
assert(consentText.innerText.includes("स्वास्थ्य जानकारी"), "Consent text should be in Hindi.");

// Trigger speech synthesis
playConsentVoice();
assert(global.lastSpokenUtterance !== undefined, "Speech Synthesis should have been triggered.");
assert(global.lastSpokenUtterance.text.includes("स्वास्थ्य जानकारी"), "Speech utterance should match consent text.");
assert(global.lastSpokenUtterance.lang === "hi-IN", "Speech Synthesis language should be 'hi-IN' when selectedLanguage is 'hi'.");
console.log("✅ Test 5 Passed: Speech Synthesis lang matches selectedLanguage ('hi' -> 'hi-IN') and reads the correct text.");

console.log("--------------------------------------------------");
console.log("🎉 ALL MULTI-LINGUAL FLOW TESTS PASSED SUCCESSFULLY!");
console.log("--------------------------------------------------");
process.exit(0);
