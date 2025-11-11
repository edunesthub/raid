"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X } from "lucide-react";

export default function TournamentForm({ onClose, onCreated }) {
  const [form, setForm] = useState({
    tournament_name: "",
    game: "",
    entry_fee: "",
    max_participant: "",
    first_place: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.tournament_name || !form.game) return alert("Please fill required fields");

    setLoading(true);
    try {
      await addDoc(collection(db, "tournaments"), {
        tournament_name: form.tournament_name,
        game: form.game,
        entry_fee: Number(form.entry_fee) || 0,
        max_participant: Number(form.max_participant) || 0,
        first_place: Number(form.first_place) || 0,
        current_participants: 0,
        status: "registration-open",
        created_at: serverTimestamp(),
      });
      onCreated(); // refresh list
      onClose();   // close modal
    } catch (error) {
      console.error(error);
      alert("Failed to create tournament");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
          <X size={18} />
        </button>
        <h3 className="text-xl font-bold text-white mb-4">Create Tournament</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="tournament_name"
            placeholder="Tournament Name"
            value={form.tournament_name}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            required
          />
          <input
            name="game"
            placeholder="Game Name"
            value={form.game}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="entry_fee"
              placeholder="Entry Fee"
              value={form.entry_fee}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
            <input
              type="number"
              name="max_participant"
              placeholder="Max Participants"
              value={form.max_participant}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <input
            type="number"
            name="first_place"
            placeholder="First Place Prize"
            value={form.first_place}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded-lg"
          >
            {loading ? "Creating..." : "Create Tournament"}
          </button>
        </form>
      </div>
    </div>
  );
}
