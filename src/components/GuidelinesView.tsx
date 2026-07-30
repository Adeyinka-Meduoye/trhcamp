import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COMMITTEES } from '../data/campData';
import { Attendee } from '../types';
import {
  BookOpen,
  ShieldCheck,
  Clock,
  Shirt,
  Smartphone,
  Sparkles,
  HeartHandshake,
  Moon,
  HeartPulse,
  Baby,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Award,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface GuidelinesViewProps {
  attendees?: Attendee[];
}

export const GuidelinesView: React.FC<GuidelinesViewProps> = ({ attendees = [] }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'committees' | 'disciplinary' | 'legacy'>('rules');
  const [openRuleIndex, setOpenRuleIndex] = useState<number | null>(null);

  const toggleRule = (idx: number) => {
    setOpenRuleIndex(openRuleIndex === idx ? null : idx);
  };

  const generalRules = [
    {
      id: 1,
      title: 'Registration & Attendance',
      icon: CheckCircle2,
      summary: 'Compulsory 7-day attendance unless officially excused.',
      details: [
        'Every participant must complete the official registration process before the registration deadline (closes 1 week prior).',
        'Attendance is compulsory for all scheduled camp activities unless officially excused by the Camp Director.',
        'Participants are expected to remain at the camp throughout the seven-day programme. Requests to leave the camp temporarily must receive prior approval from the Camp Administration.',
      ],
    },
    {
      id: 2,
      title: 'Dress Code',
      icon: Shirt,
      summary: 'Modest, decent Christian clothing suitable for prayer walks.',
      details: [
        'Participants are expected to dress modestly, decently, and in a manner befitting a Christian gathering.',
        'Clothing that is revealing, inappropriate, or distracting will not be permitted.',
        'Comfortable clothing suitable for morning prayer walks (5:00 AM) and camp activities is strongly encouraged.',
      ],
    },
    {
      id: 3,
      title: 'Punctuality',
      icon: Clock,
      summary: 'Strict adherence to schedule timing.',
      details: [
        'Camp activities will commence strictly according to the approved schedule.',
        'Participants are expected to arrive promptly for all sessions and be prepared before each activity begins.',
        'Repeated lateness may attract appropriate disciplinary measures.',
      ],
    },
    {
      id: 4,
      title: 'Mobile Phone Usage',
      icon: Smartphone,
      summary: 'Silent mode during prayer, teachings, and worship.',
      details: [
        'Mobile phones should only be used when necessary.',
        'During prayer sessions, teachings, worship, and Bible study, all devices must be switched to silent mode.',
        'Excessive phone usage that distracts from the spiritual purpose of the camp is discouraged.',
      ],
    },
    {
      id: 5,
      title: 'Cleanliness & Environmental Responsibility',
      icon: Sparkles,
      highlight: 'Gender Sanitation Roles',
      summary: 'Ladies maintain hall & toilets; Guys ensure continuous water supply.',
      details: [
        'The ladies are responsible for maintaining a clean and orderly environment, ensuring the church hall is kept clean and toilets are fit for use.',
        'The guys are responsible for making sure there is always water available for washing and bathing throughout the camp.',
        'Designated sanitation responsibilities will be assigned throughout the camp.',
        'Participants must properly dispose of waste and maintain high standards of personal hygiene.',
      ],
    },
    {
      id: 6,
      title: 'Respect & Christian Conduct',
      icon: HeartHandshake,
      summary: 'Zero tolerance for fighting, abusive language, or gossip.',
      details: [
        'Participants are expected to demonstrate love, humility, respect, and maturity in all interactions.',
        'Fighting, abusive language, gossip, malice, bullying, harassment, or any form of misconduct will not be tolerated.',
        'Every participant should contribute to maintaining an atmosphere of peace, unity, and spiritual growth.',
      ],
    },
    {
      id: 7,
      title: 'Curfew & Quiet Hours',
      icon: Moon,
      summary: '6:00 PM campus entry curfew & mandatory quiet hours.',
      details: [
        'All participants must be within the church premises by 6:00 PM, except where otherwise approved by the Camp Administration.',
        'Quiet hours shall be observed during designated sleeping periods (12:30 AM Lights Out) to allow adequate rest for all participants.',
        'Loud conversations, music, or unnecessary movement during quiet hours should be avoided.',
      ],
    },
    {
      id: 8,
      title: 'Health & Safety',
      icon: HeartPulse,
      summary: 'Disclose medical conditions during registration.',
      details: [
        'Participants with medical conditions are required to disclose them during registration.',
        'Personal medications should be brought and managed by the participant.',
        'All emergencies must be reported immediately to the Medical Team or Camp Administration.',
      ],
    },
    {
      id: 9,
      title: 'Children’s Care & Teen Fasting Plan',
      icon: Baby,
      summary: 'Parents manage under 12s; Teenagers break fast at 3:00 PM.',
      details: [
        'Children aged 12 years and below are solely the responsibility of their parents or guardians.',
        'Teenagers (13+) will be accorded the same plan as adults (One meal a day to break the fast at the designated 3:00 PM time).',
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Title Banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#251464] text-[#F8FAFC] rounded-3xl p-6 sm:p-8 border border-[#FF8A00]/30 shadow-xl space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FF8A00]" />
            <span className="text-xs font-mono text-[#FF8A00] font-bold uppercase tracking-wider">
              CAMP OPERATIONS MANUAL
            </span>
          </div>
          <span className="bg-[#FF8A00]/20 text-[#FF8A00] px-3 py-1 rounded-full text-xs font-mono font-bold border border-[#FF8A00]/30">
            TRH Ministries Global
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
          Guidelines, Operational Procedures & Vision
        </h2>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
          To ensure a spiritually enriching, orderly, and impactful camp experience, all participants will be expected to comply with the following guidelines and operational procedures throughout the 7 days.
        </p>

        {/* Inner Sub-navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { id: 'rules', label: '9 General Guidelines' },
            { id: 'committees', label: 'Committee Operational Procedures' },
            { id: 'disciplinary', label: 'Disciplinary Procedures' },
            { id: 'legacy', label: 'Legacy & Long-Term Vision' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#FF8A00] text-[#0F172A] shadow-md font-extrabold'
                  : 'bg-[#334155] text-[#F8FAFC] hover:bg-[#0F172A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* TAB 1: GENERAL GUIDELINES */}
      {activeTab === 'rules' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FF8A00]" />
              General Guidelines & Standards of Conduct
            </h3>
            <span className="text-xs text-[#94A3B8]">9 Key Guidelines</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {generalRules.map((rule, idx) => {
              const Icon = rule.icon;
              const isOpen = openRuleIndex === idx;

              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.4, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className={`bg-[#1E293B] rounded-2xl border transition-all ${
                    isOpen ? 'border-[#FF8A00] shadow-md' : 'border-[#334155] shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => toggleRule(idx)}
                    className="w-full p-4 text-left flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#251464] border border-[#FF8A00]/30 flex items-center justify-center text-[#FF8A00] shrink-0 font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#FF8A00] font-bold">Rule #{rule.id}</span>
                          {rule.highlight && (
                            <span className="bg-[#FF8A00] text-[#0F172A] text-[10px] px-2 py-0.2 rounded font-bold uppercase">
                              {rule.highlight}
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-[#F8FAFC] text-base">{rule.title}</h4>
                        <p className="text-xs text-[#94A3B8] mt-0.5">{rule.summary}</p>
                      </div>
                    </div>

                    <div className="p-1 rounded-lg bg-[#334155] text-[#F8FAFC]">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded detail box */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-[#334155] space-y-2">
                      <ul className="space-y-2 text-xs text-[#F8FAFC] leading-relaxed">
                        {rule.details.map((dt, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-2">
                            <span className="text-[#FF8A00] font-bold mt-0.5">•</span>
                            <span>{dt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* TAB 2: COMMITTEE PROCEDURES */}
      {activeTab === 'committees' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="border-b border-[#334155] pb-3">
            <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF8A00]" />
              Operational Procedures by Committee
            </h3>
            <p className="text-xs text-[#94A3B8]">
              The successful execution of the camp is coordinated through {COMMITTEES.length} dedicated departments:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMMITTEES.map((comm, idx) => {
              const actualVolunteers = attendees.filter((a) => a.departmentInterest === comm.name).length;
              return (
                <div key={idx} className="bg-[#1E293B] rounded-2xl p-5 border border-[#334155] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-[#F8FAFC] text-base flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#FF8A00] text-[#0F172A] text-xs font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {comm.name}
                    </h4>
                    <span className="text-[10px] font-mono bg-[#251464] text-[#FF8A00] border border-[#FF8A00]/40 px-2.5 py-0.5 rounded-full font-bold">
                      {actualVolunteers} Volunteer{actualVolunteers === 1 ? '' : 's'}
                    </span>
                  </div>

                  <p className="text-xs text-[#94A3B8] leading-relaxed">{comm.description}</p>

                  <div className="space-y-1 pt-1 border-t border-[#334155]">
                    <span className="text-[10px] uppercase font-mono text-[#94A3B8] font-bold">Key Responsibilities:</span>
                    <ul className="space-y-1 text-xs text-[#F8FAFC]">
                      {comm.responsibilities.map((res, rIdx) => (
                        <li key={rIdx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A00] shrink-0" />
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* TAB 3: DISCIPLINARY PROCEDURE */}
      {activeTab === 'disciplinary' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-[#334155] shadow-sm space-y-6"
        >
          <div className="border-b border-[#334155] pb-4">
            <h3 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#FF8A00]" />
              Disciplinary Procedure & Governance
            </h3>
            <p className="text-xs text-[#94A3B8]">
              To preserve the spiritual atmosphere and order of the camp throughout the 7 days:
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#FF8A00]/40 space-y-2">
              <span className="text-xs font-bold text-[#FF8A00] uppercase tracking-wider block">
                1. Minor Infractions
              </span>
              <p className="text-xs text-[#F8FAFC]">
                Lateness to sessions or minor distractions will attract verbal caution or spiritual counselling by committee leads.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#E85B00]/60 space-y-2">
              <span className="text-xs font-bold text-[#E85B00] uppercase tracking-wider block">
                2. Repeated Violations
              </span>
              <p className="text-xs text-[#F8FAFC]">
                Repeated infractions of curfew (6:00 PM), dress code, or session attendance may result in written warnings or temporary suspension from specific camp privileges.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F172A] border border-red-500/60 space-y-2">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                3. Serious Misconduct
              </span>
              <p className="text-xs text-[#F8FAFC]">
                Fighting, abusive language, bullying, or gross insubordination will lead to immediate dismissal from the camp at the discretion of the Camp Director and Church Administration.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#251464] border border-[#FF8A00]/30 text-[#F8FAFC] text-xs space-y-1">
            <p className="font-bold text-[#FF8A00]">Restorative Approach:</p>
            <p className="italic font-serif">
              "All disciplinary measures shall be administered with fairness, wisdom, and the ultimate objective of spiritual restoration."
            </p>
          </div>
        </motion.div>
      )}

      {/* TAB 4: LEGACY & LONG TERM VISION */}
      {activeTab === 'legacy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-[#251464] via-[#0F172A] to-[#251464] text-[#F8FAFC] rounded-3xl p-6 sm:p-10 border border-[#FF8A00]/40 shadow-xl space-y-6"
        >
          <div className="flex items-center gap-2 text-[#FF8A00] font-mono text-xs uppercase tracking-widest font-semibold">
            <Award className="w-4 h-4 text-[#FF8A00]" />
            <span>TRH Ministries Global — Legacy Vision</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
            Building an Enduring Culture of Consecration
          </h3>

          <div className="p-6 rounded-2xl bg-[#0F172A] border border-[#FF8A00]/40 space-y-3">
            <p className="text-sm sm:text-base text-[#F8FAFC] font-serif italic leading-relaxed">
              "The vision of the TRH Annual Victory Camp extends beyond hosting a yearly fasting programme. It is to establish a lasting culture of consecration that becomes part of the identity of TRH Ministries Global—a gathering that each generation anticipates, inherits, and strengthens. Through standardized systems, intentional planning, and unwavering spiritual focus, the camp will continue to shape lives, raise leaders, and advance the Kingdom for years to come."
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#94A3B8] pt-2">
            <div className="p-4 rounded-xl bg-[#1E293B] border border-[#334155] space-y-1">
              <h4 className="font-bold text-[#F8FAFC] text-sm">Standardized Manuals</h4>
              <p>Participant handbooks, leadership manuals, and committee planning systems for generational continuity.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#1E293B] border border-[#334155] space-y-1">
              <h4 className="font-bold text-[#F8FAFC] text-sm">Kingdom Service Integration</h4>
              <p>Integrating visitors into the church family and equipping believers for effective local and global ministry.</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
