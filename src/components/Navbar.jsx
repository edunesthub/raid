import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthButton } from './AuthButton';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Black notch spacer for iOS / Capacitor */}
      <div
        style={{
          height: 'env(safe-area-inset-top)',
          width: '100%',
          backgroundColor: '#000', // always black
        }}
      />

      {/* Actual navigation */}
      <nav
        className="h-16 flex items-center px-4 md:px-8 bg-black"
        style={{ position: 'relative', zIndex: 10 }}
      >
        <Link href="/" className={`nav-link ${pathname === '/' ? 'nav-link-active' : ''}`}>
          Home
        </Link>
        {isAuthenticated && (
          <>
            <Link href="/clans" className={`nav-link ${pathname === '/clans' ? 'nav-link-active' : ''}`}>
              Clans
            </Link>
            <Link href="/about" className={`nav-link ${pathname === '/about' ? 'nav-link-active' : ''}`}>
              About
            </Link>
            <Link href="/leagues" className={`nav-link ${pathname === '/leagues' ? 'nav-link-active' : ''}`}>
              Leagues
            </Link>
          </>
        )}
        <AuthButton />
      </nav>
    </>
  );
}