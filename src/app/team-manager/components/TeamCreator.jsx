"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Search, Users, UserPlus, CheckCircle2, Shield, Loader2, Trophy, Trash2, X, AlertCircle, ArrowLeft, ChevronRight, LayoutGrid, Edit2, Camera, Save, LogOut } from "lucide-react";
import { createTeam, getTeams, addMemberToTeam, deleteTeam, updateTeam } from "@/services/teamService";
import { userService } from "@/services/userService";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, limit, where, doc, updateDoc, arrayUnion, arrayRemove, increment, deleteField } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function TeamManagerTeamCreator({ managerEmail }) {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Navigation State
  const [activeView, setActiveView] = useState("dashboard"); // "dashboard" | "manage"
  const [createdTeam, setCreatedTeam] = useState(null); // The team currently being managed

  const [teams, setTeams] = useState([]);
  const [memberDetails, setMemberDetails] = useState({}); // Map of email -> user object
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [availableTournaments, setAvailableTournaments] = useState([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(false);
  const [enrollingTournamentId, setEnrollingTournamentId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [editName, setEditName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editSlogan, setEditSlogan] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isLineupModalOpen, setIsLineupModalOpen] = useState(false);
  const [selectedForLineup, setSelectedForLineup] = useState([]);
  const [enrollingTournament, setEnrollingTournament] = useState(null);
  const teamFileInputRef = useRef(null);

  const searchRef = useRef(null);

  useEffect(() => {
    fetchTeams();
    fetchTournaments();
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (createdTeam?.members?.length > 0) {
      fetchMemberDetails(createdTeam.members);
    } else {
      setMemberDetails({});
    }
  }, [createdTeam?.members]);

  const fetchMemberDetails = async (emails) => {
    try {
      const users = await userService.getUsersByEmails(emails);
      const detailsMap = {};
      users.forEach(u => {
        detailsMap[u.email] = u;
      });
      setMemberDetails(detailsMap);
    } catch (err) {
      console.error("Error fetching member details:", err);
    }
  };

  const fetchTeams = async () => {
    const allTeams = await getTeams();
    const myTeams = allTeams.filter(t => t.manager === managerEmail);
    setTeams(myTeams);

    // Update the currently managed team if it exists in the fetched list
    if (createdTeam) {
      const updatedCurrent = myTeams.find(t => t.id === createdTeam.id);
      if (updatedCurrent) {
        setCreatedTeam(updatedCurrent); // Keep it tailored with latest data
      } else {
        // Team was deleted remotely? Go back to dashboard
        setCreatedTeam(null);
        setActiveView("dashboard");
      }
    }
  };

  const fetchTournaments = async () => {
    try {
      setTournamentsLoading(true);
      const q = query(collection(db, "tournaments"), where("participant_type", "==", "Team"));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvailableTournaments(list);
    } catch (err) {
      console.error("Error fetching squad tournaments:", err);
    } finally {
      setTournamentsLoading(false);
    }
  };

  const handleStartEnrollment = (tourn) => {
    const isEnrolled = tourn.teams?.includes(createdTeam.id);
    setEnrollingTournament(tourn);
    if (isEnrolled && tourn.rosters?.[createdTeam.id]) {
      setSelectedForLineup(tourn.rosters[createdTeam.id]);
    } else {
      setSelectedForLineup([]); // Start fresh
    }
    setIsLineupModalOpen(true);
  };

  const handleWithdrawTournament = async (tournamentId) => {
    if (!confirm("Are you sure you want to withdraw your team from this tournament?")) return;

    setEnrollingTournamentId(tournamentId);
    try {
      const tournamentRef = doc(db, "tournaments", tournamentId);

      await updateDoc(tournamentRef, {
        teams: arrayRemove(createdTeam.id),
        [`rosters.${createdTeam.id}`]: deleteField(),
        current_participants: increment(-1)
      });

      // Update local state
      setAvailableTournaments(prev => prev.map(t =>
        t.id === tournamentId
          ? {
            ...t,
            teams: (t.teams || []).filter(id => id !== createdTeam.id),
            rosters: (() => {
              const newRosters = { ...(t.rosters || {}) };
              delete newRosters[createdTeam.id];
              return newRosters;
            })()
          }
          : t
      ));

      setMessage("Team withdrawn from tournament successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Withdrawal error:", err);
      setMessage("Failed to withdraw team.");
    } finally {
      setEnrollingTournamentId(null);
    }
  };

  const toggleMemberSelection = (email) => {
    setSelectedForLineup(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleConfirmEnrollment = async () => {
    if (!enrollingTournament || !createdTeam) return;

    // Enforce squad size if defined
    if (enrollingTournament.squad_size && selectedForLineup.length !== enrollingTournament.squad_size) {
      alert(`This tournament requires exactly ${enrollingTournament.squad_size} members. You have selected ${selectedForLineup.length}.`);
      return;
    }

    if (selectedForLineup.length === 0) {
      alert("Please select at least one member for the lineup.");
      return;
    }

    const tournamentId = enrollingTournament.id;
    setEnrollingTournamentId(tournamentId);
    setIsLineupModalOpen(false);

    try {
      const tournamentRef = doc(db, "tournaments", tournamentId);

      // Update tournament with team ID and the specific roster for this team
      const isAlreadyEnrolled = enrollingTournament.teams?.includes(createdTeam.id);

      const updateData = {
        teams: arrayUnion(createdTeam.id),
        [`rosters.${createdTeam.id}`]: selectedForLineup,
      };

      if (!isAlreadyEnrolled) {
        updateData.current_participants = increment(1);
      }

      await updateDoc(tournamentRef, updateData);

      // Update local state
      setAvailableTournaments(prev => prev.map(t =>
        t.id === tournamentId
          ? {
            ...t,
            teams: isAlreadyEnrolled ? t.teams : [...(t.teams || []), createdTeam.id],
            rosters: { ...(t.rosters || {}), [createdTeam.id]: selectedForLineup }
          }
          : t
      ));

      setMessage(isAlreadyEnrolled ? "Squad lineup updated successfully!" : "Squad lineup mobilized successfully!");
      setTimeout(() => setMessage(""), 3000);
      setEnrollingTournament(null);
    } catch (err) {
      console.error("Enrollment error:", err);
      setMessage("Failed to mobilize squad lineup.");
    } finally {
      setEnrollingTournamentId(null);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const team = await createTeam({ name: teamName, managerEmail, members: [], avatarUrl: "", slogan: "" });
      await fetchTeams();
      setTeamName("");
      setMessage("Team created successfully.");

      // Auto-switch to management view for the new team
      setCreatedTeam(team);
      setActiveView("manage");

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error creating team.");
    } finally {
      setIsCreating(false);
    }
  };

  const openTeamManagement = (team) => {
    setCreatedTeam(team);
    setActiveView("manage");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeTeamManagement = () => {
    setActiveView("dashboard");
    setCreatedTeam(null);
    setIsEditingTeam(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("managerEmail");
    router.push("/team-manager/login");
  };

  const handleUpdateTeam = async () => {
    if (!editName.trim()) {
      setMessage("Team name cannot be empty.");
      return;
    }
    setIsUpdating(true);
    try {
      const updated = await updateTeam(createdTeam.id, {
        name: editName,
        slogan: editSlogan
      });
      setCreatedTeam(updated);
      await fetchTeams();
      setIsEditingTeam(false);
      setMessage("Team updated successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error updating team.");
    } finally {
      setIsUpdating(false);
    }
  };

  const startEditing = () => {
    setEditName(createdTeam.name);
    setEditSlogan(createdTeam.slogan || "");
    setIsEditingTeam(true);
  };

  const handleTeamAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      setMessage("Uploading avatar...");

      const formDataCloud = new FormData();
      formDataCloud.append('file', file);
      formDataCloud.append('upload_preset', 'raid_avatars');
      formDataCloud.append('folder', 'avatars');

      const cloudName = 'drgz6qqo5';
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formDataCloud
      });

      const data = await res.json();
      if (!data.secure_url) throw new Error('Upload failed');

      // Update the team document directly like in profile edit
      const updated = await updateTeam(createdTeam.id, { avatarUrl: data.secure_url });
      setCreatedTeam(updated);
      await fetchTeams();
      setMessage("Avatar updated!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error('Error uploading team avatar:', err);
      setMessage("Avatar upload failed.");
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm("Are you sure you want to delete this team? This action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteTeam(teamId);
      setMessage("Team deleted.");

      // If we are in management view for this team, go back
      if (createdTeam?.id === teamId) {
        closeTeamManagement();
      }

      await fetchTeams();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error deleting team.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUserSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchResults(true);

    try {
      // Advanced search logic mirroring UserSearchBar.jsx
      const usersRef = collection(db, 'users');
      const searchLower = value.toLowerCase();

      // Optimistic fetch - get a batch and filter client side for better UX on fields not indexed for text search
      const allUsersQuery = query(usersRef, limit(100));
      const allUsersDocs = await getDocs(allUsersQuery);

      const results = [];
      allUsersDocs.docs.forEach(doc => {
        const userData = doc.data();
        const username = (userData.username || '').toLowerCase();
        const email = (userData.email || '').toLowerCase();
        const firstName = (userData.firstName || '').toLowerCase();
        const lastName = (userData.lastName || '').toLowerCase();

        if (
          username.includes(searchLower) ||
          email.includes(searchLower) ||
          firstName.includes(searchLower) ||
          lastName.includes(searchLower)
        ) {
          results.push({ id: doc.id, ...userData });
        }
      });

      setSearchResults(results.slice(0, 10));
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddMember = async (userEmail) => {
    if (!createdTeam) return;
    if (createdTeam.members?.includes(userEmail)) return;
    try {
      await addMemberToTeam(createdTeam.id, userEmail);

      // Optimistic update for speed
      setCreatedTeam(prev => ({ ...prev, members: [...(prev.members || []), userEmail] }));

      await fetchTeams(); // Sync with server

      setMessage("Member recruited.");
      setTimeout(() => setMessage(""), 3000);
      setSearchTerm("");
      setSearchResults([]);
      setShowSearchResults(false);
    } catch (err) {
      setMessage("Error adding member.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 animate-fade-in transition-all">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between gap-4 bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl border border-gray-800 sticky top-4 z-40 shadow-xl">
          <div className="flex items-center gap-4">
            {activeView === "manage" && (
              <button
                onClick={closeTeamManagement}
                className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield size={20} className="text-orange-500" />
                {activeView === "dashboard" ? "eSports Teams" : createdTeam?.name}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {activeView === "dashboard" ? "Manage your teams" : `Team ID: ${createdTeam?.id?.slice(0, 8)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-orange-500 tracking-wide">{managerEmail.split('@')[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-xl transition-all flex items-center gap-2 text-xs font-bold"
              title="Sign Out"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* DASHBOARD VIEW */}
        {activeView === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Create Team Card */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl border border-gray-800 sticky top-28">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-500/20 rounded-xl text-orange-500">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Create Team</h2>
                    <p className="text-xs text-gray-500">Add a new team to your list</p>
                  </div>
                </div>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Team Name (e.g. Team Alpha)"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 focus:border-orange-500 rounded-xl py-4 px-4 outline-none transition-all"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full btn-raid py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                  >
                    {isCreating ? <Loader2 className="animate-spin" size={18} /> : "Create Team"}
                  </button>
                </form>
              </div>
            </div>

            {/* Team Grid */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <LayoutGrid size={20} className="text-gray-500" />
                My Teams <span className="text-gray-500 text-sm font-normal">({teams.length})</span>
              </h2>

              {teams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 border border-dashed border-gray-800 rounded-3xl text-center">
                  <Shield size={48} className="text-gray-800 mb-4" />
                  <p className="text-gray-500 font-medium">No teams created yet.</p>
                  <p className="text-xs text-gray-600">Create a team to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      onClick={() => openTeamManagement(team)}
                      className="group cursor-pointer bg-gray-900/50 hover:bg-gray-800/80 border border-gray-800 hover:border-orange-500/30 p-5 rounded-2xl transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="text-orange-500" size={20} />
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-gray-700 flex items-center justify-center text-lg font-black text-white shadow-inner overflow-hidden">
                          {team.avatarUrl ? (
                            <img src={team.avatarUrl} alt={team.name} className="w-full h-full object-cover" />
                          ) : (
                            team.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight group-hover:text-orange-400 transition-colors">{team.name}</h3>
                          <p className="text-xs text-gray-500">{(team.members || []).length} Members</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] uppercase font-bold rounded border border-green-500/20">Active</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); openTeamManagement(team); }}
                          className="px-3 py-1 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 text-[10px] uppercase font-bold rounded border border-gray-700 transition-all ml-auto z-10"
                        >
                          Edit Team
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MANAGEMENT VIEW */}
        {activeView === "manage" && createdTeam && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">

            {/* Team Stats / Info Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-3xl border border-gray-800 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-500"></div>

                <div className="relative group mx-auto w-24 h-24 mb-4">
                  <div className="w-24 h-24 bg-gray-800 border-4 border-gray-900 rounded-full flex items-center justify-center shadow-2xl relative z-10 overflow-hidden">
                    {createdTeam.avatarUrl ? (
                      <img src={createdTeam.avatarUrl} alt={createdTeam.name} className="w-full h-full object-cover" />
                    ) : (
                      <Trophy size={40} className="text-yellow-500" />
                    )}
                  </div>
                  <button
                    onClick={() => teamFileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 p-2 bg-orange-500 rounded-full text-white z-20 border-2 border-gray-900 shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                  >
                    {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  </button>
                  <input
                    type="file"
                    ref={teamFileInputRef}
                    accept="image/*"
                    onChange={handleTeamAvatarUpload}
                    className="hidden"
                  />
                </div>

                {isEditingTeam ? (
                  <div className="space-y-3 mb-6">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Team Name"
                      className="w-full bg-black border border-gray-700 rounded-lg p-2 text-center text-xl font-bold outline-none focus:border-orange-500"
                    />
                    <input
                      type="text"
                      value={editSlogan}
                      onChange={(e) => setEditSlogan(e.target.value)}
                      placeholder="Team Slogan"
                      className="w-full bg-black border border-gray-700 rounded-lg p-2 text-center text-xs outline-none focus:border-orange-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateTeam}
                        disabled={isUpdating}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                      >
                        {isUpdating ? <Loader2 className="animate-spin" size={14} /> : <><Save size={14} /> Save</>}
                      </button>
                      <button
                        onClick={() => setIsEditingTeam(false)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded-lg text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="pt-4 border-t border-gray-800/50 mt-4">
                      <button
                        onClick={() => handleDeleteTeam(createdTeam.id)}
                        disabled={isDeleting}
                        className="w-full py-2.5 rounded-lg border border-red-900/30 bg-red-900/10 text-red-500 hover:bg-red-900/20 hover:border-red-500/50 transition-all font-bold flex items-center justify-center gap-2 text-xs"
                      >
                        {isDeleting ? <Loader2 className="animate-spin" size={14} /> : <><Trash2 size={14} /> Delete Team</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h2 className="text-3xl font-black text-white">{createdTeam.name}</h2>
                      <button onClick={startEditing} className="text-gray-500 hover:text-white transition-colors">
                        <Edit2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-6 italic">
                      {createdTeam.slogan || "No slogan set"}
                    </p>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-6">
                  <div>
                    <p className="text-2xl font-bold text-white">{(createdTeam.members || []).length}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Members</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">0</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Wins</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Main Management Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Recruitment */}
              <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                    <UserPlus size={20} />
                  </div>
                  <h3 className="font-bold text-lg">Add Members</h3>
                </div>

                <div className="relative z-20" ref={searchRef}>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search usernames, names or emails..."
                    value={searchTerm}
                    onChange={handleUserSearch}
                    className="w-full bg-black border border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 rounded-xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-gray-600"
                  />

                  {/* DROPDOWN RESULTS */}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto animate-fade-in">
                      {searchLoading ? (
                        <div className="p-8 text-center text-gray-500">
                          <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                          <p className="text-xs">Scanning...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="divide-y divide-gray-800">
                          {searchResults.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => handleAddMember(user.email)}
                              className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-300 group-hover:bg-orange-500 group-hover:text-white transition-colors overflow-hidden">
                                  {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                                  ) : (
                                    user.username?.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-gray-200">{user.username}</p>
                                  <p className="text-xs text-gray-500">{user.firstName} {user.lastName}</p>
                                </div>
                              </div>
                              <div className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                {createdTeam.members?.includes(user.email) ? <CheckCircle2 size={18} /> : <Plus size={18} />}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-gray-500">
                          <p className="text-sm">No matches found.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tournament Deployment Section */}
              <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                      <Trophy size={20} />
                    </div>
                    <h3 className="font-bold text-lg">Active Squad Operations</h3>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                    Deploy {createdTeam.name}
                  </span>
                </div>

                {tournamentsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Scanning Grid...</p>
                  </div>
                ) : availableTournaments.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-gray-800 rounded-3xl">
                    <Trophy size={40} className="text-gray-800 mx-auto mb-4 opacity-20" />
                    <p className="text-gray-500 font-bold">No Squad Events Found</p>
                    <p className="text-xs text-gray-600">Check back later for specialized team tournaments.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {availableTournaments.map((tourn) => {
                      const isEnrolled = tourn.teams?.includes(createdTeam.id);
                      return (
                        <div
                          key={tourn.id}
                          className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 group ${isEnrolled
                            ? 'bg-blue-600/5 border-blue-500/30'
                            : 'bg-black/30 border-gray-800 hover:border-gray-600'
                            }`}
                        >
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border shadow-lg transition-transform group-hover:scale-105 ${isEnrolled ? 'border-blue-500/50' : 'border-gray-700'
                              }`}>
                              {tourn.tournament_flyer ? (
                                <img src={tourn.tournament_flyer} alt={tourn.tournament_name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-black text-gray-700">{tourn.tournament_name?.charAt(0)}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <h4 className="font-black text-white leading-tight uppercase tracking-tight truncate border-b border-transparent group-hover:border-white/10 pb-0.5 inline-block transition-all">
                                {tourn.tournament_name || tourn.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
                                  {tourn.game || 'E-SPORTS'}
                                </span>
                                <span className="text-[9px] font-black uppercase text-gray-500">
                                  {tourn.teams?.length || 0}/{tourn.max_participant || tourn.maxPlayers || '∞'} Squads
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            {isEnrolled && (
                              <button
                                onClick={() => handleWithdrawTournament(tourn.id)}
                                disabled={enrollingTournamentId === tourn.id}
                                className="px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 shadow-lg"
                              >
                                {enrollingTournamentId === tourn.id ? 'Processing...' : 'Withdraw'}
                              </button>
                            )}
                            <button
                              onClick={() => handleStartEnrollment(tourn)}
                              disabled={enrollingTournamentId === tourn.id}
                              className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isEnrolled
                                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95'
                                : enrollingTournamentId === tourn.id
                                  ? 'bg-blue-500/20 text-gray-400 border border-blue-500/30 cursor-wait'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95'
                                }`}
                            >
                              {isEnrolled ? (
                                <span className="flex items-center justify-center gap-2">
                                  <Edit2 size={12} /> Edit Squad
                                </span>
                              ) : enrollingTournamentId === tourn.id ? (
                                'Deploying...'
                              ) : (
                                'Mobilize Squad'
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Roster List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wider">Active Members</h3>
                  <span className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-400">{(createdTeam.members || []).length} / 50</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(createdTeam.members || []).map((email, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-gray-900/30 border border-gray-800 rounded-xl hover:border-orange-500/30 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-400 border border-gray-700 overflow-hidden shrink-0">
                        {memberDetails[email]?.avatarUrl ? (
                          <img src={memberDetails[email].avatarUrl} alt={memberDetails[email].username} className="w-full h-full object-cover" />
                        ) : (
                          (memberDetails[email]?.username || email).charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-200 truncate">
                          {memberDetails[email]?.username || email.split('@')[0]}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">{email}</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    </div>
                  ))}
                  {(createdTeam.members || []).length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-800 rounded-xl">
                      <Users size={32} className="text-gray-800 mx-auto mb-3" />
                      <p className="text-gray-600 font-bold">No Members Yet</p>
                      <p className="text-xs text-gray-700">Use the search above to add members.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 bg-orange-600 text-white rounded-2xl shadow-2xl animate-fade-in-up z-[100] flex items-center gap-3">
            <CheckCircle2 size={24} />
            <span className="font-bold text-sm tracking-wide">{message}</span>
          </div>
        )}

        {/* Lineup Selection Modal */}
        {isLineupModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsLineupModalOpen(false)}></div>
            <div className="relative bg-[#0f0f10] border border-gray-800 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-scale">
              <div className="p-8 border-b border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                      <Users size={20} />
                    </div>
                    <h3 className="font-bold text-xl">Select Tournament Lineup</h3>
                  </div>
                  <button onClick={() => setIsLineupModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Choose exactly <span className="text-orange-500 font-black">{enrollingTournament?.squad_size || 'the required'}</span> members to represent <span className="text-white font-bold">{createdTeam.name}</span> in the <span className="text-blue-400 font-bold">{enrollingTournament?.tournament_name || enrollingTournament?.title}</span>.
                </p>
              </div>

              <div className="p-6 max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar">
                {(createdTeam.members || []).length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-gray-800 rounded-2xl">
                    <AlertCircle size={32} className="text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">No Members Available</p>
                    <p className="text-[10px] text-gray-600 mt-1">Add members to your team first.</p>
                  </div>
                ) : (
                  (createdTeam.members || []).map((email, idx) => {
                    const isSelected = selectedForLineup.includes(email);
                    const profile = memberDetails[email];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleMemberSelection(email)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${isSelected
                          ? 'bg-blue-600/10 border-blue-500/50'
                          : 'bg-gray-900/30 border-gray-800 hover:border-gray-700'
                          }`}
                      >
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-700 group-hover:border-gray-600'
                          }`}>
                          {isSelected && <CheckCircle2 size={14} className="text-white" />}
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center font-bold text-gray-500 border border-gray-700 overflow-hidden shrink-0">
                          {profile?.avatarUrl ? (
                            <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                          ) : (
                            (profile?.username || email).charAt(0).toUpperCase()
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-blue-400' : 'text-gray-300'}`}>
                            {profile?.username || email.split('@')[0]}
                          </p>
                          <p className="text-[10px] text-gray-600 truncate">{email}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-8 bg-gray-900/50 flex items-center justify-between gap-4">
                <div className="text-sm">
                  <span className="text-gray-500 uppercase tracking-widest text-[10px] font-black block mb-1">Squad Strength</span>
                  <span className="text-white font-black">{selectedForLineup.length} <span className="text-gray-600">Selected</span></span>
                </div>
                <button
                  onClick={handleConfirmEnrollment}
                  disabled={enrollingTournament?.squad_size ? selectedForLineup.length !== enrollingTournament.squad_size : selectedForLineup.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  {enrollingTournament?.squad_size && selectedForLineup.length !== enrollingTournament.squad_size
                    ? `NEED ${enrollingTournament.squad_size} PLAYERS`
                    : "Confirm Lineup & Deploy"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}
