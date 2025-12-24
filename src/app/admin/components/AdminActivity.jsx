'use client';

import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { Filter, RefreshCcw, Search, UserCircle2, Clock, ListFilter } from 'lucide-react';

export default function AdminActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminCache, setAdminCache] = useState({}); // id -> {name, role}
  const [filters, setFilters] = useState({ group: 'all', action: 'all', search: '' });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'admin_audit_logs'), orderBy('createdAt', 'desc'), limit(200));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLogs(items);

      // Preload admin info
      const ids = [...new Set(items.map(l => l.adminId).filter(Boolean))];
      const cacheUpdates = {};
      await Promise.all(ids.map(async (id) => {
        if (adminCache[id]) return;
        try {
          const us = await getDoc(doc(db, 'users', id));
          if (us.exists()) {
            const u = us.data();
            cacheUpdates[id] = {
              name: u.username || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Admin',
              role: u.adminRole || null,
            };
          }
        } catch {}
      }));
      if (Object.keys(cacheUpdates).length) setAdminCache(prev => ({ ...prev, ...cacheUpdates }));
    } catch (e) {
      console.error('Failed loading admin logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const groupOk = filters.group === 'all' || (adminCache[l.adminId]?.role || '').toUpperCase() === filters.group;
      const actionOk = filters.action === 'all' || (l.action || '') === filters.action;
      const s = filters.search.trim().toLowerCase();
      const searchOk = !s || [
        l.entityId,
        l.entityType,
        l.action,
        adminCache[l.adminId]?.name,
      ].filter(Boolean).some(v => String(v).toLowerCase().includes(s));
      return groupOk && actionOk && searchOk;
    });
  }, [logs, filters, adminCache]);

  const actionsList = useMemo(() => {
    const set = new Set(logs.map(l => l.action).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [logs]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Admin Activity</h2>
          <p className="text-gray-400 text-sm mt-1">Recent actions by Admin A/B/C</p>
        </div>
        <button
          onClick={loadLogs}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-all text-sm md:text-base"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by admin, entity, or action"
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm md:text-base focus:border-orange-500 focus:ring-2 focus:ring-orange-400 outline-none shadow-sm transition"
          />
        </div>
        <div>
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><ListFilter size={14} /> Admin Group</div>
          <select
            value={filters.group}
            onChange={(e) => setFilters(f => ({ ...f, group: e.target.value }))}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-3 text-white"
          >
            <option value="all">All</option>
            <option value="A">Admin A</option>
            <option value="B">Admin B</option>
            <option value="C">Admin C</option>
          </select>
        </div>
        <div>
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><Filter size={14} /> Action</div>
          <select
            value={filters.action}
            onChange={(e) => setFilters(f => ({ ...f, action: e.target.value }))}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-3 text-white"
          >
            {actionsList.map(a => (
              <option key={a} value={a}>{a === 'all' ? 'All' : a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm md:text-base">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="text-left p-4">Admin</th>
              <th className="text-left p-4">Group</th>
              <th className="text-left p-4">Action</th>
              <th className="text-left p-4">Entity</th>
              <th className="text-left p-4">Details</th>
              <th className="text-left p-4">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">No activity found</td>
              </tr>
            ) : (
              filtered.map((l) => {
                const a = adminCache[l.adminId] || {};
                const time = l.createdAt?.toDate ? l.createdAt.toDate() : (l.createdAt?._seconds ? new Date(l.createdAt._seconds * 1000) : null);
                return (
                  <tr key={l.id} className="border-t border-gray-700 hover:bg-gray-900/50 transition-all">
                    <td className="p-4 text-white font-medium flex items-center gap-2">
                      <UserCircle2 size={16} className="text-gray-400" />
                      {a.name || l.adminId || 'Admin'}
                    </td>
                    <td className="p-4 text-orange-300">
                      {a.role ? `Admin ${a.role}` : '-'}
                    </td>
                    <td className="p-4 text-gray-300">{l.action}</td>
                    <td className="p-4 text-gray-300">{l.entityType}{l.entityId ? `: ${l.entityId}` : ''}</td>
                    <td className="p-4 text-gray-400">
                      {l.details ? <code className="text-xs break-words">{JSON.stringify(l.details)}</code> : '-'}
                    </td>
                    <td className="p-4 text-gray-400 flex items-center gap-2">
                      <Clock size={14} className="text-gray-500" />
                      {time ? time.toLocaleString() : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
