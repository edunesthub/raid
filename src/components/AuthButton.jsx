"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { LogIn, LogOut, User, Loader2 } from "lucide-react";
import Link from "next/link";

export function AuthButton({ className = "", onAction }) {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  const handleClick = () => {
    if (onAction) onAction();
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-2 ${className}`}>
        <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Link 
          href="/profile" 
          onClick={handleClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg overflow-hidden">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <User size={14} />
            )}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-[10px] font-black italic text-orange-500 leading-none mb-0.5 uppercase">Elite Player</p>
            <p className="text-xs font-bold text-white leading-none">@{user.username || 'player'}</p>
          </div>
        </Link>
        <button
          onClick={() => {
            logout();
            handleClick();
          }}
          className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Link
        href="/auth/login"
        onClick={handleClick}
        className="px-6 py-2.5 rounded-xl font-bold text-sm text-white/70 hover:text-white transition-colors"
      >
        Login
      </Link>
      <Link
        href="/auth/signup"
        onClick={handleClick}
        className="btn-raid-v2 shadow-orange-500/20"
      >
        Join Arena
      </Link>
    </div>
  );
}
