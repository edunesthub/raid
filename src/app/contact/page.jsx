"use client";
import React, { useState } from 'react';

const WHATSAPP_NUMBER = "+233547921454";
const WHATSAPP_COMMUNITY_LINK = "https://chat.whatsapp.com/Gjg0O27vntADU2WjTHmCgw";

function formatWhatsAppNumber(number) {
  // Convert "+233547921454" -> "233201624018" for wa.me format
  const digits = (number || "").replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits.slice(1);
  return digits;
}

import { Instagram, Twitter, Facebook, MessageCircle, ExternalLink } from 'lucide-react';

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sending) return;

    // Basic validation
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedSubject || !trimmedMessage) {
      alert("Please fill in your name, subject, and message.");
      return;
    }

    // Compose WhatsApp text
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
    // Prefer full redirect for mobile compatibility
    window.location.href = url;
    setTimeout(() => setSending(false), 3000);
  };
  return (
    <div className="w-full h-full overflow-y-auto relative bg-[#050505]">
      <div className="scanline"></div>
      <div className="container-mobile py-12 relative z-10 max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
            Contact <span className="text-blue-500">Uplink</span>
          </h1>
          <p className="text-blue-500/40 font-black uppercase tracking-[0.4em] text-[10px]">
            // ESTABLISHING_SIGNAL_PARAMETERS
          </p>
        </div>

        {/* Intro */}
        <section className="mb-12">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
            <div className="relative bg-black/40 border border-blue-500/20 p-8" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 80%, 98% 100%, 0 100%, 0 20%)' }}>
              <h2 className="text-xl font-black text-blue-400 uppercase italic tracking-tighter mb-4">// GET_IN_TOUCH</h2>
              <p className="text-gray-500 font-bold uppercase tracking-wide text-xs leading-relaxed">
                Our operatives are monitoring the signal 24/7. Whether you have
                tactical questions, server feedback, or need immediate support,
                initialize a transmission below.
              </p>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-blue-500/5 blur-sm opacity-50"></div>
            <div className="relative bg-black border border-blue-500/20 p-8 sm:p-10 space-y-8" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)' }}>
              <h2 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.4em] mb-2 px-1">NEW_TRANSMISSION</h2>

              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2 px-1">SENDER_ID</label>
                    <input
                      type="text"
                      className="w-full bg-black/40 border border-blue-500/20 px-5 py-4 focus:outline-none focus:border-blue-500/60 text-white font-black italic uppercase tracking-wider transition-all"
                      style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
                      placeholder="OPERATIVE_NAME"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2 px-1">UPLINK_MAIL (OPTIONAL)</label>
                    <input
                      type="email"
                      className="w-full bg-black/40 border border-blue-500/20 px-5 py-4 focus:outline-none focus:border-blue-500/60 text-white font-black italic uppercase tracking-wider transition-all"
                      style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
                      placeholder="MAIL_ADDRESS"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2 px-1">SUBJECT_HEADER</label>
                  <input
                    type="text"
                    className="w-full bg-black/40 border border-blue-500/20 px-5 py-4 focus:outline-none focus:border-blue-500/60 text-white font-black italic uppercase tracking-wider transition-all"
                    style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 100%, 0 100%, 0 10%)' }}
                    placeholder="ISSUE_PRIORITY_LOW"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2 px-1">DATA_BURST</label>
                  <textarea
                    rows={5}
                    className="w-full bg-black/40 border border-blue-500/20 px-5 py-4 focus:outline-none focus:border-blue-500/60 text-white font-black italic uppercase tracking-wider transition-all resize-none"
                    style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 100%, 0 100%, 0 10%)' }}
                    placeholder="ENTER_MESSAGE_BODY..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-4 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase italic tracking-[0.2em] py-5 shadow-[0_0_20px_rgba(255,0,255,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                >
                  {sending ? 'COMM_OPENING...' : 'INITIATE_WA_BURST'}
                </button>
                <p className="text-[8px] font-black text-gray-700 text-center uppercase tracking-[0.3em]">
                  Direct_Comms: {WHATSAPP_NUMBER}
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* WhatsApp Card */}
        <section className="mb-12">
          <div className="relative group overflow-hidden" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 70%, 98% 100%, 0 100%, 0 30%)' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-blue-500/20 blur group-hover:opacity-40 transition-opacity opacity-20"></div>
            <div className="relative bg-black border border-green-500/20 p-8 flex items-center gap-8">
              <div className="flex-shrink-0 w-24 h-24 bg-green-500/10 border border-green-500/20 p-5 flex items-center justify-center" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(37,211,102,0.4)]"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Connect to the <span className="text-green-500">Node</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] mb-6">// SYNC_WITH_ACTIVE_FACTION_BASE</p>
                <a
                  href={WHATSAPP_COMMUNITY_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white font-black uppercase italic tracking-widest px-8 py-3 text-xs transition-all shadow-[0_0_15px_rgba(37,211,102,0.3)]"
                  style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
                >
                  JOIN_CENTRAL_COMM
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Business and Socials */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-black/40 border border-white/5 p-8" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 15%)' }}>
            <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-4">CORP_INQUIRY</h2>
            <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-4">Partnerships + Media_Requests:</p>
            <a href="mailto:raid00arena@gmail.com" className="text-white font-black italic tracking-tighter hover:text-blue-400 transition-colors uppercase">
              raid00arena@gmail.com
            </a>
          </div>

          <div className="bg-black/40 border border-white/5 p-8" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 15%, 100% 100%, 0 100%)' }}>
            <h2 className="text-xs font-black text-pink-500 uppercase tracking-[0.4em] mb-4">SIGNAL_NODES</h2>
            <div className="flex gap-4">
              {[
                { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: "#", color: "#1DA1F2" },
                { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, href: "#", color: "#1877F2" },
                { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, href: "#", color: "#E4405F" },
                { name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, href: WHATSAPP_COMMUNITY_LINK, color: "#25D366" },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target={social.name === 'WhatsApp' ? "_blank" : undefined}
                  rel={social.name === 'WhatsApp' ? "noopener noreferrer" : undefined}
                  className="w-12 h-12 flex items-center justify-center bg-gray-900 border border-white/5 transition-all hover:scale-110 active:scale-95 group"
                  style={{
                    clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = social.color;
                    e.currentTarget.style.boxShadow = `0 0 10px ${social.color}44`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div style={{ color: social.color }} className="group-hover:scale-110 transition-transform">
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;