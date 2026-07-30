import React, { useState, useEffect } from 'react';
import { CAMP_DETAILS } from '../data/campData';
import heroBgImg from '../assets/images/victory_camp_hero_bg_1785340181891.jpg';
import {
  Calendar,
  Clock,
  MapPin,
  ClipboardCheck,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Sun,
  Flame,
  Moon,
  Users,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';

interface HeroOverviewProps {
  onRegisterClick: () => void;
  onScheduleClick: () => void;
  onRulesClick: () => void;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({
  onRegisterClick,
  onScheduleClick,
  onRulesClick,
}) => {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date(`${CAMP_DETAILS.startDate}T00:00:00`).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setDays(Math.floor(difference / (1000 * 60 * 60 * 24)));
        setHours(Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        setMinutes(Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)));
        setSeconds(Math.floor((difference % (1000 * 60)) / 1000));
      } else {
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
      }
    };

    const setDays = (d: number) => setTimeLeft((prev) => ({ ...prev, days: d }));
    const setHours = (h: number) => setTimeLeft((prev) => ({ ...prev, hours: h }));
    const setMinutes = (m: number) => setTimeLeft((prev) => ({ ...prev, minutes: m }));
    const setSeconds = (s: number) => setTimeLeft((prev) => ({ ...prev, seconds: s }));

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyBank = () => {
    navigator.clipboard.writeText(CAMP_DETAILS.bankAccount.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const objectives = [
    'Deepen the prayer lives of all participants.',
    'Foster greater intimacy with God through fasting and consecration.',
    'Encourage spiritual discipline and systematic Bible study.',
    'Provide sound biblical teaching and fresh prophetic impartation.',
    'Build stronger fellowship, love, and unity within the church family.',
    'Raise believers who are spiritually mature and prepared for Kingdom service.',
  ];

  const highlights = [
    {
      title: 'Morning Prayer Walk',
      time: '5:00 AM Daily',
      desc: 'Awaken the dawn with territory-claiming corporate prayer and intercession.',
      icon: Sun,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Teaching & 3 PM Fast Break',
      time: '12:00 PM – 3:00 PM',
      desc: 'Deep Word ministrations followed by breaking the fast together as one body.',
      icon: Flame,
      color: 'from-amber-600 to-red-600',
    },
    {
      title: 'Bible Study Groups',
      time: '6:00 PM Daily',
      desc: 'Interactive fellowship dissecting scripture and sharing revelation.',
      icon: BookOpen,
      color: 'from-indigo-600 to-blue-600',
    },
    {
      title: 'Midnight Praise & Worship',
      time: '11:00 PM Daily',
      desc: 'High prophetic worship sessions breaking barriers in God\'s presence.',
      icon: Moon,
      color: 'from-purple-600 to-indigo-900',
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Main Hero Section - Open, Borderless, Centralized with Background Image */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] p-6 sm:p-12 text-center flex flex-col items-center justify-center space-y-8 border border-[#FF8A00]/40 shadow-2xl">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-opacity mix-blend-overlay opacity-35 pointer-events-none scale-105 transform"
          style={{ backgroundImage: `url(${heroBgImg})` }}
        />
        {/* Dark Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#251464]/80 via-[#1E293B]/90 to-[#0F172A] pointer-events-none" />

        {/* Decorative background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-[#FF8A00]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8 max-w-4xl mx-auto w-full flex flex-col items-center">
          {/* Top Badges (Centralized) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#FF8A00]" />
              Flagship 7-Day Spiritual Retreat
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B]/80 text-[#F8FAFC] border border-[#334155] text-xs sm:text-sm font-medium backdrop-blur-md">
              <Calendar className="w-4 h-4 text-[#FF8A00]" />
              {CAMP_DETAILS.dateDisplay}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F172A]/80 text-[#94A3B8] border border-[#334155] text-xs sm:text-sm backdrop-blur-md">
              <MapPin className="w-4 h-4 text-[#E85B00]" />
              {CAMP_DETAILS.venue}
            </span>
          </div>

          {/* Main Title & Theme (Centralized) */}
          <div className="space-y-4 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              <span className="animate-gradient-grey">TRH ANNUAL</span>{' '}
              <span className="animate-gradient-right drop-shadow-lg">VICTORY CAMP 2026</span>
            </h1>

            {/* Scripture Banner */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[#0F172A]/80 border border-[#FF8A00]/30 space-y-2 text-center max-w-2xl mx-auto">
              <div className="flex flex-wrap items-center justify-center gap-2 text-[#FF8A00] font-bold text-xs sm:text-sm tracking-wider uppercase">
                <span>Theme: EVIDENCE — Proof of Victory</span>
                <span className="text-[#E85B00] hidden sm:inline">•</span>
                <span className="font-mono text-[#F8FAFC]">{CAMP_DETAILS.scripture}</span>
              </div>
              <p className="text-base sm:text-lg text-[#F8FAFC] font-serif italic">
                "{CAMP_DETAILS.scriptureText}"
              </p>
            </div>
          </div>

          {/* Countdown Timer (Centralized) */}
          <div className="space-y-3 pt-2 text-center flex flex-col items-center w-full">
            <p className="text-xs uppercase font-mono tracking-wider text-[#FF8A00] font-bold">
              Countdown to Camp Launch
            </p>
            <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-lg w-full">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Mins', value: timeLeft.minutes },
                { label: 'Secs', value: timeLeft.seconds },
              ].map((unit, idx) => (
                <div
                  key={idx}
                  className="bg-[#1E293B] border border-[#FF8A00]/30 rounded-2xl p-3 sm:p-4 text-center shadow-lg"
                >
                  <span className="block text-2xl sm:text-4xl font-extrabold text-[#FF8A00] font-mono">
                    {String(unit.value).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#94A3B8] uppercase tracking-widest font-semibold mt-1 block">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons (Centralized) */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-6 border-t border-[#334155]/60 w-full">
            <button
              onClick={onRegisterClick}
              className="px-5 sm:px-7 py-3.5 rounded-xl animate-bg-gradient-right text-white font-black flex items-center justify-center gap-2 shadow-xl shadow-[#FF8A00]/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group max-w-full border border-orange-400/40"
            >
              <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
              <span className="text-white font-black tracking-wide text-xs sm:text-base whitespace-nowrap">
                Register Now ({CAMP_DETAILS.feeDisplay})
              </span>
              <ChevronRight className="w-4 h-4 text-white shrink-0" />
            </button>

            <button
              onClick={onScheduleClick}
              className="px-5 py-3.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] font-semibold text-sm sm:text-base flex items-center justify-center gap-2 border border-[#334155] transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4 text-[#FF8A00]" />
              <span>Daily Timetable</span>
            </button>
          </div>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF8A00]" />
            <span>Camp Highlights & Experience</span>
          </h2>
          <span className="text-xs text-[#94A3B8] font-medium hidden sm:inline">
            7-Day Consecration Atmosphere
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#1E293B] rounded-2xl p-5 border border-[#334155] shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF8A00] to-[#E85B00] flex items-center justify-center text-[#0F172A] font-bold shadow-md`}
                >
                  <Icon className="w-5 h-5 text-[#0F172A]" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#FF8A00] bg-[#FF8A00]/10 px-2 py-0.5 rounded border border-[#FF8A00]/30">
                    {item.time}
                  </span>
                  <h3 className="font-bold text-[#F8FAFC] text-base mt-2">{item.title}</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column: Executive Summary / Vision & Bank Payment Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Vision & Objectives */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-[#334155] shadow-sm space-y-6">
            <div className="border-b border-[#334155] pb-4">
              <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#FF8A00]" />
                Executive Summary & Vision
              </h2>
            </div>

            <div className="space-y-4 text-[#94A3B8] text-sm leading-relaxed">
              <p>
                The <strong className="text-[#F8FAFC]">TRH Annual Victory Camp</strong> is proposed as a flagship seven-day spiritual retreat designed to create an atmosphere for prayer, fasting, worship, biblical teaching, and fellowship. The camp seeks to strengthen the spiritual lives of members, cultivate deeper intimacy with God, and prepare the church for greater Kingdom impact.
              </p>
              <p>
                Beyond being a week of fasting, the camp is envisioned as an <em className="text-[#FF8A00]">annual culture of consecration</em> where believers intentionally disconnect from everyday distractions to encounter God, receive fresh direction, and build lasting relationships within the church family.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#251464]/60 border border-[#FF8A00]/40 space-y-2">
              <h3 className="font-bold text-[#FF8A00] text-sm uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF8A00]" />
                Vision Statement
              </h3>
              <p className="text-sm text-[#F8FAFC] font-serif italic">
                "To establish an atmosphere of consecration where believers experience spiritual renewal, develop deeper intimacy with God, and are equipped to influence their world through Christ."
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-[#F8FAFC] text-base">Key Camp Objectives</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#0F172A] border border-[#334155]">
                    <CheckCircle2 className="w-4 h-4 text-[#FF8A00] mt-0.5 shrink-0" />
                    <span className="text-xs text-[#94A3B8] font-medium leading-normal">{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Registration & Bank Transfer Information */}
        <div className="space-y-6">
          {/* Bank Payment Card */}
          <div className="bg-gradient-to-br from-[#251464] via-[#1E293B] to-[#0F172A] text-[#F8FAFC] rounded-3xl p-6 border border-[#FF8A00]/40 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#334155] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FF8A00]/20 border border-[#FF8A00]/30 flex items-center justify-center text-[#FF8A00]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#F8FAFC] text-base">Registration Fee</h3>
                  <p className="text-xs text-[#FF8A00] font-mono font-semibold">{CAMP_DETAILS.feeDisplay} Per Participant</p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#FF8A00]/20 text-[#FF8A00] px-2 py-1 rounded-full border border-[#FF8A00]/30">
                Official Account
              </span>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed">
              To assist with camp logistics and encourage commitment, a nominal fee of <strong className="text-[#F8FAFC]">₦1,000</strong> is required for each registered participant.
            </p>

            {/* Bank details box */}
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#FF8A00]/30 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94A3B8]">Bank Name:</span>
                <span className="font-bold text-[#F8FAFC]">{CAMP_DETAILS.bankAccount.bankName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94A3B8]">Account Name:</span>
                <span className="font-bold text-[#FF8A00]">{CAMP_DETAILS.bankAccount.accountName}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-[#334155]">
                <span className="text-[#94A3B8]">Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-[#FF8A00] tracking-wider">
                    {CAMP_DETAILS.bankAccount.accountNumber}
                  </span>
                  <button
                    onClick={handleCopyBank}
                    className="p-1.5 rounded bg-[#334155] hover:bg-[#1E293B] text-[#FF8A00] transition-colors cursor-pointer"
                    title="Copy Account Number"
                  >
                    {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#251464]/80 border border-[#FF8A00]/30 text-[11px] text-[#94A3B8] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF8A00] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#F8FAFC]">Note:</strong> Registration closes strictly one week before camp begins. Upload or paste your transaction receipt reference when completing the form!
              </span>
            </div>

            <button
              onClick={onRegisterClick}
              className="w-full py-3 rounded-xl bg-[#FF8A00] hover:bg-[#E85B00] text-[#0F172A] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF8A00]/20 transition-all cursor-pointer"
            >
              <span>Fill Registration Form Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Logistics Summary */}
          <div className="bg-[#1E293B] rounded-3xl p-6 border border-[#334155] shadow-sm space-y-4">
            <h3 className="font-bold text-[#F8FAFC] text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF8A00]" />
              Quick Logistics Overview
            </h3>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li className="flex items-center justify-between py-1.5 border-b border-[#334155]">
                <span className="text-[#94A3B8]">Venue:</span>
                <span className="font-semibold text-[#F8FAFC]">TRH Church Hall</span>
              </li>
              <li className="flex items-center justify-between py-1.5 border-b border-[#334155]">
                <span className="text-[#94A3B8]">Dates:</span>
                <span className="font-semibold text-[#F8FAFC]">23rd – 30th August 2026</span>
              </li>
              <li className="flex items-center justify-between py-1.5 border-b border-[#334155]">
                <span className="text-[#94A3B8]">Sleepover Available:</span>
                <span className="font-semibold text-[#F8FAFC]">Yes (Church Premises)</span>
              </li>
              <li className="flex items-center justify-between py-1.5 border-b border-[#334155]">
                <span className="text-[#94A3B8]">Daily Curfew:</span>
                <span className="font-semibold text-[#FF8A00]">6:00 PM Sharp</span>
              </li>
              <li className="flex items-center justify-between py-1.5">
                <span className="text-[#94A3B8]">Fast Breaking:</span>
                <span className="font-semibold text-[#F8FAFC]">Daily at 3:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
