# TRH Victory Camp 2026 Portal

Official retreat portal for **TRH Ministries Global Annual Victory Camp 2026**. Designed for seamless attendee registration, digital camp pass issuance, event schedule navigation, operational guidelines, faith expectation sharing, and real-time administrative management.

---

## 🌟 Key Features

### 1. Hero & Overview Section
* **Event Details**: Clear presentation of camp theme, date range, venue location, and registration fee (`₦1,000`).
* **Live Countdown Timer**: Real-time countdown tracking the days, hours, minutes, and seconds until the retreat commences.
* **Animated Call-to-Action**: Shimmering gradient action buttons guiding users directly to registration or schedule details.

### 2. Comprehensive Registration System
* **Personal & Contact Details**: Full name, gender, age range, phone number, email address, marital status, and address.
* **Ecclesiastical Information**: Parish name and regional zone.
* **Attendance Options**: Choice between staying for the entire 7 days or selecting specific attendance dates, plus sleepover accommodation preferences.
* **Accompanied Children (≤ 12 years)**: Track whether attendees are bringing children, specify exact child count (1–5), and list child ages for child-care planning.
* **Volunteer Committee Selection**: Option to serve across 10 operational departments (Administration, Protocol, Kitchen/Catering, Sanitation, Media & Tech, Security, Medical, Transport, Children Ministry, Music/Worship).
* **Medical & Emergency Safety**: Confidential recording of medical conditions and emergency contact info.
* **Payment & Faith Expectations**: Bank transfer payment receipt verification and submission of personal faith expectations for the retreat.

### 3. Digital Camp Pass & QR Verification
* **Personalized Pass Card**: Displays attendee registration number, photo/avatar placeholder, pass tier badge, accommodation status, and accompanied children breakdown.
* **QR Code Generation**: Built-in unique QR code encoding attendee registration data for fast gate verification.
* **Pass Actions**: One-click pass image generation (`HTML5 Canvas` export) and browser printing.
* **Instant Gate Verification Modal**: Integrated camera scanner and manual registration search for security officers to verify passes and check attendees in real-time.

### 4. Interactive Camp Schedule
* **Day-by-Day Timetable**: Detailed schedule covering spiritual sessions, morning devotions, workshop breakouts, evening revivals, and meal breaks.
* **Filterable Views**: Easily switch between days or view the full week schedule.

### 5. Operational Guidelines & Volunteer Departments
* **Camp Rules & Code of Conduct**: Comprehensive breakdown of guidelines, dress code, safety rules, and disciplinary framework.
* **Department Volunteer Overview**: Highlights all 10 operational committees with live counters showing registered volunteer counts.

### 6. Faith Expectation Wall
* **Community Prayer Wall**: Display of shared faith expectations submitted during registration.
* **Interactive Reactions**: Encouraging community interaction with prayer counters and supportive tags.

### 7. Administrative Portal
* **Real-Time KPI Dashboard**: Stat cards detailing Total Registered, Checked-In, Sleepover, Accompanied Children (≤ 12 years), and Medical Alerts.
* **Attendee Table & Mobile Cards**: Responsive list supporting search by name, phone, registration number, parish, or committee.
* **Instant Check-In Toggle**: One-click check-in and check-out tracking for gate officers.
* **Data Export**: Export attendee data to CSV for offline administrative processing.
* **Walk-In Registration Form**: Admin modal for registering on-site walk-in attendees with full support for specific day selection and accompanied children.

### 8. Mobile & UX Optimization
* **Browser History Integration**: Mobile phone back-button support using URL hash routing (`#overview`, `#register`, `#schedule`, `#guidelines`, `#expectations`, `#admin`, `#pass`).
* **Responsive Layouts**: Fully responsive interface tailored for mobile, tablet, and desktop screens.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript, Vite
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Database**: Firebase Firestore (Persistent cloud database with offline/mock fallback)
* **Effects & Animations**: Canvas-Confetti, Tailwind CSS keyframe animations

---

## 🚀 Getting Started

### Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file based on `.env.example`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Development Server**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

5. **Linting & Code Verification**:
   ```bash
   npm run lint
   ```

---

## 📄 License

TRH Ministries Global © 2026. All Rights Reserved.
