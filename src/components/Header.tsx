import React, { useRef, useState, useEffect } from 'react';
import { CAMP_DETAILS, DEFAULT_CAMP_LOGO } from '../data/campData';
import {
  Calendar,
  Clock,
  MapPin,
  ClipboardCheck,
  BookOpen,
  Users,
  Flame,
  ShieldAlert,
  Ticket,
  Menu,
  X,
  Upload,
} from 'lucide-react';

export type TabType =
  | 'overview'
  | 'register'
  | 'pass'
  | 'schedule'
  | 'guidelines'
  | 'expectations'
  | 'admin';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  registeredCount: number;
  myPassRegNumber?: string;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  registeredCount,
  myPassRegNumber,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentDateTime(`${dateStr} • ${timeStr}`);
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const [logoSrc, setLogoSrc] = useState<string>(() => {
    try {
      const savedLogo = localStorage.getItem('trh_camp_custom_logo');
      return savedLogo || DEFAULT_CAMP_LOGO;
    } catch {
      return DEFAULT_CAMP_LOGO;
    }
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          setLogoSrc(resultStr);
          try {
            localStorage.setItem('trh_camp_custom_logo', resultStr);
          } catch (err) {
            console.error('Storage full or error:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Streamlined nav items without icons for uncluttered responsiveness
  const navItems: Omit<NavItem, 'icon'>[] = [
    { id: 'register', label: 'Register (₦1,000)', badge: 'Open' },
    { id: 'schedule', label: 'Timetable' },
    { id: 'guidelines', label: 'Camp Guidelines' },
    { id: 'expectations', label: 'Victory Wall' },
    { id: 'admin', label: 'Admin Registry', badge: registeredCount > 0 ? `${registeredCount}` : undefined },
  ];

  return (
    <header className="bg-[#251464] text-[#F8FAFC] border-b border-[#FF8A00]/30 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      {/* Top Global Bar */}
      <div className="bg-gradient-to-r from-[#251464] via-[#1E293B] to-[#0F172A] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#94A3B8] border-b border-[#FF8A00]/20 flex items-center justify-center">
        <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-[#FF8A00] font-mono font-bold bg-[#0F172A] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-[#FF8A00]/30 shadow-sm shrink-0 whitespace-nowrap">
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FF8A00] shrink-0" />
          <span>{currentDateTime}</span>
        </div>
      </div>

      {/* Main Branding Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative group/logo">
            <img
              src={logoSrc}
              alt="TRH Camp Logo"
              onClick={() => setActiveTab('overview')}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shadow-lg shadow-[#FF8A00]/20 group-hover/logo:scale-105 transition-transform border border-[#FF8A00]/50 cursor-pointer bg-[#0F172A]"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Change logo from local computer"
              className="absolute -bottom-1 -right-1 p-1 bg-[#FF8A00] text-[#0F172A] rounded-full shadow hover:scale-110 transition-transform cursor-pointer"
            >
              <Upload className="w-2.5 h-2.5 stroke-[2.5]" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div
            onClick={() => setActiveTab('overview')}
            className="cursor-pointer group flex flex-col justify-center"
          >
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F8FAFC] group-hover:text-[#FF8A00] transition-colors leading-none">
              TRH CAMP
            </h1>
          </div>
        </div>

        {/* Desktop Navigation (Uncluttered, No Icons) - Shown on large screens (lg) */}
        <nav className="hidden lg:flex items-center gap-1 sm:gap-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`relative px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#FF8A00] text-[#0F172A] shadow-md shadow-[#FF8A00]/20'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive
                        ? 'bg-[#251464] text-[#FF8A00]'
                        : 'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#E85B00] animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile & Tablet menu hamburger button (visible on screens below lg) */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#94A3B8] hover:bg-[#1E293B] focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#F8FAFC]" /> : <Menu className="w-6 h-6 text-[#F8FAFC]" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1E293B] border-t border-[#334155] px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as TabType);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-[#FF8A00] text-[#0F172A] font-extrabold'
                    : 'text-[#94A3B8] hover:bg-[#0F172A] hover:text-[#F8FAFC]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-[#251464] text-[#FF8A00]' : 'bg-[#0F172A] text-[#FF8A00] border border-[#FF8A00]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

