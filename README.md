# RAID1 Arena

A Next.js-based platform for participating in gaming tournaments and leagues.

## Project Structure

### Root Directory

```
├── .gitignore              # Git ignore rules
├── .qodo/                  # Project configuration directory
├── README.md              # Project documentation
├── eslint.config.mjs      # ESLint configuration
├── next.config.ts         # Next.js configuration
├── package.json           # Project dependencies and scripts
├── package-lock.json      # Locked versions of dependencies
├── postcss.config.mjs     # PostCSS configuration for Tailwind
├── tsconfig.json          # TypeScript configuration
```

### Public Assets (`/public`)

```
├── public/
    ├── file.svg           # File-related icon
    ├── globe.svg          # Globe/world icon
    ├── next.svg           # Next.js logo
    ├── vercel.svg         # Vercel logo
    └── window.svg         # Window interface icon
```

### Source Code (`/src`)

```
├── src/
    └── app/               # Next.js App Router directory
        ├── assets/        # Application assets and media
        ├── auth/          # Authentication components and logic
        │   ├── login/     # Login page and components
        │   └── signup/    # Signup page and components
        ├── components/    # Reusable React components
        │   ├── Footer.tsx # Site-wide footer
        │   ├── Header.tsx # Site-wide header
        │   └── ...        # Other shared components
        ├── contexts/      # React Context providers
        │   ├── auth/      # Authentication context
        │   └── wallet/    # Wallet management context
        ├── data/          # Data models and mock data
        │   └── tournaments.ts  # Tournament data and types

        ├── profile/       # User profile management
        │   ├── settings/  # User settings
        │   └── stats/     # User statistics
        ├── tournament/    # Tournament participation
        │   ├── [id]/     # Individual tournament pages
        │   └── list/      # Tournament listing
        ├── wallet/        # Wallet and payments
        │   ├── balance/   # Balance management
        │   └── transactions/ # Transaction history
        ├── favicon.ico    # Site favicon
        ├── globals.css    # Global styles
        ├── layout.tsx     # Root layout component
        └── page.tsx       # Home page component
```

## Key Features

### User Authentication & Profiles Module (MVP - Phase 1)

#### 1. Introduction

##### 1.1 Purpose
This document specifies the technical requirements for the User Authentication & Profiles module of RAID’s MVP. Authentication flows will be powered by Better Auth, while persistent data (users, profiles, match history, Arena Points) will be stored in Postgres, with Drizzle ORM managing schema definitions and database migrations.

##### 1.2 Scope
- Provide secure, scalable user authentication.
- Maintain persistent gamer profiles in Postgres.
- Integrate match history and Arena Points with the tournament system.
- Expose APIs to manage authentication and profile data.

**Not in scope (for Phase 1):**
- Payment or wallet functionality.
- Advanced social features such as friends, chat, or guilds.
- Multi-factor authentication (MFA).

## Getting Started

1. **Prerequisites**
   - Node.js (v18 or higher)
   - npm or yarn
   - Git

2. **Installation**
   ```bash
   # Clone the repository
   git clone [repository-url]

   # Navigate to project directory
   cd raid1arena

   # Install dependencies
   npm install
   ```

3. **Development**
   ```bash
   # Start development server
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build**
   ```bash
   # Create production build
   npm run build

   # Start production server
   npm start
   ```

## Technologies

- [Next.js](https://nextjs.org/) - React framework for production
- TypeScript - Type-safe JavaScript
- Tailwind CSS - Utility-first CSS framework
- ESLint - Code linting
- PostCSS - CSS processing

## Development Guidelines

- Follow TypeScript strict mode guidelines
- Use functional components with hooks
- Implement responsive design using Tailwind CSS

- Follow the component-based architecture

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
