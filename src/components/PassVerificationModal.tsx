import React, { useState } from 'react';
import { Attendee } from '../types';
import {
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  Phone,
  Clock,
  Calendar,
  AlertTriangle,
  X,
  CreditCard,
  MapPin,
  Heart,
  Baby,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { CAMP_DETAILS } from '../data/campData';

const ADMIN_ROLES = [
  'Camp Director',
  'Director, Church Administration',
  'Assistant Director, Church Administration',
  'Senate President',
  'Innovation & Technology Lead',
  'Senior & Founding Pastor',
  'Information Desk',
  'Information Desk Two',
];

interface PassVerificationModalProps {
  attendee: Attendee | null;
  searchedRegNum: string;
  onConfirmCheckIn: (attendee: Attendee, checkedInByAdmin?: string) => void;
  onClose: () => void;
}

export const PassVerificationModal: React.FC<PassVerificationModalProps> = ({
  attendee,
  searchedRegNum,
  onConfirmCheckIn,
  onClose,
}) => {
  const [adminRole, setAdminRole] = useState<string | null>(() => {
    return localStorage.getItem('trh_camp_admin_role') || null;
  });

  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>(ADMIN_ROLES[0]);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const handleAdminAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: selectedRole,
          password: passwordInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const role = data.role || selectedRole;
        localStorage.setItem('trh_camp_admin_role', role);
        setAdminRole(role);
        setShowAdminLogin(false);
        setPasswordInput('');
        setAuthError(null);
      } else {
        setAuthError(data.error || 'Invalid admin password. Access denied.');
      }
    } catch (err) {
      setAuthError('Connection error verifying credentials. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#1E293B] text-[#F8FAFC] rounded-3xl border-2 border-[#FF8A00] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#251464] via-[#1E293B] to-[#0F172A] p-5 border-b border-[#FF8A00]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF8A00] text-[#0F172A] flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-6 h-6 text-[#0F172A]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#F8FAFC] tracking-tight">
                PROTOCOL PASS VERIFICATION
              </h3>
              <p className="text-xs text-[#FF8A00] font-mono font-bold">
                Pass Code: {searchedRegNum}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#334155] hover:bg-[#0F172A] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
            title="Close Verification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {attendee ? (
            <>
              {/* Status Header Badge */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  attendee.isCheckedIn
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {attendee.isCheckedIn ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                  ) : (
                    <Clock className="w-7 h-7 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider font-bold block">
                      CAMP CHECK-IN STATUS
                    </span>
                    <span className="text-sm sm:text-base font-black">
                      {attendee.isCheckedIn ? 'CHECKED IN & VERIFIED' : 'PENDING CHECK-IN AT DESK'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                    PAYMENT
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      attendee.paymentStatus?.toLowerCase() === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {attendee.paymentStatus?.toLowerCase() === 'paid' ? 'PAID (₦1,000)' : 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Active Admin Banner if logged in */}
              {adminRole && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Check-In Authorized: <strong>{adminRole}</strong></span>
                  </div>
                </div>
              )}

              {/* Attendee Details Card */}
              <div className="bg-[#0F172A] rounded-2xl p-5 border border-[#334155] space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-[#334155]">
                  <div>
                    <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                      ATTENDEE NAME
                    </span>
                    <h4 className="text-lg sm:text-xl font-extrabold text-[#F8FAFC]">
                      {attendee.surname} {attendee.firstName} {attendee.otherNames || ''}
                    </h4>
                    <p className="text-xs text-[#FF8A00] font-semibold">
                      Gender Category: {attendee.gender?.toLowerCase() === 'female' ? 'Female (Sister)' : 'Male (Brother)'}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-[#251464] border border-[#FF8A00]/40 text-[#FF8A00] font-mono text-xs font-black">
                    {attendee.regNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase">Phone Number</span>
                    <span className="font-mono text-[#F8FAFC] font-semibold">{attendee.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase">Email</span>
                    <span className="text-[#F8FAFC] font-semibold truncate block">
                      {attendee.email || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase">Duration</span>
                    <span className="text-[#F8FAFC] font-semibold">
                      {attendee.stayEntire7Days ? 'All 7 Days' : 'Selected Days'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase">Sleepover</span>
                    <span className="text-[#F8FAFC] font-semibold">
                      {attendee.sleepOver ? 'Yes (Camp Facility)' : 'No (Day Participant)'}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-[#334155]">
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-bold">
                      Payment Transfer Name / Remarks
                    </span>
                    <span className="text-[#FF8A00] font-mono font-bold text-xs break-all">
                      {attendee.paymentReceiptRef || 'None provided'}
                    </span>
                  </div>
                  {attendee.emergencyName && (
                    <div className="col-span-2 pt-2 border-t border-[#334155]">
                      <span className="text-[#94A3B8] block text-[10px] uppercase">Emergency Contact</span>
                      <span className="text-[#F8FAFC] font-semibold">
                        {attendee.emergencyName} ({attendee.emergencyRelation || 'Contact'}) — {attendee.emergencyPhone}
                      </span>
                    </div>
                  )}

                  {(attendee.hasChildren || (attendee.childrenCount && attendee.childrenCount > 0)) && (
                    <div className="col-span-2 pt-2.5 border-t border-purple-500/30 bg-purple-950/40 p-3 rounded-xl border flex items-start gap-2 text-xs">
                      <Baby className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-purple-300 block">
                          Accompanied Children: {attendee.childrenCount || (attendee.childrenAges ? attendee.childrenAges.length : 1)} Child(ren)
                        </span>
                        {Array.isArray(attendee.childrenAges) && attendee.childrenAges.length > 0 && (
                          <span className="text-[#94A3B8] text-[11px] block mt-0.5">
                            Child Ages: {attendee.childrenAges.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {attendee.hasMedicalCondition && (
                    <div className="col-span-2 pt-2.5 border-t border-red-500/40 bg-red-950/60 p-3 rounded-xl border flex items-start gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-red-300 block uppercase tracking-wider text-[10px]">
                          Medical Alert Flagged:
                        </span>
                        <p className="text-red-200 font-semibold mt-0.5">
                          {attendee.medicalDetails || 'Medical condition specified on record.'}
                        </p>
                        {attendee.isTakingMedication && attendee.medicationDetails && (
                          <p className="text-red-300/80 text-[11px] mt-0.5">
                            Medication: {attendee.medicationDetails}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION AREA DEPENDING ON ADMIN AUTH STATUS */}
              {adminRole ? (
                /* Admin Authorized View */
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  {!attendee.isCheckedIn ? (
                    <button
                      onClick={() => onConfirmCheckIn(attendee, adminRole || 'Admin / Information Desk')}
                      className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <UserCheck className="w-5 h-5 text-white" />
                      <span>CONFIRM & GRANT CAMP ACCESS</span>
                    </button>
                  ) : (
                    <div className="w-full sm:flex-1 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-center text-xs flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Attendee Is Verified & Checked In</span>
                      </div>
                      {attendee.checkedInBy && (
                        <span className="text-[11px] text-emerald-400/80 font-normal">
                          Confirmed by: <strong className="font-semibold">{attendee.checkedInBy}</strong>
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-[#334155] hover:bg-[#0F172A] text-[#F8FAFC] font-bold text-xs sm:text-sm cursor-pointer border border-[#334155]"
                  >
                    Dismiss
                  </button>
                </div>
              ) : (
                /* Non-Admin / Public Scanner View */
                <div className="space-y-4 pt-1">
                  <div className="p-4 rounded-2xl bg-[#0F172A] border border-amber-500/40 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>Official Information Desk Authorization Required</span>
                    </div>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed">
                      Pass details verified. For security reasons, check-in confirmation can only be granted by an authorized <strong>Information Desk Officer</strong> or <strong>Camp Admin</strong> at the venue desk.
                    </p>
                  </div>

                  {showAdminLogin ? (
                    /* Inline Admin Authentication Form */
                    <form onSubmit={handleAdminAuthenticate} className="bg-[#0F172A] p-4 sm:p-5 rounded-2xl border border-[#FF8A00]/40 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-[#F8FAFC] flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#FF8A00]" />
                          <span>Admin / Information Desk Unlock</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowAdminLogin(false)}
                          className="text-[#94A3B8] hover:text-[#F8FAFC] text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      {authError && (
                        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>{authError}</span>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-semibold text-[#94A3B8] block mb-1">
                            Official Role / Title
                          </label>
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#1E293B] text-[#F8FAFC] text-xs"
                          >
                            {ADMIN_ROLES.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-[#94A3B8] block mb-1">
                            Admin Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={passwordInput}
                              onChange={(e) => setPasswordInput(e.target.value)}
                              placeholder="Enter official password..."
                              className="w-full px-3 py-2 rounded-xl border border-[#334155] bg-[#1E293B] text-[#F8FAFC] text-xs pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#E85B00] text-[#0F172A] font-extrabold text-xs flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
                      >
                        {isAuthenticating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying Credentials...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Authorize & Unlock Check-In</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAdminLogin(true)}
                        className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-[#FF8A00]/20 hover:bg-[#FF8A00]/30 text-[#FF8A00] border border-[#FF8A00]/40 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Lock className="w-4 h-4 text-[#FF8A00]" />
                        <span>Information Desk Officer Unlock</span>
                      </button>

                      <button
                        onClick={onClose}
                        className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-[#334155] hover:bg-[#0F172A] text-[#F8FAFC] font-bold text-xs cursor-pointer border border-[#334155]"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-red-950/80 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#F8FAFC]">Registration Pass Not Found</h4>
                <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                  No registration record matches pass number <span className="text-[#FF8A00] font-mono font-bold">{searchedRegNum}</span>. Please verify registration or consult the Information Desk.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#334155] hover:bg-[#0F172A] text-[#F8FAFC] font-bold text-xs cursor-pointer"
              >
                Close Verification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

