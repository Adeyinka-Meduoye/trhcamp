import React from 'react';
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
} from 'lucide-react';
import { CAMP_DETAILS } from '../data/campData';

interface PassVerificationModalProps {
  attendee: Attendee | null;
  searchedRegNum: string;
  onConfirmCheckIn: (attendee: Attendee) => void;
  onClose: () => void;
}

export const PassVerificationModal: React.FC<PassVerificationModalProps> = ({
  attendee,
  searchedRegNum,
  onConfirmCheckIn,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#1E293B] text-[#F8FAFC] rounded-3xl border-2 border-[#FF8A00] shadow-2xl overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#251464] via-[#1E293B] to-[#0F172A] p-5 border-b border-[#FF8A00]/30 flex items-center justify-between">
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
        <div className="p-6 space-y-6">
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
                </div>
              </div>

              {/* Confirm / Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                {!attendee.isCheckedIn ? (
                  <button
                    onClick={() => onConfirmCheckIn(attendee)}
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <UserCheck className="w-5 h-5 text-white" />
                    <span>CONFIRM & GRANT CAMP ACCESS</span>
                  </button>
                ) : (
                  <div className="w-full sm:flex-1 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-center text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Attendee Is Verified & Checked In</span>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-[#334155] hover:bg-[#0F172A] text-[#F8FAFC] font-bold text-xs sm:text-sm cursor-pointer border border-[#334155]"
                >
                  Dismiss
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-red-950/80 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#F8FAFC]">Registration Pass Not Found</h4>
                <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                  No registration record matches pass number <span className="text-[#FF8A00] font-mono font-bold">{searchedRegNum}</span>. Please verify registration or consult the Protocol Desk.
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
