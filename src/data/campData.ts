import { Attendee, CommitteeInfo, ExpectationPost, ScheduleItem, CampActivityDef, CampDayDef } from '../types';
import trhLogoImg from '../assets/images/trh_camp_logo_1785335253249.png';

/**
 * LOGO CONFIGURATION
 * 
 * TO CHANGE THE LOGO IN THE CODEBASE:
 * Replace the logo image file at '/src/assets/images/trh_camp_logo_1785335253249.png'
 * or change the import path above to point to your image file in /src/assets/
 */
export const DEFAULT_CAMP_LOGO = trhLogoImg;

/**
 * REGISTRATION CLOSURE CONFIGURATION
 * 
 * By default, registration automatically closes 1 week prior to camp start date (August 16, 2026).
 * Camp Start Date: August 23, 2026 (2026-08-23)
 * 
 * HOW TO MODIFY REGISTRATION CLOSURE IN THE CODEBASE:
 * 1. To change the auto-close date/time: Edit REGISTRATION_CLOSURE_DATE below (format: YYYY-MM-DDTHH:mm:ss).
 * 2. To manually force registration OPEN: Set IS_REGISTRATION_MANUALLY_OVERRIDDEN = true;
 * 3. To manually force registration CLOSED: Set IS_REGISTRATION_MANUALLY_OVERRIDDEN = false;
 * 4. To revert to automatic date calculation: Set IS_REGISTRATION_MANUALLY_OVERRIDDEN = null;
 */
export const REGISTRATION_CLOSURE_DATE = '2026-08-16T23:59:59';
export const IS_REGISTRATION_MANUALLY_OVERRIDDEN: boolean | null = null;

export const isRegistrationClosed = (): boolean => {
  if (IS_REGISTRATION_MANUALLY_OVERRIDDEN !== null) {
    return !IS_REGISTRATION_MANUALLY_OVERRIDDEN;
  }
  const closureDate = new Date(REGISTRATION_CLOSURE_DATE);
  const now = new Date();
  return now >= closureDate;
};

export const CAMP_DETAILS = {
  name: 'TRH Annual Victory Camp 2026',
  theme: 'EVIDENCE — Proof of Victory',
  scripture: '1 COR. 15:57 TPT',
  scriptureText: 'But thanks be to God, who gives us the victory through our Lord Jesus Christ!',
  startDate: '2026-08-23',
  endDate: '2026-08-30',
  dateDisplay: '23rd – 30th August 2026',
  duration: 'Seven (7) Days',
  venue: 'TRH Church Hall',
  attendance: 'Open to all members and visitors',
  fee: 1000,
  feeDisplay: '₦1,000',
  bankAccount: {
    bankName: 'Polaris  Bank',
    accountName: 'JIDEOFOR EMMANUEL OKOH',
    accountNumber: '1011312255',
    note: 'Please include your Full Name and "Victory Camp" in your transfer remark.',
  },
};

export const DAILY_SCHEDULE: ScheduleItem[] = [
  {
    id: 's1',
    time: '4:30 AM',
    activity: 'Wake-Up & Personal Preparation',
    category: 'rest',
    description: 'Awaken early, prepare your heart and body for the morning prayer walk.',
  },
  {
    id: 's2',
    time: '5:00 AM',
    activity: 'Morning Prayer Walk',
    category: 'prayer',
    description: 'Corporate prayer walk surrounding the camp territory with intense intercession and worship.',
    highlight: 'Key Daily Routine',
  },
  {
    id: 's3',
    time: '8:00 AM',
    activity: 'Personal Devotion & Quiet Reflection',
    category: 'rest',
    description: 'Solitary time with Scriptures, journaling, and deep meditation on the Word of Victory.',
  },
  {
    id: 's4',
    time: '11:00 AM',
    activity: 'Personal Study / Preparation',
    category: 'study',
    description: 'Prepare notes for Bible Study groups and review teaching themes.',
  },
  {
    id: 's5',
    time: '12:00 PM – 3:00 PM',
    activity: 'Teaching & Prayer Session (Breaking of Fast at 3:00 PM)',
    category: 'teaching',
    description: 'Anointing-filled apostolic teaching, prophetic prayer, followed by breaking the fast together at 3:00 PM.',
    highlight: 'Fast Breaking Session',
  },
  {
    id: 's6',
    time: '3:30 PM – 5:00 PM',
    activity: 'Lunch',
    category: 'fellowship',
    description: 'Shared communal meal provided by the Hospitality Team.',
  },
  {
    id: 's7',
    time: '5:00 PM',
    activity: 'Personal Rest / Fellowship',
    category: 'fellowship',
    description: 'Relaxation, physical hygiene, team bonding, and spiritual discussions.',
  },
  {
    id: 's8',
    time: '6:00 PM',
    activity: 'Bible Study Groups',
    category: 'study',
    description: 'Interactive group discussions dissecting the theme "EVIDENCE - Proof of Victory".',
  },
  {
    id: 's9',
    time: '8:00 PM',
    activity: 'Personal Prayer & Reflection',
    category: 'prayer',
    description: 'Evening consecration and personal altar setup.',
  },
  {
    id: 's10',
    time: '11:00 PM',
    activity: 'Midnight Praise & Worship',
    category: 'worship',
    description: 'High midnight worship, prophetic songs, and breaking of spiritual strongholds.',
    highlight: 'Midnight Encounter',
  },
  {
    id: 's11',
    time: '12:30 AM',
    activity: 'Lights Out / Rest',
    category: 'rest',
    description: 'Mandatory quiet period to ensure physical renewal for the next day.',
  },
];

export const COMMITTEES: CommitteeInfo[] = [
  {
    name: 'Administration',
    description: 'Oversees registration, attendance, accommodation, scheduling, communication, and general camp coordination.',
    responsibilities: [
      'Manage physical & online registrations',
      'Coordinate badge issuance & attendance tracking',
      'Oversee camp schedule adherence & communications',
    ],
    volunteersCount: 8,
    iconName: 'ClipboardList',
  },
  {
    name: 'Protocol',
    description: 'Maintains order during all camp activities, assists with seating, movement, and participant coordination.',
    responsibilities: [
      'Seating organization & hall crowd management',
      'VIP & guest minister reception',
      'Orderly movement during prayer walks & sessions',
    ],
    volunteersCount: 12,
    iconName: 'UserCheck',
  },
  {
    name: 'Hospitality',
    description: 'Coordinates meal preparation, food distribution, and participant welfare during breaking of fast at 3:00 PM.',
    responsibilities: [
      'Prep and distribute meals at 3:30 PM fast breaking',
      'Provide drinking water and refreshment logistics',
      'Address dietary needs and general participant welfare',
    ],
    volunteersCount: 15,
    iconName: 'Utensils',
  },
  {
    name: 'Medical',
    description: 'Provides first aid, responds to medical emergencies, and monitors participants requiring special health attention.',
    responsibilities: [
      'First aid station setup & medication monitoring',
      'Immediate response to health emergencies',
      'Health advisory for fasting safety',
    ],
    volunteersCount: 6,
    iconName: 'HeartPulse',
  },
  {
    name: 'Media',
    description: 'Documents camp activities, handles live streaming, audio-visual support, photography, and recording of teaching sessions.',
    responsibilities: [
      'Audio & Video mixing during sessions',
      'Photography & camp highlights creation',
      'Live stream broadcasting & social updates',
    ],
    volunteersCount: 10,
    iconName: 'Video',
  },
  {
    name: 'Prayer',
    description: 'Coordinates morning prayer walks, intercessory watches, and prayer chains throughout the 7 days.',
    responsibilities: [
      'Lead 5:00 AM Prayer Walks',
      'Maintain 24/7 prayer chain watches',
      'Counsel & pray with participants',
    ],
    volunteersCount: 14,
    iconName: 'Flame',
  },
  {
    name: 'Music',
    description: 'Leads worship sessions, midnight praise, and creates a spirit-filled atmosphere for encounters.',
    responsibilities: [
      'Lead worship at Midnight Praise (11:00 PM)',
      'Lead song ministrations during 12:00 PM sessions',
      'Rehearsals and choir coordination',
    ],
    volunteersCount: 16,
    iconName: 'Music',
  },
  {
    name: 'Security',
    description: 'Ensures safety of participants, maintains premises accountability, and monitors access to TRH Church Hall.',
    responsibilities: [
      'Enforce 6:00 PM campus curfew entry',
      'Monitor vehicle & participant perimeter safety',
      'Prevent unauthorized access & lost property',
    ],
    volunteersCount: 9,
    iconName: 'ShieldCheck',
  },
  {
    name: 'Sanctuary',
    description: 'Oversees and maintains the cleanliness and readiness of the worship environment and sanitation facilities.',
    responsibilities: [
      'Ensure church hall is pristine before & after sessions',
      'Sanitation maintenance in coordination with ladies\' team',
      'Sanctuary setup & altar maintenance',
    ],
    volunteersCount: 11,
    iconName: 'Sparkles',
  },
  {
    name: 'Games & Recreation',
    description: 'Organizes approved activities that promote fellowship, unity, and healthy physical interaction during rest hours.',
    responsibilities: [
      'Plan afternoon fellowship games (5:00 PM)',
      'Team bonding icebreakers & Bible quizzes',
      'Organize sports & recreation safety',
    ],
    volunteersCount: 7,
    iconName: 'Trophy',
  },
  {
    name: 'Information Desk',
    description: 'Provides information, resolves attendee inquiries, handles general announcements, and assists lost and found.',
    responsibilities: [
      'Assist attendees with camp direction and inquiries',
      'Manage lost and found desk',
      'Coordinate announcements with Administration',
    ],
    volunteersCount: 6,
    iconName: 'HelpCircle',
  },
];

export const INITIAL_ATTENDEES: Attendee[] = [];

export const INITIAL_EXPECTATIONS: ExpectationPost[] = [];

/**
 * 4 MAJOR DAILY CAMP ACTIVITIES FOR ATTENDANCE TRACKING
 */
export const MAJOR_DAILY_ACTIVITIES: CampActivityDef[] = [
  {
    key: 'prayerWalk_5am',
    time: '5:00 AM',
    name: 'Prayer Walk',
    iconName: 'Footprints',
    description: '5:00 AM — Morning prayer walk surrounding the camp premises with intercession and worship.',
  },
  {
    key: 'teachingPrayer_12pm',
    time: '12:00 PM',
    name: 'Teaching & Prayer',
    iconName: 'BookOpen',
    description: '12:00 PM – 3:00 PM — Apostolic teaching, prophetic prayer, and corporate fast breaking.',
  },
  {
    key: 'bibleStudy_6pm',
    time: '6:00 PM',
    name: 'Bible Study',
    iconName: 'Users',
    description: '6:00 PM – 7:30 PM — Interactive Bible study groups on Evidence & Proof of Victory.',
  },
  {
    key: 'midnightWorship_11pm',
    time: '11:00 PM',
    name: 'Midnight Worship',
    iconName: 'Moon',
    description: '11:00 PM – 12:30 AM — High midnight worship, prophetic songs, and breaking of spiritual strongholds.',
  },
];

/**
 * 8-DAY CAMP TIMELINE (AUG 23 - AUG 30, 2026)
 */
export const CAMP_DAYS: CampDayDef[] = [
  { dayNumber: 1, dateStr: '2026-08-23', label: 'Day 1 — Sun, Aug 23 (Arrival & Opening)', isArrivalDay: true },
  { dayNumber: 2, dateStr: '2026-08-24', label: 'Day 2 — Mon, Aug 24' },
  { dayNumber: 3, dateStr: '2026-08-25', label: 'Day 3 — Tue, Aug 25' },
  { dayNumber: 4, dateStr: '2026-08-26', label: 'Day 4 — Wed, Aug 26' },
  { dayNumber: 5, dateStr: '2026-08-27', label: 'Day 5 — Thu, Aug 27' },
  { dayNumber: 6, dateStr: '2026-08-28', label: 'Day 6 — Fri, Aug 28' },
  { dayNumber: 7, dateStr: '2026-08-29', label: 'Day 7 — Sat, Aug 29' },
  { dayNumber: 8, dateStr: '2026-08-30', label: 'Day 8 — Sun, Aug 30 (Thanksgiving & Departure)', isDepartureDay: true },
];

