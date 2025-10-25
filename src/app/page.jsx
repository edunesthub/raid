import Link from "next/link";
import Image from "next/image";
import { featuredTournaments } from "@/data/tournaments";
import TournamentCard from "@/components/TournamentCard.jsx";

export default function Home() {
  // ✅ Use direct public paths instead of imports
  const assets = [
    "/assets/8ball.jpg",
    "/assets/amongus.jpg",
    "/assets/brawlhalla.jpg",
    "/assets/chess.jpg",
    "/assets/cod.jpg",
    "/assets/dream.jpg",
    "/assets/efootball.jpg",
    "/assets/fifa.jpg",
    "/assets/freefire.jpg",
    "/assets/mortal.jpg",
    "/assets/pubg-mobile.jpg",
    "/assets/raid1.svg",
    "/assets/shawdow.jpg",
    "/assets/2kmbile.jpg",
  ];

  return (
    <div className="container-mobile min-h-screen py-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="mb-4 flex justify-center">
          {/* ✅ Use direct path from public */}
          <Image
            src="/assets/raid1.svg"
            alt="RAID Logo"
            width={120}
            height={120}
            className="w-30 h-30"
          />
        </div>

        <div className="bg-gradient-to-r from-black/10 to-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-300">
            Compete in skill-based tournaments with gamers around Ghana.
          </p>
        </div>
      </div>

      {/* Images Carousel Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Featured</h2>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
            {assets.map((src, idx) => (
              <div
                key={idx}
                className="snap-center shrink-0 w-64 h-40 relative rounded-lg overflow-hidden border border-gray-700"
              >
                <Image
                  src={src}
                  alt={`asset-${idx}`}
                  fill
                  className="object-cover"
                  priority={idx < 3}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2"></span>
          Raid Tournaments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      </section>
    </div>
  );
}
