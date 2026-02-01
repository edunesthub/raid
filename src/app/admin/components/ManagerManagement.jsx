'use client';
import { useState, useEffect } from 'react';
import { getManagers, deleteManager } from '@/services/teamService';
import { Trash2, UserPlus, Search, ShieldAlert, Mail } from 'lucide-react';

export default function ManagerManagement() {
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleting, setIsDeleting] = useState(null);

    useEffect(() => {
        loadManagers();
    }, []);

    const loadManagers = async () => {
        try {
            setLoading(true);
            const data = await getManagers();
            setManagers(data);
        } catch (err) {
            console.error('Error loading managers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (email) => {
        if (!window.confirm(`Are you sure you want to delete the manager with email: ${email}? This will revoke their access to the manager portal.`)) return;

        try {
            setIsDeleting(email);
            await deleteManager(email);
            setManagers(prev => prev.filter(m => m.id !== email));
            alert('Manager deleted successfully');
        } catch (err) {
            console.error('Failed to delete manager:', err);
            alert('Failed to delete manager');
        } finally {
            setIsDeleting(null);
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
                            className="group bg-gray-900/40 border border-gray-800 hover:border-orange-500/30 rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/5"
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
                                <div className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-[9px] font-black uppercase tracking-widest text-gray-400">
                                    Manager
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-800/50 flex items-center justify-between">
                                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                    Authentication: OK
                                </div>
                                <button
                                    onClick={() => handleDelete(manager.id || manager.email)}
                                    disabled={isDeleting === (manager.id || manager.email)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all font-bold text-xs border border-red-500/20 hover:scale-105 active:scale-95 disabled:opacity-50"
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
        </div>
    );
}
