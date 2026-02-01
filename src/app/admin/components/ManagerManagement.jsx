'use client';
import { useState, useEffect } from 'react';
import { getManagers, deleteManager, getTeams, deleteTeam } from '@/services/teamService';
import { Trash2, UserPlus, Search, ShieldAlert, Mail, Shield, Users, X, Loader2 } from 'lucide-react';

export default function ManagerManagement() {
    const [managers, setManagers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleting, setIsDeleting] = useState(null);
    const [selectedManager, setSelectedManager] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeletingTeam, setIsDeletingTeam] = useState(null);

    useEffect(() => {
        loadManagers();
    }, []);

    const loadManagers = async () => {
        try {
            setLoading(true);
            const [managerData, teamData] = await Promise.all([
                getManagers(),
                getTeams()
            ]);
            setManagers(managerData);
            setTeams(teamData);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (email) => {
        if (!window.confirm(`WARNING: DELETING MANAGER [${email}]\n\nThis will PERMANENTLY revoke their access to the portal. Are you sure?`)) return;

        try {
            setIsDeleting(email);
            await deleteManager(email);
            setManagers(prev => prev.filter(m => m.id !== email));
            alert('Manager deleted successfully');
            if (selectedManager?.id === email) setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to delete manager:', err);
            alert('Failed to delete manager');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!window.confirm('CRITICAL ACTION: Delete this team permanently? This cannot be undone.')) return;
        try {
            setIsDeletingTeam(teamId);
            await deleteTeam(teamId);
            setTeams(prev => prev.filter(t => t.id !== teamId));
        } catch (err) {
            console.error('Failed to delete team:', err);
            alert('Failed to delete team');
        } finally {
            setIsDeletingTeam(null);
        }
    };

    const filteredManagers = managers.filter(m =>
        (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 text-white min-h-screen bg-black/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Team <span className="text-orange-500">Managers</span></h2>
                    <p className="text-gray-400 text-sm mt-1">Review and manage the logistics team for RAID eSports.</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-full px-4 py-2 flex items-center gap-2 text-xs font-bold text-gray-400">
                    <ShieldAlert size={14} className="text-orange-500" />
                    <span>{managers.length} Total Managers</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500 transition-all font-medium"
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Decrypting access logs...</p>
                </div>
            ) : managers.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/20 border border-dashed border-gray-800 rounded-[2.5rem]">
                    <UserPlus className="text-gray-700 mx-auto mb-4" size={48} />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No managers registered in the matrix.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredManagers.map((manager) => (
                        <div
                            key={manager.id || manager.email}
                            onClick={() => {
                                setSelectedManager(manager);
                                setIsModalOpen(true);
                            }}
                            className="group bg-gray-900/40 border border-gray-800 hover:border-orange-500/30 rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/5 cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-inner flex items-center justify-center text-orange-500 font-black text-lg">
                                        {manager.name?.charAt(0).toUpperCase() || 'M'}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg text-white leading-none mb-1 uppercase tracking-tight">{manager.name || 'Anonymous'}</h3>
                                        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold">
                                            <Mail size={10} />
                                            <span className="truncate max-w-[150px]">{manager.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-800/50 flex items-center justify-between">
                                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                    Authentication: OK
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(manager.id || manager.email);
                                    }}
                                    disabled={isDeleting === (manager.id || manager.email)}
                                    className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all font-bold text-[10px] sm:text-xs border border-red-500/20 hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {isDeleting === (manager.id || manager.email) ? (
                                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Trash2 size={14} />
                                            <span>Delete</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Manager Details Modal */}
            {isModalOpen && selectedManager && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/90 backdrop-blur-xl animate-fade-in py-8">
                    <div className="relative w-full max-w-2xl bg-zinc-950 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-full">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 z-[110] p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all border border-white/5"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 pb-0">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-3xl">
                                    {selectedManager.name?.charAt(0).toUpperCase() || 'M'}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter truncate">{selectedManager.name || 'Anonymous'}</h2>
                                    <p className="text-gray-500 font-bold text-sm tracking-widest uppercase flex items-center gap-2 mt-1">
                                        <Mail size={14} className="text-orange-500" />
                                        {selectedManager.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Managed Teams</h3>
                                <div className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-orange-500/20">
                                    {teams.filter(t => t.manager === selectedManager.email).length} Teams
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar space-y-3">
                            {teams.filter(t => t.manager === selectedManager.email).length === 0 ? (
                                <div className="text-center py-10 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                    <Shield className="text-gray-700 mx-auto mb-2 opacity-30" size={32} />
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No teams associated with this operative.</p>
                                </div>
                            ) : (
                                teams.filter(t => t.manager === selectedManager.email).map((team) => (
                                    <div key={team.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group/team hover:bg-white/10 transition-all">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {team.avatarUrl ? (
                                                    <img src={team.avatarUrl} alt={team.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Shield className="text-orange-500" size={20} />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{team.name}</p>
                                                <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                                    <Users size={10} />
                                                    <span>{team.members?.length || 0} Members</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTeam(team.id);
                                            }}
                                            disabled={isDeletingTeam === team.id}
                                            className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 active:scale-90"
                                            title="Delete Team"
                                        >
                                            {isDeletingTeam === team.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-5 sm:p-8 pt-4 border-t border-white/5 bg-zinc-900/40">
                            <button
                                onClick={() => handleDelete(selectedManager.email)}
                                disabled={isDeleting === selectedManager.email}
                                className="w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)] active:scale-95 disabled:opacity-50"
                            >
                                {isDeleting === selectedManager.email ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 size={18} />
                                        <span>Terminate Manager Access</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
