import React from 'react';
import Link from 'next/link';

const PrivacyPolicyPage = () => {
  return (
    <div className="w-full h-full overflow-y-auto relative bg-[#050505]">
      <div className="scanline"></div>
      <div className="container-mobile py-12 relative z-10 max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
            Privacy <span className="text-blue-500">Security</span>
          </h1>
          <p className="text-blue-500/40 font-black uppercase tracking-[0.4em] text-[10px]">
            // DATA_PROTECTION_ENCRYPTION v4.0.2
          </p>
          <p className="mt-4 text-[8px] text-gray-600 font-black uppercase tracking-widest leading-relaxed">
            [SYS_LOG]: LAST_SYNCED: OCTOBER 13, 2025
          </p>
        </div>

        <div className="space-y-12">
          {/* Intro Section */}
          <section className="relative group">
            <div className="absolute -inset-0.5 bg-blue-500/10 opacity-50 blur-sm"></div>
            <div className="relative bg-black border border-blue-500/20 p-8" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 90%, 98% 100%, 0 100%, 0 10%)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-6 bg-blue-500 shadow-[0_0_10px_#00f3ff]"></div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">1. Introduction</h2>
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                Welcome to RAID Arena ("we," "our," or "us").
                Your privacy protocol is paramount. This manual explains how we harvest,
                utilize, and shield your data within the Service network.
              </p>
            </div>
          </section>

          {/* Collection Section */}
          <section className="relative group">
            <div className="absolute -inset-0.5 bg-pink-500/5 opacity-50 blur-sm"></div>
            <div className="relative bg-black border border-pink-500/20 p-8" style={{ clipPath: 'polygon(0 0, 98% 0, 100% 10%, 100% 100%, 2% 100%, 0 90%)' }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-6 bg-pink-500 shadow-[0_0_10px_#ff00ff]"></div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">2. Data Harvest</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest italic">// PERSONAL_BIOMETRICS</h3>
                  <ul className="space-y-2">
                    {[
                      "IDENTITY_LABELS",
                      "UPLINK_COORDINATES",
                      "ZONE_LOCATIONS",
                      "SOCIAL_INTERACTION_LOGS"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-500"></div>
                        <span className="text-[9px] font-black text-blue-500/60 tracking-widest">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-pink-500 uppercase tracking-widest italic">// MACHINE_TELEMETRY</h3>
                  <ul className="space-y-2">
                    {[
                      "IP_NETWORK_TAGS",
                      "OS_KERNEL_LOGS",
                      "DEVICE_SIGNATURES",
                      "USACE_ANALYTICS"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-pink-500"></div>
                        <span className="text-[9px] font-black text-pink-500/60 tracking-widest">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="relative group">
            <div className="absolute -inset-0.5 bg-blue-500/5 opacity-50 blur-sm"></div>
            <div className="relative bg-black border border-blue-500/20 p-8" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 20%)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-6 bg-blue-600 shadow-[0_0_10px_rgba(0,243,255,1)]"></div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">3. Operational Utility</h2>
              </div>
              <p className="text-xs text-gray-500 font-black uppercase tracking-widest leading-relaxed mb-6">
                Data is strictly utilized for network enhancement and security integrity:
              </p>
              <div className="flex flex-wrap gap-4">
                {[
                  "CORE_MANAGEMENT",
                  "THREAT_MONITORING",
                  "PERSONALIZATION_ALGORITHMS",
                  "SYSTEM_UPDATES",
                  "FAIR_PLAY_PROTOCOL"
                ].map((tag, i) => (
                  <div key={i} className="bg-blue-900/10 border border-blue-500/30 px-3 py-1 text-[8px] font-black text-blue-400 tracking-[0.2em]" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}>
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Media Usage */}
          <section className="bg-black/40 border border-pink-500/20 p-8" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 20%, 100% 100%, 0 100%)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-6 bg-pink-500 shadow-[0_0_10px_#ff00ff]"></div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">4. Media Broadcast Rights</h2>
            </div>
            <p className="text-xs text-pink-500/60 font-black uppercase tracking-widest leading-relaxed">
              By initializing tournament nodes, you grant the arena permission to rebroadcast gameplay visuals,
              screenshots, and audio signatures for promotional deployment. NO_COMPENSATION_PROTOCOL = TRUE.
            </p>
          </section>

          {/* Security & Contact */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-black border border-blue-500/20 p-8" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 15%)' }}>
              <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-4">7. SECURITY_KINETICS</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                Kinetics include SSL_ENCRYPTION, FIREWALL_SHIELDS, and ACCESS_STRICTURES.
                System security is high, but absolute immunity is statistically impossible.
              </p>
            </div>

            <div className="bg-black border border-blue-500/20 p-8" style={{ clipPath: 'polygon(0 0, 90% 0, 100% 15%, 100% 100%, 0 100%)' }}>
              <h2 className="text-xs font-black text-pink-500 uppercase tracking-[0.4em] mb-4">11. UPLINK_CONTACT</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4 leading-relaxed">
                Direct all privacy inquiries to the central terminal:
              </p>
              <a href="mailto:raid00arena@gmail.com" className="text-white font-black italic tracking-tighter hover:text-blue-400 transition-colors uppercase block">
                raid00arena@gmail.com
              </a>
              <span className="text-[8px] font-black text-gray-700 mt-4 block uppercase tracking-widest">RAID_ARENA_SECURITY_DIV</span>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <Link href="/" className="inline-block group">
            <div className="bg-blue-600/10 border border-blue-600/30 px-12 py-5 text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] group-hover:bg-blue-600/20 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,243,255,0.1)]" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}>
              REVERT_TO_BASE
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};;

export default PrivacyPolicyPage;