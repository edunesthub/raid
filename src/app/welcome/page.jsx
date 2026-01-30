"use client";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white text-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Scanline overlay */}
      <div className="scanline"></div>

      <div className="relative z-20 flex flex-col items-center">
        <div className="mb-8 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-pink-600 rounded-none blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative px-8 py-6 bg-black border border-white/10" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white mb-2">
              RAID <span className="text-blue-500">ARENA</span>
            </h1>
            <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-pink-500 to-blue-500 opacity-50"></div>
          </div>
        </div>

        <p className="text-blue-400 font-bold uppercase tracking-[0.5em] text-[10px] mb-12 animate-pulse">
          // ESTABLISHING_SECURE_LINK //
        </p>

        <div className="flex flex-col gap-6 w-full max-w-xs">
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] py-4 transition-all duration-300 shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_35px_rgba(0,243,255,0.5)] active:scale-95"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
            Authenticate
          </button>

          <button
            onClick={() => router.push("/auth/signup")}
            className="w-full bg-transparent border border-pink-500 text-pink-500 hover:bg-pink-500/10 font-black uppercase tracking-[0.3em] py-4 transition-all duration-300 shadow-[0_0_15px_rgba(255,0,255,0.1)] active:scale-95"
            style={{ clipPath: 'polygon(0 0, 90% 0, 100% 30%, 100% 100%, 10% 100%, 0 70%)' }}
          >
            Create_Profile
          </button>
        </div>

        <div className="mt-16 flex items-center gap-4 text-gray-600">
          <div className="h-px w-8 bg-gray-800"></div>
          <span className="text-[10px] uppercase font-bold tracking-widest">v0.1.0_GHANA_NODES</span>
          <div className="h-px w-8 bg-gray-800"></div>
        </div>
      </div>
    </div>
  );
}
