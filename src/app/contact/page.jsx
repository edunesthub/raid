"use client";
import React, { useState } from 'react';

const WHATSAPP_NUMBER = "+233201624018";

function formatWhatsAppNumber(number) {
  // Convert "+233201624018" -> "233201624018" for wa.me format
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Contact Us</h1>
          <p className="text-gray-400 text-sm">We usually respond within 24 hours.</p>
        </div>

        <section className="mb-8">
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-raid-gold mb-2">Get in Touch</h2>
            <p className="text-sm text-gray-400">
              We'd love to hear from you! Whether you have questions, feedback, or need support,
              our team is here to help. Use the form or WhatsApp to reach out.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-raid-gold mb-4">Send Us a Message</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="mt-1 block w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400">Your Email (optional)</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="mt-1 block w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-400">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="mt-1 block w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  placeholder="Regarding a tournament issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-400">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="mt-1 block w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 px-4 rounded-xl text-lg font-semibold text-white bg-orange-600 hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                {sending ? 'Opening WhatsApp…' : 'Send via WhatsApp'}
              </button>
              <p className="text-xs text-gray-500 text-center">Messages are sent directly to our WhatsApp: {WHATSAPP_NUMBER}</p>
            </form>
          </div>
        </section>

        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-raid-gold mb-3">WhatsApp Direct</h2>
              <p className="text-sm text-gray-400 mb-2">Prefer chatting? Reach us instantly on WhatsApp:</p>
              <a
                href={`https://wa.me/${formatWhatsAppNumber(WHATSAPP_NUMBER)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 rounded-xl px-4 py-2 text-sm"
              >
                {WHATSAPP_NUMBER}
              </a>
            </div>
            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-raid-gold mb-3">Support</h2>
              <p className="text-sm text-gray-400 mb-2">Technical support and account inquiries:</p>
              <p className="text-sm font-medium text-raid-gold">
                <a href="mailto:support@raidarena.com" className="hover:underline">raid00arena@gmail.com</a>
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-raid-gold mb-3">Business Inquiries</h2>
            <p className="text-sm text-gray-400 mb-2">Partnerships, media, and other opportunities:</p>
            <p className="text-sm font-medium text-raid-gold">
              <a href="mailto:business@raidarena.com" className="hover:underline">raid00arena@gmail.com</a>
            </p>
          </div>
        </section>

        <section className="mb-8">
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-raid-gold mb-3">Social Media</h2>
            <p className="text-sm text-gray-400 mb-4">Follow us for updates on tournaments and events:</p>
            <div className="flex flex-wrap gap-3">
              <a href="#" className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-sm">Twitter</a>
              <a href="#" className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-sm">Facebook</a>
              <a href="#" className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-sm">Instagram</a>
              <a href="#" className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-sm">Discord</a>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
};

export default ContactPage;