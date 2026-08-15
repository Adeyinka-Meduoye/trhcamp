import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Attendee, CommitteeName } from '../types';
import { CAMP_DETAILS, MAJOR_DAILY_ACTIVITIES, CAMP_DAYS } from '../data/campData';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  UserCheck,
  Sparkles,
  Users,
  Moon,
  Sun,
  BookOpen,
  Footprints,
  QrCode,
  Award,
  Check,
  X,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Building2,
  Bed,
  CheckCheck,
} from 'lucide-react';

interface DailyAttendanceTrackerProps {
  attendees: Attendee[];
  onUpdateAttendee: (updated: Attendee) => void;
  authenticatedRole: string;
}

export const DailyAttendanceTracker: React.FC<DailyAttendanceTrackerProps> = ({
  attendees,
  onUpdateAttendee,
  authenticatedRole,
}) => {
  // Active selected camp day
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  // Active activity tab: 'all' (Matrix View) or specific activity key
  const [selectedActivityKey, setSelectedActivityKey] = useState<string>('prayerWalk_5am');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterSleepover, setFilterSleepover] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent'>('all');

  // Quick Pass / Scanner Input
  const [quickScanInput, setQuickScanInput] = useState('');
  const [quickScanFeedback, setQuickScanFeedback] = useState<{
    success: boolean;
    message: string;
    attendeeName?: string;
  } | null>(null);

  // Selected attendee for detailed timeline modal
  const [selectedAttendeeForTimeline, setSelectedAttendeeForTimeline] = useState<Attendee | null>(null);

  // Active day definition
  const currentDayDef = useMemo(() => {
    return CAMP_DAYS.find((d) => d.dayNumber === selectedDayNumber) || CAMP_DAYS[0];
  }, [selectedDayNumber]);

  // Active activity definition
  const currentActivityDef = useMemo(() => {
    return MAJOR_DAILY_ACTIVITIES.find((a) => a.key === selectedActivityKey) || MAJOR_DAILY_ACTIVITIES[0];
  }, [selectedActivityKey]);

  // Helper to generate key for attendance map: e.g. "2026-08-24_prayerWalk_5am"
  const getAttendanceKey = (dateStr: string, actKey: string) => `${dateStr}_${actKey}`;

  // Helper to check if attendee is marked present for a specific session
  const isAttendeePresent = (attendee: Attendee, dateStr: string, actKey: string): boolean => {
    const key = getAttendanceKey(dateStr, actKey);
    return !!attendee.dailyAttendance?.[key]?.marked;
  };

  // Helper to get attendance record metadata
  const getAttendanceRecord = (attendee: Attendee, dateStr: string, actKey: string) => {
    const key = getAttendanceKey(dateStr, actKey);
    return attendee.dailyAttendance?.[key];
  };

  // Toggle single attendance for attendee on current selected day & activity
  const handleToggleAttendance = (attendee: Attendee, dateStr: string, actKey: string) => {
    const key = getAttendanceKey(dateStr, actKey);
    const currentlyMarked = !!attendee.dailyAttendance?.[key]?.marked;

    const updatedDailyAttendance = {
      ...(attendee.dailyAttendance || {}),
      [key]: {
        marked: !currentlyMarked,
        markedAt: !currentlyMarked ? new Date().toISOString() : undefined,
        markedBy: !currentlyMarked ? authenticatedRole : undefined,
      },
    };

    const updatedAttendee: Attendee = {
      ...attendee,
      dailyAttendance: updatedDailyAttendance,
    };

    onUpdateAttendee(updatedAttendee);

    // If modal is open for this attendee, update local state
    if (selectedAttendeeForTimeline?.id === attendee.id) {
      setSelectedAttendeeForTimeline(updatedAttendee);
    }
  };

  // Quick Pass Code / Phone Scanner Submit
  const handleQuickScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickScanInput.trim().toLowerCase();
    if (!query) return;

    const matched = attendees.find((a) => {
      return (
        a.regNumber.toLowerCase() === query ||
        a.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, '')) ||
        `${a.firstName} ${a.surname}`.toLowerCase() === query ||
        a.surname.toLowerCase() === query
      );
    });

    if (!matched) {
      setQuickScanFeedback({
        success: false,
        message: `No attendee found matching "${quickScanInput}". Verify registration number or phone.`,
      });
      return;
    }

    const key = getAttendanceKey(currentDayDef.dateStr, currentActivityDef.key);
    const wasAlreadyMarked = !!matched.dailyAttendance?.[key]?.marked;

    if (wasAlreadyMarked) {
      setQuickScanFeedback({
        success: true,
        message: `Already marked present for ${currentActivityDef.name}!`,
        attendeeName: `${matched.firstName} ${matched.surname} (${matched.regNumber})`,
      });
    } else {
      const updatedDailyAttendance = {
        ...(matched.dailyAttendance || {}),
        [key]: {
          marked: true,
          markedAt: new Date().toISOString(),
          markedBy: authenticatedRole,
        },
      };

      const updated = { ...matched, dailyAttendance: updatedDailyAttendance };
      onUpdateAttendee(updated);

      setQuickScanFeedback({
        success: true,
        message: `Successfully marked PRESENT for ${currentActivityDef.name}!`,
        attendeeName: `${matched.firstName} ${matched.surname} (${matched.regNumber})`,
      });
    }

    setQuickScanInput('');
  };

  // Batch action: Mark All Sleepover Present for current session
  const handleBatchMarkSleepovers = () => {
    const sleepoverAttendees = filteredAttendees.filter((a) => a.sleepOver);
    if (sleepoverAttendees.length === 0) return;

    if (
      !window.confirm(
        `Mark ALL ${sleepoverAttendees.length} sleepover attendees as PRESENT for ${currentDayDef.label} — ${currentActivityDef.name}?`
      )
    ) {
      return;
    }

    const nowIso = new Date().toISOString();
    sleepoverAttendees.forEach((att) => {
      const key = getAttendanceKey(currentDayDef.dateStr, currentActivityDef.key);
      const updatedDailyAttendance = {
        ...(att.dailyAttendance || {}),
        [key]: {
          marked: true,
          markedAt: nowIso,
          markedBy: authenticatedRole,
        },
      };
      onUpdateAttendee({ ...att, dailyAttendance: updatedDailyAttendance });
    });
  };

  // Batch action: Mark All Filtered Present
  const handleBatchMarkAllFiltered = () => {
    if (filteredAttendees.length === 0) return;

    if (
      !window.confirm(
        `Mark ALL ${filteredAttendees.length} currently listed attendees as PRESENT for ${currentDayDef.label} — ${currentActivityDef.name}?`
      )
    ) {
      return;
    }

    const nowIso = new Date().toISOString();
    filteredAttendees.forEach((att) => {
      const key = getAttendanceKey(currentDayDef.dateStr, currentActivityDef.key);
      const updatedDailyAttendance = {
        ...(att.dailyAttendance || {}),
        [key]: {
          marked: true,
          markedAt: nowIso,
          markedBy: authenticatedRole,
        },
      };
      onUpdateAttendee({ ...att, dailyAttendance: updatedDailyAttendance });
    });
  };

  // Filtered attendees for the list/table
  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      // Search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        a.firstName.toLowerCase().includes(searchLower) ||
        a.surname.toLowerCase().includes(searchLower) ||
        (a.otherNames && a.otherNames.toLowerCase().includes(searchLower)) ||
        a.regNumber.toLowerCase().includes(searchLower) ||
        a.phone.includes(searchQuery);

      // Department
      const matchesDept = filterDepartment === 'all' || a.departmentInterest === filterDepartment;

      // Sleepover
      const matchesSleepover =
        filterSleepover === 'all' ||
        (filterSleepover === 'sleepover' && a.sleepOver) ||
        (filterSleepover === 'commuter' && !a.sleepOver);

      // Status for current session
      const isPresent = isAttendeePresent(a, currentDayDef.dateStr, currentActivityDef.key);
      const matchesStatus =
        selectedActivityKey === 'matrix' ||
        filterStatus === 'all' ||
        (filterStatus === 'present' && isPresent) ||
        (filterStatus === 'absent' && !isPresent);

      return matchesSearch && matchesDept && matchesSleepover && matchesStatus;
    });
  }, [
    attendees,
    searchQuery,
    filterDepartment,
    filterSleepover,
    filterStatus,
    selectedDayNumber,
    selectedActivityKey,
    currentDayDef.dateStr,
    currentActivityDef.key,
  ]);

  // Session stats calculations for active day & activity
  const sessionStats = useMemo(() => {
    const total = attendees.length;
    if (total === 0) return { present: 0, percentage: 0, sleepoverPresent: 0, sleepoverTotal: 0, commuterPresent: 0 };

    let present = 0;
    let sleepoverPresent = 0;
    let sleepoverTotal = 0;
    let commuterPresent = 0;

    attendees.forEach((a) => {
      if (a.sleepOver) sleepoverTotal++;
      const isPres = isAttendeePresent(a, currentDayDef.dateStr, currentActivityDef.key);
      if (isPres) {
        present++;
        if (a.sleepOver) sleepoverPresent++;
        else commuterPresent++;
      }
    });

    const percentage = Math.round((present / total) * 100);
    return {
      present,
      percentage,
      sleepoverPresent,
      sleepoverTotal,
      commuterPresent,
      total,
    };
  }, [attendees, currentDayDef.dateStr, currentActivityDef.key]);

  // Overall attendance statistics for an individual attendee
  const getAttendeeAttendanceSummary = (attendee: Attendee) => {
    let totalSessions = CAMP_DAYS.length * MAJOR_DAILY_ACTIVITIES.length; // 8 * 4 = 32
    let attendedCount = 0;

    CAMP_DAYS.forEach((d) => {
      MAJOR_DAILY_ACTIVITIES.forEach((act) => {
        if (isAttendeePresent(attendee, d.dateStr, act.key)) {
          attendedCount++;
        }
      });
    });

    const rate = Math.round((attendedCount / totalSessions) * 100);
    return { attendedCount, totalSessions, rate };
  };

  // Export Daily Attendance to CSV
  const handleExportAttendanceCSV = () => {
    if (attendees.length === 0) {
      alert('No attendee records available to export.');
      return;
    }

    const headers = [
      'Reg Number',
      'Full Name',
      'Phone Number',
      'Gender',
      'Department',
      'Accommodation (Sleepover)',
      'Total Sessions Attended (Out of 32)',
      'Attendance Percentage',
    ];

    // Add 32 session columns
    CAMP_DAYS.forEach((d) => {
      MAJOR_DAILY_ACTIVITIES.forEach((act) => {
        headers.push(`Day ${d.dayNumber} (${act.time} ${act.name})`);
      });
    });

    const rows = attendees.map((a) => {
      const { attendedCount, totalSessions, rate } = getAttendeeAttendanceSummary(a);
      const row = [
        `"${a.regNumber}"`,
        `"${a.surname} ${a.firstName} ${a.otherNames || ''}".trim()`,
        `"${a.phone}"`,
        `"${a.gender}"`,
        `"${a.departmentInterest}"`,
        `"${a.sleepOver ? 'Sleepover on Camp' : 'Commuter'}"`,
        `"${attendedCount}/${totalSessions}"`,
        `"${rate}%"`,
      ];

      CAMP_DAYS.forEach((d) => {
        MAJOR_DAILY_ACTIVITIES.forEach((act) => {
          const isPres = isAttendeePresent(a, d.dateStr, act.key);
          row.push(`"${isPres ? 'PRESENT' : 'ABSENT'}"`);
        });
      });

      return row.join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `TRH_Camp_2026_Daily_Attendance_Matrix_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Camp Timeline Day Selection Bar */}
      <div className="bg-[#1E293B] rounded-3xl p-5 sm:p-6 border border-[#334155] shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF8A00]/20 text-[#FF8A00] flex items-center justify-center border border-[#FF8A00]/30 font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#F8FAFC] text-base">
                Camp Timeline (August 23 – 30, 2026)
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Select a camp day to mark and monitor daily attendance across all 4 major activities.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportAttendanceCSV}
            className="px-3.5 py-2 rounded-xl bg-[#334155] hover:bg-[#475569] text-emerald-400 font-semibold text-xs flex items-center gap-1.5 border border-emerald-500/30 transition-all cursor-pointer shadow"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Attendance Matrix (CSV)</span>
          </button>
        </div>

        {/* 8-Day Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {CAMP_DAYS.map((day) => {
            const isSelected = day.dayNumber === selectedDayNumber;

            // Calculate attendance rate for this day across all 4 activities
            let dayTotalPresent = 0;
            let dayMaxPossible = attendees.length * 4;
            if (dayMaxPossible > 0) {
              attendees.forEach((a) => {
                MAJOR_DAILY_ACTIVITIES.forEach((act) => {
                  if (isAttendeePresent(a, day.dateStr, act.key)) dayTotalPresent++;
                });
              });
            }
            const dayRate = dayMaxPossible > 0 ? Math.round((dayTotalPresent / dayMaxPossible) * 100) : 0;

            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setSelectedDayNumber(day.dayNumber)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-[#FF8A00] text-[#0F172A] border-[#FF8A00] shadow-lg scale-[1.02]'
                    : 'bg-[#0F172A] text-[#94A3B8] border-[#334155] hover:border-[#475569] hover:text-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-black uppercase ${isSelected ? 'text-[#0F172A]' : 'text-[#FF8A00]'}`}>
                    Day {day.dayNumber}
                  </span>
                  {day.isArrivalDay && (
                    <span className="text-[8px] px-1 py-0.2 bg-purple-500/30 text-purple-200 rounded font-bold">
                      Arrival
                    </span>
                  )}
                  {day.isDepartureDay && (
                    <span className="text-[8px] px-1 py-0.2 bg-teal-500/30 text-teal-200 rounded font-bold">
                      Final
                    </span>
                  )}
                </div>

                <div>
                  <p className={`text-xs font-extrabold ${isSelected ? 'text-[#0F172A]' : 'text-[#F8FAFC]'}`}>
                    {day.label.split('—')[1]?.trim() || day.label}
                  </p>
                </div>

                <div className="pt-1 border-t border-current/10 flex items-center justify-between text-[10px] font-mono">
                  <span>Present:</span>
                  <span className="font-bold">{dayRate}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Major Daily Activities Tabs */}
      <div className="bg-[#1E293B] rounded-3xl p-5 sm:p-6 border border-[#334155] shadow-lg space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#334155] pb-4">
          <div>
            <span className="text-xs font-mono uppercase text-[#FF8A00] font-bold">
              {currentDayDef.label}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight flex items-center gap-2">
              <span>Daily Activity Sessions</span>
              <span className="text-xs font-mono bg-purple-950/60 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-full font-bold">
                4 Key Activities Daily
              </span>
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-[#0F172A] p-1.5 rounded-2xl border border-[#334155]">
            {MAJOR_DAILY_ACTIVITIES.map((activity) => {
              const isSelected = selectedActivityKey === activity.key;
              const is5am = activity.key === 'prayerWalk_5am';
              const is12pm = activity.key === 'teachingPrayer_12pm';
              const is6pm = activity.key === 'bibleStudy_6pm';
              const is11pm = activity.key === 'midnightWorship_11pm';

              return (
                <button
                  key={activity.key}
                  type="button"
                  onClick={() => setSelectedActivityKey(activity.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF8A00] text-[#0F172A] shadow font-black'
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]'
                  }`}
                >
                  {is5am && <Footprints className="w-3.5 h-3.5" />}
                  {is12pm && <BookOpen className="w-3.5 h-3.5" />}
                  {is6pm && <Users className="w-3.5 h-3.5" />}
                  {is11pm && <Moon className="w-3.5 h-3.5" />}
                  <span>{activity.time} {activity.name}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setSelectedActivityKey('matrix')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedActivityKey === 'matrix'
                  ? 'bg-purple-600 text-white shadow font-black'
                  : 'text-purple-300 hover:bg-[#1E293B]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Matrix View (All 4)</span>
            </button>
          </div>
        </div>

        {/* Selected Activity Details & KPI Header (when in single activity mode) */}
        {selectedActivityKey !== 'matrix' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#0F172A] p-4 rounded-2xl border border-[#334155]">
            <div className="md:col-span-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#FF8A00] bg-[#FF8A00]/10 px-2 py-0.5 rounded border border-[#FF8A00]/20">
                  {currentActivityDef.time}
                </span>
                <h4 className="font-extrabold text-[#F8FAFC] text-base">
                  {currentActivityDef.name}
                </h4>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {currentActivityDef.description}
              </p>
            </div>

            <div className="bg-[#1E293B] p-3 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Total Present</span>
              <div className="flex items-baseline justify-between">
                <p className="text-xl font-black text-emerald-400">
                  {sessionStats.present} <span className="text-xs text-[#94A3B8]">/ {sessionStats.total}</span>
                </p>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                  {sessionStats.percentage}%
                </span>
              </div>
            </div>

            <div className="bg-[#1E293B] p-3 rounded-xl border border-purple-500/30 flex flex-col justify-between">
              <span className="text-[10px] font-mono uppercase text-purple-300 font-bold">Sleepover vs Commuter</span>
              <div className="text-xs text-[#F8FAFC] space-y-0.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Sleepovers:</span>
                  <span className="font-bold text-purple-300">{sessionStats.sleepoverPresent} / {sessionStats.sleepoverTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Commuters:</span>
                  <span className="font-bold text-teal-300">{sessionStats.commuterPresent}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rapid Pass Scan & Batch Controls Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1">
          {/* Quick Scan Input */}
          <div className="lg:col-span-6 bg-[#0F172A] p-3.5 rounded-2xl border border-[#334155] space-y-2">
            <form onSubmit={handleQuickScanSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <QrCode className="w-4 h-4 text-[#FF8A00] absolute left-3 top-3" />
                <input
                  type="text"
                  value={quickScanInput}
                  onChange={(e) => setQuickScanInput(e.target.value)}
                  placeholder="Scan pass or type Reg # / Phone (e.g. TRH-2026-VC-0001)..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#334155] bg-[#1E293B] text-[#F8FAFC] placeholder-[#94A3B8] text-xs outline-none focus:border-[#FF8A00]"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#FF8A00] hover:bg-[#E85B00] text-[#0F172A] text-xs font-black shrink-0 transition-all cursor-pointer shadow flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Present</span>
              </button>
            </form>

            {quickScanFeedback && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 border animate-fadeIn ${
                  quickScanFeedback.success
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/60 border-red-500/40 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {quickScanFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>
                    {quickScanFeedback.attendeeName ? (
                      <strong>{quickScanFeedback.attendeeName}: </strong>
                    ) : null}
                    {quickScanFeedback.message}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickScanFeedback(null)}
                  className="text-current opacity-70 hover:opacity-100 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Batch Actions */}
          <div className="lg:col-span-6 bg-[#0F172A] p-3.5 rounded-2xl border border-[#334155] flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase font-bold">Fast Batch Actions</span>
              <p className="text-xs text-[#CBD5E1]">Speed up marking for large sessions</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleBatchMarkSleepovers}
                className="px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                title="Mark all registered sleepover attendees as present"
              >
                <Bed className="w-3.5 h-3.5 text-purple-300" />
                <span>Mark All Sleepovers Present</span>
              </button>

              <button
                type="button"
                onClick={handleBatchMarkAllFiltered}
                className="px-3 py-1.5 rounded-xl bg-[#334155] hover:bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                title="Mark all currently listed attendees as present"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark Listed Present</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0F172A] p-3 rounded-2xl border border-[#334155]">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, reg #, or phone..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-[#334155] bg-[#1E293B] text-[#F8FAFC] placeholder-[#94A3B8] text-xs outline-none focus:border-[#FF8A00]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter (only in single activity view) */}
            {selectedActivityKey !== 'matrix' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-[#334155] bg-[#1E293B] text-[#F8FAFC] text-xs font-semibold outline-none"
              >
                <option value="all">Status: All</option>
                <option value="present">Present Only (✓)</option>
                <option value="absent">Absent Only (✗)</option>
              </select>
            )}

            {/* Department Filter */}
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#334155] bg-[#1E293B] text-[#F8FAFC] text-xs font-semibold outline-none"
            >
              <option value="all">Department: All</option>
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
              <option value="Information Desk">Information Desk</option>
            </select>

            {/* Sleepover Filter */}
            <select
              value={filterSleepover}
              onChange={(e) => setFilterSleepover(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#334155] bg-[#1E293B] text-[#F8FAFC] text-xs font-semibold outline-none"
            >
              <option value="all">Accommodation: All</option>
              <option value="sleepover">Sleepover on Camp</option>
              <option value="commuter">Commuter</option>
            </select>
          </div>
        </div>

        {/* ATTENDEE ATTENDANCE ROSTER TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-[#334155] bg-[#0F172A]">
          {filteredAttendees.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Users className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
              <p className="text-sm font-bold text-[#F8FAFC]">No attendees match current filter criteria</p>
              <p className="text-xs text-[#94A3B8]">Try adjusting search query or clearing department/status filters.</p>
            </div>
          ) : selectedActivityKey !== 'matrix' ? (
            /* SINGLE ACTIVITY TABLE VIEW */
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#1E293B] text-[#94A3B8] font-mono uppercase text-[10px] border-b border-[#334155]">
                <tr>
                  <th className="py-3 px-4">Reg # & Name</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Sleepover</th>
                  <th className="py-3 px-4 text-center">Session Attendance ({currentActivityDef.time})</th>
                  <th className="py-3 px-4 text-right">Full Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/60 text-[#F8FAFC]">
                {filteredAttendees.map((att) => {
                  const isPresent = isAttendeePresent(att, currentDayDef.dateStr, currentActivityDef.key);
                  const record = getAttendanceRecord(att, currentDayDef.dateStr, currentActivityDef.key);
                  const { attendedCount, totalSessions, rate } = getAttendeeAttendanceSummary(att);

                  return (
                    <tr
                      key={att.id}
                      className={`hover:bg-[#1E293B]/70 transition-colors ${
                        isPresent ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => setSelectedAttendeeForTimeline(att)}
                            className="font-extrabold text-xs text-[#F8FAFC] hover:text-[#FF8A00] transition-colors cursor-pointer text-left block"
                          >
                            {att.surname} {att.firstName} {att.otherNames || ''}
                          </button>
                          <span className="text-[10px] font-mono text-[#94A3B8] block">
                            {att.regNumber} • {att.phone}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[11px] font-mono bg-[#1E293B] px-2 py-0.5 rounded border border-[#334155] text-[#CBD5E1]">
                          {att.departmentInterest}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {att.sleepOver ? (
                          <span className="text-[10px] font-mono uppercase bg-purple-950 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-bold flex items-center gap-1 w-fit">
                            <Bed className="w-3 h-3" /> Sleepover
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded w-fit">
                            Commuter
                          </span>
                        )}
                      </td>

                      {/* ONE-CLICK ATTENDANCE TOGGLE BUTTON */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(att, currentDayDef.dateStr, currentActivityDef.key)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm ${
                            isPresent
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
                              : 'bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155]'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                              <span>Present ✓</span>
                              {record?.markedAt && (
                                <span className="text-[9px] font-mono opacity-80 pl-1 border-l border-emerald-400">
                                  {new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="w-4 h-4 rounded-full border border-[#94A3B8] inline-block" />
                              <span>Mark Present</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedAttendeeForTimeline(att)}
                          className="px-2.5 py-1 rounded-lg bg-[#1E293B] hover:bg-purple-950 text-purple-300 hover:text-white border border-[#334155] text-[11px] font-mono transition-colors cursor-pointer"
                        >
                          {attendedCount}/{totalSessions} ({rate}%)
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* MATRIX VIEW (ALL 4 MAJOR ACTIVITIES SIDE-BY-SIDE) */
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#1E293B] text-[#94A3B8] font-mono uppercase text-[10px] border-b border-[#334155]">
                <tr>
                  <th className="py-3 px-4">Attendee Details</th>
                  {MAJOR_DAILY_ACTIVITIES.map((act) => (
                    <th key={act.key} className="py-3 px-2 text-center">
                      <span className="block text-[#F8FAFC] font-bold">{act.time}</span>
                      <span className="text-[9px] text-[#FF8A00]">{act.name}</span>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center">Daily Score</th>
                  <th className="py-3 px-4 text-right">Full Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/60 text-[#F8FAFC]">
                {filteredAttendees.map((att) => {
                  let dailyScore = 0;
                  MAJOR_DAILY_ACTIVITIES.forEach((act) => {
                    if (isAttendeePresent(att, currentDayDef.dateStr, act.key)) dailyScore++;
                  });
                  const { attendedCount, totalSessions, rate } = getAttendeeAttendanceSummary(att);

                  return (
                    <tr key={att.id} className="hover:bg-[#1E293B]/70 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedAttendeeForTimeline(att)}
                          className="font-extrabold text-xs text-[#F8FAFC] hover:text-[#FF8A00] transition-colors cursor-pointer text-left block"
                        >
                          {att.surname} {att.firstName}
                        </button>
                        <span className="text-[10px] font-mono text-[#94A3B8] block">
                          {att.regNumber} • {att.departmentInterest}
                        </span>
                      </td>

                      {/* 4 Interactive Columns */}
                      {MAJOR_DAILY_ACTIVITIES.map((act) => {
                        const isPres = isAttendeePresent(att, currentDayDef.dateStr, act.key);
                        return (
                          <td key={act.key} className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleAttendance(att, currentDayDef.dateStr, act.key)}
                              className={`p-2 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center ${
                                isPres
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                                  : 'bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] border border-[#334155]'
                              }`}
                              title={`${act.time} ${act.name}: ${isPres ? 'Marked Present (Click to unmark)' : 'Absent (Click to mark present)'}`}
                            >
                              {isPres ? <Check className="w-4 h-4" /> : <X className="w-4 h-4 opacity-40" />}
                            </button>
                          </td>
                        );
                      })}

                      <td className="py-3 px-3 text-center font-mono font-bold text-xs">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            dailyScore === 4
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : dailyScore > 0
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {dailyScore} / 4
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedAttendeeForTimeline(att)}
                          className="px-2.5 py-1 rounded-lg bg-[#1E293B] hover:bg-purple-950 text-purple-300 hover:text-white border border-[#334155] text-[11px] font-mono transition-colors cursor-pointer"
                        >
                          {attendedCount}/{totalSessions} ({rate}%)
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* INDIVIDUAL ATTENDEE FULL 8-DAY TIMELINE MODAL */}
      {selectedAttendeeForTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/85 backdrop-blur-sm animate-fadeIn">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1E293B] border-2 border-purple-500/50 rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 text-[#F8FAFC]"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#334155] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#FF8A00]" />
                  <span className="text-xs font-mono font-bold uppercase text-[#FF8A00]">
                    ATTENDEE CAMP ATTENDANCE PROFILE
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[#F8FAFC]">
                  {selectedAttendeeForTimeline.surname} {selectedAttendeeForTimeline.firstName} {selectedAttendeeForTimeline.otherNames || ''}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8] font-mono">
                  <span>Reg: <strong>{selectedAttendeeForTimeline.regNumber}</strong></span>
                  <span>•</span>
                  <span>Phone: <strong>{selectedAttendeeForTimeline.phone}</strong></span>
                  <span>•</span>
                  <span>Dept: <strong>{selectedAttendeeForTimeline.departmentInterest}</strong></span>
                  <span>•</span>
                  <span>Accommodation: <strong>{selectedAttendeeForTimeline.sleepOver ? 'Sleepover' : 'Commuter'}</strong></span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAttendeeForTimeline(null)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] p-2 rounded-xl hover:bg-[#334155] cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Attendance Score Banner */}
            {(() => {
              const { attendedCount, totalSessions, rate } = getAttendeeAttendanceSummary(selectedAttendeeForTimeline);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0F172A] p-4 rounded-2xl border border-[#334155]">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#94A3B8]">Total Sessions Attended</span>
                    <p className="text-2xl font-black text-emerald-400">
                      {attendedCount} <span className="text-sm text-[#94A3B8]">/ {totalSessions}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#94A3B8]">Attendance Percentage</span>
                    <p className="text-2xl font-black text-[#FF8A00]">{rate}%</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#94A3B8]">Faithful Recognition</span>
                    <p className="text-sm font-bold text-purple-300">
                      {rate >= 80 ? '🌟 Gold Camp Honor' : rate >= 50 ? '⭐ Faithful Participant' : '🌱 Encouraged Attendee'}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* 8-Day Breakdown Grid */}
            <div className="space-y-3">
              <h4 className="text-sm font-extrabold text-[#F8FAFC] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF8A00]" />
                <span>8-Day Session Timeline (Click any session to toggle)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CAMP_DAYS.map((d) => {
                  return (
                    <div
                      key={d.dayNumber}
                      className="bg-[#0F172A] p-4 rounded-2xl border border-[#334155] space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#334155]/60 pb-2">
                        <span className="text-xs font-bold text-[#F8FAFC]">
                          {d.label}
                        </span>
                        <span className="text-[10px] font-mono text-[#FF8A00] font-bold">
                          Day {d.dayNumber}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {MAJOR_DAILY_ACTIVITIES.map((act) => {
                          const isPres = isAttendeePresent(selectedAttendeeForTimeline, d.dateStr, act.key);
                          const rec = getAttendanceRecord(selectedAttendeeForTimeline, d.dateStr, act.key);

                          return (
                            <button
                              key={act.key}
                              type="button"
                              onClick={() => handleToggleAttendance(selectedAttendeeForTimeline, d.dateStr, act.key)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                isPres
                                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                                  : 'bg-[#1E293B] border-[#334155] text-[#94A3B8] hover:border-[#475569]'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-[#FF8A00]">
                                  {act.time}
                                </span>
                                {isPres ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <X className="w-3 h-3 text-[#94A3B8] opacity-40 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] font-bold truncate text-[#F8FAFC] pt-1">
                                {act.name}
                              </p>
                              {rec?.markedAt && (
                                <span className="text-[9px] font-mono text-[#94A3B8] pt-1 block truncate">
                                  Marked: {new Date(rec.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#334155]">
              <button
                type="button"
                onClick={() => setSelectedAttendeeForTimeline(null)}
                className="px-6 py-2.5 rounded-xl bg-[#334155] hover:bg-[#475569] text-[#F8FAFC] font-bold text-xs cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
