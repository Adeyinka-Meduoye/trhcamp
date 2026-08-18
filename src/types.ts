export type Gender = 'Male' | 'Female';

export type PaymentStatus = 'Paid' | 'Pending';

export type CommitteeName =
  | 'Administration'
  | 'Protocol'
  | 'Media'
  | 'Hospitality'
  | 'Music'
  | 'Prayer'
  | 'Security'
  | 'Medical'
  | 'Sanctuary'
  | 'Games & Recreation'
  | 'Information Desk'
  | 'Other';

export interface ChildInfo {
  id: string;
  age: string;
}

export interface Attendee {
  id: string;
  regNumber: string;
  surname: string;
  firstName: string;
  otherNames?: string;
  gender: Gender;
  dob: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  
  isMember: boolean;
  howHeard?: string;
  departmentInterest: CommitteeName;
  
  stayEntire7Days: boolean;
  attendingDays: string[];
  sleepOver: boolean;
  
  hasMedicalCondition: boolean;
  medicalDetails?: string;
  isTakingMedication: boolean;
  medicationDetails?: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  
  paymentStatus: PaymentStatus;
  paymentReceiptRef?: string;
  
  hasChildren: boolean;
  childrenCount: number;
  childrenAges: string[];
  
  expectations: string;
  
  commitmentsAgreed: boolean;
  declarationSigned: boolean;
  signatureName: string;
  registeredAt: string;
  registeredBy?: string;
  isCheckedIn?: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  dailyAttendance?: Record<string, {
    marked: boolean;
    markedAt?: string;
    markedBy?: string;
  }>;
}

export interface DailyAttendanceRecord {
  marked: boolean;
  markedAt?: string;
  markedBy?: string;
}

export interface CampActivityDef {
  key: string;
  time: string;
  name: string;
  iconName: string;
  description: string;
}

export interface CampDayDef {
  dayNumber: number;
  dateStr: string;
  label: string;
  isArrivalDay?: boolean;
  isDepartureDay?: boolean;
  activitiesNote?: string;
  activities?: CampActivityDef[];
}

export interface ScheduleItem {
  id: string;
  time: string;
  activity: string;
  category: 'prayer' | 'teaching' | 'fellowship' | 'rest' | 'fasting' | 'study' | 'worship';
  description: string;
  highlight?: string;
}

export interface CommitteeInfo {
  name: CommitteeName;
  description: string;
  responsibilities: string[];
  teamLead?: string;
  volunteersCount: number;
  iconName: string;
}

export interface ExpectationPost {
  id: string;
  authorName: string;
  actualAuthorName?: string;
  isAnonymous: boolean;
  category: 'Spiritual Growth' | 'Healing & Health' | 'Breakthrough' | 'Family & Relationships' | 'Ministry & Service' | 'Financial & Career' | 'General';
  message: string;
  amenCount: number;
  createdAt: string;
  visibility?: 'public' | 'private';
}

export interface AdminUser {
  id: string;
  fullName: string;
  username: string; // Login ID
  password: string;
  role: string;
  isSuperAdmin?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  notes?: string;
  createdBy?: string;
}


