import React, { useState } from 'react';
import { COMMITTEES } from '../data/campData';
import { CommitteeName } from '../types';
import {
  Users,
  CheckCircle2,
  Sparkles,
  ClipboardList,
  UserCheck,
  Utensils,
  HeartPulse,
  Video,
  Flame,
  Music,
  ShieldCheck,
  Trophy,
  ChevronRight,
  Send,
} from 'lucide-react';

interface CommitteeVolunteerProps {
  onRegisterWithDepartment: (dept: CommitteeName) => void;
}

export const CommitteeVolunteer: React.FC<CommitteeVolunteerProps> = ({
  onRegisterWithDepartment,
}) => {
  const [selectedCommittee, setSelectedCommittee] = useState<CommitteeName | null>(null);
  const [volunteerSubmitted, setVolunteerSubmitted] = useState<boolean>(false);
  const [volName, setVolName] = useState('');
  const [volPhone, setVolPhone] = useState('');
  const [volNotes, setVolNotes] = useState('');

  const getCommitteeIcon = (name: CommitteeName) => {
    switch (name) {
      case 'Administration':
        return ClipboardList;
      case 'Protocol':
        return UserCheck;
      case 'Hospitality':
        return Utensils;
      case 'Medical':
        return HeartPulse;
      case 'Media':
        return Video;
      case 'Prayer':
        return Flame;
      case 'Music':
        return Music;
      case 'Security':
        return ShieldCheck;
      case 'Sanctuary':
        return Sparkles;
      case 'Games & Recreation':
        return Trophy;
      default:
        return Users;
    }
  };

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommittee || !volName.trim() || !volPhone.trim()) return;

    setVolunteerSubmitted(true);
    setTimeout(() => {
      setVolunteerSubmitted(false);
      onRegisterWithDepartment(selectedCommittee);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-[#251464] text-[#F8FAFC] rounded-3xl p-6 sm:p-8 border border-[#FF8A00]/30 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF8A00]" />
            <span className="text-xs font-mono text-[#FF8A00] font-bold uppercase tracking-wider">
              CAMP ADMINISTRATION & SERVICE
            </span>
          </div>
          <span className="bg-[#FF8A00]/20 text-[#FF8A00] px-3 py-1 rounded-full text-xs font-mono font-bold border border-[#FF8A00]/30">
            10 Active Committees
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
          Volunteer for Victory Camp Committees
        </h2>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
          The successful execution of the camp will be coordinated through dedicated committees. Each committee is assigned clearly defined responsibilities to ensure excellence throughout the 7 days. Select a committee below to volunteer!
        </p>
      </div>

      {/* Committee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {COMMITTEES.map((committee) => {
          const Icon = getCommitteeIcon(committee.name);
          const isSelected = selectedCommittee === committee.name;

          return (
            <div
              key={committee.name}
              className={`bg-[#1E293B] rounded-2xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'border-[#FF8A00] ring-2 ring-[#FF8A00]/40 shadow-lg'
                  : 'border-[#334155] shadow-sm hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#251464] border border-[#FF8A00]/30 flex items-center justify-center text-[#FF8A00] font-bold">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono bg-[#334155] text-[#F8FAFC] px-2.5 py-1 rounded-full border border-[#334155] font-semibold">
                    {committee.volunteersCount} Enrolled
                  </span>
                </div>

                <h3 className="font-extrabold text-[#F8FAFC] text-lg">{committee.name}</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{committee.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-[#334155]">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                    Responsibilities:
                  </span>
                  <ul className="space-y-1 text-xs text-[#F8FAFC]">
                    {committee.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A00] shrink-0" />
                        <span className="truncate">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCommittee(committee.name);
                  window.scrollTo({ top: 600, behavior: 'smooth' });
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF8A00] text-[#0F172A] shadow-md font-extrabold'
                    : 'bg-[#334155] hover:bg-[#0F172A] text-[#F8FAFC]'
                }`}
              >
                <span>{isSelected ? 'Selected Committee' : 'Volunteer for ' + committee.name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Volunteer Submission Modal / Drawer */}
      {selectedCommittee && (
        <div className="bg-[#251464] text-[#F8FAFC] rounded-3xl p-6 sm:p-8 border-2 border-[#FF8A00]/50 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#334155] pb-4">
            <div>
              <span className="text-xs font-mono text-[#FF8A00] uppercase font-bold">
                VOLUNTEER APPLICATION
              </span>
              <h3 className="text-xl font-bold text-[#F8FAFC]">
                Selected Committee: <span className="text-[#FF8A00]">{selectedCommittee}</span>
              </h3>
            </div>
            <button
              onClick={() => setSelectedCommittee(null)}
              className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] underline cursor-pointer"
            >
              Change Selection
            </button>
          </div>

          {volunteerSubmitted ? (
            <div className="p-8 text-center space-y-3 bg-[#1E293B] rounded-2xl border border-emerald-500/40">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-lg text-[#F8FAFC]">Volunteer Sign-up Recorded!</h4>
              <p className="text-xs text-[#94A3B8]">
                Redirecting you to complete your official camp registration form with this committee preference...
              </p>
            </div>
          ) : (
            <form onSubmit={handleVolunteerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#94A3B8]">Your Full Name *</label>
                  <input
                    type="text"
                    value={volName}
                    onChange={(e) => setVolName(e.target.value)}
                    placeholder="e.g. Emmanuel Adeyemi"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#94A3B8]">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    value={volPhone}
                    onChange={(e) => setVolPhone(e.target.value)}
                    placeholder="+2348012345678"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#94A3B8]">
                  Relevant Experience / Skill Notes (Optional)
                </label>
                <textarea
                  value={volNotes}
                  onChange={(e) => setVolNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. I have experience with sound mixing, first aid, or crowd protocol..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8] text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onRegisterWithDepartment(selectedCommittee)}
                  className="px-5 py-2.5 rounded-xl bg-[#334155] hover:bg-[#0F172A] text-[#F8FAFC] text-xs font-semibold cursor-pointer border border-[#334155]"
                >
                  Proceed Directly to Registration
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#E85B00] text-[#0F172A] text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Send className="w-4 h-4 text-[#0F172A]" />
                  <span>Submit & Register with {selectedCommittee}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
