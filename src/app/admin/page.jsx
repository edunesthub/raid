import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';

// Mock Admin Authentication
const useAdminAuth = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminData = localStorage.getItem('admin_auth');
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    if (email === 'admin@raidarena.com' && password === 'admin123') {
      const adminData = {
        id: 'admin_1',
        email: email,
        name: 'Admin User',
        role: 'super_admin'
      };
      localStorage.setItem('admin_auth', JSON.stringify(adminData));
      setAdmin(adminData);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('admin_auth');
    setAdmin(null);
  };

  return { admin, loading, login, logout };
};

// Login Page
const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    if (onLogin(email, password)) {
      setError('');
    } else {
      setError('Invalid credentials. Try: admin@raidarena.com / admin123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-orange-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-orange-500/30 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">RAID Arena</h1>
          <p className="text-orange-400">Admin Portal</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 rounded-lg transition-all"
          >
            Sign In
          </button>

          <div className="text-center text-gray-400 text-sm">
            Demo: admin@raidarena.com / admin123
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Stats Card
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
        {trend && (
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
  const stats = [
    { title: "Total Users", value: "2,547", icon: Users, trend: 12, color: "blue" },
    { title: "Active Tournaments", value: "18", icon: Trophy, trend: 8, color: "orange" },
    { title: "Total Revenue", value: "₵45,890", icon: BarChart3, trend: 15, color: "green" },
    { title: "Pending Actions", value: "7", icon: AlertCircle, trend: -3, color: "purple" }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: "New tournament created", user: "Admin", time: "5 minutes ago" },
            { action: "User registration", user: "john@example.com", time: "15 minutes ago" },
            { action: "Tournament completed", user: "COD Mobile Pro League", time: "1 hour ago" },
            { action: "Payment received", user: "₵250", time: "2 hours ago" }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <div>
                <p className="text-white font-medium">{activity.action}</p>
                <p className="text-gray-400 text-sm">{activity.user}</p>
              </div>
              <span className="text-gray-500 text-sm">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Tournament Management
const TournamentManagement = () => {
  const [tournaments, setTournaments] = useState([
    { id: 1, name: "COD Mobile Pro League", game: "Call of Duty Mobile", status: "active", participants: 45, maxParticipants: 64, prize: 5000 },
    { id: 2, name: "PUBG Championship", game: "PUBG Mobile", status: "upcoming", participants: 32, maxParticipants: 100, prize: 10000 },
    { id: 3, name: "FIFA Mobile Tournament", game: "FIFA Mobile", status: "completed", participants: 128, maxParticipants: 128, prize: 3000 }
  ]);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this tournament?')) {
      setTournaments(tournaments.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Tournament Management</h2>
        <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition-all">
          <Plus size={20} />
          Create Tournament
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tournaments..."
            className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-orange-500"
          />
        </div>
        <button className="flex items-center gap-2 bg-gray-800 border border-gray-600 hover:border-orange-500 text-white px-4 py-3 rounded-lg transition-all">
          <Filter size={20} />
          Filters
        </button>
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
              {tournaments.map((tournament) => (
                <tr key={tournament.id} className="border-t border-gray-700 hover:bg-gray-900/50">
                  <td className="p-4">
                    <p className="text-white font-medium">{tournament.name}</p>
                  </td>
                  <td className="p-4 text-gray-300">{tournament.game}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tournament.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      tournament.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
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
                      <button onClick={() => handleDelete(tournament.id)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all">
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

// User Management
const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", status: "active", tournaments: 12, earnings: 5400 },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "active", tournaments: 8, earnings: 3200 },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", status: "suspended", tournaments: 15, earnings: 7800 }
  ]);

  const toggleUserStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
        : user
    ));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">User Management</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search users by name or email..."
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
                <th className="text-left text-gray-300 font-medium p-4">Tournaments</th>
                <th className="text-left text-gray-300 font-medium p-4">Total Earnings</th>
                <th className="text-left text-gray-300 font-medium p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-900/50">
                  <td className="p-4">
                    <p className="text-white font-medium">{user.name}</p>
                  </td>
                  <td className="p-4 text-gray-300">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{user.tournaments}</td>
                  <td className="p-4 text-white font-medium">₵{user.earnings.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => toggleUserStatus(user.id)} className={`p-2 rounded-lg transition-all ${
                          user.status === 'active' 
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                            : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                        }`}>
                        {user.status === 'active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
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

// Main Admin Portal
const AdminPortal = () => {
  const { admin, loading, login, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin onLogin={login} />;
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