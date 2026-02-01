'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Eye, X } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [roleEditing, setRoleEditing] = useState({ role: 'user', adminRole: 'A' });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const userData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userData);
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openUserModal = async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setSelectedUser(data);
        setRoleEditing({ role: data.role || (data.isAdmin ? 'admin' : 'user'), adminRole: data.adminRole || 'A' });
        setModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  const saveUserRoles = async () => {
    if (!selectedUser) return;
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), {
        role: roleEditing.role,
        adminRole: roleEditing.adminRole,
        isAdmin: roleEditing.role === 'admin',
      });
      setUsers((prev) => prev.map(u => u.id === selectedUser.id ? { ...u, role: roleEditing.role, adminRole: roleEditing.adminRole, isAdmin: roleEditing.role === 'admin' } : u));
      alert('User roles updated');
    } catch (err) {
      console.error('Failed updating roles:', err);
      alert('Failed to update roles');
    }
  };

  return (
    <div className="p-6 text-white min-h-screen bg-gray-900">
      <h2 className="text-3xl font-bold mb-6 text-orange-400">User Management</h2>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users by username or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-400 transition"
        />
      </div>

      {/* Users List */}
      {loading ? (
        <p className="text-gray-400">Loading users...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg transition"
            >
              <div className="space-y-1">
                <p className="text-lg font-semibold text-white flex items-center gap-2">
                  {user.username}
                  {user.isAdmin && (
                    <span className="text-xs px-2 py-0.5 rounded bg-orange-600/20 border border-orange-500/40 text-orange-300">
                      Admin {user.adminRole || 'A'}
                    </span>
                  )}
                </p>
                {(user.firstName || user.lastName) && (
                  <p className="text-xs font-bold text-orange-500/70 uppercase tracking-widest -mt-1">
                    {user.firstName} {user.lastName}
                  </p>
                )}
                <p className="text-gray-400 text-sm">{user.email}</p>
                {user.createdAt && (
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                    Joined: {new Date(user.createdAt?.seconds * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => openUserModal(user.id)}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition"
              >
                <Eye size={16} /> View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* User Details Modal */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold text-orange-400 mb-4">{selectedUser.username}</h3>
            <div className="space-y-3 text-sm text-gray-200">
              <p><span className="font-medium text-white">Full Name:</span> {selectedUser.firstName} {selectedUser.lastName}</p>
              <p><span className="font-medium text-white">Email:</span> {selectedUser.email}</p>
              <p><span className="font-medium text-white">Contact:</span> {selectedUser.contact || 'N/A'}</p>
              <p><span className="font-medium text-white">Bio:</span> {selectedUser.bio || 'N/A'}</p>
              {/* Add more fields if needed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-gray-400 mb-1">Role</label>
                  <select
                    value={roleEditing.role}
                    onChange={(e) => setRoleEditing((r) => ({ ...r, role: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Admin Group</label>
                  <select
                    value={roleEditing.adminRole}
                    onChange={(e) => setRoleEditing((r) => ({ ...r, adminRole: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="A">Admin A</option>
                    <option value="B">Admin B</option>
                    <option value="C">Admin C</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Use A/B/C to divide admins into 3 groups.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={saveUserRoles}
                className="flex-1 bg-orange-600 hover:bg-orange-500 py-2 rounded-xl text-white font-medium transition"
              >
                Save
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-xl text-white font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
