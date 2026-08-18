import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminUser } from '../types';
import { STANDARD_ADMIN_ROLES, DEFAULT_ADMIN_USERS } from '../data/campData';
import {
  saveAdminUserToFirestore,
  updateAdminUserInFirestore,
  deleteAdminUserFromFirestore,
  seedInitialAdminUsersIfEmpty,
} from '../lib/firebase';
import {
  ShieldCheck,
  UserPlus,
  Search,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  Edit3,
  RefreshCw,
  Lock,
  Users,
  ShieldAlert,
  Sparkles,
  AlertCircle,
  X,
  CheckCircle2,
  Sliders,
  Calendar,
  Layers,
  Fingerprint,
  Info,
} from 'lucide-react';

interface UserAccountManagementProps {
  adminUsers: AdminUser[];
  currentAdminRole: string | null;
  onRefresh?: () => void;
}

export const UserAccountManagement: React.FC<UserAccountManagementProps> = ({
  adminUsers,
  currentAdminRole,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [globalShowPasswords, setGlobalShowPasswords] = useState(false);
  const [revealedPasswordIds, setRevealedPasswordIds] = useState<Record<string, boolean>>({});

  // Copy Feedback
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modal States
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Form Fields
  const [formFullName, setFormFullName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formShowPassword, setFormShowPassword] = useState(true);
  const [formRole, setFormRole] = useState(STANDARD_ADMIN_ROLES[0]);
  const [formCustomRole, setFormCustomRole] = useState('');
  const [formIsSuperAdmin, setFormIsSuperAdmin] = useState(false);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Password Reset Modal
  const [passwordResetUser, setPasswordResetUser] = useState<AdminUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetModalShowPass, setResetModalShowPass] = useState(true);
  const [resetModalError, setResetModalError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Delete Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Success Notification Banner
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => {
      setSuccessNotice((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Helper to copy text to clipboard
  const handleCopyText = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField((prev) => (prev === fieldKey ? null : prev));
    }, 2000);
  };

  // Password Generator Helper
  const generateStrongPassword = () => {
    const prefixes = ['TrhCamp', 'Victory', 'Evidence', 'Praise', 'Shiloh', 'Grace', 'Glory'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomYear = '2026';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const symbols = ['!', '#', '@', '$', '*'];
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    return `${randomPrefix}${randomYear}${randomSymbol}${randomSuffix}`;
  };

  // Auto-generate Login ID from Name
  const generateUsernameFromName = (name: string, role: string) => {
    if (!name.trim()) return '';
    const cleanName = name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');
    return cleanName || role;
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormFullName('');
    setFormUsername('');
    setFormPassword(generateStrongPassword());
    setFormRole(STANDARD_ADMIN_ROLES[6]); // default to Information Desk
    setFormCustomRole('');
    setFormIsSuperAdmin(false);
    setFormNotes('');
    setFormError(null);
    setShowCreateEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setFormFullName(user.fullName || '');
    setFormUsername(user.username || '');
    setFormPassword(user.password || '');
    if (STANDARD_ADMIN_ROLES.includes(user.role)) {
      setFormRole(user.role);
      setFormCustomRole('');
    } else {
      setFormRole('Custom Role');
      setFormCustomRole(user.role);
    }
    setFormIsSuperAdmin(Boolean(user.isSuperAdmin));
    setFormNotes(user.notes || '');
    setFormError(null);
    setShowCreateEditModal(true);
  };

  // Save / Update User Submit
  const handleSaveUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const fullName = formFullName.trim();
    const username = formUsername.trim();
    const password = formPassword.trim();
    const finalRole = formRole === 'Custom Role' ? formCustomRole.trim() : formRole;

    if (!fullName) {
      setFormError('Full Name is required.');
      return;
    }
    if (!username) {
      setFormError('Username (Login ID) is required.');
      return;
    }
    if (!password || password.length < 5) {
      setFormError('Password must be at least 5 characters.');
      return;
    }
    if (!finalRole) {
      setFormError('Please specify an administrative role.');
      return;
    }

    // Check duplicate username (except when editing self)
    const existing = adminUsers.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        (!editingUser || u.id !== editingUser.id)
    );
    if (existing) {
      setFormError(`Username "${username}" is already assigned to ${existing.fullName}. Please choose a unique Login ID.`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingUser) {
        // Update existing user
        const updatedUser: AdminUser = {
          ...editingUser,
          fullName,
          username,
          password,
          role: finalRole,
          isSuperAdmin: formIsSuperAdmin || finalRole === 'Innovation & Technology Lead',
          notes: formNotes.trim(),
          updatedAt: new Date().toISOString(),
        };

        await updateAdminUserInFirestore(updatedUser);
        showNotification(`User "${fullName}" (${username}) updated globally.`);
      } else {
        // Create new user
        const newId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newUser: AdminUser = {
          id: newId,
          fullName,
          username,
          password,
          role: finalRole,
          isSuperAdmin: formIsSuperAdmin || finalRole === 'Innovation & Technology Lead',
          notes: formNotes.trim(),
          createdAt: new Date().toISOString(),
          createdBy: currentAdminRole || 'Innovation & Technology Lead',
        };

        await saveAdminUserToFirestore(newUser);
        showNotification(`New Admin Account "${fullName}" (${username}) created successfully.`);
      }

      setShowCreateEditModal(false);
    } catch (err: any) {
      console.error('Error saving admin user:', err);
      setFormError(err.message || 'Failed to save admin user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Reset Password Modal
  const handleOpenPasswordReset = (user: AdminUser) => {
    setPasswordResetUser(user);
    setNewPasswordInput(generateStrongPassword());
    setResetModalError(null);
  };

  // Confirm Quick Password Reset
  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUser) return;

    const pass = newPasswordInput.trim();
    if (!pass || pass.length < 5) {
      setResetModalError('Password must be at least 5 characters.');
      return;
    }

    setIsResetting(true);
    setResetModalError(null);

    try {
      const updatedUser: AdminUser = {
        ...passwordResetUser,
        password: pass,
        updatedAt: new Date().toISOString(),
      };
      await updateAdminUserInFirestore(updatedUser);
      showNotification(`Password for "${passwordResetUser.fullName}" updated globally.`);
      setPasswordResetUser(null);
    } catch (err: any) {
      console.error('Failed to reset password:', err);
      setResetModalError(err.message || 'Failed to update password.');
    } finally {
      setIsResetting(false);
    }
  };

  // Confirm Delete User
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    // Prevent deleting the primary super admin
    if (userToDelete.role === 'Innovation & Technology Lead' && userToDelete.username === 'Innovation & Technology Lead') {
      setDeleteError('The primary Super Admin root account cannot be deleted to prevent administrative lockouts.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteAdminUserFromFirestore(userToDelete.id);
      showNotification(`Admin account "${userToDelete.fullName}" (${userToDelete.username}) has been permanently deleted.`);
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete admin user:', err);
      setDeleteError(err.message || 'Failed to delete user account.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset to Defaults helper if needed
  const handleSeedDefaults = async () => {
    if (window.confirm('Reset/Seed missing default church administration accounts into Firestore?')) {
      await seedInitialAdminUsersIfEmpty(DEFAULT_ADMIN_USERS);
      showNotification('Default administrative user accounts seeded.');
    }
  };

  // Toggle individual row password visibility
  const toggleRowPassword = (userId: string) => {
    setRevealedPasswordIds((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return adminUsers.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q) ||
        (u.notes || '').toLowerCase().includes(q);

      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'super_admin' && (u.isSuperAdmin || u.role === 'Innovation & Technology Lead')) ||
        u.role === roleFilter;

      return matchesQuery && matchesRole;
    });
  }, [adminUsers, searchQuery, roleFilter]);

  // Statistics
  const totalCount = adminUsers.length;
  const superAdminCount = adminUsers.filter(
    (u) => u.isSuperAdmin || u.role === 'Innovation & Technology Lead'
  ).length;
  const standardAdminCount = totalCount - superAdminCount;

  return (
    <div id="user-access-management-container" className="space-y-6 animate-fadeIn text-[#F8FAFC]">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF8A00]/10 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#FF8A00]" />
              <span>Super Admin Master Control</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
              User Access &amp; RBAC Management
            </h2>
            <p className="text-sm text-[#CBD5E1] leading-relaxed">
              Super Admin control: Generate login credentials, update passwords globally, and manage staff access.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="create-user-account-btn"
              type="button"
              onClick={handleOpenCreateModal}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8A00] to-[#E85B00] hover:from-[#FFA033] hover:to-[#FF6B00] text-[#0F172A] font-black text-sm shadow-xl hover:shadow-[#FF8A00]/25 transition-all flex items-center gap-2.5 cursor-pointer transform active:scale-95"
            >
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
              <span>Create User Account</span>
            </button>

            {adminUsers.length === 0 && (
              <button
                type="button"
                onClick={handleSeedDefaults}
                className="px-4 py-3 rounded-2xl bg-[#1E293B] hover:bg-[#334155] text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                title="Initialize default administration accounts into Firestore"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Seed Defaults</span>
              </button>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-[#334155]/80">
          <div className="bg-[#0F172A]/80 p-3.5 rounded-2xl border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Total Users</span>
              <Users className="w-4 h-4 text-[#FF8A00]" />
            </div>
            <p className="text-2xl font-black text-[#F8FAFC] mt-1">{totalCount}</p>
            <span className="text-[10px] text-emerald-400 font-medium">Synced Globally</span>
          </div>

          <div className="bg-[#0F172A]/80 p-3.5 rounded-2xl border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Super Admins</span>
              <ShieldAlert className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-purple-300 mt-1">{superAdminCount}</p>
            <span className="text-[10px] text-purple-400 font-medium">Master Privileges</span>
          </div>

          <div className="bg-[#0F172A]/80 p-3.5 rounded-2xl border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Staff Accounts</span>
              <Fingerprint className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-cyan-300 mt-1">{standardAdminCount}</p>
            <span className="text-[10px] text-slate-400 font-medium">Operational Leads</span>
          </div>

          <div className="bg-[#0F172A]/80 p-3.5 rounded-2xl border border-[#334155]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Database Sync</span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-sm font-black text-emerald-400 mt-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Live Active
            </p>
            <span className="text-[10px] text-[#94A3B8] font-mono">Firestore Real-Time</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {successNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 px-5 py-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-400 hover:text-white p-1 rounded-lg hover:bg-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar: Search, Filters, and Global Password Toggle */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, login ID, or role..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#FF8A00] focus:ring-1 focus:ring-[#FF8A00] outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter & Global Password Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#FF8A00] outline-none cursor-pointer"
            >
              <option value="all">All Roles ({adminUsers.length})</option>
              <option value="super_admin">Super Admins ({superAdminCount})</option>
              {STANDARD_ADMIN_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setGlobalShowPasswords(!globalShowPasswords)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              globalShowPasswords
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/80'
                : 'bg-[#0F172A] border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#475569]'
            }`}
          >
            {globalShowPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{globalShowPasswords ? 'Hide All Passwords' : 'Show All Passwords'}</span>
          </button>
        </div>
      </div>

      {/* Main Table: Registered System Users */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-[#334155] flex items-center justify-between bg-[#1E293B]/80">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#FF8A00]" />
            <h3 className="text-base sm:text-lg font-extrabold text-[#F8FAFC]">
              Registered System Users
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0F172A] border border-[#334155] text-[11px] font-mono text-[#FF8A00] font-bold">
              {filteredUsers.length} of {adminUsers.length}
            </span>
          </div>

          <span className="text-[11px] font-mono text-[#94A3B8] hidden sm:inline-block">
            Global Credentials &amp; RBAC Directory
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0F172A] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider border-b border-[#334155]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Full Name</th>
                <th className="py-3.5 px-4">Username (Login ID)</th>
                <th className="py-3.5 px-4">Password</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/70 text-[#F8FAFC]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                    <div className="space-y-3 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-[#94A3B8] flex items-center justify-center mx-auto border border-[#334155]">
                        <Search className="w-6 h-6 opacity-60" />
                      </div>
                      <p className="text-sm font-semibold text-[#F8FAFC]">No Administrator Accounts Found</p>
                      <p className="text-xs text-[#94A3B8]">
                        {searchQuery
                          ? `No user matched your search query "${searchQuery}".`
                          : 'No administrator accounts registered yet.'}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="px-4 py-1.5 rounded-xl bg-[#0F172A] hover:bg-[#334155] text-xs font-bold text-[#FF8A00] border border-[#FF8A00]/40"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSuper = user.isSuperAdmin || user.role === 'Innovation & Technology Lead';
                  const isPasswordVisible = globalShowPasswords || Boolean(revealedPasswordIds[user.id]);
                  const isCopiedLogin = copiedField === `login_${user.id}`;
                  const isCopiedPass = copiedField === `pass_${user.id}`;

                  // Initials for avatar
                  const nameParts = (user.fullName || user.username || 'Admin').split(' ').filter(Boolean);
                  const initials = nameParts.length >= 2
                    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                    : (nameParts[0]?.[0] || 'A').toUpperCase();

                  // Formatted Date
                  const createdDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'System Default';

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#0F172A]/50 transition-colors group"
                    >
                      {/* Full Name */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                              isSuper
                                ? 'bg-purple-950 text-purple-300 border-purple-500/50 shadow-sm'
                                : 'bg-[#0F172A] text-[#FF8A00] border-[#FF8A00]/30'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-[#F8FAFC] flex items-center gap-1.5">
                              <span>{user.fullName}</span>
                              {isSuper && (
                                <span
                                  className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-500/40 font-bold"
                                  title="Super Administrator Master Privileges"
                                >
                                  SUPER
                                </span>
                              )}
                            </div>
                            {user.notes && (
                              <span className="text-[10px] text-[#94A3B8] line-clamp-1 max-w-xs">
                                {user.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Username / Login ID */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 bg-[#0F172A] px-2.5 py-1 rounded-lg border border-[#334155]">
                          <span className="font-mono text-xs font-bold text-[#FF8A00]">
                            {user.username}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(user.username, `login_${user.id}`)}
                            className="text-[#94A3B8] hover:text-[#F8FAFC] p-0.5 rounded cursor-pointer transition-colors"
                            title="Copy Username"
                          >
                            {isCopiedLogin ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Password */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 bg-[#0F172A] px-2.5 py-1 rounded-lg border border-[#334155]">
                          <span className="font-mono text-xs text-[#CBD5E1]">
                            {isPasswordVisible ? user.password : '••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRowPassword(user.id)}
                            className="text-[#94A3B8] hover:text-[#F8FAFC] p-0.5 rounded cursor-pointer transition-colors"
                            title={isPasswordVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isPasswordVisible ? (
                              <EyeOff className="w-3.5 h-3.5 text-[#FF8A00]" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyText(user.password, `pass_${user.id}`)}
                            className="text-[#94A3B8] hover:text-[#F8FAFC] p-0.5 rounded cursor-pointer transition-colors"
                            title="Copy Password"
                          >
                            {isCopiedPass ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                            isSuper
                              ? 'bg-purple-950/70 border-purple-500/50 text-purple-300'
                              : user.role.includes('Director') || user.role.includes('Pastor') || user.role.includes('Senate')
                              ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                              : 'bg-[#0F172A] border-[#334155] text-[#CBD5E1]'
                          }`}
                        >
                          {isSuper ? (
                            <ShieldCheck className="w-3 h-3 text-purple-400 shrink-0" />
                          ) : (
                            <Lock className="w-3 h-3 text-[#FF8A00] shrink-0" />
                          )}
                          <span className="truncate max-w-[170px]">{user.role}</span>
                        </span>
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#94A3B8]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 opacity-60" />
                          {createdDate}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Quick Password Reset Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenPasswordReset(user)}
                            className="p-1.5 rounded-lg bg-[#0F172A] hover:bg-[#334155] text-amber-400 border border-[#334155] hover:border-amber-500/40 cursor-pointer transition-colors"
                            title="Quick Change / Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 rounded-lg bg-[#0F172A] hover:bg-[#334155] text-[#F8FAFC] border border-[#334155] hover:border-[#475569] cursor-pointer transition-colors"
                            title="Edit User Details & Roles"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User Button */}
                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            disabled={user.username === 'Innovation & Technology Lead' && user.role === 'Innovation & Technology Lead'}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              user.username === 'Innovation & Technology Lead' && user.role === 'Innovation & Technology Lead'
                                ? 'bg-[#0F172A] border-[#334155] text-slate-600 cursor-not-allowed opacity-40'
                                : 'bg-[#0F172A] hover:bg-rose-950/70 border-[#334155] hover:border-rose-500/50 text-rose-400'
                            }`}
                            title={
                              user.username === 'Innovation & Technology Lead'
                                ? 'Root Super Admin cannot be deleted'
                                : 'Delete User Account'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CREATE OR EDIT USER ACCOUNT */}
      {showCreateEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/85 backdrop-blur-sm animate-fadeIn">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1E293B] border-2 border-purple-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-[#F8FAFC]"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#334155] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#FF8A00]" />
                  <span className="text-xs font-mono font-bold uppercase text-[#FF8A00]">
                    {editingUser ? 'UPDATE USER ACCOUNT' : 'CREATE NEW ADMIN ACCOUNT'}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[#F8FAFC]">
                  {editingUser ? `Edit ${editingUser.fullName}` : 'Register Administrator'}
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Manage staff credentials, system roles, and global RBAC permissions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateEditModal(false)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-xl hover:bg-[#334155] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-950/70 border border-rose-500/50 text-rose-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUserSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5">
                  Full Name <span className="text-[#FF8A00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => {
                    setFormFullName(e.target.value);
                    if (!editingUser && !formUsername) {
                      setFormUsername(generateUsernameFromName(e.target.value, formRole));
                    }
                  }}
                  placeholder="e.g., Pastor David Emmanuel or Sister Grace Okon"
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#FF8A00] outline-none"
                />
              </div>

              {/* Username (Login ID) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-[#94A3B8] uppercase">
                    Username (Login ID) <span className="text-[#FF8A00]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormUsername(generateUsernameFromName(formFullName, formRole))}
                    className="text-[10px] font-mono text-[#FF8A00] hover:underline"
                  >
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="e.g., Information Desk or DavidEmmanuel"
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#F8FAFC] font-mono placeholder-[#64748B] focus:border-[#FF8A00] outline-none"
                />
                <span className="text-[10px] text-[#94A3B8] mt-1 block">
                  Staff member will use this exact Login ID to sign into the system.
                </span>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5">
                  System Role <span className="text-[#FF8A00]">*</span>
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#F8FAFC] focus:border-[#FF8A00] outline-none cursor-pointer"
                >
                  {STANDARD_ADMIN_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="Custom Role">Custom Department / Title...</option>
                </select>

                {formRole === 'Custom Role' && (
                  <input
                    type="text"
                    required
                    value={formCustomRole}
                    onChange={(e) => setFormCustomRole(e.target.value)}
                    placeholder="Enter custom role title..."
                    className="w-full mt-2 px-4 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#F8FAFC] focus:border-[#FF8A00] outline-none"
                  />
                )}
              </div>

              {/* Password & Generator */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-[#94A3B8] uppercase">
                    Login Password <span className="text-[#FF8A00]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormPassword(generateStrongPassword())}
                    className="text-[10px] font-mono text-purple-300 hover:text-purple-200 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#FF8A00]" />
                    <span>Generate Secure Key</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={formShowPassword ? 'text' : 'password'}
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Enter login password..."
                    className="w-full pl-4 pr-10 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#F8FAFC] font-mono placeholder-[#64748B] focus:border-[#FF8A00] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setFormShowPassword(!formShowPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC]"
                  >
                    {formShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Super Admin Privileges Checkbox */}
              <div className="bg-[#0F172A] p-3.5 rounded-2xl border border-[#334155] flex items-start gap-3">
                <input
                  type="checkbox"
                  id="formIsSuperAdmin"
                  checked={formIsSuperAdmin || formRole === 'Innovation & Technology Lead'}
                  onChange={(e) => setFormIsSuperAdmin(e.target.checked)}
                  disabled={formRole === 'Innovation & Technology Lead'}
                  className="mt-0.5 w-4 h-4 text-[#FF8A00] rounded focus:ring-0 cursor-pointer accent-[#FF8A00]"
                />
                <label htmlFor="formIsSuperAdmin" className="text-xs text-[#CBD5E1] cursor-pointer space-y-0.5">
                  <span className="font-extrabold text-[#F8FAFC] block">
                    Grant Super Administrator Privileges
                  </span>
                  <span className="text-[11px] text-[#94A3B8] block">
                    Allows managing other admin accounts, generating credentials, and deleting attendee records.
                  </span>
                </label>
              </div>

              {/* Notes / Department Info */}
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] uppercase mb-1.5">
                  Responsibilities &amp; Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g., Responsible for North Gate registration check-in."
                  className="w-full px-4 py-2 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#FF8A00] outline-none resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setShowCreateEditModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#334155] text-xs font-bold text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#E85B00] hover:from-[#FFA033] hover:to-[#FF6B00] text-[#0F172A] font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{editingUser ? 'Save & Sync Changes' : 'Create User Account'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: QUICK PASSWORD RESET */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/85 backdrop-blur-sm animate-fadeIn">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1E293B] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-[#F8FAFC]"
          >
            <div className="flex items-start justify-between border-b border-[#334155] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-mono font-bold uppercase text-amber-400">
                    UPDATE PASSWORD GLOBALLY
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#F8FAFC]">
                  {passwordResetUser.fullName}
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Login ID: <strong className="text-[#FF8A00] font-mono">{passwordResetUser.username}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPasswordResetUser(null)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-xl hover:bg-[#334155] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetModalError && (
              <div className="bg-rose-950/70 border border-rose-500/50 text-rose-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{resetModalError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-[#94A3B8] uppercase">
                    New Global Password <span className="text-[#FF8A00]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewPasswordInput(generateStrongPassword())}
                    className="text-[10px] font-mono text-[#FF8A00] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Random</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={resetModalShowPass ? 'text' : 'password'}
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Enter new password..."
                    className="w-full pl-4 pr-10 py-2.5 bg-[#0F172A] border border-[#334155] rounded-xl text-xs text-[#F8FAFC] font-mono placeholder-[#64748B] focus:border-amber-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setResetModalShowPass(!resetModalShowPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC]"
                  >
                    {resetModalShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-[#94A3B8] mt-1 block">
                  Password updates instantly and applies across all devices and sessions.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setPasswordResetUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#334155] text-xs font-bold text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0F172A] font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Update Password Globally</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: DELETE USER CONFIRMATION */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/85 backdrop-blur-sm animate-fadeIn">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1E293B] border-2 border-rose-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-[#F8FAFC]"
          >
            <div className="flex items-start justify-between border-b border-[#334155] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span className="text-xs font-mono font-bold uppercase text-rose-400">
                    CONFIRM USER DELETION
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#F8FAFC]">
                  Delete Admin Account?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-xl hover:bg-[#334155] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {deleteError && (
              <div className="bg-rose-950/70 border border-rose-500/50 text-rose-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="bg-[#0F172A] p-4 rounded-2xl border border-[#334155] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Staff Name:</span>
                <span className="font-bold text-[#F8FAFC]">{userToDelete.fullName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Username (Login ID):</span>
                <span className="font-mono font-bold text-[#FF8A00]">{userToDelete.username}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Role:</span>
                <span className="font-semibold text-purple-300">{userToDelete.role}</span>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed">
              ⚠️ Deleting this user will permanently revoke their access across the entire TRH Victory Camp portal immediately. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#334155]">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#334155] text-xs font-bold text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
              >
                Keep Account
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
