import React, { useRef, useState } from 'react';
import { Attendee } from '../types';
import { CAMP_DETAILS, DEFAULT_CAMP_LOGO } from '../data/campData';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import {
  Ticket,
  QrCode,
  Printer,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  User,
  UserCheck,
  Heart,
  Share2,
  Download,
  Mail,
  Loader2,
  AlertCircle,
  Baby,
} from 'lucide-react';

interface CampPassCardProps {
  attendee: Attendee;
  onRegisterAnother?: () => void;
}

export const CampPassCard: React.FC<CampPassCardProps> = ({
  attendee,
  onRegisterAnother,
}) => {
  const passRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!passRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(passRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `TRH_Camp_Pass_${attendee.regNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
      alert('Could not render image. You can still use the Print / Save button.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!passRef.current) return;
    try {
      setIsSendingEmail(true);
      setEmailStatus(null);
      const dataUrl = await toPng(passRef.current, { cacheBust: true, pixelRatio: 2 });
      
      const res = await fetch('/api/send-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendee, passImageBase64: dataUrl }),
      });

      const data = await res.json();
      if (data.success) {
        setEmailStatus({
          type: 'success',
          message: data.message || `Digital Pass successfully sent to ${attendee.email}`,
        });
      } else {
        setEmailStatus({
          type: 'error',
          message: data.error || 'Unable to send pass email.',
        });
      }
    } catch (err: any) {
      setEmailStatus({
        type: 'error',
        message: 'Network error sending pass email: ' + (err.message || ''),
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${CAMP_DETAILS.name} Pass`,
          text: `My Victory Pass for ${CAMP_DETAILS.name}! Reg No: ${attendee.regNumber}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `TRH Victory Camp Pass: ${attendee.firstName} ${attendee.surname} (${attendee.regNumber})`
      );
      alert('Pass details copied to clipboard!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1E293B] p-4 rounded-2xl border border-[#334155] shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
            Registration Confirmed! Your Official Digital Pass is Ready.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="px-3.5 py-2 rounded-xl bg-[#FF8A00] hover:bg-[#E85B00] text-[#0F172A] font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow transition-colors cursor-pointer disabled:opacity-50"
            title="Download PNG Pass Image"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#0F172A]" />
            ) : (
              <Download className="w-4 h-4 text-[#0F172A]" />
            )}
            <span>{isDownloading ? 'Generating PNG...' : 'Download Pass Image'}</span>
          </button>

          <button
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            className="px-3.5 py-2 rounded-xl bg-[#251464] hover:bg-[#1E114F] text-[#F8FAFC] font-extrabold text-xs sm:text-sm flex items-center gap-1.5 border border-[#FF8A00]/40 transition-colors cursor-pointer disabled:opacity-50"
            title="Send Pass to Email"
          >
            {isSendingEmail ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#FF8A00]" />
            ) : (
              <Mail className="w-4 h-4 text-[#FF8A00]" />
            )}
            <span>{isSendingEmail ? 'Sending Pass...' : 'Send Pass to Email'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-[#334155] hover:bg-[#0F172A] text-[#F8FAFC] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer border border-[#334155]"
          >
            <Printer className="w-4 h-4 text-[#94A3B8]" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {emailStatus && (
        <div
          className={`p-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 border font-semibold ${
            emailStatus.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/80 border-red-500/50 text-red-300'
          }`}
        >
          {emailStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{emailStatus.message}</span>
        </div>
      )}

      {/* Printable Visual Badge Card */}
      <div
        ref={passRef}
        className="relative overflow-hidden bg-gradient-to-br from-[#251464] via-[#0F172A] to-[#251464] text-[#F8FAFC] rounded-3xl border-2 border-[#FF8A00]/50 shadow-2xl p-6 sm:p-8 space-y-6 print:border-black print:text-black print:bg-white print:shadow-none"
      >
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF8A00]/10 rounded-full blur-3xl pointer-events-none print:hidden" />

        {/* Header Branding */}
        <div className="flex items-start justify-between border-b border-[#FF8A00]/30 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <img
              src={DEFAULT_CAMP_LOGO}
              alt="TRH Logo"
              className="w-12 h-12 object-cover rounded-2xl border-2 border-[#FF8A00] shadow-lg shrink-0"
            />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF8A00] font-bold block">
                TRH Ministries Global
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
                ANNUAL VICTORY CAMP 2026
              </h2>
              <p className="text-xs text-[#94A3B8] font-serif italic">
                Theme: EVIDENCE — Proof of Victory ({CAMP_DETAILS.scripture})
              </p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-widest block">
              REGISTRATION NO.
            </span>
            <span className="text-sm sm:text-lg font-mono font-black text-[#FF8A00] bg-[#FF8A00]/20 px-3 py-1 rounded-xl border border-[#FF8A00]/40 inline-block">
              {attendee.regNumber}
            </span>
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Left Column: Attendee Info */}
          <div className="sm:col-span-2 space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#94A3B8]">PARTICIPANT NAME</span>
              <h3 className="text-2xl font-extrabold text-[#F8FAFC] tracking-tight">
                {attendee.surname.toUpperCase()}, {attendee.firstName} {attendee.otherNames || ''}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[#1E293B] border border-[#334155] space-y-0.5">
                <span className="text-[10px] text-[#94A3B8] uppercase">Gender</span>
                <p className="font-semibold text-[#F8FAFC]">{attendee.gender}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1E293B] border border-[#334155] space-y-0.5">
                <span className="text-[10px] text-[#94A3B8] uppercase">Phone</span>
                <p className="font-mono font-semibold text-[#F8FAFC]">{attendee.phone}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1E293B] border border-[#334155] space-y-0.5">
                <span className="text-[10px] text-[#94A3B8] uppercase">Church Status</span>
                <p className="font-semibold text-[#FF8A00]">
                  {attendee.isMember ? 'TRH Member' : 'Guest / Visitor'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1E293B] border border-[#334155] space-y-0.5">
                <span className="text-[10px] text-[#94A3B8] uppercase">Committee Interest</span>
                <p className="font-semibold text-[#FF8A00]">{attendee.departmentInterest}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-[#251464] border border-[#FF8A00]/30 text-[#F8FAFC] text-xs font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#FF8A00]" />
                {attendee.stayEntire7Days ? 'Full 7 Days Attendance' : 'Partial Attendance'}
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-[#334155] border border-[#334155] text-[#F8FAFC] text-xs font-semibold">
                {attendee.sleepOver ? '🛌 Sleeping Over at Camp' : '🚌 Daily Commuter'}
              </span>

              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  attendee.paymentStatus?.toLowerCase() === 'paid'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF8A00]" />
                Payment: {attendee.paymentStatus?.toLowerCase() === 'paid' ? 'Paid' : 'Pending'} ({CAMP_DETAILS.feeDisplay})
              </span>

              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  attendee.isCheckedIn
                    ? 'bg-teal-950 text-teal-300 border border-teal-500/40'
                    : 'bg-[#334155] text-[#94A3B8] border border-[#334155]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                Pass Status: {attendee.isCheckedIn ? 'VERIFIED & CHECKED IN' : 'PENDING CHECK-IN'}
              </span>

              {(attendee.hasChildren || (attendee.childrenCount && attendee.childrenCount > 0)) && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-950/80 text-purple-200 border border-purple-500/50 text-xs font-bold flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-purple-300" />
                  <span>
                    Bringing Children (≤12 yrs): {attendee.childrenCount || (attendee.childrenAges ? attendee.childrenAges.length : 1)}
                    {Array.isArray(attendee.childrenAges) && attendee.childrenAges.length > 0 && (
                      <span className="font-normal opacity-90 ml-1">
                        (Ages: {attendee.childrenAges.join(', ')})
                      </span>
                    )}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Right Column: QR Code & Verification */}
          <div className="bg-[#1E293B] border border-[#FF8A00]/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-2.5 bg-white rounded-xl shadow-inner border border-[#FF8A00]/40 flex items-center justify-center">
              <QRCodeSVG
                value={typeof window !== 'undefined' ? `${window.location.origin}?verify=${encodeURIComponent(attendee.regNumber)}` : attendee.regNumber}
                size={110}
                bgColor="#FFFFFF"
                fgColor="#0F172A"
                level="M"
                includeMargin={false}
              />
            </div>
            <span className="text-[10px] font-mono text-[#FF8A00] uppercase tracking-widest font-bold">
              SCAN TO VERIFY PASS
            </span>
            <p className="text-[11px] text-[#94A3B8] leading-tight">
              Scan with phone camera or present to TRH Protocol desk at arrival for instant pass verification.
            </p>
          </div>
        </div>

        {/* Camp Logistics Footer */}
        <div className="pt-4 border-t border-[#334155] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#94A3B8] font-mono">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#FF8A00] shrink-0" />
            <span>Venue: TRH Church Hall</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#FF8A00] shrink-0" />
            <span>Dates: {CAMP_DETAILS.dateDisplay}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#FF8A00] shrink-0" />
            <span>Curfew: 6:00 PM Daily</span>
          </div>
        </div>
      </div>

      {/* Summary of Expectations & Commitment */}
      <div className="bg-[#1E293B] rounded-3xl p-6 border border-[#334155] shadow-sm space-y-4 print:hidden">
        <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF8A00]" />
          Your Submitted Faith Expectation
        </h3>
        <p className="text-xs text-[#F8FAFC] italic bg-[#0F172A] p-4 rounded-2xl border border-[#334155]">
          "{attendee.expectations}"
        </p>

        {onRegisterAnother && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={onRegisterAnother}
              className="text-xs font-semibold text-[#FF8A00] hover:text-[#E85B00] underline cursor-pointer"
            >
              + Register Another Participant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
