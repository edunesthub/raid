"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthButton } from './AuthButton';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Fixed navbar */}
      <nav
        className="fixed top-0 left-0 w-full h-16 flex items-center px-4 md:px-8 bg-black z-50"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <Link href="/" className={`nav-link ${pathname === '/' ? 'nav-link-active' : ''}`}>
          Home
        </Link>
        {isAuthenticated && (
          <>
            <Link
              href="/clans"
              className={`nav-link ${pathname === '/clans' ? 'nav-link-active' : ''}`}
            >
              Clans
            </Link>
            <Link
              href="/about"
              className={`nav-link ${pathname === '/about' ? 'nav-link-active' : ''}`}
            >
              About
            </Link>
            <Link
              href="/leagues"
              className={`nav-link ${pathname === '/leagues' ? 'nav-link-active' : ''}`}
            >
              Leagues
            </Link>
          </>
        )}
        <AuthButton />
      </nav>

      {/* Spacer div to push content below the fixed navbar */}
      <div style={{ height: "calc(4rem + env(safe-area-inset-top))" }} />
    </>
  );
}