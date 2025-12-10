export default function manifest() {
  return {
    name: "RAID Arena - Mobile Esports Platform",
    short_name: "RAID Arena",
    description: "Africa's premier mobile-first esports platform. Join tournaments, win cash prizes, and get instant payouts.",
    start_url: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#000000",
    scope: "/",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    screenshots: [
      {
        src: "/assets/raid1.svg",
        sizes: "540x720",
        type: "image/svg+xml",
        form_factor: "narrow"
      }
    ],
    categories: ["games", "sports", "entertainment"],
    shortcuts: [
      {
        name: "Tournaments",
        short_name: "Tournaments",
        description: "View active tournaments",
        url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192"
          }
        ]
      },
      {
        name: "Leagues",
        short_name: "Leagues",
        description: "Browse leagues",
        url: "/leagues",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192"
          }
        ]
      },
      {
        name: "Profile",
        short_name: "Profile",
        description: "View your profile",
        url: "/profile",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192"
          }
        ]
      }
    ],
    related_applications: [],
    prefer_related_applications: false
  };
}