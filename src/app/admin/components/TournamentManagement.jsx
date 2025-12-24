// src/app/admin/components/TournamentManagement.jsx - FIXED EDIT & SEPARATED
'use client';

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Search, Edit, Trash2, X, Calendar, Users as UsersIcon, Zap, Target, Filter } from "lucide-react";
import TournamentForm from "./TournamentForm";
import TournamentParticipants from "./TournamentParticipants";
import { useAuth } from '@/hooks/useAuth';
import { logAdminAction } from '@/services/adminAuditService';

export default function TournamentManagement() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [activeTab, setActiveTab] = useState("bracket"); // bracket or battle-royale
  const [statusUpdate, setStatusUpdate] = useState({
    tournamentId: null,
    currentStatus: "",
    newStatus: "",
  });

  const statusOptions = [
    { value: "registration-open", label: "Registration Open", color: "bg-blue-500" },
    { value: "upcoming", label: "Upcoming", color: "bg-yellow-500" },
    { value: "live", label: "Live", color: "bg-green-500" },
    { value: "completed", label: "Completed", color: "bg-gray-500" },
  ];

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "tournaments"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setTournaments(data);
    } catch (error) {
      console.error("Error loading tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this tournament? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "tournaments", id));
      setTournaments(tournaments.filter((t) => t.id !== id));
      if (user?.id) {
        logAdminAction({
          adminId: user.id,
          action: 'tournament_delete',
          entityType: 'tournament',
          entityId: id,
        });
      }
      alert("Tournament deleted successfully!");
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete tournament: " + error.message);
    }
  };

  const handleEdit = (tournament) => {
    setSelectedTournament(tournament);
    setShowForm(true);
  };

  const openStatusModal = (tournament) => {
    setStatusUpdate({
      tournamentId: tournament.id,
      currentStatus: tournament.status || "completed",
      newStatus: tournament.status || "completed",
    });
    setShowStatusModal(true);
  };

  const openParticipantsModal = (tournamentId) => {
    setSelectedTournamentId(tournamentId);
    setShowParticipantsModal(true);
  };

  const handleStatusChange = async () => {
    if (!statusUpdate.tournamentId) return;

    try {
      const tournamentRef = doc(db, "tournaments", statusUpdate.tournamentId);
      await updateDoc(tournamentRef, {
        status: statusUpdate.newStatus,
        updated_at: new Date(),
        updatedBy: user?.id || null,
      });

      setTournaments(tournaments.map(t => 
        t.id === statusUpdate.tournamentId 
          ? { ...t, status: statusUpdate.newStatus }
          : t
      ));

      if (user?.id) {
        logAdminAction({
          adminId: user.id,
          action: 'tournament_status_change',
          entityType: 'tournament',
          entityId: statusUpdate.tournamentId,
          details: { from: statusUpdate.currentStatus, to: statusUpdate.newStatus }
        });
      }
      setShowStatusModal(false);
      alert("Tournament status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update tournament status");
    }
  };

  const handleGenerateBracket = async (tournamentId) => {
    if (!confirm('Generate bracket for this tournament? This will randomly match all participants and start the tournament.')) {
      return;
    }

    try {
      setLoading(true);
      const { tournamentService } = await import('@/services/tournamentService');
      const result = await tournamentService.generateBracket(tournamentId);
      if (user?.id) {
        logAdminAction({
          adminId: user.id,
          action: 'tournament_generate_bracket',
          entityType: 'tournament',
          entityId: tournamentId,
          details: { matches: result?.matches?.length || 0 }
        });
      }
      alert(`Bracket generated successfully! ${result.matches.length} matches created for Round 1.`);
      loadTournaments();
    } catch (error) {
      console.error('Error generating bracket:', error);
      alert(error.message || 'Failed to generate bracket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(s => s.value === status);
    if (!statusOption) return <span className="text-gray-400">Unknown</span>;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${statusOption.color}`}>
        {statusOption.label}
      </span>
    );
  };

  const getFormatBadge = (format) => {
    const formatColors = {
      "Bracket": "bg-purple-500/20 text-purple-400 border-purple-500/40",
      "Battle Royale": "bg-orange-500/20 text-orange-400 border-orange-500/40",
      "Round Robin": "bg-blue-500/20 text-blue-400 border-blue-500/40",
      "Swiss": "bg-green-500/20 text-green-400 border-green-500/40",
    };

    const color = formatColors[format] || "bg-gray-500/20 text-gray-400 border-gray-500/40";

    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${color}`}>
        {format || "Unknown"}
      </span>
    );
  };

  const shouldShowBracketButton = (tournament) => {
    return (
      tournament.format === "Bracket" &&
      !tournament.bracketGenerated &&
      tournament.status === 'live'
    );
  };

  // Filter tournaments by format and search
  const bracketTournaments = tournaments.filter(t => 
    t.format === "Bracket" &&
    (t.tournament_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.game?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const battleRoyaleTournaments = tournaments.filter(t => 
    t.format !== "Bracket" &&
    (t.tournament_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.game?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayTournaments = activeTab === "bracket" ? bracketTournaments : battleRoyaleTournaments;

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-white">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Tournament Management
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage all tournaments by format
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedTournament(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-all text-sm md:text-base"
        >
          <Plus size={18} />
          Create Tournament
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search tournaments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm md:text-base focus:border-orange-500 focus:ring-2 focus:ring-orange-400 outline-none shadow-sm transition"
        />
      </div>

      {/* Format Tabs */}
      <div className="flex gap-2 bg-gray-800 border border-gray-700 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("bracket")}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "bracket"
              ? "bg-purple-600 text-white shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          <Target className="w-5 h-5" />
          Bracket Tournaments
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {bracketTournaments.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("battle-royale")}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === "battle-royale"
              ? "bg-orange-600 text-white shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          <Zap className="w-5 h-5" />
          Battle Royale / FFA
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {battleRoyaleTournaments.length}
          </span>
        </button>
      </div>

      {/* Info Banner */}
      <div className={`rounded-xl p-4 border ${
        activeTab === "bracket" 
          ? "bg-purple-500/10 border-purple-500/30" 
          : "bg-orange-500/10 border-orange-500/30"
      }`}>
        <p className={`text-sm flex items-center gap-2 ${
          activeTab === "bracket" ? "text-purple-400" : "text-orange-400"
        }`}>
          <Filter className="w-4 h-4" />
          {activeTab === "bracket" 
            ? "Bracket tournaments use auto-generated elimination brackets. Click 'Generate Bracket' when ready to start."
            : "Battle Royale tournaments require manual winner selection. Use 'Battle Royale Results' tab to set winners."}
        </p>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm md:text-base">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="text-left p-4">Tournament</th>
              <th className="text-left p-4">Game</th>
              <th className="text-left p-4">Format</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Participants</th>
              <th className="text-left p-4">Entry Fee</th>
              {activeTab === "bracket" && <th className="text-left p-4">Bracket</th>}
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayTournaments.length === 0 ? (
              <tr>
                <td colSpan={activeTab === "bracket" ? 8 : 7} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Filter className="w-12 h-12 text-gray-600" />
                    <p className="font-semibold">No {activeTab === "bracket" ? "bracket" : "battle royale"} tournaments found</p>
                    <p className="text-sm">Create one using the button above</p>
                  </div>
                </td>
              </tr>
            ) : (
              displayTournaments.map((t) => (
                <tr key={t.id} className="border-t border-gray-700 hover:bg-gray-900/50 transition-all">
                  <td className="p-4 text-white font-medium">
                    <div>{t.tournament_name}</div>
                    <div className="mt-1 space-x-2">
                      {(t.createdByName || t.createdByRole) && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">Created by</span>
                          {t.createdByName && (
                            <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-white">{t.createdByName}</span>
                          )}
                          {t.createdByRole && (
                            <span className="px-2 py-0.5 rounded bg-orange-600/20 border border-orange-500/40 text-orange-300">Admin {t.createdByRole}</span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 space-x-2">
                      {(t.updatedByName || t.updatedByRole) && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">Updated by</span>
                          {t.updatedByName && (
                            <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-white">{t.updatedByName}</span>
                          )}
                          {t.updatedByRole && (
                            <span className="px-2 py-0.5 rounded bg-orange-600/20 border border-orange-500/40 text-orange-300">Admin {t.updatedByRole}</span>
                          )}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{t.game}</td>
                  <td className="p-4">{getFormatBadge(t.format)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => openStatusModal(t)}
                      className="hover:scale-105 transition-transform"
                    >
                      {getStatusBadge(t.status || "completed")}
                    </button>
                  </td>
                  <td className="p-4 text-gray-400">
                    <button
                      onClick={() => openParticipantsModal(t.id)}
                      className="flex items-center gap-2 hover:text-orange-400 transition-colors"
                    >
                      <UsersIcon size={16} />
                      {t.current_participants}/{t.max_participant}
                    </button>
                  </td>
                  <td className="p-4 text-gray-400">₵{t.entry_fee}</td>
                  {activeTab === "bracket" && (
                    <td className="p-4">
                      {t.bracketGenerated ? (
                        <span className="text-green-400 text-xs flex items-center gap-1">
                          <Target size={12} />
                          Generated
                        </span>
                      ) : (
                        <span className="text-yellow-500 text-xs flex items-center gap-1">
                          <Zap size={12} />
                          Pending
                        </span>
                      )}
                    </td>
                  )}
                  <td className="p-4">
                    <div className="flex gap-2">
                      {shouldShowBracketButton(t) && (
                        <button
                          onClick={() => handleGenerateBracket(t.id)}
                          className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition"
                          title="Generate Bracket"
                        >
                          <Zap size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => openStatusModal(t)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition"
                        title="Change Status"
                      >
                        <Calendar size={14} />
                      </button>
                      <button
                        onClick={() => openParticipantsModal(t.id)}
                        className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition"
                        title="View Participants"
                      >
                        <UsersIcon size={14} />
                      </button>
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition"
                        title="Edit Tournament"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                        title="Delete Tournament"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-4 md:hidden">
        {displayTournaments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <Filter className="w-12 h-12 text-gray-600" />
              <p className="font-semibold">No {activeTab === "bracket" ? "bracket" : "battle royale"} tournaments found</p>
              <p className="text-sm">Create one using the button above</p>
            </div>
          </div>
        ) : (
          displayTournaments.map((t) => (
            <div key={t.id} className="bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-lg transition border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-semibold flex-1">{t.tournament_name}</h3>
                <button onClick={() => openStatusModal(t)}>
                  {getStatusBadge(t.status || "completed")}
                </button>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="text-gray-300">
                  Game: <span className="text-white">{t.game}</span>
                </div>
                <div className="flex items-center gap-2">
                  Format: {getFormatBadge(t.format)}
                </div>
                {(t.createdByName || t.createdByRole) && (
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">Created by</span>
                    {t.createdByName && (
                      <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-white">{t.createdByName}</span>
                    )}
                    {t.createdByRole && (
                      <span className="px-2 py-0.5 rounded bg-orange-600/20 border border-orange-500/40 text-orange-300">Admin {t.createdByRole}</span>
                    )}
                  </div>
                )}
                {(t.updatedByName || t.updatedByRole) && (
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700">Updated by</span>
                    {t.updatedByName && (
                      <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-white">{t.updatedByName}</span>
                    )}
                    {t.updatedByRole && (
                      <span className="px-2 py-0.5 rounded bg-orange-600/20 border border-orange-500/40 text-orange-300">Admin {t.updatedByRole}</span>
                    )}
                  </div>
                )}
                <button
                  onClick={() => openParticipantsModal(t.id)}
                  className="flex items-center gap-2 text-gray-300 hover:text-orange-400 transition-colors"
                >
                  <UsersIcon size={16} />
                  Participants: <span className="text-white">{t.current_participants}/{t.max_participant}</span>
                </button>
                <div className="text-gray-300">
                  Entry Fee: <span className="text-white">₵{t.entry_fee}</span>
                </div>
                {activeTab === "bracket" && (
                  <div className="text-gray-300">
                    Bracket: {t.bracketGenerated ? (
                      <span className="text-green-400">✓ Generated</span>
                    ) : (
                      <span className="text-yellow-500">⚡ Pending</span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {shouldShowBracketButton(t) && (
                  <button
                    onClick={() => handleGenerateBracket(t.id)}
                    className="col-span-2 p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition flex items-center justify-center gap-1"
                  >
                    <Zap size={16} /> Generate Bracket
                  </button>
                )}
                <button
                  onClick={() => openStatusModal(t)}
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <Calendar size={16} /> Status
                </button>
                <button
                  onClick={() => openParticipantsModal(t.id)}
                  className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <UsersIcon size={16} /> Users
                </button>
                <button
                  onClick={() => handleEdit(t)}
                  className="p-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-md relative shadow-2xl border border-gray-700">
            <button
              onClick={() => setShowStatusModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold text-white mb-6">Change Tournament Status</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Current Status
                </label>
                <div className="p-3 bg-gray-800 rounded-lg">
                  {getStatusBadge(statusUpdate.currentStatus)}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  New Status
                </label>
                <select
                  value={statusUpdate.newStatus}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, newStatus: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {showParticipantsModal && selectedTournamentId && (
        <TournamentParticipants
          tournamentId={selectedTournamentId}
          onClose={() => {
            setShowParticipantsModal(false);
            setSelectedTournamentId(null);
          }}
        />
      )}

      {/* Tournament Form Modal */}
      {showForm && (
        <TournamentForm
          tournament={selectedTournament}
          onClose={() => {
            setShowForm(false);
            setSelectedTournament(null);
          }}
          onCreated={() => {
            loadTournaments();
            setShowForm(false);
            setSelectedTournament(null);
          }}
        />
      )}
    </div>
  );
}