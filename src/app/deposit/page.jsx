"use client";
import Link from 'next/link';
import { Rocket, Zap, Shield, Sparkles } from 'lucide-react';

export default function DepositPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="scanline"></div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-md w-full text-center">
        <div className="mb-10 relative inline-block group">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-500 blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-black border border-pink-500/30 p-8" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)' }}>
            <Zap className="w-16 h-16 text-pink-500 mx-auto mb-6 shadow-[0_0_20px_rgba(255,0,255,0.4)]" />
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
              UPLINK_<span className="text-pink-500">CREDIT</span>
            </h1>
            <div className="h-0.5 w-24 bg-pink-500 mx-auto opacity-50 mb-6"></div>
            <p className="text-pink-500/40 font-black uppercase tracking-[0.4em] text-[10px] mb-4">
              // DEPOSIT_GATEWAY_STANDBY
            </p>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
              Establishing secure payment nodes. The credit acquisition
              terminal is currently offline for maintenance.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 text-gray-700 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
            <Shield className="w-4 h-4" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
          </div>

          <Link href="/" className="inline-block group">
            <div className="bg-pink-600/10 border border-pink-600/30 px-12 py-5 text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] group-hover:bg-pink-600/20 transition-all active:scale-95" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}>
              REVERT_TO_BASE
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}