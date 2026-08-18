import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ExpectationPost } from '../types';
import { CAMP_DETAILS } from '../data/campData';
import {
  subscribeExpectations,
  saveExpectationToFirestore,
  incrementAmenInFirestore,
  deleteExpectationFromFirestore,
  subscribeWallSettings,
  updateWallSettingsInFirestore,
} from '../lib/firebase';
import {
  Flame,
  Plus,
  Send,
  Sparkles,
  ShieldCheck,
  Search,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  X,
  Globe,
  KeyRound,
  LogOut,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';

const ADMIN_ROLES = [
  'Senior & Founding Pastor',
  'Camp Director',
  'Director, Church Administration',
  'Assistant Director, Church Administration',
  'Senate President',
  'Innovation & Technology Lead',
  'Information Desk',
  'Information Desk Two',
];

export const ExpectationWall: React.FC = () => {
  const [posts, setPosts] = useState<ExpectationPost[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<ExpectationPost['category']>('Spiritual Growth');
  const [message, setMessage] = useState('');
  const [customAuthorName, setCustomAuthorName] = useState('');
  const [isFormAnonymous, setIsFormAnonymous] = useState(false);

  // Global & Individual Anonymity State
  const [maskAllNames, setMaskAllNames] = useState<boolean>(() => {
    return localStorage.getItem('trh_camp_mask_all_names') === 'true';
  });
  // Specific post IDs that override the global mask state (persisted)
  const [individuallyToggledIds, setIndividuallyToggledIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('trh_camp_individually_masked_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Admin Role & Unlock State
  const [currentAdminRole, setCurrentAdminRole] = useState<string | null>(() => {
    return localStorage.getItem('trh_camp_admin_role') || null;
  });
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(ADMIN_ROLES[0]);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Deletion Modal state for Innovation & Technology Lead
  const [postToDelete, setPostToDelete] = useState<ExpectationPost | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const unsubPosts = subscribeExpectations((fetchedPosts) => {
      setPosts(fetchedPosts);
    });

    const unsubSettings = subscribeWallSettings((settings) => {
      setMaskAllNames(settings.maskAllNames);
      setIndividuallyToggledIds(new Set(settings.individuallyToggledIds));
      localStorage.setItem('trh_camp_mask_all_names', String(settings.maskAllNames));
      localStorage.setItem('trh_camp_individually_masked_ids', JSON.stringify(settings.individuallyToggledIds));
    });

    return () => {
      unsubPosts();
      unsubSettings();
    };
  }, []);

  const categories = [
    'All',
    'Spiritual Growth',
    'Healing & Health',
    'Breakthrough',
    'Family & Relationships',
    'Ministry & Service',
    'Financial & Career',
  ];

  const handleAmen = async (id: string, currentAmenCount: number) => {
    // Optimistic UI update
    setPosts(
      posts.map((p) => (p.id === id ? { ...p, amenCount: p.amenCount + 1 } : p))
    );
    await incrementAmenInFirestore(id, currentAmenCount).catch((err) =>
      console.error('Failed to increment amen in Firestore:', err)
    );
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const authorDisplayName = isFormAnonymous
      ? 'Anonymous Believer'
      : customAuthorName.trim() || 'Anonymous Believer';

    const newPost: ExpectationPost = {
      id: `exp-${Date.now()}`,
      authorName: authorDisplayName,
      actualAuthorName: customAuthorName.trim() || authorDisplayName,
      isAnonymous: isFormAnonymous || !customAuthorName.trim(),
      category,
      message: message.trim(),
      amenCount: 1,
      createdAt: new Date().toISOString(),
    };

    setPosts([newPost, ...posts]);
    setMessage('');
    setCustomAuthorName('');
    setIsFormAnonymous(false);
    setShowForm(false);

    await saveExpectationToFirestore(newPost).catch((err) =>
      console.error('Failed to save expectation to Firestore:', err)
    );
  };

  // Toggle Global Mask All Names (Admin only)
  const handleToggleMaskAll = async () => {
    if (!currentAdminRole) {
      setShowAdminAuthModal(true);
      return;
    }
    const nextState = !maskAllNames;
    setMaskAllNames(nextState);
    localStorage.setItem('trh_camp_mask_all_names', String(nextState));
    // Reset individual overrides so the global mask applies uniformly to all posts
    setIndividuallyToggledIds(new Set());
    localStorage.removeItem('trh_camp_individually_masked_ids');

    // Sync to Firestore in real time so all believers across devices see the change immediately
    await updateWallSettingsInFirestore({
      maskAllNames: nextState,
      individuallyToggledIds: [],
    }).catch((err) => console.error('Failed to sync wall settings to Firestore:', err));
  };

  // Toggle individual post name (Admin only)
  const handleToggleIndividualPost = async (postId: string) => {
    if (!currentAdminRole) {
      return;
    }
    let updatedArray: string[] = [];
    setIndividuallyToggledIds((prev) => {
      const next = new Set<string>(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      updatedArray = Array.from(next);
      localStorage.setItem('trh_camp_individually_masked_ids', JSON.stringify(updatedArray));
      return next;
    });

    // Sync updated individual overrides to Firestore
    await updateWallSettingsInFirestore({
      individuallyToggledIds: updatedArray,
    }).catch((err) => console.error('Failed to sync individual toggle to Firestore:', err));
  };

  // Determine if a given post is displayed as anonymous
  const isPostAnonymous = (post: ExpectationPost): boolean => {
    const isIndividuallyToggled = individuallyToggledIds.has(post.id);
    if (maskAllNames) {
      // If global mask is ON: default to anonymous unless individually revealed
      return !isIndividuallyToggled;
    } else {
      // If global mask is OFF: default to real name (or post's original anonymity) unless individually masked
      if (post.isAnonymous && (!post.actualAuthorName || post.authorName === 'Anonymous Believer')) {
        return true;
      }
      return isIndividuallyToggled;
    }
  };

  const isTechLeadLoggedIn = (): boolean => {
    return currentAdminRole === 'Innovation & Technology Lead';
  };

  // Authorize password for Admin role
  const handleAuthorizeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasswordInput.trim()) return;

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: selectedRole,
          password: adminPasswordInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const role = data.role || selectedRole;
        localStorage.setItem('trh_camp_admin_role', role);
        setCurrentAdminRole(role);
        setShowAdminAuthModal(false);
        setAdminPasswordInput('');
        setAuthError(null);
      } else {
        setAuthError(data.error || 'Incorrect password for selected leadership title.');
      }
    } catch (err) {
      setAuthError('Connection error verifying credentials. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('trh_camp_admin_role');
    setCurrentAdminRole(null);
  };

  // Open deletion flow
  const handleInitiateDelete = (post: ExpectationPost) => {
    setPostToDelete(post);
    if (!isTechLeadLoggedIn()) {
      setSelectedRole('Innovation & Technology Lead');
      setAuthError(null);
      setAdminPasswordInput('');
      setShowAdminAuthModal(true);
      return;
    }
    setShowDeleteModal(true);
  };

  // Execute deletion in Firestore
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    const targetId = postToDelete.id;

    // Optimistically remove from state
    setPosts((prev) => prev.filter((p) => p.id !== targetId));

    try {
      await deleteExpectationFromFirestore(targetId);
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (err) {
      console.error('Error deleting entry from Firestore:', err);
      alert('Failed to delete entry from database. Please check connection.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter Posts based on Category and Search
  const filteredPosts = posts.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.actualAuthorName && p.actualAuthorName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Title Banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#251464] text-[#F8FAFC] rounded-3xl p-6 sm:p-8 border border-[#FF8A00]/30 shadow-xl space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF8A00]" />
            <span className="text-xs font-mono text-[#FF8A00] font-bold uppercase tracking-wider">
              PROOF OF VICTORY WALL
            </span>
          </div>
          <span className="bg-[#FF8A00]/20 text-[#FF8A00] px-3 py-1 rounded-full text-xs font-mono font-bold border border-[#FF8A00]/30">
            {CAMP_DETAILS.scripture}
          </span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Camp Faith & Prayer Expectations
          </h2>
          <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-3xl leading-relaxed mt-1">
            Post your faith desires for the 7-day Victory Camp and join in agreement with fellow believers by clicking <strong>Amen 🙏</strong> on prayer requests.
          </p>
        </div>

        {/* Leadership & Admin Bar */}
        {currentAdminRole && (
          <div className="p-4 rounded-2xl bg-[#1E293B] border border-[#FF8A00]/40 text-xs text-[#F8FAFC] flex flex-wrap items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF8A00] shrink-0" />
              <span>
                Admin Session Active: <strong>{currentAdminRole}</strong>
              </span>
            </div>
            <button
              onClick={handleLogoutAdmin}
              className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] flex items-center gap-1 font-semibold underline underline-offset-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>
        )}

        {/* Action Controls Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-auto max-w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#E85B00] text-[#0F172A] font-black text-xs sm:text-sm gap-2 shadow-lg transition-all cursor-pointer active:scale-95 border border-[#FF8A00]"
            >
              <Plus className="w-4 h-4 text-[#0F172A] shrink-0" />
              <span className="whitespace-nowrap">Post Your Expectation</span>
            </button>

            {/* MASK ALL NAMES AS ANONYMOUS TOGGLE BUTTON - ONLY VISIBLE TO ADMINS */}
            {currentAdminRole ? (
              <button
                type="button"
                onClick={handleToggleMaskAll}
                className={`w-auto max-w-full inline-flex items-center justify-center text-center px-3.5 py-2.5 rounded-xl text-xs font-black border gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                  maskAllNames
                    ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 ring-2 ring-purple-400/50'
                    : 'bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border-[#475569]'
                }`}
              >
                {maskAllNames ? (
                  <>
                    <UserX className="w-4 h-4 text-purple-200 shrink-0" />
                    <span className="sm:hidden">Names Masked (Click to Reveal)</span>
                    <span className="hidden sm:inline">Names Masked as Anonymous (Click to Reveal All)</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 text-[#FF8A00] shrink-0" />
                    <span className="sm:hidden">Mask All Names</span>
                    <span className="hidden sm:inline">Mask All Names as Anonymous</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAdminPasswordInput('');
                  setShowAdminAuthModal(true);
                }}
                className="w-auto max-w-full inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#1E293B]/80 hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155] gap-1.5 transition-all cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#FF8A00] shrink-0" />
                <span className="whitespace-nowrap">Admin Login</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 text-xs text-[#CBD5E1] font-mono">
            <span className="bg-[#0F172A]/70 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#FF8A00] shrink-0" />
              <span>{posts.length} Faith Expectations</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Post Submission Card */}
      {showForm && (
        <form
          onSubmit={handleAddPost}
          className="bg-[#1E293B] rounded-3xl p-6 sm:p-8 border-2 border-[#FF8A00] shadow-2xl space-y-5 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-[#334155] pb-3">
            <h3 className="font-extrabold text-[#F8FAFC] text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF8A00]" />
              Post What You Are Trusting God For
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#94A3B8]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] text-sm font-semibold outline-none focus:border-[#FF8A00]"
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c} className="bg-[#1E293B] text-[#F8FAFC]">{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#94A3B8]">Your Name (Optional)</label>
              <input
                type="text"
                value={customAuthorName}
                onChange={(e) => setCustomAuthorName(e.target.value)}
                placeholder="e.g. Bro. Emmanuel or leave blank for Anonymous"
                className="w-full px-4 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8] text-sm outline-none focus:border-[#FF8A00]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#94A3B8]">
              Your Faith Expectation / Prayer Desire *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="e.g. Believing God for absolute divine evidence in my business, health, and prayer life..."
              className="w-full px-4 py-3 rounded-2xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8] text-sm leading-relaxed outline-none focus:border-[#FF8A00]"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#CBD5E1]">
              <input
                type="checkbox"
                checked={isFormAnonymous}
                onChange={(e) => setIsFormAnonymous(e.target.checked)}
                className="rounded border-[#334155] text-[#FF8A00] focus:ring-[#FF8A00]"
              />
              <span>Post anonymously as <strong>Anonymous Believer</strong></span>
            </label>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#E85B00] text-[#0F172A] font-black text-xs sm:text-sm flex items-center gap-2 shadow cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4 text-[#0F172A]" />
              <span>Publish to Victory Wall</span>
            </button>
          </div>
        </form>
      )}

      {/* Category Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1E293B] p-3 rounded-2xl border border-[#334155] shadow-sm">
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#FF8A00] text-[#0F172A] shadow-sm font-extrabold'
                  : 'text-[#94A3B8] hover:bg-[#334155] hover:text-[#F8FAFC]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expectations..."
            className="pl-9 pr-4 py-1.5 rounded-xl border border-[#334155] text-xs w-full sm:w-48 bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8] outline-none focus:border-[#FF8A00]"
          />
        </div>
      </div>

      {/* Expectation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPosts.length === 0 ? (
          <div className="col-span-full bg-[#1E293B] rounded-3xl p-10 text-center border border-[#334155] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#334155] flex items-center justify-center mx-auto text-[#FF8A00]">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[#F8FAFC]">No Expectations Found</h4>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
              No faith expectations found matching your selected category or search filter.
            </p>
          </div>
        ) : (
          filteredPosts.map((post, idx) => {
            const anonymousState = isPostAnonymous(post);
            const registeredName = post.actualAuthorName || post.authorName;
            const displayName = anonymousState ? 'Anonymous Believer' : registeredName;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.45, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#1E293B] rounded-2xl p-5 border border-[#334155] hover:border-[#FF8A00]/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30 px-2 py-0.5 rounded-md font-bold">
                      {post.category}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Author Name Chip - interactive toggle only for Admins */}
                      {currentAdminRole ? (
                        <button
                          type="button"
                          onClick={() => handleToggleIndividualPost(post.id)}
                          title="Admin: Click to toggle name anonymity for this post"
                          className={`flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer active:scale-95 ${
                            anonymousState
                              ? 'bg-purple-950/60 border-purple-500/40 text-purple-300 hover:border-purple-300'
                              : 'bg-[#0F172A] border-[#334155] text-[#CBD5E1] hover:border-[#FF8A00]'
                          }`}
                        >
                          {anonymousState ? (
                            <>
                              <UserX className="w-3 h-3 text-purple-400" />
                              <span className="font-bold">🎭 Anonymous Believer</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 text-emerald-400" />
                              <span className="font-semibold text-[#F8FAFC]">{displayName}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div
                          className={`flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg border select-none ${
                            anonymousState
                              ? 'bg-purple-950/40 border-purple-500/30 text-purple-300'
                              : 'bg-[#0F172A] border-[#334155] text-[#CBD5E1]'
                          }`}
                        >
                          {anonymousState ? (
                            <>
                              <UserX className="w-3 h-3 text-purple-400" />
                              <span className="font-bold">🎭 Anonymous Believer</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 text-emerald-400" />
                              <span className="font-semibold text-[#F8FAFC]">{displayName}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Delete Button for Victory Wall Entry (Authorized Admins only) */}
                      {currentAdminRole && (
                        <button
                          type="button"
                          onClick={() => handleInitiateDelete(post)}
                          title="Delete Entry (Innovation & Technology Lead)"
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-200 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer flex items-center justify-center shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#F8FAFC] font-serif italic leading-relaxed p-3.5 rounded-xl border bg-[#0F172A] border-[#334155]">
                    "{post.message}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#334155] text-xs">
                  <span className="text-[10px] font-mono text-[#94A3B8]">
                    TRH Victory Camp 2026
                  </span>

                  <button
                    onClick={() => handleAmen(post.id, post.amenCount)}
                    className="px-3 py-1.5 rounded-xl bg-[#FF8A00]/10 hover:bg-[#FF8A00]/20 text-[#FF8A00] font-bold border border-[#FF8A00]/30 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                  >
                    <span>Amen! 🙏</span>
                    <span className="bg-[#FF8A00] text-[#0F172A] text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold">
                      {post.amenCount}
                    </span>
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ADMIN AUTHENTICATION MODAL */}
      {showAdminAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-sm animate-fadeIn">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1E293B] border-2 border-[#FF8A00]/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-[#F8FAFC]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40 flex items-center justify-center shrink-0">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#F8FAFC]">
                    Leadership Authorization
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    TRH Camp Administration
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminAuthModal(false)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#CBD5E1] leading-relaxed bg-[#0F172A] p-3.5 rounded-xl border border-[#334155]">
              Administrative permissions required for deletion and moderation. Please verify with your official role credentials:
            </p>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthorizeAdmin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]">
                  Select Official Title *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] text-sm font-semibold outline-none focus:border-[#FF8A00]"
                >
                  {ADMIN_ROLES.map((role) => (
                    <option key={role} value={role} className="bg-[#1E293B] text-[#F8FAFC]">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#94A3B8]">
                  Leadership Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Enter official password..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] text-sm pr-10 outline-none focus:border-[#FF8A00]"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminAuthModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#334155] hover:bg-[#475569] text-[#F8FAFC] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="px-5 py-2 rounded-xl bg-[#FF8A00] hover:bg-[#E85B00] text-[#0F172A] text-xs font-bold flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Verify Leadership</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* DELETION CONFIRMATION MODAL */}
      {showDeleteModal && postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-sm animate-fadeIn">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1E293B] border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-[#F8FAFC]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#F8FAFC]">
                    Delete Victory Wall Entry
                  </h3>
                  <p className="text-xs text-red-400 font-semibold">
                    Authorized: Innovation & Technology Lead
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              Are you sure you want to permanently delete this faith expectation from the database?
            </p>

            {/* Entry Card Preview */}
            <div className="bg-[#0F172A] p-4 rounded-2xl border border-red-500/30 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#FF8A00] font-bold uppercase">{postToDelete.category}</span>
                <span className="text-[#94A3B8]">{postToDelete.authorName}</span>
              </div>
              <p className="text-xs text-[#F8FAFC] font-serif italic leading-relaxed">
                "{postToDelete.message}"
              </p>
            </div>

            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>This action cannot be undone and will delete the post from Firestore.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-[#334155] hover:bg-[#475569] text-[#F8FAFC] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-[#F8FAFC] text-xs font-extrabold flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete Entry</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
