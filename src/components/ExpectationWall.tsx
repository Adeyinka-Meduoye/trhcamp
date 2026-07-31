import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ExpectationPost } from '../types';
import { CAMP_DETAILS } from '../data/campData';
import {
  subscribeExpectations,
  saveExpectationToFirestore,
  incrementAmenInFirestore,
  deleteExpectationFromFirestore,
} from '../lib/firebase';
import {
  Flame,
  Heart,
  Plus,
  Send,
  User,
  Sparkles,
  ShieldCheck,
  Search,
  Trash2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  X,
  ShieldAlert,
} from 'lucide-react';

export const ExpectationWall: React.FC = () => {
  const [posts, setPosts] = useState<ExpectationPost[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<ExpectationPost['category']>('Spiritual Growth');
  const [message, setMessage] = useState('');

  // Deletion Modal state for Innovation & Technology Lead
  const [postToDelete, setPostToDelete] = useState<ExpectationPost | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAdminAuthRequired, setIsAdminAuthRequired] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeExpectations((fetchedPosts) => {
      setPosts(fetchedPosts);
    });
    return () => unsubscribe();
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

    const newPost: ExpectationPost = {
      id: `exp-${Date.now()}`,
      authorName: 'Anonymous Believer',
      isAnonymous: true,
      category,
      message: message.trim(),
      amenCount: 1,
      createdAt: new Date().toISOString(),
    };

    setPosts([newPost, ...posts]);
    setMessage('');
    setShowForm(false);

    await saveExpectationToFirestore(newPost).catch((err) =>
      console.error('Failed to save expectation to Firestore:', err)
    );
  };

  // Check if current session is logged in as Innovation & Technology Lead
  const isTechLeadLoggedIn = (): boolean => {
    return localStorage.getItem('trh_camp_admin_role') === 'Innovation & Technology Lead';
  };

  // Open deletion flow
  const handleInitiateDelete = (post: ExpectationPost) => {
    setPostToDelete(post);
    setAuthError(null);
    setAdminPasswordInput('');
    
    if (isTechLeadLoggedIn()) {
      setIsAdminAuthRequired(false);
    } else {
      setIsAdminAuthRequired(true);
    }
    setShowDeleteModal(true);
  };

  // Authorize password for Innovation & Technology Lead
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
          username: 'Innovation & Technology Lead',
          password: adminPasswordInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('trh_camp_admin_role', 'Innovation & Technology Lead');
        setIsAdminAuthRequired(false);
        setAuthError(null);
      } else {
        setAuthError(data.error || 'Incorrect password for Innovation & Technology Lead.');
      }
    } catch (err) {
      setAuthError('Connection error verifying credentials. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
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

  const filteredPosts = posts.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <Flame className="w-5 h-5 text-[#FF8A00]" />
            <span className="text-xs font-mono text-[#FF8A00] font-bold uppercase tracking-wider">
              PROOF OF VICTORY WALL
            </span>
          </div>
          <span className="bg-[#FF8A00]/20 text-[#FF8A00] px-3 py-1 rounded-full text-xs font-mono font-bold border border-[#FF8A00]/30">
            {CAMP_DETAILS.scripture}
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
          Camp Faith & Prayer Expectations
        </h2>
        <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
          Post your faith expectations for the 7-day Victory Camp and join in agreement with fellow believers by clicking <strong>Amen 🙏</strong> on their requests!
        </p>

        {isTechLeadLoggedIn() && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-semibold">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>Admin Active: Logged in as <strong>Innovation & Technology Lead</strong> (Victory Wall Entry Deletion Enabled)</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#E85B00] text-[#0F172A] font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#0F172A]" />
            <span>Post Your Expectation</span>
          </button>

          <span className="text-xs text-[#94A3B8] font-mono">
            {posts.length} Faith Requests Posted
          </span>
        </div>
      </motion.div>

      {/* Post Submission Card */}
      {showForm && (
        <form
          onSubmit={handleAddPost}
          className="bg-[#1E293B] rounded-3xl p-6 sm:p-8 border-2 border-[#FF8A00] shadow-xl space-y-5 animate-fadeIn"
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
                className="w-full px-4 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] text-sm font-semibold"
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c} className="bg-[#1E293B] text-[#F8FAFC]">{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center p-3 rounded-xl bg-[#0F172A] border border-[#FF8A00]/30 text-xs text-[#94A3B8]">
              <span className="font-semibold text-[#FF8A00]">🔒 Anonymous Post:</span>
              <span className="ml-1 text-[11px]">Your request will be published anonymously on the Victory Wall.</span>
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
              className="w-full px-4 py-3 rounded-2xl border border-[#334155] bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8] text-sm leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#E85B00] text-[#0F172A] font-black text-xs sm:text-sm flex items-center gap-2 shadow cursor-pointer"
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
            className="pl-9 pr-4 py-1.5 rounded-xl border border-[#334155] text-xs w-full sm:w-48 bg-[#334155] text-[#F8FAFC] placeholder-[#94A3B8]"
          />
        </div>
      </div>

      {/* Expectation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPosts.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.45, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#1E293B] rounded-2xl p-5 border border-[#334155] shadow-sm hover:shadow-md hover:border-[#FF8A00]/40 transition-all flex flex-col justify-between space-y-4 relative group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30 px-2 py-0.5 rounded-md font-bold">
                  {post.category}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#94A3B8]">
                    {post.authorName}
                  </span>

                  {/* Delete Button for Victory Wall Entry */}
                  <button
                    type="button"
                    onClick={() => handleInitiateDelete(post)}
                    title="Delete Entry (Innovation & Technology Lead)"
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-200 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#F8FAFC] font-serif italic leading-relaxed bg-[#0F172A] p-3.5 rounded-xl border border-[#334155]">
                "{post.message}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#334155] text-xs">
              <span className="text-[10px] font-mono text-[#94A3B8]">
                TRH Victory Camp 2026
              </span>

              <button
                onClick={() => handleAmen(post.id, post.amenCount)}
                className="px-3 py-1.5 rounded-xl bg-[#FF8A00]/10 hover:bg-[#FF8A00]/20 text-[#FF8A00] font-bold border border-[#FF8A00]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Amen! 🙏</span>
                <span className="bg-[#FF8A00] text-[#0F172A] text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold">
                  {post.amenCount}
                </span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DELETION CONFIRMATION & AUTH MODAL */}
      {showDeleteModal && postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-sm animate-fadeIn">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1E293B] border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-[#F8FAFC]"
          >
            {isAdminAuthRequired ? (
              /* Step 1: Admin Password Authorization required */
              <form onSubmit={handleAuthorizeAdmin} className="space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-[#F8FAFC]">
                        Innovation & Technology Lead Verification
                      </h3>
                      <p className="text-xs text-[#94A3B8]">
                        Restricted Admin Action
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

                <p className="text-xs text-[#CBD5E1] leading-relaxed bg-[#0F172A] p-3.5 rounded-xl border border-[#334155]">
                  Deleting Victory Wall entries is restricted exclusively to the <strong>Innovation & Technology Lead</strong> official role. Please authorize with your password:
                </p>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#94A3B8]">
                    Innovation & Technology Lead Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="Enter official tech lead password..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#334155] bg-[#334155] text-[#F8FAFC] text-sm pr-10"
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
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#334155] hover:bg-[#475569] text-[#F8FAFC] text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-[#F8FAFC] text-xs font-bold flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize & Proceed</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Confirmation Modal after Auth */
              <div className="space-y-5">
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
                  Are you sure you want to permanently delete this faith expectation from the Victory Wall?
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
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
