import Link from "next/link";
import { Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-black border-t border-gray-800 text-gray-400 py-12 px-4 md:px-12 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand Column */}
                <div className="space-y-4">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/assets/raid1.svg" alt="RAID Logo" className="w-8 h-8" />
                        <span className="text-xl font-black text-white tracking-tighter">RAID ARENA</span>
                    </Link>
                    <p className="text-sm text-gray-500 max-w-xs">
                        The ultimate esports platform for competitive gaming in Ghana & Nigeria. Join tournaments, build your team, and rise to glory.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                        <a href="https://x.com/raidarena00" className="text-gray-500 hover:text-orange-500 transition-colors" target="_blank" rel="noopener noreferrer"><Twitter size={20} /></a>
                        <a href="https://www.instagram.com/raid00arena/" className="text-gray-500 hover:text-orange-500 transition-colors" target="_blank" rel="noopener noreferrer"><Instagram size={20} /></a>
                        <a href="https://www.tiktok.com/@raid_arena00" className="text-gray-500 hover:text-orange-500 transition-colors" target="_blank" rel="noopener noreferrer">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.44 1.43-1.58 2.41-.05.4-.04.81.01 1.2.14.95.82 1.83 1.7 2.22.84.4 1.84.42 2.68.04.84-.35 1.48-1.09 1.73-1.97.1-.38.15-.77.15-1.17V.02z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Platform Links */}
                <div>
                    <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Platform</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/tournaments" className="hover:text-orange-500 transition-colors">Tournaments</Link></li>
                        <li><Link href="/leaderboard" className="hover:text-orange-500 transition-colors">Leaderboard</Link></li>
                        <li><Link href="/esports-teams" className="hover:text-orange-500 transition-colors">Teams</Link></li>
                        <li><Link href="/profile" className="hover:text-orange-500 transition-colors">Players</Link></li>
                    </ul>
                </div>

                {/* Company Links */}
                <div>
                    <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Company</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
                        <li><Link href="/contact" className="hover:text-orange-500 transition-colors">Contact</Link></li>
                        <li><Link href="/team-manager/login" className="hover:text-orange-500 transition-colors">Partner with Us</Link></li>
                    </ul>
                </div>

                {/* Resources Links */}
                <div>
                    <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Resources</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/terms-of-service" className="hover:text-orange-500 transition-colors">Terms of Service</Link></li>
                        <li><Link href="/privacy-policy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                <p>&copy; {currentYear} RAID ARENA. All rights reserved.</p>
                <div className="flex gap-6">
                    <Link href="/terms-of-service" className="hover:text-gray-400 transition-colors">Terms</Link>
                    <Link href="/privacy-policy" className="hover:text-gray-400 transition-colors">Privacy</Link>
                    <Link href="/cookies" className="hover:text-gray-400 transition-colors">Cookies</Link>
                </div>
            </div>
        </footer>
    );
}
