"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/app/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { 
  ChevronLeft, Camera, User, Mail, Globe, 
  Calendar, Phone, Sparkles, Loader2, Save, X, Trash2
} from "lucide-react";
import Link from "next/link";
import { COUNTRIES } from "@/utils/countries";
import { GENERIC_AVATARS } from "@/utils/avatars";

export default function EditProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    country: "",
    bio: "",
    dateOfBirth: "",
    phone: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.id) fetchUserData();
  }, [user?.id]);

  const fetchUserData = async () => {
    try {
      const docSnap = await getDoc(doc(db, "users", user.id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          username: data.username || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          country: data.country || "",
          bio: data.bio || "",
          dateOfBirth: data.dateOfBirth || "",
          phone: data.phone || "",
        });
        if (data.avatarUrl) setAvatarPreview(data.avatarUrl);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load profile data");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const uploadToCloudinary = async (file) => {
    const cloudData = new FormData();
    cloudData.append('file', file);
    cloudData.append('upload_preset', 'raid_avatars');
    const res = await fetch(`https://api.cloudinary.com/v1_1/drgz6qqo5/image/upload`, { method: 'POST', body: cloudData });
    const d = await res.json();
    return d.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      let avatarUrl = avatarPreview;
      if (avatarFile) avatarUrl = await uploadToCloudinary(avatarFile);

      await updateDoc(doc(db, "users", user.id), {
        ...formData,
        avatarUrl,
        updatedAt: new Date(),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/profile");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-black pt-24 pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
        {/* Navigation */}
        <div className="flex items-center gap-6 mb-12">
          <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none mb-1">Modify Profile.</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Operational Metadata Calibration</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Avatar Calibration Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-panel p-8 md:p-12 rounded-[3rem] relative overflow-hidden text-center group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-purple-600 opacity-50" />
              
              <div className="relative inline-block mb-10 group/avatar">
                <div className="relative w-48 h-48 rounded-full p-1.5 bg-gradient-to-tr from-orange-500 to-purple-600 shadow-[0_0_60px_rgba(249,115,22,0.2)]">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border-4 border-black">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                    ) : (
                      <User className="w-16 h-16 text-gray-800" />
                    )}
                  </div>
                  <button type="button" onClick={() => document.getElementById('avatar-input').click()} className="absolute bottom-2 right-2 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:bg-orange-500 hover:text-white transition-all scale-100 hover:scale-110 active:scale-90 shadow-[0_0_20px_rgba(0,0,0,0.5)] border-4 border-black">
                    <Camera size={24} />
                  </button>
                </div>
                <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black italic text-orange-500 uppercase tracking-[0.3em] mb-6">Identity Projection Selection</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {GENERIC_AVATARS.slice(0, 8).map((url, i) => (
                    <button key={i} type="button" onClick={() => {setAvatarPreview(url); setAvatarFile(null);}} className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${avatarPreview === url ? 'border-orange-500 scale-110 shadow-lg' : 'border-white/5 hover:border-white/20'}`}>
                      <img src={url} alt="Preset" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-[2rem] border-red-500/10">
              <h3 className="text-xs font-black italic text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Trash2 size={14} /> Danger Zone
              </h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-6 leading-relaxed">Identity termination is irreversible. Backup tactical data before proceeding.</p>
              <button disabled type="button" className="w-full py-4 bg-red-500/5 hover:bg-red-500/20 text-red-500 border border-red-500/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all opacity-50 cursor-not-allowed">
                Deactivate Operative
              </button>
            </div>
          </div>

          {/* Form Calibration Column */}
          <div className="lg:col-span-8 space-y-12">
            <div className="glass-panel p-8 md:p-12 rounded-[3.5rem] relative">
              
              {/* Status Notifications */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8 flex items-center gap-4 animate-shake">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <X className="text-red-500" size={20} />
                  </div>
                  <p className="text-red-400 text-xs font-black uppercase tracking-widest">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-8 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Save className="text-green-500" size={20} />
                  </div>
                  <p className="text-green-400 text-xs font-black uppercase tracking-widest">Profile Configuration Updated Successfully.</p>
                </div>
              )}

              <div className="space-y-10">
                {/* Core Identity */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <User className="text-orange-500" size={16} />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Core Identity</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Game ID</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none border-orange-500/50 transition-all font-black" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Tactical Bio</label>
                      <div className="relative">
                        <Sparkles className="absolute left-4 top-4 w-4 h-4 text-orange-500" />
                        <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] pl-12 pr-6 py-4 text-white focus:outline-none border-orange-500/50 transition-all text-sm leading-relaxed" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Personal Records */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <Globe className="text-purple-500" size={16} />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Operational Data</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">First Designation</label>
                      <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none border-orange-500/50 transition-all uppercase italic font-black" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Last Designation</label>
                      <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none border-orange-500/50 transition-all uppercase italic font-black" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Battle Sector</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <select value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none border-orange-500/50 transition-all appearance-none uppercase font-black">
                          {COUNTRIES.map(c => <option key={c.code} value={c.name} className="bg-black">{c.flag} {c.name.toUpperCase()}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Mobile Transmission (SMS)</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none border-orange-500/50 transition-all font-black tracking-widest" />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="pt-6">
                  <button type="submit" disabled={isSaving} className="w-full md:w-auto px-12 py-5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-4 group active:scale-95 disabled:opacity-50">
                    {isSaving ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> <span>Syncing Data...</span></>
                    ) : (
                      <><Save size={18} className="group-hover:scale-110 transition-transform" /> <span>Commit Configuration</span></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}