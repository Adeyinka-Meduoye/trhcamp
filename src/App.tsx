import React, { useState, useEffect } from 'react';
import { Header, TabType } from './components/Header';
import { HeroOverview } from './components/HeroOverview';
import { RegistrationForm } from './components/RegistrationForm';
import { CampPassCard } from './components/CampPassCard';
import { ScheduleView } from './components/ScheduleView';
import { GuidelinesView } from './components/GuidelinesView';
import { ExpectationWall } from './components/ExpectationWall';
import { AdminPortal } from './components/AdminPortal';
import { PassVerificationModal } from './components/PassVerificationModal';

import { Attendee, CommitteeName } from './types';
import { CAMP_DETAILS } from './data/campData';
import {
  subscribeAttendees,
  saveAttendeeToFirestore,
  updateAttendeeInFirestore,
  deleteAttendeeFromFirestore,
} from './lib/firebase';
import { Heart, Sparkles, ShieldCheck, Ticket } from 'lucide-react';

const VALID_TABS: TabType[] = ['overview', 'register', 'schedule', 'guidelines', 'expectations', 'admin', 'pass'];

const getTabFromLocation = (): TabType => {
  const hash = window.location.hash.replace('#', '').toLowerCase() as TabType;
  return VALID_TABS.includes(hash) ? hash : 'overview';
};

export default function App() {
  const [activeTab, setActiveTabState] = useState<TabType>(() => getTabFromLocation());
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [verifyingScan, setVerifyingScan] = useState<{ regNum: string; attendee: Attendee | null } | null>(null);

  const setActiveTab = (newTab: TabType) => {
    setActiveTabState(newTab);
    const targetHash = `#${newTab}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState({ tab: newTab }, '', targetHash);
    }
  };

  // Sync back button / browser history popstate
  useEffect(() => {
    const handlePopState = () => {
      const tabFromUrl = getTabFromLocation();
      setActiveTabState(tabFromUrl);
    };

    window.addEventListener('popstate', handlePopState);

    // Initial state setup if hash missing
    if (!window.location.hash) {
      window.history.replaceState({ tab: activeTab }, '', `#${activeTab}`);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const [myAttendee, setMyAttendee] = useState<Attendee | null>(() => {
    try {
      const savedPass = localStorage.getItem('trh_victory_camp_my_pass');
      return savedPass ? JSON.parse(savedPass) : null;
    } catch {
      return null;
    }
  });

  // Scroll to top automatically when active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // Subscribe to real-time Firestore attendees
  useEffect(() => {
    const unsubscribe = subscribeAttendees((fetchedAttendees) => {
      setAttendees(fetchedAttendees);
    });
    return () => unsubscribe();
  }, []);

  // Handle QR code verification link scanning: ?verify=TRH-2026-VC-XXXX
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyReg = params.get('verify') || params.get('pass');
    if (verifyReg) {
      const found = attendees.find(
        (a) => a.regNumber.toUpperCase() === verifyReg.trim().toUpperCase()
      ) || null;
      setVerifyingScan({ regNum: verifyReg, attendee: found });
    }
  }, [attendees]);

  useEffect(() => {
    try {
      if (myAttendee) {
        localStorage.setItem('trh_victory_camp_my_pass', JSON.stringify(myAttendee));
      } else {
        localStorage.removeItem('trh_victory_camp_my_pass');
      }
    } catch {
      // Ignore
    }
  }, [myAttendee]);

  const handleRegistrationSuccess = (newAttendee: Attendee) => {
    setMyAttendee(newAttendee);
    setActiveTab('pass');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateAttendee = async (updated: Attendee) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
    if (myAttendee && myAttendee.id === updated.id) {
      setMyAttendee(updated);
    }
    await updateAttendeeInFirestore(updated).catch((err) =>
      console.error('Failed to update attendee in Firestore:', err)
    );
  };

  const handleDeleteAttendee = async (id: string) => {
    setAttendees((prev) => prev.filter((a) => a.id !== id));
    if (myAttendee && myAttendee.id === id) {
      setMyAttendee(null);
    }
    await deleteAttendeeFromFirestore(id).catch((err) =>
      console.error('Failed to delete attendee from Firestore:', err)
    );
  };

  const handleAddAttendee = async (newAtt: Attendee) => {
    setAttendees((prev) => [newAtt, ...prev]);
    await saveAttendeeToFirestore(newAtt).catch((err) =>
      console.error('Failed to add attendee to Firestore:', err)
    );
  };


  const handleVolunteerWithDept = (dept: CommitteeName) => {
    setActiveTab('register');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleViewPass = (att: Attendee) => {
    setMyAttendee(att);
    setActiveTab('pass');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        registeredCount={attendees.length}
        myPassRegNumber={myAttendee?.regNumber}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'overview' && (
          <HeroOverview
            onRegisterClick={() => setActiveTab('register')}
            onScheduleClick={() => setActiveTab('schedule')}
            onRulesClick={() => setActiveTab('guidelines')}
          />
        )}

        {activeTab === 'register' && (
          <RegistrationForm onSuccess={handleRegistrationSuccess} />
        )}

        {activeTab === 'pass' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between max-w-xl mx-auto px-2">
              <button
                onClick={() => setActiveTab('admin')}
                className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#FF8A00] border border-[#FF8A00]/30 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                ← Back to Admin Registry
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155] font-semibold text-xs cursor-pointer"
              >
                Return to Home
              </button>
            </div>

            {myAttendee ? (
              <CampPassCard
                attendee={myAttendee}
                onRegisterAnother={() => {
                  setMyAttendee(null);
                  setActiveTab('register');
                }}
              />
            ) : (
              <div className="max-w-xl mx-auto bg-[#1E293B] text-[#F8FAFC] rounded-3xl p-8 border border-[#FF8A00]/40 text-center space-y-4 shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-[#FF8A00]/20 text-[#FF8A00] flex items-center justify-center mx-auto border border-[#FF8A00]/30">
                  <Ticket className="w-6 h-6 text-[#FF8A00]" />
                </div>
                <h3 className="text-xl font-extrabold text-[#F8FAFC]">Admin Inspection Only</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed max-w-md mx-auto">
                  Digital Pass viewing is reserved for administrative verification and registration confirmation. Please log into the Admin Registry to inspect participant passes.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="px-5 py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#E85B00] text-[#0F172A] font-extrabold text-xs shadow cursor-pointer"
                  >
                    Open Admin Registry
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && <ScheduleView />}

        {activeTab === 'guidelines' && <GuidelinesView attendees={attendees} />}

        {activeTab === 'expectations' && <ExpectationWall />}

        {activeTab === 'admin' && (
          <AdminPortal
            attendees={attendees}
            onUpdateAttendee={handleUpdateAttendee}
            onDeleteAttendee={handleDeleteAttendee}
            onAddAttendee={handleAddAttendee}
            onViewPass={handleViewPass}
            onNavigateHome={() => setActiveTab('overview')}
          />
        )}
      </main>

      {/* QR Code Pass Scan Verification Modal */}
      {verifyingScan && (
        <PassVerificationModal
          attendee={verifyingScan.attendee}
          searchedRegNum={verifyingScan.regNum}
          onConfirmCheckIn={async (att) => {
            const updated = { ...att, isCheckedIn: true };
            await handleUpdateAttendee(updated);
            setVerifyingScan({ regNum: att.regNumber, attendee: updated });
          }}
          onClose={() => {
            setVerifyingScan(null);
            const url = new URL(window.location.href);
            url.searchParams.delete('verify');
            url.searchParams.delete('pass');
            window.history.replaceState({}, '', url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''));
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#0F172A] border-t border-[#334155] py-8 px-4 text-center text-xs text-[#94A3B8] space-y-3">
        <p className="text-[#FF8A00] font-extrabold tracking-widest text-sm uppercase sm:text-base font-serif italic">
          TRH - WINNING ON EVERY SIDE
        </p>
        <div className="pt-3 border-t border-[#334155]/60 max-w-md mx-auto">
          <p className="text-xs font-semibold text-[#F8FAFC] tracking-wide">
            Developed by <span className="text-[#FF8A00] font-bold">TRH Innovation & Technology Organisation</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
