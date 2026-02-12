import Link from "next/link";
import { Twitter, Instagram, Facebook, Youtube, Github } from "lucide-react";

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
                        <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors"><Instagram size={20} /></a>
                        <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors"><Youtube size={20} /></a>
                        <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors"><Github size={20} /></a>
                    </div>
                </div>

                {/* Platform Links */}
                <div>
                    <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Platform</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/tournaments" className="hover:text-orange-500 transition-colors">Tournaments</Link></li>
                        <li><Link href="/leaderboard" className="hover:text-orange-500 transition-colors">OS Leaderboard</Link></li>
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
                        <li><Link href="/admin/login" className="hover:text-orange-500 transition-colors">Admin Access</Link></li>
                    </ul>
                </div>

                {/* Resources Links */}
                <div>
                    <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Resources</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/terms-of-service" className="hover:text-orange-500 transition-colors">Terms of Service</Link></li>
                        <li><Link href="/privacy-policy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/faq" className="hover:text-orange-500 transition-colors">FAQs</Link></li>
                        <li><Link href="/support" className="hover:text-orange-500 transition-colors">Support Center</Link></li>
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
