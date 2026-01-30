import React from 'react';
import Link from 'next/link';

const TermsOfServicePage = () => {
  return (
    <div className="w-full h-full overflow-y-auto relative bg-[#050505]">
      <div className="scanline"></div>
      <div className="container-mobile py-12 relative z-10 max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16 px-4">
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
            Terms of <span className="text-blue-500">Service</span>
          </h1>
          <p className="text-blue-500/40 font-black uppercase tracking-[0.4em] text-[10px]">
            // LEGAL_ACCESS_PROTOCOLS v2.1
          </p>
        </div>

        <div className="space-y-8 px-4">
          <section className="relative group">
            <div className="absolute -inset-0.5 bg-blue-500/10 opacity-50 blur-sm"></div>
            <div className="relative bg-black border border-blue-500/20 p-8" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 90%, 98% 100%, 0 100%, 0 10%)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-6 bg-blue-500 shadow-[0_0_10px_#00f3ff]"></div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">1. Acceptance of Terms</h2>
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                By accessing and using the RAID Arena platform, you agree to be bound by these Terms of Service and all
                applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from
                using or accessing this site. The materials contained in this website are protected by applicable
                copyright and trademark law.
              </p>
            </div>
          </section>

          <section className="relative group">
            <div className="absolute -inset-0.5 bg-blue-500/5 opacity-50 blur-sm"></div>
            <div className="relative bg-black border border-blue-500/20 p-8" style={{ clipPath: 'polygon(0 0, 98% 0, 100% 10%, 100% 100%, 2% 100%, 0 90%)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-6 bg-pink-500 shadow-[0_0_10px_#ff00ff]"></div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">2. Use License</h2>
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed mb-6">
                Permission is granted to temporarily download one copy of the materials (information or software)
                on RAID Arena's website for personal, non-commercial transitory viewing only. This is the grant
                of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="space-y-3">
                {[
                  "MODIFY_OR_COPY_MATERIALS",
                  "COMMERCIAL_EXPLOITATION_EXCLUSION",
                  "REVERSE_ENGINEERING_PROHIBITED",
                  "PROPRIETARY_NOTATION_REMOVAL",
                  "DATA_MIRRORING_RESTRICTION"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-1 h-1 bg-blue-500"></div>
                    <span className="text-[10px] font-black text-blue-500/60 tracking-widest leading-none italic">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="relative group">
            <div className="absolute -inset-0.5 bg-pink-500/10 opacity-50 blur-sm"></div>
            <div className="relative bg-black border border-pink-500/20 p-8" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 20%)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-6 bg-pink-600 shadow-[0_0_10px_rgba(255,0,255,1)]"></div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">3. No Gambling Policy</h2>
              </div>
              <p className="text-xs text-pink-500/80 font-black uppercase tracking-[0.2em] leading-relaxed">
                RAID Arena strictly prohibits any form of gambling, betting, or wagering on our platform.
                Users found to be in violation of this policy will have their accounts immediately terminated
                and may be reported to relevant authorities. Our platform is designed for skill-based gaming
                and entertainment only. GAMBLING_INTENT = NULL.
              </p>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-black border border-blue-500/20 p-8" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 15%)' }}>
              <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] mb-4">4. DISCLAIMER</h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">
                The materials on RAID Arena's website are provided on an 'as is' basis.
                RAID Arena makes no warranties, expressed or implied, and hereby disclaims
                and negates all other warranties.
              </p>
            </section>

            <section className="bg-black border border-blue-500/20 p-8" style={{ clipPath: 'polygon(0 0, 90% 0, 100% 15%, 100% 100%, 0 100%)' }}>
              <h2 className="text-xs font-black text-pink-500 uppercase tracking-[0.4em] mb-4">5. LIMITATIONS</h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-relaxed">
                In no event shall RAID Arena or its suppliers be liable for any damages
                arising out of the use or inability to use the materials on RAID Arena's website.
              </p>
            </section>
          </div>

          <section className="bg-black/40 border border-white/5 p-8" style={{ clipPath: 'polygon(2% 0, 100% 0, 100% 80%, 98% 100%, 0 100%, 0 20%)' }}>
            <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.4em] mb-4">9. GOVERNING LAW</h2>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of
              GHANA [NODE_AF-W] and you irrevocably submit to the exclusive jurisdiction of the
              courts in that state or location.
            </p>
          </section>
        </div>

        <div className="mt-16 text-center">
          <Link href="/" className="inline-block group">
            <div className="bg-blue-600/10 border border-blue-600/30 px-10 py-4 text-xs font-black text-blue-400 uppercase tracking-[0.3em] group-hover:bg-blue-600/20 transition-all active:scale-95" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}>
              EXIT_TO_CORE
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};;

export default TermsOfServicePage;