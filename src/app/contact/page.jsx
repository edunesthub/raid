"use client";
import React, { useState } from 'react';
import { 
  Instagram, Twitter, Facebook, MessageCircle, ExternalLink, 
  User, Mail, MessageSquare, Send, Loader2 
} from 'lucide-react';

const WHATSAPP_NUMBER = "+233547921454";
const WHATSAPP_COMMUNITY_LINK = "https://chat.whatsapp.com/Gjg0O27vntADU2WjTHmCgw";

function formatWhatsAppNumber(number) {
  const digits = (number || "").replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits.slice(1);
  return digits;
}

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sending) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedSubject || !trimmedMessage) {
      alert("Please fill in your name, subject, and message.");
      return;
    }

    const lines = [
      `New contact request`,
      `Name: ${trimmedName}`,
      trimmedEmail ? `Email: ${trimmedEmail}` : null,
      `Subject: ${trimmedSubject}`,
      "",
      trimmedMessage,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join("\n"));
    const phone = formatWhatsAppNumber(WHATSAPP_NUMBER);
    const url = `https://wa.me/${phone}?text=${text}`;

    setSending(true);
    window.location.href = url;
    setTimeout(() => setSending(false), 3000);
  };

  return (
    <div className="min-h-[100dvh] bg-black relative overflow-x-clip flex flex-col items-center">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 lg:px-12 pt-[110px] md:pt-[140px] pb-12 md:pb-20 relative z-10 w-full animate-fade-in flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-7xl font-black italic text-white uppercase tracking-tighter mb-4">
            Contact <span className="text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">Us.</span>
          </h1>
          <p className="text-gray-500 text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] max-w-xl mx-auto">
            Get in touch with us. We usually respond within 24 hours.
          </p>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 flex-1">
          
          {/* Main Form Area (Logistics) - Left Column */}
          <div className="lg:col-span-3">
            <div className="glass-panel p-6 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden group border border-white/5 h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter mb-2">
                Send a <span className="text-orange-500">Message</span>
              </h2>
              <p className="text-gray-400 text-xs md:text-sm font-medium mb-8 leading-relaxed">
                Send a direct message to our support team via WhatsApp for immediate processing.
              </p>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Your Name</label>
                    <div className="relative group/input">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-orange-500 transition-colors" />
                      <input
                        type="text"
                        id="name"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-bold"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Email Address (Optional)</label>
                    <div className="relative group/input">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-orange-500 transition-colors" />
                      <input
                        type="email"
                        id="email"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-bold"
                        placeholder="john.doe@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Subject Input */}
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Subject</label>
                  <div className="relative group/input">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-orange-500 transition-colors" />
                    <input
                      type="text"
                      id="subject"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-bold"
                      placeholder="Regarding a tournament issue"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="space-y-2">
                  <label htmlFor="message" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Your Message</label>
                  <div className="relative group/input">
                    <textarea
                      id="message"
                      rows={6}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all italic text-sm md:text-base leading-relaxed"
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black uppercase text-xs sm:text-sm tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                >
                  {sending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>Sending...</span></>
                  ) : (
                    <>Send Message <Send className="w-4 h-4" /></>
                  )}
                </button>
                <p className="text-[9px] sm:text-[10px] text-gray-500 text-center font-bold uppercase tracking-widest mt-4 opacity-70">
                  Messages are sent securely via WhatsApp: {WHATSAPP_NUMBER}
                </p>
              </form>
            </div>
          </div>

          {/* Side Panels - Right Column */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8 h-full flex flex-col">
            
            {/* WhatsApp Community Banner */}
            <div className="bg-gradient-to-br from-[#128C7E]/20 to-black border border-[#25D366]/30 rounded-[2rem] p-8 shadow-[0_0_30px_rgba(37,211,102,0.1)] relative overflow-hidden group hover:border-[#25D366]/60 transition-colors flex-1 flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#25D366]/20 transition-colors duration-500" />
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center p-3 shadow-[0_0_20px_rgba(37,211,102,0.2)]">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tighter">Community <span className="text-[#25D366]">Hub</span></h3>
                  <p className="text-[10px] text-[#25D366] font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" /> Always Active
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 font-medium mb-8 leading-relaxed relative z-10 max-w-sm">
                Connect with other players, find teams, and stay updated on tournaments. 
              </p>
              
              <a
                href={WHATSAPP_COMMUNITY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl px-6 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] active:scale-95 relative z-10"
              >
                Join WhatsApp Group <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>

            {/* Business Inquiries */}
            <div className="glass-panel p-8 rounded-[2rem] border border-white/5 flex-none">
              <h3 className="text-xl font-black italic text-white uppercase tracking-tighter mb-4">Business <span className="text-orange-500">Inquiries</span></h3>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed font-medium">
                For strategic partnerships, sponsorship opportunities, and media coverage requests.
              </p>
              <a href="mailto:raid00arena@gmail.com" className="group flex items-center gap-4 bg-white/[0.03] hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/30 rounded-2xl w-full p-4 transition-all">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-lg shadow-orange-500/0 group-hover:shadow-orange-500/20">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Direct Line</div>
                  <div className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors">raid00arena@gmail.com</div>
                </div>
              </a>
            </div>

            {/* Social Media Radar */}
            <div className="glass-panel p-8 rounded-[2rem] border border-white/5 flex-none">
              <h3 className="text-xl font-black italic text-white uppercase tracking-tighter mb-6">Social <span className="text-orange-500">Radar</span></h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: "#", color: "hover:bg-[#1DA1F2] hover:border-[#1DA1F2]/50 hover:shadow-[0_0_20px_rgba(29,161,242,0.3)]" },
                  { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, href: "#", color: "hover:bg-[#1877F2] hover:border-[#1877F2]/50 hover:shadow-[0_0_20px_rgba(24,119,242,0.3)]" },
                  { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, href: "#", color: "hover:bg-[#E4405F] hover:border-[#E4405F]/50 hover:shadow-[0_0_20px_rgba(228,64,95,0.3)]" },
                  { name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, href: WHATSAPP_COMMUNITY_LINK, color: "hover:bg-[#25D366] hover:border-[#25D366]/50 hover:shadow-[0_0_20px_rgba(37,211,102,0.3)]" },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target={social.name === 'WhatsApp' ? "_blank" : undefined}
                    rel={social.name === 'WhatsApp' ? "noopener noreferrer" : undefined}
                    className={`flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-gray-400 transition-all duration-300 group ${social.color}`}
                  >
                    <div className="group-hover:text-white transition-colors duration-300 transform group-hover:scale-110">
                      {social.icon}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;