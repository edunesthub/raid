import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthButton } from './AuthButton';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth(); // Use the actual authentication logic

  return (
    <nav>
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
          {/* ...other authenticated nav items... */}
        </>
      )}
      <AuthButton />
    </nav>
  );
}