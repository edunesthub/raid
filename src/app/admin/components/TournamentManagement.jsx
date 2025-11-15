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
import { Plus, Search, Edit, Eye, Trash2, X, Calendar, Users as UsersIcon, Zap } from "lucide-react";
import TournamentForm from "./TournamentForm";
import TournamentParticipants from "./TournamentParticipants";

export default function TournamentManagement() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
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
    if (!confirm("Are you sure you want to delete this tournament?")) return;
    try {
      await deleteDoc(doc(db, "tournaments", id));
      setTournaments(tournaments.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete tournament");
    }
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
      });

      setTournaments(tournaments.map(t => 
        t.id === statusUpdate.tournamentId 
          ? { ...t, status: statusUpdate.newStatus }
          : t
      ));

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

  const filtered = tournaments.filter(
    (t) =>
      t.tournament_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.game?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-white">
        Loading tournaments...
      </div>
    );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          Tournament Management
        </h2>
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

      {/* Desktop Table */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm md:text-base">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="text-left p-4">Tournament</th>
              <th className="text-left p-4">Game</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Participants</th>
              <th className="text-left p-4">Entry Fee</th>
              <th className="text-left p-4">Bracket</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-gray-700 hover:bg-gray-900/50 transition-all">
                <td className="p-4 text-white font-medium">{t.tournament_name}</td>
                <td className="p-4 text-gray-300">{t.game}</td>
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
                <td className="p-4">
                  {t.bracketGenerated ? (
                    <span className="text-green-400 text-xs">✓ Generated</span>
                  ) : (
                    <span className="text-gray-500 text-xs">Not Generated</span>
                  )}
                </td>
                <td className="p-4 flex gap-2">
                  {!t.bracketGenerated && t.status === 'live' && (
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
                    className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition"
                    title="Change Status"
                  >
                    <Calendar size={14} />
                  </button>
                  <button
                    onClick={() => openParticipantsModal(t.id)}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition"
                    title="View Participants"
                  >
                    <UsersIcon size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTournament(t);
                      setShowForm(true);
                    }}
                    className="p-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-4 md:hidden">
        {filtered.map((t) => (
          <div key={t.id} className="bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-lg transition">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-semibold">{t.tournament_name}</h3>
              <button onClick={() => openStatusModal(t)}>
                {getStatusBadge(t.status || "completed")}
              </button>
            </div>
            <div className="text-gray-300 text-sm mb-2">
              Game: <span className="text-white">{t.game}</span>
            </div>
            <div className="text-gray-300 text-sm mb-2">
              <button
                onClick={() => openParticipantsModal(t.id)}
                className="flex items-center gap-2 hover:text-orange-400 transition-colors"
              >
                <UsersIcon size={16} />
                Participants: <span className="text-white">{t.current_participants}/{t.max_participant}</span>
              </button>
            </div>
            <div className="text-gray-300 text-sm mb-2">
              Entry Fee: <span className="text-white">₵{t.entry_fee}</span>
            </div>
            <div className="text-gray-300 text-sm mb-4">
              Bracket: {t.bracketGenerated ? (
                <span className="text-green-400">✓ Generated</span>
              ) : (
                <span className="text-gray-500">Not Generated</span>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              {!t.bracketGenerated && t.status === 'live' && (
                <button
                  onClick={() => handleGenerateBracket(t.id)}
                  className="flex-1 p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-center transition flex items-center justify-center gap-1"
                >
                  <Zap size={16} /> Generate
                </button>
              )}
              <button
                onClick={() => openStatusModal(t)}
                className="flex-1 p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-center transition flex items-center justify-center gap-1"
              >
                <Calendar size={16} /> Status
              </button>
              <button
                onClick={() => openParticipantsModal(t.id)}
                className="flex-1 p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-center transition flex items-center justify-center gap-1"
              >
                <UsersIcon size={16} /> Users
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="flex-1 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-center transition flex items-center justify-center gap-1"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-2xl relative shadow-2xl border border-gray-700">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <TournamentForm
              tournament={selectedTournament}
              onClose={() => setShowForm(false)}
              onCreated={loadTournaments}
            />
          </div>
        </div>
      )}
    </div>
  );
}