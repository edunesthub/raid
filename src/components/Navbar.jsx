import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthButton } from './AuthButton';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Menu, X, Trophy, MessageSquare, Users, Home } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Tournaments', href: '/tournament', icon: Trophy },
    { name: 'Challenges', href: '/challenges', icon: MessageSquare },
    { name: 'Players', href: '/players', icon: Users },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-panel py-2' : 'bg-transparent py-4'
    }`}>
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <img src="/assets/raid1.svg" alt="R" className="w-6 h-6 invert" />
          </div>
          <span className="text-xl font-black italic tracking-tighter text-white group-hover:text-orange-500 transition-colors">
            RAID<span className="text-orange-500 group-hover:text-white">ARENA</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold tracking-tight transition-all ${
                  isActive 
                    ? 'bg-orange-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Auth / Mobile Toggle */}
        <div className="flex items-center gap-4">
          <AuthButton className="hidden md:block" />
          
          <button 
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-black/95 backdrop-blur-xl animate-fade-in p-6">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all ${
                    isActive 
                      ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={24} />
                  {link.name}
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t border-white/10">
              <AuthButton onAction={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}