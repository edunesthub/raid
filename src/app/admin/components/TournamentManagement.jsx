"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Search, Edit, Eye, Trash2, X } from "lucide-react";
import TournamentForm from "./TournamentForm";

export default function TournamentManagement() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);

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
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-gray-700 hover:bg-gray-900/50 transition-all">
                <td className="p-4 text-white font-medium">{t.tournament_name}</td>
                <td className="p-4 text-gray-300">{t.game}</td>
                <td className="p-4 text-gray-400">{t.status}</td>
                <td className="p-4 text-gray-400">{t.current_participants}/{t.max_participant}</td>
                <td className="p-4 text-gray-400">₵{t.entry_fee}</td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedTournament(t);
                      setShowForm(true);
                    }}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTournament(t);
                      setShowForm(true);
                    }}
                    className="p-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
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
              <span className="text-gray-400 text-sm">{t.status}</span>
            </div>
            <div className="text-gray-300 text-sm mb-2">
              Game: <span className="text-white">{t.game}</span>
            </div>
            <div className="text-gray-300 text-sm mb-2">
              Participants: <span className="text-white">{t.current_participants}/{t.max_participant}</span>
            </div>
            <div className="text-gray-300 text-sm mb-2">
              Entry Fee: <span className="text-white">₵{t.entry_fee}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  setSelectedTournament(t);
                  setShowForm(true);
                }}
                className="flex-1 p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-center transition"
              >
                <Eye size={16} /> View
              </button>
              <button
                onClick={() => {
                  setSelectedTournament(t);
                  setShowForm(true);
                }}
                className="flex-1 p-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-center transition"
              >
                <Edit size={16} /> Edit
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="flex-1 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-center transition"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
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
