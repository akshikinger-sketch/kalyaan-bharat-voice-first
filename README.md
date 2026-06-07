# Kalyaan Bharat (कल्याण भारत)
### Voice-First Healthcare Continuity Platform for Underserved Communities in India

Kalyaan Bharat is a voice-first, family-centric healthcare continuity platform designed specifically for rural and underserved elderly populations in India. It simplifies complex healthcare journeys by using voice as the primary interface, bridging the gap between elderly patients, remote family caregivers, Doctors, and NGO-led community health networks.

---

## 🌟 Product Vision & Core Principles

Unlike traditional telemedicine marketplaces, Kalyaan Bharat is a **continuity of care platform**. It does not treat healthcare as a series of one-off transactional video calls; instead, it establishes an ongoing record of voice history, care plan adjustments, community visits, and family updates.

1. **Voice-First (Radical Accessibility)**: Elderly users can complete key actions, report pain/symptoms, and review instructions by tapping a single orange mic button ("Boliye") speaking in their native language (Hindi, Marathi, Bengali, Tamil, English).
2. **Continuity of Care**: Medical records, consultation notes, and voice interactions persist across visits on a centralized patient health timeline.
3. **Family-Centric Reassurance**: Caregivers can monitor the vitals, medication adherence, and alerts of elderly family members remotely from a dedicated dashboard.
4. **Human-in-the-Loop**: AI services summarize voice interactions and consultations, but never diagnose or prescribe. All medical decisions are drafted by Doctors and validated by Community Health Workers.

---

## 👥 Target User Roles

- **Elderly Patient (e.g., Kamla Bai, 68)**: Uses the voice-first portal to ask questions, review daily pill schedules (Yad-dihani), and receive reminders.
- **Caregiver / Family Member (e.g., Ramesh Kumar, 27 - Son)**: Monitors medication adherence, receives alerts, and stays updated on parent recovery from a remote city.
- **NGO Program Manager (e.g., Seva Elder Care Foundation)**: Monitors village health trends, risk distributions, and coordinates intervention protocols.
- **Community Health Worker / Asha Worker (e.g., Suresh Kumar)**: Visits high-risk patients, records vital metrics, and resolves critical missed-dose alerts.
- **Doctor (e.g., Dr. Anjali Sharma - General Physician)**: Analyzes voice logs, edits Care Plans, conducts consultations, and writes digital prescriptions.
- **System Administrator**: Evaluates platform compliance, retention rates, and general regional health performance.

---

## 🛠️ System Modules

- **Module 1: Authentication & Onboarding**: Implements mobile log entry, 4-digit mock OTP verification, and language choices (Hindi, English, Marathi).
- **Module 2: DPDP Act 2023 Consent (Ethical Rules)**: Prompts users on privacy, explaining data usage. Includes a voice-enabled "Listen" playback feature.
- **Module 3: Profile Setup**: Collects name, age, and gender, and allows linking caregivers.
- **Module 4: Patient Dashboard & Voice Interaction**: Features a large mic button that transcribes speech in real-time, stores voice recordings, and triggers clinical summaries.
- **Module 5: Yad-dihani (Medication Reminders)**: Daily checkbox logs for morning, afternoon, and evening doses.
- **Module 6: Caregiver Portal**: Displays adherence bar charts, vital updates, and critical alert warnings.
- **Module 7: Doctor Workspace**: Consists of patient search directory, timeline logs, voice query history players, and prescription drafts.
- **Module 8: Care Plan Builder**: Multi-step workspace to outline recovery protocols, stretches, and follow-ups.
- **Module 9: NGO Manager Dashboard**: Bento-style aggregated KPIs, activity feeds, and weekly trend visual charts.
- **Module 10: High-Risk Alert Center**: Triages missed medication doses or severe reported symptoms (Low, Medium, High, Critical).
- **Module 11: Community Worker Portal**: Action center for Asha workers to log home visits, input vitals, and resolve active alerts.

---

## 🚀 Setup & Execution Guide

The application is built as a client-side Single Page Application (SPA) utilizing vanilla HTML5, CSS3, and JavaScript, leveraging Tailwind CSS (via CDN) and Google Noto Sans/Material Symbols.

### Prerequisite
No build steps, compilers, or database installations are required. You only need a modern web browser.

### Running the Application

#### Option A: Direct Browser Launch (Simplest)
1. Double-click the `index.html` file to open it directly in Chrome, Edge, or Safari.
2. The application will initialize and run entirely within your browser using `localStorage` to persist data state.

#### Option B: Local Web Server (Recommended)
To run the app on a local port, serve the directory using Node.js or Python:
- **Node.js**:
  ```bash
  npx -y http-server ./
  ```
  Open `http://localhost:8080` in your browser.
- **Python**:
  ```bash
  python -m http.server 8000
  ```
  Open `http://localhost:8000` in your browser.

---

## 🔍 Clickable Demo Journey (The Step-by-Step Storyboard)

Use the floating **Demo Control Center** at the bottom-left of the screen to guide your review.

1. **Step 1: Onboarding & Consent**: Starts at the Welcome screen. Select a language (e.g., Hindi), click **Continue**, enter mobile number `9876543210` and OTP `1234`. Read or listen to the DPDP privacy guidelines, complete the profile setup (Kamla Bai, 68), and click **Complete Setup**.
2. **Step 2: Patient Voice Query**: From the Patient Home screen, click the orange **Boliye** button. Choose "Hindi" in the simulator dropdown and click **Stop Recording** to simulate Kamla Bai complaining about knee pain. Save and submit.
3. **Step 3: Doctor Review**: Open the Demo Control Center dropdown and switch role to **Doctor**. Click on **Patient Alert (Kamla Bai)**. Listen to the voice log, review the transcript, and read the AI Clinical Summary.
4. **Step 4: Consultation & Care Plan**: As the Doctor, click **Start New Consultation**. Review notes, click **Proceed to Care Plan**, customize her stretches/medications, and click **Save Care Plan**.
5. **Step 5: Inject Missed Dose Alert**: On the Demo Control Center, click **Miss Morning Meds** to simulate time passing and Kamla missing two consecutive doses of her pain medication.
6. **Step 6: Caregiver Notification & NGO Triage**:
   - Switch role to **Caregiver (Son)**: Observe the red alert warning showing his mother missed her Naproxen dose.
   - Switch role to **NGO Manager**: View the Alert Center. See the critical warning and allocate Community Worker Suresh Kumar to visit Sonepat.
7. **Step 7: Asha Worker Home Visit**: Switch role to **Community Health Worker**. See the pending task, click **Begin Check-in**, record visit notes (e.g. vitals checked, BP: 130/85, medication given), and resolve.
8. **Step 8: Resolution Reassurance**: Switch back to **Caregiver** or **Patient** views. The alert is now resolved, and Kamla's risk level returns to "Low".
