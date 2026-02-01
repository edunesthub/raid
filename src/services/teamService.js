// Service for managing teams, managers, and assignments using Firebase Firestore
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  setDoc,
  getDoc,
  deleteDoc
} from "firebase/firestore";

export async function registerManager({ name, email, password }) {
  // In production, use Firebase Auth for password management!
  const managerRef = doc(db, "managers", email);
  await setDoc(managerRef, { name, email, password });
  return { name, email };
}

export async function loginManager({ email, password }) {
  const managerRef = doc(db, "managers", email);
  const snap = await getDoc(managerRef);
  if (snap.exists()) {
    const data = snap.data();
    if (data.password === password) {
      return { name: data.name, email: data.email };
    }
    throw new Error("Invalid password");
  }
  throw new Error("Manager not found");
}

export async function createTeam({ name, managerEmail, members, avatarUrl, slogan }) {
  const docRef = await addDoc(collection(db, "teams"), {
    name,
    manager: managerEmail,
    members: members || [],
    avatarUrl: avatarUrl || null,
    slogan: slogan || "",
    createdAt: new Date().toISOString(),
  });
  const snap = await getDoc(docRef);
  return { id: docRef.id, ...snap.data() };
}

export async function updateTeam(teamId, updates) {
  const teamRef = doc(db, "teams", teamId);
  await updateDoc(teamRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  const snap = await getDoc(teamRef);
  return { id: teamId, ...snap.data() };
}

export async function deleteTeam(teamId) {
  const teamRef = doc(db, "teams", teamId);
  await deleteDoc(teamRef);
  return true;
}

export async function getTeams() {
  const querySnapshot = await getDocs(collection(db, "teams"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function addMemberToTeam(teamId, userEmail) {
  const teamRef = doc(db, "teams", teamId);
  await updateDoc(teamRef, { members: arrayUnion(userEmail) });
  const snap = await getDoc(teamRef);
  return { id: teamId, ...snap.data() };
}

export async function removeMemberFromTeam(teamId, userEmail) {
  const teamRef = doc(db, "teams", teamId);
  await updateDoc(teamRef, { members: arrayRemove(userEmail) });
  const snap = await getDoc(teamRef);
  return { id: teamId, ...snap.data() };
}

export async function assignTournamentToTeams(tournamentId, teamIds) {
  const tournamentRef = doc(db, "tournaments", tournamentId);
  await updateDoc(tournamentRef, { teams: teamIds });
  const snap = await getDoc(tournamentRef);
  return { id: tournamentId, ...snap.data() };
}

export async function createTournament({ name }) {
  const docRef = await addDoc(collection(db, "tournaments"), {
    name,
    teams: [],
  });
  const snap = await getDoc(docRef);
  return { id: docRef.id, ...snap.data() };
}

export async function getTournaments() {
  const querySnapshot = await getDocs(collection(db, "tournaments"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getManagers() {
  const querySnapshot = await getDocs(collection(db, "managers"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function deleteManager(email) {
  const managerRef = doc(db, "managers", email);
  await deleteDoc(managerRef);
  return true;
}
