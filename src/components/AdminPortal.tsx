import React, { useState } from 'react';
import { Attendee, CommitteeName, PaymentStatus } from '../types';
import { CAMP_DETAILS } from '../data/campData';
import {
  ShieldAlert,
  Search,
  Download,
  CheckCircle2,
  Clock,
  UserPlus,
  Trash2,
  Eye,
  CreditCard,
  Users,
  Building2,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Lock,
  KeyRound,
  LogOut,
  UserCheck,
  Loader2,
  X,
  Baby,
} from 'lucide-react';

const ADMIN_USERNAMES = [
  'Senior & Founding Pastor',
  'Director, Church Administration',
  'Assistant Director, Church Administration',
  'Senate President',
  'Innovation & Technology Lead',
  'Camp Director',
];

interface AdminPortalProps {
  attendees: Attendee[];
  onUpdateAttendee: (updated: Attendee) => void;
  onDeleteAttendee: (id: string) => void;
  onAddAttendee: (newAttendee: Attendee) => void;
  onViewPass: (attendee: Attendee) => void;
  onNavigateHome?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  attendees,
  onUpdateAttendee,
  onDeleteAttendee,
  onAddAttendee,
  onViewPass,
  onNavigateHome,
}) => {
  const [authenticatedRole, setAuthenticatedRole] = useState<string | null>(() => {
    return localStorage.getItem('trh_camp_admin_role') || null;
  });

  const [selectedUsername, setSelectedUsername] = useState<string>(ADMIN_USERNAMES[0]);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Sign out confirmation modal state
  const [showSignOutModal, setShowSignOutModal] = useState<boolean>(false);

  // Notice when unauthorized role tries to delete
  const [deleteRestrictedNotice, setDeleteRestrictedNotice] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterSleepover, setFilterSleepover] = useState<string>('all');
  const [filterCheckIn, setFilterCheckIn] = useState<string>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [manualSurname, setManualSurname] = useState('');
  const [manualFirstName, setManualFirstName] = useState('');
  const [manualOtherNames, setManualOtherNames] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualGender, setManualGender] = useState<'Male' | 'Female'>('Male');
  const [manualDob, setManualDob] = useState('2000-01-01');
  const [manualIsMember, setManualIsMember] = useState(true);
  const [manualHowHeard, setManualHowHeard] = useState('Church Announcement');
  const [manualDept, setManualDept] = useState<CommitteeName>('Administration');
  const [manualStayEntire7Days, setManualStayEntire7Days] = useState(true);
  const [manualAttendingDays, setManualAttendingDays] = useState<string[]>([
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday Morning',
  ]);
  const [manualSleepOver, setManualSleepOver] = useState(true);
  const [manualHasMedical, setManualHasMedical] = useState(false);
  const [manualMedicalDetails, setManualMedicalDetails] = useState('');
  const [manualIsTakingMedication, setManualIsTakingMedication] = useState(false);
  const [manualMedicationDetails, setManualMedicationDetails] = useState('');
  const [manualEmergencyName, setManualEmergencyName] = useState('');
  const [manualEmergencyRelation, setManualEmergencyRelation] = useState('');
  const [manualEmergencyPhone, setManualEmergencyPhone] = useState('');
  const [manualPayment, setManualPayment] = useState<PaymentStatus>('Paid');
  const [manualReceiptRef, setManualReceiptRef] = useState('');
  const [manualHasChildren, setManualHasChildren] = useState(false);
  const [manualChildrenCount, setManualChildrenCount] = useState(1);
  const [manualChildrenAges, setManualChildrenAges] = useState('');
  const [manualExpectations, setManualExpectations] = useState('');

  const isTechLead = authenticatedRole === 'Innovation & Technology Lead';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: selectedUsername, password: passwordInput }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAuthenticatedRole(data.role);
        localStorage.setItem('trh_camp_admin_role', data.role);
        setPasswordInput('');
      } else {
        setLoginError(data.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err: any) {
      setLoginError('Server authentication error. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const confirmLogout = () => {
    setAuthenticatedRole(null);
    localStorage.removeItem('trh_camp_admin_role');
    setPasswordInput('');
    setLoginError(null);
    setShowSignOutModal(false);
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  const handleAttemptDelete = (id: string, name: string) => {
    if (!isTechLead) {
      setDeleteRestrictedNotice(
        `Permission Restricted: Only the "Innovation & Technology Lead" can delete records from the TRH Admin Registry.`
      );
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete registration for ${name}?`)) {
      onDeleteAttendee(id);
    }
  };

  // If not authenticated, render login form
  if (!authenticatedRole) {
    return (
      <div className="max-w-md mx-auto space-y-6 pb-12 pt-4">
        <div className="bg-[#1E293B] rounded-3xl p-6 sm:p-8 border-2 border-[#FF8A00]/40 shadow-2xl space-y-6 text-[#F8FAFC]">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#251464] border border-[#FF8A00]/40 flex items-center justify-center mx-auto text-[#FF8A00] shadow-lg">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC]">
              TRH Admin Registry Login
            </h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Restricted portal for authorized TRH Victory Camp administration & leadership officers.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#FF8A00]" /> Select Official Title / Username
              </label>
              <select
                value={selectedUsername}
                onChange={(e) => {
                  setSelectedUsername(e.target.value);
                  setLoginError(null);
                }}
                className="w-full px-4 py-3 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] text-xs sm:text-sm font-semibold focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] outline-none"
              >
                {ADMIN_USERNAMES.map((name) => (
                  <option key={name} value={name} className="bg-[#1E293B] text-[#F8FAFC]">
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#FF8A00]" /> Access Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setLoginError(null);
                }}
                placeholder="Enter assigned role password..."
                className="w-full px-4 py-3 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8] text-xs sm:text-sm focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 rounded-xl bg-[#FF8A00] hover:bg-[#E85B00] text-[#0F172A] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isAuthenticating ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0F172A]" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-[#0F172A]" />
              )}
              <span>{isAuthenticating ? 'Verifying Password...' : 'Authenticate & Access Registry'}</span>
            </button>
          </form>

          <div className="pt-3 border-t border-[#334155] text-center">
            <p className="text-[11px] text-[#94A3B8]">
              Authorized Official Passwords are provided strictly to designated TRH officers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Compute available departments dynamically from defaults + attendees
  const availableDepartments = Array.from(
    new Set([
      'Administration',
      'Protocol',
      'Media',
      'Hospitality',
      'Music',
      'Prayer',
      'Security',
      'Medical',
      'Sanctuary',
      'Games & Recreation',
      'Information Desk',
      'Other',
      ...attendees.map((a) => a.departmentInterest).filter((d): d is string => Boolean(d)),
    ])
  ).sort();

  // Stats calculation
  const totalCount = attendees.length;
  const paidCount = attendees.filter((a) => a.paymentStatus === 'Paid').length;
  const pendingCount = attendees.filter((a) => a.paymentStatus === 'Pending').length;
  const totalRevenue = paidCount * CAMP_DETAILS.fee;
  const sleepoverCount = attendees.filter((a) => a.sleepOver).length;
  const checkedInCount = attendees.filter((a) => a.isCheckedIn).length;
  const medicalCount = attendees.filter((a) => a.hasMedicalCondition).length;
  const totalChildrenCount = attendees.reduce((sum, a) => {
    if (a.hasChildren && typeof a.childrenCount === 'number' && a.childrenCount > 0) {
      return sum + a.childrenCount;
    }
    if (a.hasChildren && Array.isArray(a.childrenAges) && a.childrenAges.length > 0) {
      return sum + a.childrenAges.length;
    }
    return sum;
  }, 0);

  const filteredAttendees = attendees.filter((a) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      a.surname.toLowerCase().includes(query) ||
      a.firstName.toLowerCase().includes(query) ||
      a.regNumber.toLowerCase().includes(query) ||
      a.phone.includes(query);

    const matchesPayment = filterPayment === 'all' || a.paymentStatus === filterPayment;
    const matchesDept = filterDepartment === 'all' || a.departmentInterest === filterDepartment;
    const matchesSleep =
      filterSleepover === 'all' ||
      (filterSleepover === 'yes' ? a.sleepOver : !a.sleepOver);
    const matchesCheckIn =
      filterCheckIn === 'all' ||
      (filterCheckIn === 'checkedIn' ? a.isCheckedIn : !a.isCheckedIn);

    return matchesSearch && matchesPayment && matchesDept && matchesSleep && matchesCheckIn;
  });

  const handleTogglePayment = (attendee: Attendee) => {
    const newStatus: PaymentStatus = attendee.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
    const updated: Attendee = {
      ...attendee,
      paymentStatus: newStatus,
      paymentReceiptRef:
        newStatus === 'Paid'
          ? attendee.paymentReceiptRef || 'Verified by Admin'
          : '',
    };
    onUpdateAttendee(updated);
  };

  const handleToggleCheckIn = (attendee: Attendee) => {
    const newCheckedIn = !attendee.isCheckedIn;
    const updated: Attendee = {
      ...attendee,
      isCheckedIn: newCheckedIn,
      checkedInAt: newCheckedIn ? new Date().toISOString() : undefined,
    };
    onUpdateAttendee(updated);
  };

  const handleExportCSV = () => {
    const headers = [
      'Reg Number',
      'Surname',
      'First Name',
      'Gender',
      'Phone',
      'Member Status',
      'Committee',
      'Sleepover',
      'Payment Status',
      'Payment Ref',
      'Check-In Status',
      'Expectations',
    ];

    const rows = attendees.map((a) => [
      `"${a.regNumber}"`,
      `"${a.surname}"`,
      `"${a.firstName}"`,
      `"${a.gender}"`,
      `"${a.phone}"`,
      `"${a.isMember ? 'Member' : 'Visitor'}"`,
      `"${a.departmentInterest}"`,
      `"${a.sleepOver ? 'Yes' : 'No'}"`,
      `"${a.paymentStatus}"`,
      `"${a.paymentReceiptRef || ''}"`,
      `"${a.isCheckedIn ? 'Checked In' : 'Pending'}"`,
      `"${a.expectations.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TRH_Victory_Camp_Attendees_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSurname.trim() || !manualFirstName.trim() || !manualPhone.trim()) return;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newAtt: Attendee = {
      id: `att-manual-${Date.now()}`,
      regNumber: `TRH-2026-VC-${randomNum}`,
      surname: manualSurname.trim(),
      firstName: manualFirstName.trim(),
      otherNames: manualOtherNames.trim() || '',
      gender: manualGender,
      dob: manualDob || '2000-01-01',
      phone: manualPhone.trim(),
      whatsapp: manualPhone.trim(),
      email: manualEmail.trim() || '',
      address: manualAddress.trim() || 'Walk-in Registration Desk',
      isMember: manualIsMember,
      howHeard: !manualIsMember ? manualHowHeard : '',
      departmentInterest: manualDept,
      stayEntire7Days: manualStayEntire7Days,
      attendingDays: manualStayEntire7Days
        ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday Morning']
        : (manualAttendingDays.length > 0 ? manualAttendingDays : ['Sunday', 'Monday']),
      sleepOver: manualSleepOver,
      hasMedicalCondition: manualHasMedical,
      medicalDetails: manualHasMedical ? manualMedicalDetails : '',
      isTakingMedication: manualIsTakingMedication,
      medicationDetails: manualIsTakingMedication ? manualMedicationDetails : '',
      emergencyName: manualEmergencyName.trim() || 'Admin Desk',
      emergencyRelation: manualEmergencyRelation.trim() || 'Protocol',
      emergencyPhone: manualEmergencyPhone.trim() || manualPhone.trim(),
      paymentStatus: manualPayment,
      paymentReceiptRef: manualReceiptRef.trim() || (manualPayment === 'Paid' ? 'Cash at Desk' : ''),
      hasChildren: manualHasChildren,
      childrenCount: manualHasChildren ? manualChildrenCount : 0,
      childrenAges: manualHasChildren
        ? manualChildrenAges.split(',').map((s) => parseInt(s.trim())).filter((n) => !isNaN(n))
        : [],
      expectations: manualExpectations.trim() || 'Trusting God for supernatural victory during this camp.',
      commitmentsAgreed: true,
      declarationSigned: true,
      signatureName: `${manualSurname.trim()} ${manualFirstName.trim()}`,
      registeredAt: new Date().toISOString(),
      registeredBy: 'Admin Desk (Walk-in)',
    };

    onAddAttendee(newAtt);

    // Reset form
    setManualSurname('');
    setManualFirstName('');
    setManualOtherNames('');
    setManualPhone('');
    setManualEmail('');
    setManualAddress('');
    setManualMedicalDetails('');
    setManualMedicationDetails('');
    setManualEmergencyName('');
    setManualEmergencyRelation('');
    setManualEmergencyPhone('');
    setManualReceiptRef('');
    setManualExpectations('');
    setManualHasChildren(false);
    setManualChildrenCount(1);
    setManualChildrenAges('');
    setManualAttendingDays(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday Morning']);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Title Banner */}
      <div className="bg-[#251464] text-[#F8FAFC] rounded-3xl p-6 sm:p-8 border border-[#FF8A00]/40 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#FF8A00]" />
            <span className="text-xs font-mono text-[#FF8A00] font-bold uppercase tracking-wider">
              FOR OFFICIAL USE ONLY — CAMP ADMINISTRATION
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#FF8A00]/20 text-[#FF8A00] px-3 py-1 rounded-full text-xs font-mono font-bold border border-[#FF8A00]/30 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{authenticatedRole}</span>
            </span>
            <button
              onClick={() => setShowSignOutModal(true)}
              className="px-2.5 py-1 rounded-full bg-[#334155] hover:bg-red-950 text-[#F8FAFC] hover:text-red-300 border border-[#334155] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Sign out from Admin Registry"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
          Attendee Registry & Financial Verification
        </h2>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
          Manage registered camp participants, confirm ₦1,000 fee payments, monitor sleepover accommodation counts, track medical alerts, and export data.
        </p>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#E85B00] text-[#0F172A] font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow"
          >
            <UserPlus className="w-4 h-4 text-[#0F172A]" />
            <span>Add Walk-in Attendee</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#334155] hover:bg-[#0F172A] text-[#F8FAFC] font-semibold text-xs sm:text-sm flex items-center gap-2 border border-[#334155] cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-[#1E293B] rounded-2xl p-4 border border-[#334155] shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] font-bold">Total Registered</span>
          <p className="text-2xl font-black text-[#F8FAFC]">{totalCount}</p>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-4 border border-teal-500/30 shadow-sm space-y-1 bg-teal-950/20">
          <span className="text-[10px] font-mono uppercase text-teal-400 font-bold">Checked-In Pass</span>
          <p className="text-2xl font-black text-teal-400">{checkedInCount}</p>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-4 border border-emerald-500/30 shadow-sm space-y-1 bg-emerald-950/20">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Paid (₦1,000)</span>
          <p className="text-2xl font-black text-emerald-400">{paidCount}</p>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-4 border border-[#FF8A00]/30 shadow-sm space-y-1 bg-[#FF8A00]/10">
          <span className="text-[10px] font-mono uppercase text-[#FF8A00] font-bold">Pending Fee</span>
          <p className="text-2xl font-black text-[#FF8A00]">{pendingCount}</p>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-4 border border-[#334155] shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] font-bold">Total Revenue</span>
          <p className="text-xl font-extrabold text-[#F8FAFC] font-mono">₦{totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-4 border border-[#334155] shadow-sm space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] font-bold">Sleepover Count</span>
          <p className="text-2xl font-black text-[#FF8A00]">{sleepoverCount}</p>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-4 border border-purple-500/30 shadow-sm space-y-1 bg-purple-950/20">
          <span className="text-[10px] font-mono uppercase text-purple-400 font-bold flex items-center gap-1">
            <Baby className="w-3 h-3 text-purple-400 inline" /> Children (≤12)
          </span>
          <p className="text-2xl font-black text-purple-400">{totalChildrenCount}</p>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-4 border border-red-500/30 shadow-sm space-y-1 bg-red-950/20">
          <span className="text-[10px] font-mono uppercase text-red-400 font-bold">Medical Alerts</span>
          <p className="text-2xl font-black text-red-400">{medicalCount}</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#1E293B] p-4 rounded-2xl border border-[#334155] shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="relative sm:col-span-2 md:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, Reg No, or phone..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8] text-xs sm:text-sm focus:border-[#FF8A00] outline-none"
            />
          </div>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] text-xs font-medium focus:border-[#FF8A00] outline-none cursor-pointer"
          >
            <option value="all">Volunteer Dept: All</option>
            {availableDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={filterCheckIn}
            onChange={(e) => setFilterCheckIn(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] text-xs font-medium focus:border-[#FF8A00] outline-none cursor-pointer"
          >
            <option value="all">Pass Check-In: All</option>
            <option value="checkedIn">Checked In Only</option>
            <option value="pending">Pending Check-In</option>
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] text-xs font-medium focus:border-[#FF8A00] outline-none cursor-pointer"
          >
            <option value="all">Payment Fee: All</option>
            <option value="Paid">Paid Only</option>
            <option value="Pending">Pending Only</option>
          </select>

          <select
            value={filterSleepover}
            onChange={(e) => setFilterSleepover(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] text-xs font-medium focus:border-[#FF8A00] outline-none cursor-pointer"
          >
            <option value="all">Sleepover: All</option>
            <option value="yes">Sleepover Only</option>
            <option value="no">Commuters Only</option>
          </select>
        </div>
      </div>

      {/* Attendee Mobile Cards View (< lg screens) */}
      <div className="block lg:hidden space-y-3">
        {filteredAttendees.length === 0 ? (
          <div className="bg-[#1E293B] rounded-2xl p-8 text-center text-[#94A3B8] border border-[#334155] text-xs">
            No registered attendees match the current search or filter criteria.
          </div>
        ) : (
          filteredAttendees.map((att) => (
            <div
              key={att.id}
              className="bg-[#1E293B] rounded-2xl p-4 border border-[#334155] shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#334155]/60 pb-2.5">
                <div>
                  <span className="font-mono font-bold text-xs text-[#FF8A00] block">{att.regNumber}</span>
                  <h4 className="font-bold text-sm text-[#F8FAFC] flex items-center flex-wrap gap-1">
                    <span>{att.surname}, {att.firstName}</span>
                    {att.hasMedicalCondition && (
                      <span className="px-1.5 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-500/40 text-[9px] font-mono font-bold">
                        Medical
                      </span>
                    )}
                    {(att.hasChildren || (att.childrenCount && att.childrenCount > 0)) && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-500/40 text-[9px] font-mono font-bold inline-flex items-center gap-0.5">
                        <Baby className="w-2.5 h-2.5 text-purple-300" />
                        {att.childrenCount || (att.childrenAges ? att.childrenAges.length : 1)} Kid{(att.childrenCount > 1 || (att.childrenAges && att.childrenAges.length > 1)) ? 's' : ''}
                      </span>
                    )}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onViewPass(att)}
                    className="p-2 rounded-xl bg-[#334155] hover:bg-[#0F172A] text-[#F8FAFC] cursor-pointer"
                    title="View Pass"
                  >
                    <Eye className="w-4 h-4 text-[#FF8A00]" />
                  </button>
                  <button
                    onClick={() => handleAttemptDelete(att.id, `${att.surname}, ${att.firstName}`)}
                    className={`p-2 rounded-xl border cursor-pointer transition-colors ${
                      isTechLead
                        ? 'bg-red-950 hover:bg-red-900 text-red-400 border-red-500/40'
                        : 'bg-[#334155]/60 text-[#94A3B8] border-[#334155]'
                    }`}
                    title={
                      isTechLead
                        ? 'Delete Record'
                        : 'Delete restricted'
                    }
                  >
                    {isTechLead ? <Trash2 className="w-4 h-4" /> : <Lock className="w-4 h-4 text-[#94A3B8]" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Phone</span>
                  <span className="font-mono font-medium text-[#F8FAFC]">{att.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Volunteer Dept</span>
                  <span className="font-semibold text-[#FF8A00]">{att.departmentInterest || 'None'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Sleepover</span>
                  <span className="font-medium text-[#F8FAFC]">{att.sleepOver ? 'Yes (Lodging)' : 'No (Commuter)'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Gender</span>
                  <span className="font-medium text-[#F8FAFC]">{att.gender}</span>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap gap-2 border-t border-[#334155]/60">
                <button
                  onClick={() => handleTogglePayment(att)}
                  className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    att.paymentStatus === 'Paid'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40'
                  }`}
                >
                  {att.paymentStatus === 'Paid' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fee Paid (₦1k)
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-[#FF8A00]" /> Fee Pending
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleToggleCheckIn(att)}
                  className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    att.isCheckedIn
                      ? 'bg-teal-950 text-teal-300 border border-teal-500/40'
                      : 'bg-[#334155] text-[#94A3B8] border border-[#334155]'
                  }`}
                >
                  {att.isCheckedIn ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-teal-400" /> Checked In
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-[#94A3B8]" /> Check-In Pending
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Attendee Desktop Data Table (>= lg screens) */}
      <div className="hidden lg:block bg-[#1E293B] rounded-3xl border border-[#334155] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#251464] text-[#FF8A00] uppercase font-mono tracking-wider border-b border-[#334155]">
                <th className="p-3.5 font-bold">Reg Number</th>
                <th className="p-3.5 font-bold">Participant Name</th>
                <th className="p-3.5 font-bold">Phone / WhatsApp</th>
                <th className="p-3.5 font-bold">Volunteer Dept</th>
                <th className="p-3.5 font-bold">Sleepover</th>
                <th className="p-3.5 font-bold">Payment</th>
                <th className="p-3.5 font-bold">Pass Check-In</th>
                <th className="p-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155] font-medium text-[#F8FAFC]">
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#94A3B8]">
                    No registered attendees match the current search criteria.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((att) => (
                  <tr key={att.id} className="hover:bg-[#334155]/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#FF8A00]">{att.regNumber}</td>
                    <td className="p-3.5 font-bold text-[#F8FAFC]">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span>{att.surname}, {att.firstName}</span>
                        {att.hasMedicalCondition && (
                          <span className="px-1.5 py-0.2 rounded bg-red-900/60 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold">
                            Medical
                          </span>
                        )}
                        {(att.hasChildren || (att.childrenCount && att.childrenCount > 0)) && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold inline-flex items-center gap-1" title={Array.isArray(att.childrenAges) ? `Ages: ${att.childrenAges.join(', ')}` : undefined}>
                            <Baby className="w-3 h-3 text-purple-300" />
                            {att.childrenCount || (att.childrenAges ? att.childrenAges.length : 1)} Kid{(att.childrenCount > 1 || (att.childrenAges && att.childrenAges.length > 1)) ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[#94A3B8]">{att.phone}</td>
                    <td className="p-3.5 font-semibold text-[#F8FAFC]">{att.departmentInterest}</td>
                    <td className="p-3.5">
                      {att.sleepOver ? (
                        <span className="bg-[#251464] text-[#FF8A00] px-2 py-0.5 rounded font-bold text-[10px] border border-[#FF8A00]/30">
                          Yes
                        </span>
                      ) : (
                        <span className="bg-[#334155] text-[#94A3B8] px-2 py-0.5 rounded text-[10px]">
                          No
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleTogglePayment(att)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all ${
                          att.paymentStatus === 'Paid'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40 hover:bg-[#FF8A00]/30'
                        }`}
                        title="Click to toggle Paid/Pending"
                      >
                        {att.paymentStatus === 'Paid' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Paid
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-[#FF8A00]" /> Pending
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleCheckIn(att)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all ${
                          att.isCheckedIn
                            ? 'bg-teal-950 text-teal-300 border border-teal-500/40'
                            : 'bg-[#334155] text-[#94A3B8] border border-[#334155] hover:bg-teal-950 hover:text-teal-300'
                        }`}
                        title="Click to toggle Check-In Status"
                      >
                        {att.isCheckedIn ? (
                          <>
                            <UserCheck className="w-3 h-3 text-teal-400" /> Checked In
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-[#94A3B8]" /> Pending Check-In
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => onViewPass(att)}
                        className="p-1.5 rounded-lg bg-[#334155] hover:bg-[#0F172A] text-[#F8FAFC] cursor-pointer"
                        title="View Pass"
                      >
                        <Eye className="w-4 h-4 text-[#FF8A00]" />
                      </button>
                      <button
                        onClick={() => handleAttemptDelete(att.id, `${att.surname}, ${att.firstName}`)}
                        className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                          isTechLead
                            ? 'bg-red-950 hover:bg-red-900 text-red-400 border-red-500/40'
                            : 'bg-[#334155]/60 hover:bg-[#334155] text-[#94A3B8] border-[#334155]'
                        }`}
                        title={
                          isTechLead
                            ? 'Delete Record (Tech Lead Only)'
                            : 'Delete restricted to Innovation & Technology Lead'
                        }
                      >
                        {isTechLead ? <Trash2 className="w-4 h-4" /> : <Lock className="w-4 h-4 text-[#94A3B8]" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restricted Delete Notice Modal */}
      {deleteRestrictedNotice && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-3xl p-6 max-w-md w-full space-y-4 border-2 border-red-500/40 shadow-2xl text-[#F8FAFC]">
            <div className="flex items-center gap-3 text-red-400 border-b border-[#334155] pb-3">
              <ShieldAlert className="w-6 h-6 shrink-0 text-red-400" />
              <h3 className="font-extrabold text-base">Restricted Permission Action</h3>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              {deleteRestrictedNotice}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDeleteRestrictedNotice(null)}
                className="px-4 py-2 rounded-xl bg-[#334155] hover:bg-[#0F172A] text-[#F8FAFC] text-xs font-bold border border-[#334155] cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 border-2 border-[#FF8A00]/40 shadow-2xl text-[#F8FAFC]">
            <div className="flex items-center gap-3 border-b border-[#334155] pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#F8FAFC]">Confirm Admin Sign Out</h3>
                <p className="text-[11px] text-[#94A3B8]">TRH Victory Camp Official Registry</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              Are you sure you want to sign out as <strong className="text-[#FF8A00]">{authenticatedRole}</strong>? Signing out will end your admin session and redirect you to the main homepage.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Yes, Sign Out & Go Home</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Walk-in Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleManualAddSubmit}
            className="bg-[#1E293B] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#FF8A00]/40 text-[#F8FAFC]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#334155] pb-4 shrink-0">
              <h3 className="font-extrabold text-[#F8FAFC] text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#FF8A00]" />
                Add Walk-in Registered Participant
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg bg-[#334155] hover:bg-[#0F172A] text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Fields */}
            <div className="overflow-y-auto py-4 space-y-5 pr-2 custom-scrollbar text-xs sm:text-sm">
              {/* Section 1: Personal Identification */}
              <div className="space-y-3 bg-[#0F172A] p-4 rounded-2xl border border-[#334155]">
                <h4 className="text-xs font-mono uppercase font-bold text-[#FF8A00] tracking-wider">
                  1. Personal Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Surname *
                    </label>
                    <input
                      type="text"
                      value={manualSurname}
                      onChange={(e) => setManualSurname(e.target.value)}
                      placeholder="e.g. Adeola"
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={manualFirstName}
                      onChange={(e) => setManualFirstName(e.target.value)}
                      placeholder="e.g. Simon"
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Other Names
                    </label>
                    <input
                      type="text"
                      value={manualOtherNames}
                      onChange={(e) => setManualOtherNames(e.target.value)}
                      placeholder="e.g. Priestley"
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Gender Category *
                    </label>
                    <select
                      value={manualGender}
                      onChange={(e) => setManualGender(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC]"
                    >
                      <option value="Male">Male (Brother)</option>
                      <option value="Female">Female (Sister)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={manualDob}
                      onChange={(e) => setManualDob(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <div className="space-y-3 bg-[#0F172A] p-4 rounded-2xl border border-[#334155]">
                <h4 className="text-xs font-mono uppercase font-bold text-[#FF8A00] tracking-wider">
                  2. Contact Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="+2348011223344"
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      placeholder="grace@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Residential address..."
                    className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8]"
                  />
                </div>
              </div>

              {/* Section 3: Membership & Committee */}
              <div className="space-y-3 bg-[#0F172A] p-4 rounded-2xl border border-[#334155]">
                <h4 className="text-xs font-mono uppercase font-bold text-[#FF8A00] tracking-wider">
                  3. Church & Volunteer Service
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      TRH Church Member?
                    </label>
                    <select
                      value={manualIsMember ? 'yes' : 'no'}
                      onChange={(e) => setManualIsMember(e.target.value === 'yes')}
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC]"
                    >
                      <option value="yes">Yes, I am a TRH Member</option>
                      <option value="no">No, First-time Visitor / Guest</option>
                    </select>
                  </div>

                  {!manualIsMember && (
                    <div>
                      <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                        How Did You Hear About Camp?
                      </label>
                      <select
                        value={manualHowHeard}
                        onChange={(e) => setManualHowHeard(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC]"
                      >
                        <option value="Church Announcement">Church Announcement</option>
                        <option value="Social Media (Instagram / Facebook / X / YouTube)">Social Media (Instagram / Facebook / X / YouTube)</option>
                        <option value="Invited by a Friend / Family Member">Invited by a Friend / Family Member</option>
                        <option value="Flier / Poster / Banner">Flier / Poster / Banner</option>
                        <option value="Website / Online Search">Website / Online Search</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Committee Volunteer Interest
                    </label>
                    <select
                      value={manualDept}
                      onChange={(e) => setManualDept(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC]"
                    >
                      <option value="Administration">Administration</option>
                      <option value="Protocol">Protocol</option>
                      <option value="Media">Media</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Music">Music</option>
                      <option value="Prayer">Prayer</option>
                      <option value="Security">Security</option>
                      <option value="Medical">Medical</option>
                      <option value="Sanctuary">Sanctuary</option>
                      <option value="Games & Recreation">Games & Recreation</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Accommodation & Attendance */}
              <div className="space-y-3 bg-[#0F172A] p-4 rounded-2xl border border-[#334155]">
                <h4 className="text-xs font-mono uppercase font-bold text-[#FF8A00] tracking-wider">
                  4. Accommodation & Attendance
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Attendance Duration
                    </label>
                    <select
                      value={manualStayEntire7Days ? 'entire' : 'partial'}
                      onChange={(e) => setManualStayEntire7Days(e.target.value === 'entire')}
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC]"
                    >
                      <option value="entire">Staying All 7 Days (23rd-30th Aug)</option>
                      <option value="partial">Attending Selected Days Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Sleepover Accommodation
                    </label>
                    <select
                      value={manualSleepOver ? 'yes' : 'no'}
                      onChange={(e) => setManualSleepOver(e.target.value === 'yes')}
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC]"
                    >
                      <option value="yes">Yes (Sleeping at Camp Venue)</option>
                      <option value="no">No (Day Participant / Commuter)</option>
                    </select>
                  </div>
                </div>

                {!manualStayEntire7Days && (
                  <div className="space-y-2 p-3 rounded-xl bg-[#1E293B] border border-[#334155]">
                    <label className="text-[11px] font-bold text-[#FF8A00] uppercase tracking-wider block">
                      Select Specific Days Attending:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {[
                        'Sunday',
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday Morning',
                      ].map((day) => {
                        const isSel = manualAttendingDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              if (isSel) {
                                setManualAttendingDays(manualAttendingDays.filter((d) => d !== day));
                              } else {
                                setManualAttendingDays([...manualAttendingDays, day]);
                              }
                            }}
                            className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer ${
                              isSel
                                ? 'bg-[#FF8A00] text-[#0F172A] font-extrabold border-[#FF8A00]'
                                : 'bg-[#334155] text-[#94A3B8] border-[#334155]'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 5: Children & Dependents */}
              <div className="space-y-3 bg-[#0F172A] p-4 rounded-2xl border border-[#334155]">
                <h4 className="text-xs font-mono uppercase font-bold text-[#FF8A00] tracking-wider flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-[#FF8A00]" /> 5. Children & Dependents (Aged ≤12)
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Bringing Children to Camp?
                    </label>
                    <select
                      value={manualHasChildren ? 'yes' : 'no'}
                      onChange={(e) => setManualHasChildren(e.target.value === 'yes')}
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC]"
                    >
                      <option value="no">No Children Accompanied</option>
                      <option value="yes">Yes, Accompanied by Children</option>
                    </select>
                  </div>

                  {manualHasChildren && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                          Number of Children (1 to 5)
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setManualChildrenCount(num)}
                              className={`w-9 h-9 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                manualChildrenCount === num
                                  ? 'bg-[#FF8A00] text-[#0F172A] border-[#FF8A00] font-black'
                                  : 'bg-[#334155] text-[#94A3B8] border border-[#334155]'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                          Children Ages (Comma Separated, e.g. 4, 7, 10)
                        </label>
                        <input
                          type="text"
                          value={manualChildrenAges}
                          onChange={(e) => setManualChildrenAges(e.target.value)}
                          placeholder="e.g. 4, 7, 10"
                          className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8] text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 6: Medical & Emergency */}
              <div className="space-y-3 bg-[#0F172A] p-4 rounded-2xl border border-[#334155]">
                <h4 className="text-xs font-mono uppercase font-bold text-[#FF8A00] tracking-wider">
                  6. Medical & Emergency Contact
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Has Medical Condition?
                    </label>
                    <select
                      value={manualHasMedical ? 'yes' : 'no'}
                      onChange={(e) => setManualHasMedical(e.target.value === 'yes')}
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC]"
                    >
                      <option value="no">No Known Condition</option>
                      <option value="yes">Yes (Provide Details Below)</option>
                    </select>
                  </div>

                  {manualHasMedical && (
                    <div>
                      <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                        Medical Condition Details
                      </label>
                      <input
                        type="text"
                        value={manualMedicalDetails}
                        onChange={(e) => setManualMedicalDetails(e.target.value)}
                        placeholder="e.g. Asthma, Allergies"
                        className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8]"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      value={manualEmergencyName}
                      onChange={(e) => setManualEmergencyName(e.target.value)}
                      placeholder="e.g. Adeola Simon"
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={manualEmergencyRelation}
                      onChange={(e) => setManualEmergencyRelation(e.target.value)}
                      placeholder="Parent / Spouse / Sibling"
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Emergency Phone
                    </label>
                    <input
                      type="tel"
                      value={manualEmergencyPhone}
                      onChange={(e) => setManualEmergencyPhone(e.target.value)}
                      placeholder="+2348000000000"
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 7: Payment Details */}
              <div className="space-y-3 bg-[#0F172A] p-4 rounded-2xl border border-[#334155]">
                <h4 className="text-xs font-mono uppercase font-bold text-[#FF8A00] tracking-wider">
                  7. Payment Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Payment Status *
                    </label>
                    <select
                      value={manualPayment}
                      onChange={(e) => setManualPayment(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] font-semibold"
                    >
                      <option value="Paid">Paid (₦1,000 Verified)</option>
                      <option value="Pending">Pending Payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#94A3B8] uppercase block mb-1">
                      Payment Receipt Ref / Note
                    </label>
                    <input
                      type="text"
                      value={manualReceiptRef}
                      onChange={(e) => setManualReceiptRef(e.target.value)}
                      placeholder="e.g. Cash at Protocol Desk / Bank Transfer Ref"
                      className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 8: Faith Expectations */}
              <div className="space-y-3 bg-[#0F172A] p-4 rounded-2xl border border-[#334155]">
                <h4 className="text-xs font-mono uppercase font-bold text-[#FF8A00] tracking-wider">
                  8. Faith Expectations for Victory Camp
                </h4>

                <div>
                  <textarea
                    rows={2}
                    value={manualExpectations}
                    onChange={(e) => setManualExpectations(e.target.value)}
                    placeholder="Enter spiritual expectations / prayer targets for camp..."
                    className="w-full p-3 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#334155] shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#E85B00] text-[#0F172A] text-xs font-extrabold cursor-pointer shadow-lg"
              >
                Save Walk-in Registration
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
