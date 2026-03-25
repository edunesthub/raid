"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { 
  Eye, EyeOff, Mail, Lock, User, AlertCircle, 
  CheckCircle, X, ChevronLeft, ChevronRight, 
  Camera, Globe, Calendar, Phone, Sparkles, Loader2
} from "lucide-react";
import { authValidation } from "@/services/authValidation";
import { COUNTRIES } from "@/utils/countries";
import { GENERIC_AVATARS } from "@/utils/avatars";

export default function SignupPage() {
  const router = useRouter();
  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    country: "",
    dateOfBirth: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);

  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameError, setUsernameError] = useState("");

  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState(null);

  // Email Handling
  const handleEmailChange = (email) => {
    setFormData({ ...formData, email });
    setEmailAvailable(null);
    if (window.emailCheckTimeout) clearTimeout(window.emailCheckTimeout);
    window.emailCheckTimeout = setTimeout(() => checkEmailAvailability(email), 800);
  };

  const checkEmailAvailability = async (email) => {
    if (!email || !authValidation.validateEmailFormat(email)) {
      setEmailAvailable(null);
      return;
    }
    setEmailChecking(true);
    try {
      const available = await authValidation.isEmailAvailable(email);
      setEmailAvailable(available);
    } catch (err) {
      setEmailAvailable(null);
    } finally {
      setEmailChecking(false);
    }
  };

  // Username Handling
  const handleUsernameChange = (username) => {
    setFormData({ ...formData, username });
    setUsernameAvailable(null);
    setUsernameError("");
    const formatCheck = authValidation.validateUsernameFormat(username);
    if (!formatCheck.isValid) {
      setUsernameError(formatCheck.error);
      return;
    }
    if (window.usernameCheckTimeout) clearTimeout(window.usernameCheckTimeout);
    window.usernameCheckTimeout = setTimeout(async () => {
      setUsernameChecking(true);
      try {
        const available = await authValidation.isUsernameAvailable(username);
        setUsernameAvailable(available);
        if (!available) setUsernameError("Username taken");
      } catch (err) {
        setUsernameError("Error checking availability");
      } finally {
        setUsernameChecking(false);
      }
    }, 800);
  };

  // Phone Handling
  const handlePhoneChange = (phone) => {
    setFormData({ ...formData, phone });
    setPhoneAvailable(null);
    if (window.phoneCheckTimeout) clearTimeout(window.phoneCheckTimeout);
    window.phoneCheckTimeout = setTimeout(async () => {
      if (!phone || !isValidPhoneForCountry(formData.country || "Ghana", phone)) return;
      setPhoneChecking(true);
      try {
        const available = await authValidation.isPhoneAvailable(phone);
        setPhoneAvailable(available);
      } catch (err) {} finally { setPhoneChecking(false); }
    }, 800);
  };

  const passwordStrength = (password) => {
    if (!password) return { val: 0, label: '', color: '' };
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    if (s <= 2) return { val: s, label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
    if (s <= 3) return { val: s, label: 'Medium', color: 'bg-yellow-500', text: 'text-yellow-400' };
    return { val: s, label: 'Strong', color: 'bg-green-500', text: 'text-green-400' };
  };

  const strength = passwordStrength(formData.password);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const isValidPhoneForCountry = (country, phoneRaw) => {
    const phone = phoneRaw.trim();
    if (country === "Nigeria") return /^0\d{10}$/.test(phone) || /^234\d{10}$/.test(phone);
    return /^0\d{9}$/.test(phone) || /^233\d{9}$/.test(phone);
  };

  const validateStep1 = () => {
    setError("");
    if (!authValidation.validateEmailFormat(formData.email)) { setError("Invalid email"); return false; }
    if (emailAvailable === false) { setError("Email taken"); return false; }
    if (!authValidation.validateUsernameFormat(formData.username).isValid) { setError("Invalid username"); return false; }
    if (usernameAvailable === false) { setError("Username taken"); return false; }
    if (formData.password.length < 8) { setError("Password too short"); return false; }
    if (formData.password !== formData.confirmPassword) { setError("Passwords mismatch"); return false; }
    return true;
  };

  const validateStep2 = () => {
    setError("");
    if (!formData.firstName.trim() || !formData.lastName.trim()) { setError("Name required"); return false; }
    if (!formData.country) { setError("Country required"); return false; }
    if (!formData.dateOfBirth) { setError("DOB required"); return false; }
    if (!isValidPhoneForCountry(formData.country, formData.phone)) { setError("Invalid phone"); return false; }
    if (phoneAvailable === false) { setError("Phone taken"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      let avatarUrl = avatarPreview;

      if (avatarFile) {
        const cloudData = new FormData();
        cloudData.append('file', avatarFile);
        cloudData.append('upload_preset', 'raid_avatars');
        const res = await fetch(`https://api.cloudinary.com/v1_1/drgz6qqo5/image/upload`, { method: 'POST', body: cloudData });
        const d = await res.json();
        avatarUrl = d.secure_url;
      }

      await setDoc(doc(db, "users", user.uid), {
        email: formData.email.toLowerCase(),
        username: formData.username,
        username_lowercase: formData.username.toLowerCase(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        country: formData.country,
        dateOfBirth: formData.dateOfBirth,
        bio: formData.bio,
        avatarUrl,
        createdAt: new Date(),
      });

      await setDoc(doc(db, "userStats", user.uid), {
        tournamentsPlayed: 0, tournamentsWon: 0, totalEarnings: 0, winRate: 0, currentStreak: 0,
      });

      router.push("/");
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">
              RAID <span className="text-orange-500">ARENA.</span>
            </h1>
          </Link>
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none mb-3">
            Join the <span className="text-orange-500">Elite.</span>
          </h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Step into the future of competitive gaming</p>
        </div>

        {/* Signup Card */}
        <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden">
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-purple-500 transition-all duration-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] font-black italic text-orange-500 uppercase tracking-[0.3em]">Step 0{currentStep} / 03</span>
            <div className="flex gap-1">
              {[1, 2, 3].map(s => (
                <div key={s} className={`w-6 h-1 rounded-full ${s <= currentStep ? 'bg-orange-500' : 'bg-white/10'} transition-colors`} />
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-8 flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-xs font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Email Identity</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                    <input type="email" value={formData.email} onChange={(e) => handleEmailChange(e.target.value)} placeholder="Email address" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all" required />
                    {emailChecking ? <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 animate-spin" /> : emailAvailable === true && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Game ID (Username)</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                    <input type="text" value={formData.username} onChange={(e) => handleUsernameChange(e.target.value)} placeholder="Your username" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all" required />
                    {usernameChecking ? <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 animate-spin" /> : usernameAvailable === true && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />}
                  </div>
                  {usernameError && <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1 ml-2">{usernameError}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Access Key</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Password" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-600 focus:outline-none border-orange-500 transition-all" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Confirm Key</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} placeholder="Confirm" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-600 focus:outline-none border-orange-500 transition-all" required />
                    </div>
                  </div>
                </div>

                {formData.password && (
                  <div className="px-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-gray-500">Security Strength:</span>
                      <span className={strength.text}>{strength.label}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all duration-500`} style={{ width: `${(strength.val / 5) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">First Name</label>
                    <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} placeholder="John" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:outline-none border-orange-500 transition-all uppercase italic font-black" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Last Name</label>
                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} placeholder="Doe" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:outline-none border-orange-500 transition-all uppercase italic font-black" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Battle Region</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <select value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none border-orange-500 appearance-none uppercase font-black tracking-widest" required>
                      <option value="" className="bg-black">Select Region</option>
                      {COUNTRIES.map(c => <option key={c.code} value={c.name} className="bg-black">{c.flag} {c.name.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none border-orange-500 uppercase font-black" required />
                  </div>
                  <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest ml-1">Must be 13+ years old</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Mobile Transmision (SMS)</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                    <input type="tel" value={formData.phone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder="024 XXX XXXX" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-black tracking-[0.2em]" required />
                    {phoneChecking ? <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 animate-spin" /> : phoneAvailable === true && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col items-center gap-6">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Identity Projection (Avatar)</label>
                  <div className="relative group">
                    <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-orange-500 to-purple-500 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border-4 border-black">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-12 h-12 text-gray-800" />
                        )}
                      </div>
                      <button type="button" onClick={() => document.getElementById('avatar-input').click()} className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center border-4 border-black text-white hover:bg-orange-600 transition-all scale-100 hover:scale-110 active:scale-90">
                        <Camera size={18} />
                      </button>
                    </div>
                    <input id="avatar-input" type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0])} className="hidden" />
                  </div>

                  <div className="w-full space-y-4">
                    <p className="text-[10px] text-center font-black text-gray-700 uppercase tracking-widest">Or select a legacy avatar</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {GENERIC_AVATARS.slice(0, 6).map((url, i) => (
                        <button key={i} type="button" onClick={() => {setAvatarPreview(url); setAvatarFile(null);}} className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${avatarPreview === url ? 'border-orange-500 scale-110' : 'border-white/5 hover:border-white/20'}`}>
                          <img src={url} alt="Preset" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Battle Bio</label>
                  <div className="relative">
                    <Sparkles className="absolute left-4 top-4 w-5 h-5 text-orange-500" />
                    <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Tell us your story..." className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] pl-12 pr-6 py-4 text-white placeholder-gray-600 focus:outline-none border-orange-500 transition-all italic text-sm leading-relaxed" required />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
              {currentStep > 1 && (
                <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl border border-white/10 transition-all active:scale-95">
                  Back
                </button>
              )}
              
              {currentStep < 3 ? (
                <button 
                  type="button" 
                  onClick={() => { if (currentStep === 1 ? validateStep1() : validateStep2()) setCurrentStep(currentStep + 1); }} 
                  disabled={currentStep === 1 && (emailChecking || usernameChecking || emailAvailable === false || usernameAvailable === false)}
                  className="flex-[2] py-5 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-95 disabled:opacity-50"
                >
                  <div className="flex items-center justify-center gap-2">
                    Next Section
                    <ChevronRight size={18} />
                  </div>
                </button>
              ) : (
                <button type="submit" disabled={isLoading} className="flex-[2] py-5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all active:scale-95 disabled:opacity-50">
                  {isLoading ? <div className="flex items-center justify-center gap-3"><Loader2 className="w-5 h-5 animate-spin" /><span>Syncing...</span></div> : "Complete Account"}
                </button>
              )}
            </div>
          </form>

          <p className="text-center mt-8 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            Already have an account? <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 transition-colors ml-1">Log In</Link>
          </p>
        </div>

        {/* Legal */}
        <p className="text-center mt-8 text-[9px] text-gray-700 font-bold uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed">
          By joining, you agree to our Terms of Battle and Code of Conduct. Tournament rules apply.
        </p>
      </div>
    </div>
  );
}
