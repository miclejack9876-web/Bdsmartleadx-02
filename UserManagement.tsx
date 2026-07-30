import React, { useState, useEffect } from 'react';
import { useAdmin } from './useAdmin';
import { UserRole, ApprovalStatus } from './auth';
import { 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  RefreshCw, 
  UserCheck, 
  ShieldAlert, 
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';

export function UserManagement() {
  const { 
    users, 
    metrics, 
    loading, 
    error, 
    loadUsers, 
    loadMetrics, 
    approveUser, 
    setApprovalStatus, 
    changeRole, 
    toggleUser 
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
    loadUsers();
  }, [loadMetrics, loadUsers]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = async (userId: string, userEmail: string) => {
    setActionLoadingId(userId);
    try {
      const success = await approveUser(userId);
      if (success) {
        showToast(`User ${userEmail} approved successfully!`);
        await loadUsers();
        await loadMetrics();
      } else {
        showToast(`Failed to approve ${userEmail}`);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (userId: string, userEmail: string) => {
    setActionLoadingId(userId);
    try {
      const success = await setApprovalStatus(userId, 'rejected');
      if (success) {
        showToast(`User ${userEmail} marked as rejected.`);
        await loadUsers();
        await loadMetrics();
      } else {
        showToast(`Failed to update status for ${userEmail}`);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole, userEmail: string) => {
    setActionLoadingId(userId);
    try {
      const success = await changeRole(userId, newRole);
      if (success) {
        showToast(`Role for ${userEmail} updated to ${newRole}`);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    // Filter by approval tab
    if (activeTab === 'pending' && !(u.approvalStatus === 'pending' || !u.isApproved)) return false;
    if (activeTab === 'approved' && !(u.approvalStatus === 'approved' || u.isApproved)) return false;
    if (activeTab === 'rejected' && u.approvalStatus !== 'rejected') return false;

    // Filter by role
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.fullName?.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }

    return true;
  });

  const pendingCount = users.filter((u) => u.approvalStatus === 'pending' || !u.isApproved).length;
  const approvedCount = users.filter((u) => u.approvalStatus === 'approved' || u.isApproved).length;
  const rejectedCount = users.filter((u) => u.approvalStatus === 'rejected').length;

  return (
    <div className="space-y-6" id="admin-user-management-view">
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Registered Users</p>
            <h3 className="text-2xl font-bold text-white mt-1">{users.length}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 flex items-center justify-between relative overflow-hidden">
          <div>
            <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">Pending Approval</p>
            <h3 className="text-2xl font-bold text-amber-300 mt-1">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Approved Users</p>
            <h3 className="text-2xl font-bold text-emerald-300 mt-1">{approvedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-rose-400 uppercase tracking-wider">Rejected Users</p>
            <h3 className="text-2xl font-bold text-rose-300 mt-1">{rejectedCount}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Approval Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/50'
                  : 'text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending ({pendingCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'approved'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                  : 'text-emerald-400 hover:bg-emerald-950/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved ({approvedCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === 'rejected'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50'
                  : 'text-rose-400 hover:bg-rose-950/40'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected ({rejectedCount})</span>
            </button>
          </div>

          {/* Search Input & Refresh */}
          <div className="flex items-center space-x-3">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={() => {
                loadUsers();
                loadMetrics();
              }}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Refresh User List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Approval Status</th>
                <th className="py-3.5 px-4">Registration Date</th>
                <th className="py-3.5 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-slate-600" />
                      <p className="text-sm font-medium">No users match the selected filters.</p>
                      <p className="text-xs text-slate-600">Try changing search keywords or tab filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isUserPending = u.approvalStatus === 'pending' || !u.isApproved;
                  const isUserApproved = u.approvalStatus === 'approved' || u.isApproved;
                  const isUserRejected = u.approvalStatus === 'rejected';

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Email */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs">
                            {u.fullName ? u.fullName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100">{u.fullName || 'No Name Provided'}</p>
                            <p className="text-slate-400 font-mono text-[11px]">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole, u.email)}
                          disabled={actionLoadingId === u.id}
                          className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono focus:border-cyan-500"
                        >
                          <option value="user">USER</option>
                          <option value="agent">AGENT</option>
                          <option value="manager">MANAGER</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      </td>

                      {/* Approval Status Badge */}
                      <td className="py-4 px-4">
                        {isUserApproved && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Approved
                          </span>
                        )}
                        {isUserPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            Pending Admin Approval
                          </span>
                        )}
                        {isUserRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isUserPending && (
                            <button
                              onClick={() => handleApprove(u.id, u.email)}
                              disabled={actionLoadingId === u.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center space-x-1 transition-all shadow-md shadow-emerald-950 disabled:opacity-50 cursor-pointer"
                              title="Approve user registration"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{actionLoadingId === u.id ? 'Approving...' : 'Approve'}</span>
                            </button>
                          )}

                          {isUserApproved && (
                            <span className="text-[11px] text-emerald-400 font-medium px-2 py-1 bg-emerald-950/40 rounded border border-emerald-900">
                              Active Access
                            </span>
                          )}

                          {!isUserRejected && (
                            <button
                              onClick={() => handleReject(u.id, u.email)}
                              disabled={actionLoadingId === u.id}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 rounded-lg text-xs flex items-center space-x-1 border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                              title="Reject or revoke approval"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Reject</span>
                            </button>
                          )}

                          {isUserRejected && (
                            <button
                              onClick={() => handleApprove(u.id, u.email)}
                              disabled={actionLoadingId === u.id}
                              className="px-3 py-1 bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 font-medium rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              Re-Approve
                            </button>
                          )}
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
    </div>
  );
}
