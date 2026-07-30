import React, { useState } from 'react';
import { DAILY_SCHEDULE, CAMP_DETAILS } from '../data/campData';
import { ScheduleItem } from '../types';
import {
  Clock,
  Flame,
  Sun,
  Moon,
  BookOpen,
  Coffee,
  Bookmark,
  Check,
  Calendar,
  Sparkles,
  ChevronRight,
  Utensils,
  Bell,
} from 'lucide-react';

export const ScheduleView: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

  const toggleBookmark = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter((b) => b !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
  };

  const filteredSchedule = DAILY_SCHEDULE.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'bookmarks') return bookmarkedIds.includes(item.id);
    return item.category === activeFilter;
  });

  const getCategoryIcon = (category: ScheduleItem['category']) => {
    switch (category) {
      case 'prayer':
        return Sun;
      case 'teaching':
      case 'fasting':
        return Flame;
      case 'worship':
        return Moon;
      case 'study':
        return BookOpen;
      case 'fellowship':
        return Utensils;
      default:
        return Coffee;
    }
  };

  const getCategoryBadgeColor = (category: ScheduleItem['category']) => {
    switch (category) {
      case 'prayer':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'teaching':
      case 'fasting':
        return 'bg-amber-500 text-slate-950 font-bold border-amber-600';
      case 'worship':
        return 'bg-indigo-950 text-indigo-200 border-indigo-700';
      case 'study':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'fellowship':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-[#251464] text-[#F8FAFC] rounded-3xl p-6 sm:p-8 border border-[#FF8A00]/30 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FF8A00]" />
            <span className="text-xs font-mono text-[#FF8A00] font-bold uppercase tracking-wider">
              DAILY CAMP TIMETABLE
            </span>
          </div>
          <span className="bg-[#FF8A00]/20 text-[#FF8A00] px-3 py-1 rounded-full text-xs font-mono font-bold border border-[#FF8A00]/30">
            23rd – 30th August 2026
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
          7-Day Consecration Schedule
        </h2>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
          Participants engage in a structured daily routine combining spiritual exercises, biblical teaching, corporate fasting (breaking daily at 3:00 PM), prayer walks, midnight worship, and fellowship.
        </p>

        {/* 3:00 PM Fast Breaking Banner */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-[#FF8A00]/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF8A00] text-[#0F172A] flex items-center justify-center font-bold shadow">
              <Flame className="w-6 h-6 text-[#0F172A]" />
            </div>
            <div>
              <h4 className="font-bold text-[#FF8A00] text-sm">Daily Corporate Fast Breaking</h4>
              <p className="text-xs text-[#94A3B8] font-mono">
                12:00 PM – 3:00 PM Teaching & Prayer Session • Breaking of Fast at 3:00 PM
              </p>
            </div>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              notificationsEnabled
                ? 'bg-[#FF8A00] text-[#0F172A]'
                : 'bg-[#334155] text-[#FF8A00] border border-[#FF8A00]/30'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{notificationsEnabled ? 'Reminders On' : 'Enable Reminders'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#1E293B] p-2 rounded-2xl border border-[#334155] shadow-sm">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'all', label: 'All Sessions' },
            { id: 'prayer', label: 'Prayer Walks' },
            { id: 'teaching', label: 'Teaching & Fasting' },
            { id: 'study', label: 'Bible Study' },
            { id: 'worship', label: 'Midnight Worship' },
            { id: 'fellowship', label: 'Lunch & Fellowship' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-[#FF8A00] text-[#0F172A] shadow-sm font-extrabold'
                  : 'text-[#94A3B8] hover:bg-[#334155] hover:text-[#F8FAFC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveFilter(activeFilter === 'bookmarks' ? 'all' : 'bookmarks')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeFilter === 'bookmarks'
              ? 'bg-[#251464] text-[#FF8A00] border border-[#FF8A00]/40'
              : 'bg-[#334155] text-[#F8FAFC] hover:bg-[#0F172A]'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-[#FF8A00]" />
          <span>Saved ({bookmarkedIds.length})</span>
        </button>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-4">
        {filteredSchedule.length === 0 ? (
          <div className="p-12 text-center bg-[#1E293B] rounded-3xl border border-[#334155] space-y-2">
            <Clock className="w-10 h-10 text-[#94A3B8] mx-auto" />
            <h3 className="font-bold text-[#F8FAFC] text-base">No sessions match this filter</h3>
            <p className="text-xs text-[#94A3B8]">Switch filter to view all daily camp activities.</p>
          </div>
        ) : (
          filteredSchedule.map((item) => {
            const isBookmarked = bookmarkedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`group bg-[#1E293B] rounded-2xl p-5 border transition-all shadow-sm hover:shadow-md ${
                  item.highlight
                    ? 'border-[#FF8A00]/80 ring-2 ring-[#FF8A00]/20 bg-gradient-to-r from-[#251464]/40 via-[#1E293B] to-[#1E293B]'
                    : 'border-[#334155]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Time & Activity */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0F172A] text-[#FF8A00] min-w-28 text-center border border-[#FF8A00]/30">
                      <span className="font-mono text-sm sm:text-base font-extrabold tracking-tight">
                        {item.time}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase tracking-wider font-bold bg-[#334155] text-[#F8FAFC] border-[#334155]"
                        >
                          {item.category}
                        </span>
                        {item.highlight && (
                          <span className="bg-[#FF8A00] text-[#0F172A] text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            ★ {item.highlight}
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-[#F8FAFC] text-base sm:text-lg">
                        {item.activity}
                      </h3>
                      <p className="text-xs text-[#94A3B8] leading-relaxed max-w-2xl">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Bookmark Toggle Button */}
                  <button
                    onClick={() => toggleBookmark(item.id)}
                    className={`self-start sm:self-center p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isBookmarked
                        ? 'bg-[#FF8A00] text-[#0F172A] border-[#FF8A00] shadow-sm font-bold'
                        : 'bg-[#334155] text-[#94A3B8] border-[#334155] hover:bg-[#0F172A] hover:text-[#F8FAFC]'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#0F172A] text-[#0F172A]' : 'text-[#94A3B8]'}`} />
                    <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
