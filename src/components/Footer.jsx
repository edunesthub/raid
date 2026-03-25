import Link from "next/link";
import { Twitter, Instagram, Youtube, Mail, MapPin, Phone, Github } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const sections = [
        {
            title: "Platform",
            links: [
                { name: "Tournaments", href: "/tournament" },
                { name: "Challenges", href: "/challenges" },
                { name: "Leaderboard", href: "/leaderboard" },
                { name: "Pro Teams", href: "/esports-teams" },
            ]
        },
        {
            title: "Company",
            links: [
                { name: "About Us", href: "/about" },
                { name: "Careers", href: "/careers" },
                { name: "Contact", href: "/contact" },
                { name: "Partners", href: "/partners" },
            ]
        },
        {
            title: "Legal",
            links: [
                { name: "Terms of Service", href: "/terms-of-service" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Cookie Policy", href: "/cookies" },
            ]
        }
    ];

    return (
        <footer className="relative bg-black pt-20 pb-10 px-4 overflow-hidden w-full">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full" />

            <div className="max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6 lg:pr-12">
                        <Link href="/" className="flex items-center gap-3 group">
                            <img src="/assets/raid1.svg" alt="Raid Arena" className="w-10 h-10 group-hover:scale-110 transition-transform" />
                            <span className="text-2xl font-black italic tracking-tighter text-white">
                                RAID<span className="text-orange-500">ARENA</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 font-medium leading-relaxed max-w-sm">
                            The ultimate destination for competitive mobile gaming in Africa. 
                            Build your legacy, join tournaments, and claim your glory in the Arena.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
                                <a 
                                    key={i} 
                                    href="#" 
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all"
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections Nested Grid */}
                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-10 lg:gap-8 lg:pl-10">
                        {sections.map((section) => (
                            <div key={section.title}>
                                <h3 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">{section.title}</h3>
                                <ul className="space-y-4">
                                    {section.links.map((link) => (
                                        <li key={link.name}>
                                            <Link href={link.href} className="inline-block text-gray-400 hover:text-orange-500 hover:translate-x-1 transition-all text-sm font-medium">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-sm font-medium">
                        &copy; {currentYear} RAID ARENA. Designed for Champions.
                    </p>
                    <div className="flex flex-wrap items-center gap-6 mt-4 md:mt-0 text-sm font-medium text-gray-500">
                        <span className="flex items-center gap-2 hover:text-orange-500 transition-colors cursor-pointer">
                            <MapPin size={16} /> Ghana, Africa
                        </span>
                        <a href="mailto:contact@raidarena.gg" className="flex items-center gap-2 hover:text-orange-500 transition-colors">
                            <Mail size={16} /> contact@raidarena.gg
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
