import React from 'react';
import { FaDiscord, FaWhatsapp, FaTiktok, FaInstagram } from 'react-icons/fa';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-raid-gray-dark text-foreground py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-between">
                    <div className="w-full md:w-1/3 mb-6 md:mb-0">
                        <h2 className="text-2xl font-bold mb-2">RAID</h2>
                        <p className="text-raid-gray-light">Join tournaments, Leagues and Communities.</p>
                    </div>
                    <div className="w-full md:w-1/3 mb-6 md:mb-0">
                        <h3 className="text-xl font-semibold mb-2">Quick Links</h3>
                        <ul>
                            <li><Link href="/" className="text-foreground hover:text-raid-orange">Home</Link></li>
                            <li><Link href="/about" className="text-foreground hover:text-raid-orange">About</Link></li>
                            <li><Link href="/contact" className="text-foreground hover:text-raid-orange">Contact</Link></li>
                            <li><Link href="/terms-of-service" className="text-foreground hover:text-raid-orange">Terms of Service</Link></li>
                            <li><Link href="/privacy-policy" className="text-foreground hover:text-raid-orange">Privacy Policy</Link></li>
                            <li><Link href="mailto:raid00arena@gmail.com" className="text-foreground hover:text-raid-orange">Email</Link></li>
                            <li><Link href="/auth/login" className="text-foreground hover:text-raid-orange">Login / Sign Up</Link></li>
                        </ul>
                    </div>
                    <div className="w-full md:w-1/3">
                        <h3 className="text-xl font-semibold mb-2">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="https://discord.gg/hzuZNbRD" className="text-foreground hover:text-raid-orange">
                                <FaDiscord size={24} />
                            </a>
                            <a href="https://chat.whatsapp.com/Gjg0O27vntADU2WjTHmCgw" className="text-foreground hover:text-raid-orange">
                                <FaWhatsapp size={24} />
                            </a>
                            <a href="https://www.tiktok.com/@raid_arena00" className="text-foreground hover:text-raid-orange">
                                <FaTiktok size={24} />
                            </a>
                            <a href="https://www.instagram.com/raid00arena/" className="text-foreground hover:text-raid-orange">
                                <FaInstagram size={24} />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-8 border-t border-raid-gray-light pt-4 text-center text-raid-gray-light">
                    &copy; {new Date().getFullYear()} RAID ARENA. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;