import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Attendee, CommitteeName, Gender, PaymentStatus, ExpectationPost } from '../types';
import { CAMP_DETAILS, isRegistrationClosed, REGISTRATION_CLOSURE_DATE } from '../data/campData';
import { saveAttendeeToFirestore, saveExpectationToFirestore } from '../lib/firebase';
import confetti from 'canvas-confetti';
import {
  User,
  Church,
  Calendar,
  HeartPulse,
  CreditCard,
  Baby,
  Flame,
  CheckSquare,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface RegistrationFormProps {
  onSuccess: (attendee: Attendee) => void;
  existingAttendee?: Attendee | null;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSuccess,
}) => {
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [surname, setSurname] = useState('');
  const [firstName, setFirstName] = useState('');
  const [otherNames, setOtherNames] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Section B
  const [isMember, setIsMember] = useState<boolean>(true);
  const [howHeard, setHowHeard] = useState<string>('');
  const [departmentInterest, setDepartmentInterest] = useState<CommitteeName>('Administration');

  // Section C
  const [stayEntire7Days, setStayEntire7Days] = useState<boolean>(true);
  const [attendingDays, setAttendingDays] = useState<string[]>([
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday Morning',
  ]);
  const [sleepOver, setSleepOver] = useState<boolean>(true);

  // Section D
  const [hasMedicalCondition, setHasMedicalCondition] = useState<boolean>(false);
  const [medicalDetails, setMedicalDetails] = useState('');
  const [isTakingMedication, setIsTakingMedication] = useState<boolean>(false);
  const [medicationDetails, setMedicationDetails] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Section E
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
  const [paymentReceiptRef, setPaymentReceiptRef] = useState('');

  // Section F
  const [hasChildren, setHasChildren] = useState<boolean>(false);
  const [childrenCount, setChildrenCount] = useState<number>(1);
  const [childrenAges, setChildrenAges] = useState<string[]>(['']);

  // Section G
  const [expectations, setExpectations] = useState('');

  // Section H
  const [commitments, setCommitments] = useState({
    participateFully: true,
    observeRules: true,
    respectLeadership: true,
    maintainDiscipline: true,
    keepClean: true,
    notifyEmergency: true,
  });
  const [declarationSigned, setDeclarationSigned] = useState(true);
  const [signatureName, setSignatureName] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const daysOptions = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday Morning (Close out)',
  ];

  const handleDayToggle = (day: string) => {
    if (attendingDays.includes(day)) {
      setAttendingDays(attendingDays.filter((d) => d !== day));
    } else {
      setAttendingDays([...attendingDays, day]);
    }
  };

  const handleChildrenCountChange = (count: number) => {
    setChildrenCount(count);
    const newAges = Array.from({ length: count }, (_, i) => childrenAges[i] || '');
    setChildrenAges(newAges);
  };

  const handleChildAgeChange = (index: number, ageVal: string) => {
    const newAges = [...childrenAges];
    newAges[index] = ageVal;
    setChildrenAges(newAges);
  };

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateCurrentSection = (): boolean => {
    setFormError(null);
    if (currentSection === 1) {
      if (!surname.trim() || !firstName.trim() || !dob || !phone.trim() || !email.trim() || !address.trim()) {
        setFormError('Please fill out all required fields in Personal Information (Surname, First Name, Date of Birth, Phone, Email Address, Address).');
        return false;
      }
      const userAge = calculateAge(dob);
      if (userAge <= 12) {
        setFormError('Participants 12 years of age and below cannot fill an independent registration form. Children (12 and below) must be registered by a parent/guardian under Section F (Children & Dependents).');
        return false;
      }
    } else if (currentSection === 2) {
      if (!isMember && !howHeard.trim()) {
        setFormError('Please indicate how you heard about the camp.');
        return false;
      }
    } else if (currentSection === 3) {
      if (!stayEntire7Days && attendingDays.length === 0) {
        setFormError('Please select at least one day you will attend.');
        return false;
      }
    } else if (currentSection === 4) {
      if (!emergencyName.trim() || !emergencyRelation.trim() || !emergencyPhone.trim()) {
        setFormError('Please provide complete emergency contact details.');
        return false;
      }
      if (hasMedicalCondition && !medicalDetails.trim()) {
        setFormError('Please specify your medical condition details.');
        return false;
      }
    } else if (currentSection === 5) {
      // Payment section
      if (paymentStatus === 'Paid' && !paymentReceiptRef.trim()) {
        setFormError('Please enter your payment reference / receipt number or bank transfer note.');
        return false;
      }
    } else if (currentSection === 6) {
      if (hasChildren && childrenAges.some((a) => !a.trim())) {
        setFormError('Please enter the age for each child.');
        return false;
      }
    } else if (currentSection === 7) {
      // Expectations is now optional - participants can share anonymously or skip
      return true;
    } else if (currentSection === 8) {
      const allChecked = Object.values(commitments).every(Boolean);
      if (!allChecked || !declarationSigned || !signatureName.trim()) {
        setFormError('Please agree to all camp commitments and sign the declaration to proceed.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentSection()) {
      if (currentSection < 8) {
        setCurrentSection(currentSection + 1);
        window.scrollTo({ top: 100, behavior: 'smooth' });
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrev = () => {
    setFormError(null);
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedRegNum = `TRH-2026-VC-${randomNum}`;

    const newAttendee: Attendee = {
      id: `att-${Date.now()}`,
      regNumber: generatedRegNum,
      surname: surname.trim(),
      firstName: firstName.trim(),
      otherNames: otherNames.trim() || '',
      gender,
      dob: dob || '2000-01-01',
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      email: email.trim() || '',
      address: address.trim(),

      isMember,
      howHeard: !isMember ? howHeard : '',
      departmentInterest,

      stayEntire7Days,
      attendingDays: stayEntire7Days ? daysOptions : attendingDays,
      sleepOver,

      hasMedicalCondition,
      medicalDetails: hasMedicalCondition ? medicalDetails : '',
      isTakingMedication,
      medicationDetails: isTakingMedication ? medicationDetails : '',
      emergencyName: emergencyName.trim(),
      emergencyRelation: emergencyRelation.trim(),
      emergencyPhone: emergencyPhone.trim(),

      paymentStatus,
      paymentReceiptRef: paymentReceiptRef.trim() || '',

      hasChildren,
      childrenCount: hasChildren ? childrenCount : 0,
      childrenAges: hasChildren ? childrenAges : [],

      expectations: expectations.trim(),

      commitmentsAgreed: Object.values(commitments).every(Boolean),
      declarationSigned: true,
      signatureName: signatureName.trim() || `${firstName} ${surname}`,
      registeredAt: new Date().toISOString(),
      registeredBy: 'Self',
    };

    try {
      // 1. Save Attendee to Firestore DB
      await saveAttendeeToFirestore(newAttendee);

      // 2. Save Expectation Post to Firestore DB if provided
      if (expectations.trim()) {
        const expectationPost: ExpectationPost = {
          id: `exp-${Date.now()}`,
          authorName: `${firstName.trim()} ${surname.trim().charAt(0)}.`,
          isAnonymous: false,
          category: 'Breakthrough',
          message: expectations.trim(),
          amenCount: 1,
          createdAt: new Date().toISOString(),
        };
        await saveExpectationToFirestore(expectationPost).catch((err) =>
          console.error('Expectation save error:', err)
        );
      }

      // 3. Automatically send Digital Pass to attendee email via Gmail SMTP
      if (email.trim()) {
        try {
          const emailRes = await fetch('/api/send-pass', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attendee: newAttendee }),
          });
          const contentType = emailRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const emailData = await emailRes.json();
            if (emailData.simulated) {
              console.info('[Email Notice]', emailData.message);
            } else if (emailData.success) {
              console.log('[Email Dispatched]', emailData.message);
            } else {
              console.error('[Email Dispatch Error]', emailData.error);
            }
          } else {
            const textErr = await emailRes.text();
            console.error('[Email Server Error]', emailRes.status, textErr.slice(0, 150));
          }
        } catch (err) {
          console.error('Auto send email error:', err);
        }
      }
    } catch (err) {
      console.error('Error persisting attendee to Firestore:', err);
    }

    // Trigger celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if confetti fails
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(newAttendee);
    }, 600);
  };

  const sectionHeaders = [
    { step: 1, title: 'Personal Information', icon: User },
    { step: 2, title: 'Church & Volunteer', icon: Church },
    { step: 3, title: 'Camp Participation', icon: Calendar },
    { step: 4, title: 'Medical & Emergency', icon: HeartPulse },
    { step: 5, title: 'Payment (₦1,000)', icon: CreditCard },
    { step: 6, title: 'Children & Dependents', icon: Baby },
    { step: 7, title: 'Faith Expectations', icon: Flame },
    { step: 8, title: 'Commitment & Sign', icon: CheckSquare },
  ];

  if (isRegistrationClosed()) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="bg-[#1E293B] text-[#F8FAFC] rounded-3xl p-8 sm:p-10 border-2 border-[#FF8A00] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-[#FF8A00]" />
          </div>

          <div className="space-y-2">
            <span className="bg-[#FF8A00]/20 text-[#FF8A00] px-3 py-1 rounded-full text-xs font-mono font-bold border border-[#FF8A00]/30 uppercase tracking-widest">
              Registration Window Ended
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
              Online Registration Is Now Closed
            </h2>
            <p className="text-sm text-[#94A3B8] max-w-lg mx-auto leading-relaxed">
              Online registration automatically closed on <span className="text-[#FF8A00] font-bold">16th August 2026</span> (1 week prior to TRH Victory Camp 2026 launch date).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#334155] text-xs text-[#94A3B8] space-y-2 text-left">
            <p className="font-semibold text-[#F8FAFC]">Need On-Site Registration or Assistance?</p>
            <p>
              Please report directly to the <span className="text-[#FF8A00] font-semibold">TRH Protocol & Admin Desk</span> at the church premises ({CAMP_DETAILS.venue}) during camp arrival.
            </p>
            <div className="pt-2 border-t border-[#334155] text-[11px] text-[#94A3B8] font-mono">
              💡 <span className="font-bold text-[#FF8A00]">Developer / Administrator Note:</span> To reopen or adjust the registration deadline, edit <code className="bg-[#1E293B] px-1.5 py-0.5 rounded text-[#F8FAFC]">REGISTRATION_CLOSURE_DATE</code> or set <code className="bg-[#1E293B] px-1.5 py-0.5 rounded text-[#F8FAFC]">IS_REGISTRATION_MANUALLY_OVERRIDDEN = true</code> in <code className="text-[#FF8A00]">/src/data/campData.ts</code>.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Title Header */}
      <div className="bg-[#251464] text-[#F8FAFC] rounded-3xl p-6 sm:p-8 border border-[#FF8A00]/30 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="bg-[#FF8A00]/20 text-[#FF8A00] px-3 py-1 rounded-full text-xs font-mono font-bold border border-[#FF8A00]/30">
            OFFICIAL REGISTRATION FORM
          </span>
          <span className="text-xs text-[#FF8A00] font-mono">
            Fee: {CAMP_DETAILS.feeDisplay} • Closes 1 Week Before Camp
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          TRH Victory Camp Registration
        </h2>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Please complete all sections below accurately to confirm your participation in the 7-day consecration retreat.
        </p>

        {/* Step Progress Bar */}
        <div className="pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-[#FF8A00]">
            <span>Section {currentSection} of 8: {sectionHeaders[currentSection - 1].title}</span>
            <span className="font-mono">{Math.round((currentSection / 8) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-[#0F172A] rounded-full h-2 overflow-hidden border border-[#334155]">
            <div
              className="bg-gradient-to-r from-[#FF8A00] to-[#E85B00] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentSection / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Stepper Tabs */}
        <div className="hidden sm:flex items-center justify-between gap-1 pt-2 overflow-x-auto">
          {sectionHeaders.map((sec) => {
            const Icon = sec.icon;
            const isDone = sec.step < currentSection;
            const isCurrent = sec.step === currentSection;
            return (
              <button
                key={sec.step}
                onClick={() => {
                  if (sec.step <= currentSection || validateCurrentSection()) {
                    setCurrentSection(sec.step);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#FF8A00] text-[#0F172A] font-extrabold'
                    : isDone
                    ? 'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30'
                    : 'bg-[#0F172A] text-[#94A3B8]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.step}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {formError && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg animate-shake">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* Form Card Content */}
      <div className="bg-[#1E293B] rounded-3xl p-6 sm:p-10 border border-[#334155] shadow-md space-y-8">
        {/* SECTION A: PERSONAL INFORMATION */}
        {currentSection === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#334155] pb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                <User className="w-5 h-5 text-[#FF8A00]" />
                SECTION A: PERSONAL INFORMATION
              </h3>
              <span className="text-xs text-[#FF8A00] font-semibold uppercase">Step 1 / 8</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Surname <span className="text-[#E85B00]">*</span>
                </label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="e.g. Adeola"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#334155] border border-[#334155] focus:border-[#FF8A00] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  First Name <span className="text-[#E85B00]">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Simon"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#334155] border border-[#334155] focus:border-[#FF8A00] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Other Name(s) (Optional)
                </label>
                <input
                  type="text"
                  value={otherNames}
                  onChange={(e) => setOtherNames(e.target.value)}
                  placeholder="e.g. Priestley"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#334155] border border-[#334155] focus:border-[#FF8A00] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Gender <span className="text-[#E85B00]">*</span>
                </label>
                <div className="flex gap-4 pt-1">
                  {(['Male', 'Female'] as Gender[]).map((g) => (
                    <label
                      key={g}
                      className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        gender === g
                          ? 'bg-[#FF8A00] text-[#0F172A] border-[#FF8A00] shadow-sm'
                          : 'bg-[#334155] text-[#94A3B8] border-[#334155] hover:bg-[#0F172A] hover:text-[#F8FAFC]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === g}
                        onChange={() => setGender(g)}
                        className="sr-only"
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Date of Birth <span className="text-[#E85B00]">*</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#334155] border border-[#334155] focus:border-[#FF8A00] text-[#F8FAFC] text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Phone Number <span className="text-[#E85B00]">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+2348012345678"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#334155] border border-[#334155] focus:border-[#FF8A00] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Same as phone or enter alternative"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#334155] border border-[#334155] focus:border-[#FF8A00] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Email Address <span className="text-[#E85B00]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#334155] border border-[#334155] focus:border-[#FF8A00] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Residential Address <span className="text-[#E85B00]">*</span>
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="Enter full home address..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#334155] border border-[#334155] focus:border-[#FF8A00] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION B: CHURCH INFORMATION */}
        {currentSection === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#334155] pb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                <Church className="w-5 h-5 text-[#FF8A00]" />
                SECTION B: CHURCH INFORMATION & VOLUNTEERING
              </h3>
              <span className="text-xs text-[#FF8A00] font-semibold uppercase">Step 2 / 8</span>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block">
                  Are you a member of TRH Ministries Global? <span className="text-[#E85B00]">*</span>
                </label>
                <div className="flex gap-4">
                  {[
                    { label: 'Yes, I am a member', val: true },
                    { label: 'No, I am a visitor / guest', val: false },
                  ].map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIsMember(opt.val)}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isMember === opt.val
                          ? 'bg-[#FF8A00] text-[#0F172A] border-[#FF8A00] shadow-sm font-extrabold'
                          : 'bg-[#334155] text-[#94A3B8] border-[#334155] hover:bg-[#0F172A] hover:text-[#F8FAFC]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {!isMember && (
                <div className="space-y-1.5 p-4 rounded-2xl bg-[#0F172A] border border-[#FF8A00]/40">
                  <label className="text-xs font-bold text-[#FF8A00] uppercase tracking-wider">
                    How did you hear about the camp? <span className="text-[#E85B00]">*</span>
                  </label>
                  <select
                    value={howHeard}
                    onChange={(e) => setHowHeard(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] text-sm"
                  >
                    <option value="">Select option...</option>
                    <option value="Invitation from a member">Invitation from a member</option>
                    <option value="Social Media (Instagram/Facebook/WhatsApp)">Social Media</option>
                    <option value="Friend">Friend</option>
                    <option value="Family">Family</option>
                    <option value="Church Flyer / Banner">Church Flyer / Banner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block">
                  Committee / Department Interest (Volunteer)
                </label>
                <p className="text-xs text-[#94A3B8]">
                  If you would like to volunteer to be part of any committee during camp, please indicate your preference:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {[
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
                  ].map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setDepartmentInterest(dept as CommitteeName)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                        departmentInterest === dept
                          ? 'bg-[#251464] text-[#FF8A00] border-[#FF8A00] shadow-md ring-2 ring-[#FF8A00]/50'
                          : 'bg-[#334155] text-[#94A3B8] border-[#334155] hover:bg-[#0F172A] hover:text-[#F8FAFC]'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION C: CAMP PARTICIPATION */}
        {currentSection === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#334155] pb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#FF8A00]" />
                SECTION C: CAMP PARTICIPATION
              </h3>
              <span className="text-xs text-[#FF8A00] font-semibold uppercase">Step 3 / 8</span>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block">
                  Will you be staying throughout the entire 7 days? <span className="text-[#E85B00]">*</span>
                </label>
                <div className="flex gap-4">
                  {[
                    { label: 'Yes (Full 7 Days: 23rd – 30th August)', val: true },
                    { label: 'No (Selected Days Only)', val: false },
                  ].map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setStayEntire7Days(opt.val)}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        stayEntire7Days === opt.val
                          ? 'bg-[#FF8A00] text-[#0F172A] border-[#FF8A00] shadow-sm font-extrabold'
                          : 'bg-[#334155] text-[#94A3B8] border-[#334155] hover:bg-[#0F172A] hover:text-[#F8FAFC]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {!stayEntire7Days && (
                <div className="space-y-2 p-4 rounded-2xl bg-[#0F172A] border border-[#334155]">
                  <label className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider block">
                    Select the specific days you will attend:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {daysOptions.map((day) => {
                      const isSel = attendingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                            isSel
                              ? 'bg-[#FF8A00] text-[#0F172A] font-bold border-[#FF8A00]'
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

              <div className="space-y-2 pt-2 border-t border-[#334155]">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block">
                  Will you be sleeping over at the camp (Church Hall Premises)? <span className="text-[#E85B00]">*</span>
                </label>
                <div className="flex gap-4">
                  {[
                    { label: 'Yes, Sleeping Over at Camp', val: true },
                    { label: 'No, Daily Commuter', val: false },
                  ].map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSleepOver(opt.val)}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        sleepOver === opt.val
                          ? 'bg-[#251464] text-[#FF8A00] border-[#FF8A00] shadow-sm font-extrabold'
                          : 'bg-[#334155] text-[#94A3B8] border-[#334155] hover:bg-[#0F172A] hover:text-[#F8FAFC]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION D: MEDICAL INFORMATION */}
        {currentSection === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#334155] pb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-[#FF8A00]" />
                SECTION D: MEDICAL INFORMATION & EMERGENCY CONTACT
              </h3>
              <span className="text-xs text-[#FF8A00] font-semibold uppercase">Step 4 / 8</span>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block">
                  Do you have any medical condition the camp leadership should be aware of?
                </label>
                <div className="flex gap-4">
                  {[
                    { label: 'Yes', val: true },
                    { label: 'No', val: false },
                  ].map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setHasMedicalCondition(opt.val)}
                      className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                        hasMedicalCondition === opt.val
                          ? 'bg-[#FF8A00] text-[#0F172A] border-[#FF8A00]'
                          : 'bg-[#334155] text-[#94A3B8] border-[#334155]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasMedicalCondition && (
                <div className="space-y-1.5 p-4 rounded-2xl bg-red-950/60 border border-red-500/50">
                  <label className="text-xs font-bold text-red-300 uppercase tracking-wider">
                    Please specify medical condition: <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={medicalDetails}
                    onChange={(e) => setMedicalDetails(e.target.value)}
                    rows={2}
                    placeholder="e.g. Asthma, Ulcer, Hypertension, Allergies..."
                    className="w-full px-4 py-2.5 rounded-xl border border-red-500/50 bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                  />
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-[#334155]">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block">
                  Are you currently taking any regular medication?
                </label>
                <div className="flex gap-4">
                  {[
                    { label: 'Yes', val: true },
                    { label: 'No', val: false },
                  ].map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIsTakingMedication(opt.val)}
                      className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                        isTakingMedication === opt.val
                          ? 'bg-[#FF8A00] text-[#0F172A] border-[#FF8A00]'
                          : 'bg-[#334155] text-[#94A3B8] border-[#334155]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {isTakingMedication && (
                <div className="space-y-1.5 p-4 rounded-2xl bg-[#0F172A] border border-[#FF8A00]/40">
                  <label className="text-xs font-bold text-[#FF8A00] uppercase tracking-wider">
                    Specify medication & instructions:
                  </label>
                  <textarea
                    value={medicationDetails}
                    onChange={(e) => setMedicationDetails(e.target.value)}
                    rows={2}
                    placeholder="e.g. Inhaler, daily hypertension meds..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-[#334155] space-y-4">
                <h4 className="text-xs font-extrabold text-[#F8FAFC] uppercase tracking-wider">
                  Emergency Contact Details <span className="text-[#E85B00]">*</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#94A3B8]">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="e.g. Adeola Simon"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#334155] border border-[#334155] focus:border-[#FF8A00] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#94A3B8]">Relationship</label>
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      placeholder="e.g. Spouse / Parent / Sibling"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#334155] border border-[#334155] focus:border-[#FF8A00] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#94A3B8]">Phone Number</label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+2348011223344"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#334155] border border-[#334155] focus:border-[#FF8A00] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION E: PAYMENT */}
        {currentSection === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#334155] pb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#FF8A00]" />
                SECTION E: REGISTRATION PAYMENT ({CAMP_DETAILS.feeDisplay})
              </h3>
              <span className="text-xs text-[#FF8A00] font-semibold uppercase">Step 5 / 8</span>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#0F172A] text-[#F8FAFC] border border-[#FF8A00]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#FF8A00]">TRH Camp Account</span>
                  <span className="text-lg font-black text-[#FF8A00]">{CAMP_DETAILS.feeDisplay}</span>
                </div>
                <div className="space-y-1 text-xs text-[#94A3B8] font-mono">
                  <p>Bank: <strong className="text-[#F8FAFC]">{CAMP_DETAILS.bankAccount.bankName}</strong></p>
                  <p>Account Name: <strong className="text-[#FF8A00]">{CAMP_DETAILS.bankAccount.accountName}</strong></p>
                  <p>Account Number: <strong className="text-[#FF8A00] text-sm tracking-wider">{CAMP_DETAILS.bankAccount.accountNumber}</strong></p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block">
                  Payment Status <span className="text-[#E85B00]">*</span>
                </label>
                <div className="flex gap-4">
                  {[
                    { label: 'Paid (Bank Transfer / Cash Completed)', val: 'Paid' as PaymentStatus },
                    { label: 'Pending (Will Pay to Administrator)', val: 'Pending' as PaymentStatus },
                  ].map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPaymentStatus(opt.val)}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        paymentStatus === opt.val
                          ? 'bg-[#FF8A00] text-[#0F172A] border-[#FF8A00] shadow-sm font-extrabold'
                          : 'bg-[#334155] text-[#94A3B8] border-[#334155] hover:bg-[#0F172A] hover:text-[#F8FAFC]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                  Payment Transfer Name / Remarks <span className="text-[#E85B00]">*</span>
                </label>
                <input
                  type="text"
                  value={paymentReceiptRef}
                  onChange={(e) => setPaymentReceiptRef(e.target.value)}
                  placeholder="e.g. POL-TRH-884912 or Transfer Name: Simon Priestley"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#334155] border border-[#334155] focus:border-[#FF8A00] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                  required
                />
                <p className="text-[11px] text-[#94A3B8]">
                  Please share your payment receipt or reference with the camp administrator for official verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION F: CHILDREN AND DEPENDENTS */}
        {currentSection === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#334155] pb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                <Baby className="w-5 h-5 text-[#FF8A00]" />
                SECTION F: CHILDREN AND DEPENDENTS
              </h3>
              <span className="text-xs text-[#FF8A00] font-semibold uppercase">Step 6 / 8</span>
            </div>

            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#FF8A00]/30 text-xs text-[#94A3B8] space-y-1">
                <p className="font-bold text-[#FF8A00]">Child & Teenager Guidelines:</p>
                <p>• Children aged 12 years and below are solely the responsibility of parents/guardians.</p>
                <p>• Teenagers (13+) are accorded the same plan as adults (One meal a day breaking fast at 3:00 PM).</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block">
                  Do you have children coming with you to the camp? <span className="text-[#E85B00]">*</span>
                </label>
                <div className="flex gap-4">
                  {[
                    { label: 'Yes', val: true },
                    { label: 'No', val: false },
                  ].map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setHasChildren(opt.val)}
                      className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                        hasChildren === opt.val
                          ? 'bg-[#FF8A00] text-[#0F172A] border-[#FF8A00]'
                          : 'bg-[#334155] text-[#94A3B8] border-[#334155]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasChildren && (
                <div className="space-y-4 p-5 rounded-2xl bg-[#0F172A] border border-[#334155]">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                      How many children are accompanying you? (1 to 5)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleChildrenCountChange(num)}
                          className={`w-10 h-10 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                            childrenCount === num
                              ? 'bg-[#251464] text-[#FF8A00] border-[#FF8A00] shadow-sm'
                              : 'bg-[#334155] text-[#94A3B8] border border-[#334155]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block">
                      Specify Age for Each Child:
                    </label>
                    {Array.from({ length: childrenCount }).map((_, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-6 text-xs font-bold text-[#FF8A00] font-mono">#{idx + 1}</span>
                        <input
                          type="text"
                          value={childrenAges[idx] || ''}
                          onChange={(e) => handleChildAgeChange(idx, e.target.value)}
                          placeholder="e.g. 5 years old / 14 years (Teen)"
                          className="flex-1 px-3.5 py-2 rounded-xl bg-[#334155] border border-[#334155] focus:border-[#FF8A00] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION G: EXPECTATIONS */}
        {currentSection === 7 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#334155] pb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#FF8A00]" />
                SECTION G: EXPECTATIONS & FAITH DESIRES
              </h3>
              <span className="text-xs text-[#FF8A00] font-semibold uppercase">Step 7 / 8</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider block">
                  What are you trusting God for during this camp?{' '}
                  <span className="text-[#FF8A00] font-normal lowercase">(Optional — share anonymously if you prefer)</span>
                </label>
                <p className="text-xs text-[#94A3B8]">
                  Share your specific spiritual prayer desires, healing requests, breakthrough targets, or personal expectations for this 7-day consecration.
                </p>
                <textarea
                  value={expectations}
                  onChange={(e) => setExpectations(e.target.value)}
                  rows={5}
                  placeholder="e.g. Trusting God for fresh spiritual fire on my prayer altar, clarity for my ministry calling, and divine evidence of victory in 1 Cor 15:57... (Optional)"
                  className="w-full px-4 py-3 rounded-2xl bg-[#334155] border border-[#334155] focus:border-[#FF8A00] text-[#F8FAFC] placeholder-[#94A3B8] text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION H: CAMP COMMITMENT & DECLARATION */}
        {currentSection === 8 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-[#334155] pb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#FF8A00]" />
                SECTION H: CAMP COMMITMENT & DECLARATION
              </h3>
              <span className="text-xs text-[#FF8A00] font-semibold uppercase">Step 8 / 8</span>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#334155] space-y-3">
                <p className="text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">
                  I understand that the TRH Annual Victory Camp is a 7-day spiritual retreat and I agree to:
                </p>

                <div className="space-y-2.5 pt-1">
                  {[
                    { key: 'participateFully', text: 'Participate fully in scheduled camp activities.' },
                    { key: 'observeRules', text: 'Observe all camp rules and regulations (6:00 PM curfew, modest dress, phone quiet mode).' },
                    { key: 'respectLeadership', text: 'Respect camp leadership and fellow participants.' },
                    { key: 'maintainDiscipline', text: 'Maintain spiritual discipline throughout the camp.' },
                    { key: 'keepClean', text: 'Contribute to keeping the camp environment clean and sanitary.' },
                    { key: 'notifyEmergency', text: 'Notify camp leadership immediately in case of emergencies.' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-3 p-2 rounded-xl hover:bg-[#1E293B] transition-colors cursor-pointer text-xs text-[#94A3B8] font-medium"
                    >
                      <input
                        type="checkbox"
                        checked={commitments[item.key as keyof typeof commitments]}
                        onChange={(e) =>
                          setCommitments({
                            ...commitments,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="w-4 h-4 mt-0.5 text-[#FF8A00] rounded focus:ring-[#FF8A00] border-[#334155]"
                      />
                      <span>{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Declaration statement */}
              <div className="p-5 rounded-2xl bg-[#251464]/80 border border-[#FF8A00]/40 space-y-4">
                <h4 className="text-xs font-black text-[#FF8A00] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FF8A00]" />
                  Official Declaration
                </h4>
                <p className="text-xs text-[#F8FAFC] leading-relaxed font-serif italic">
                  "I certify that the information provided above is true and accurate. I understand that registration confirms my consent for TRH Ministries Global to use the data provided for ministry purposes, my willingness to participate in the camp, and to abide by the guidelines established by the camp leadership."
                </p>

                <div className="space-y-2 pt-2 border-t border-[#FF8A00]/30">
                  <label className="text-xs font-bold text-[#FF8A00] uppercase tracking-wider block">
                    Digital Signature Name <span className="text-[#E85B00]">*</span>
                  </label>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="Type your full legal name as signature..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#334155] border border-[#334155] text-[#F8FAFC] placeholder-[#94A3B8] text-sm font-semibold"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-[#334155]">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSection === 1}
            className={`px-5 py-2.5 rounded-xl border font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              currentSection === 1
                ? 'opacity-40 cursor-not-allowed border-[#334155] text-[#94A3B8]'
                : 'border-[#334155] text-[#F8FAFC] hover:bg-[#334155]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-[#94A3B8] font-mono hidden sm:inline">
            Step {currentSection} of 8
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#E85B00] hover:from-[#E85B00] hover:to-[#FF8A00] text-[#0F172A] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#FF8A00]/20 transition-all transform active:scale-95 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : currentSection === 8 ? (
              <>
                <span>Complete & Generate Pass</span>
                <Sparkles className="w-4 h-4 text-[#0F172A]" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ChevronRight className="w-4 h-4 text-[#0F172A]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
