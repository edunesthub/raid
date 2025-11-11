"use client";

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

// Admin Authentication Hook
const useAdminAuth = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email === 'admin@raidarena.com') {
        setAdmin({
          id: user.uid,
          email: user.email,
          name: user.displayName || 'Admin User',
          role: 'super_admin'
        });
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setAdmin(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return { admin, loading, logout };
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, color = "orange" }) => {
  const colorClasses = {
    orange: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    green: "bg-green-500/10 border-green-500/30 text-green-400",
    blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    purple: "bg-purple-500/10 border-purple-500/30 text-purple-400"
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        {trend !== undefined && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTournaments: 0,
    totalRevenue: 0,
    pendingActions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Get users count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Get active tournaments
      const tournamentsRef = collection(db, 'tournaments');
      const tournamentsSnapshot = await getDocs(tournamentsRef);
      const activeTournaments = tournamentsSnapshot.docs.filter(doc => {
        const status = doc.data().status;
        return status === 'registration-open' || status === 'live';
      }).length;

      // Calculate total revenue (sum of entry fees * participants)
      let totalRevenue = 0;
      tournamentsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalRevenue += (data.entry_fee || 0) * (data.current_participants || 0);
      });

      setStats({
        totalUsers,
        activeTournaments,
        totalRevenue,
        pendingActions: 0
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon={Users} 
          trend={12} 
          color="blue" 
        />
        <StatCard 
          title="Active Tournaments" 
          value={stats.activeTournaments.toString()} 
          icon={Trophy} 
          trend={8} 
          color="orange" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`₵${stats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          trend={15} 
          color="green" 
        />
        <StatCard 
          title="Pending Actions" 
          value={stats.pendingActions.toString()} 
          icon={AlertCircle} 
          color="purple" 
        />
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-lg transition-all">
            Create Tournament
          </button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all">
            View Reports
          </button>
          <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-all">
            Manage Payments
          </button>
          <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-all">
            User Management
          </button>
        </div>
      </div>
    </div>
  );
};

// Tournament Management Component
const TournamentManagement = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const tournamentsRef = collection(db, 'tournaments');
      const q = query(tournamentsRef, orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      
      const tournamentData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().tournament_name || 'Untitled',
        game: doc.data().game || 'Unknown',
        status: doc.data().status || 'upcoming',
        participants: doc.data().current_participants || 0,
        maxParticipants: doc.data().max_participant || 0,
        prize: doc.data().first_place || 0,
        entryFee: doc.data().entry_fee || 0
      }));
      
      setTournaments(tournamentData);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return;
    
    try {
      await deleteDoc(doc(db, 'tournaments', id));
      setTournaments(tournaments.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('Failed to delete tournament');
    }
  };

  const filteredTournaments = tournaments.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.game.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-white">Loading tournaments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Tournament Management</h2>
        <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition-all">
          <Plus size={20} />
          Create Tournament
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search tournaments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-orange-500"
        />
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="text-left text-gray-300 font-medium p-4">Tournament</th>
                <th className="text-left text-gray-300 font-medium p-4">Game</th>
                <th className="text-left text-gray-300 font-medium p-4">Status</th>
                <th className="text-left text-gray-300 font-medium p-4">Participants</th>
                <th className="text-left text-gray-300 font-medium p-4">Prize Pool</th>
                <th className="text-left text-gray-300 font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTournaments.map((tournament) => (
                <tr key={tournament.id} className="border-t border-gray-700 hover:bg-gray-900/50">
                  <td className="p-4">
                    <p className="text-white font-medium">{tournament.name}</p>
                  </td>
                  <td className="p-4 text-gray-300">{tournament.game}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tournament.status === 'live' ? 'bg-green-500/20 text-green-400' :
                      tournament.status === 'registration-open' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {tournament.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{tournament.participants}/{tournament.maxParticipants}</td>
                  <td className="p-4 text-white font-medium">₵{tournament.prize.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all">
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(tournament.id)} 
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().username || doc.data().firstName + ' ' + doc.data().lastName || 'Unknown',
        email: doc.data().email || 'No email',
        status: 'active',
        tournaments: 0,
        earnings: 0
      }));
      
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-white">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">User Management</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-orange-500"
        />
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="text-left text-gray-300 font-medium p-4">User</th>
                <th className="text-left text-gray-300 font-medium p-4">Email</th>
                <th className="text-left text-gray-300 font-medium p-4">Status</th>
                <th className="text-left text-gray-300 font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-900/50">
                  <td className="p-4">
                    <p className="text-white font-medium">{user.name}</p>
                  </td>
                  <td className="p-4 text-gray-300">{user.email}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Main Admin Portal
const AdminPortal = () => {
  const { admin, loading, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-orange-500/30 rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">RAID Arena</h1>
            <p className="text-orange-400">Admin Portal</p>
          </div>
          <div className="text-center text-gray-400">
            <p>Please sign in with admin credentials</p>
            <p className="text-sm mt-2">admin@raidarena.com</p>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-black flex">
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">RAID Arena</h1>
          <p className="text-orange-400 text-sm">Admin Portal</p>
        </div>

        <nav className="flex-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  activeTab === item.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-800 rounded-lg">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{admin.name[0]}</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{admin.name}</p>
              <p className="text-gray-400 text-xs">{admin.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 justify-center bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'tournaments' && <TournamentManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'analytics' && (
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-4">Analytics</h2>
              <p className="text-gray-400">Analytics dashboard coming soon...</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p className="text-gray-400">Settings panel coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;