# DevOps Monitoring UI

A modern monitoring dashboard for DevOps infrastructure, built with Next.js and shadcn/ui.

## Tech Stack

- **Next.js 16** - React framework with App Router, Turbopack, and standalone output
- **Tailwind CSS v4** - Utility-first CSS framework (`@tailwindcss/postcss`)
- **shadcn/ui** - Accessible UI components built with Radix UI and Tailwind
- **Hugeicons & Lucide Icons** - Clean icon sets (`@hugeicons/react` & `lucide-react`)
- **Recharts** - Composable charting library for visualizing metrics
- **React Query** - Data fetching and state management
- **Framer Motion** - Animation library
- **next-themes** - Theme management (dark/light mode)
- **Vitest** - Unit testing (`npm run verify` runs ESLint, `tsc`, Vitest, and Next.js build)

## Getting Started

### Prerequisites

- Node.js 20+ (24 LTS recommended) and npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/NotHarshhaa/devops-monitoring-in-a-box.git
cd devops-monitoring-in-a-box/ui-next
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser (Docker Compose serves the built UI on [http://localhost:4000](http://localhost:4000))

## Project Structure

```
devops-monitoring-in-a-box/ui-next/
├── app/                    # Next.js App Router pages & API routes
│   ├── admin/              # Admin center page
│   ├── alerts/             # Alerts & silence management
│   ├── api/                # auth, health, notifications, proxy, ssl routes
│   ├── auth/               # signin, signup, forgot-password, error pages
│   ├── dashboard/          # Main monitoring dashboard
│   ├── logs/               # Loki log search & live tail
│   ├── metrics/            # Prometheus metrics charts
│   ├── plugins/            # Plugin manager & data viewer
│   ├── profile/            # User profile page
│   ├── services/           # Service health, Blackbox SLA, SSL tracker
│   ├── settings/           # Notification & site settings
│   ├── templates/          # Grafana dashboard template marketplace
│   ├── version/            # Component version monitor
│   ├── globals.css         # Tailwind v4 & shadcn global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Root redirect
├── components/             # React components (app-shell.tsx, ui/, etc.)
├── hooks/                  # React hooks
├── lib/                    # Service API clients, auth-simple, config, server helpers
├── prisma/                 # Prisma SQLite schema & seed script
├── public/                 # Static assets
├── tests/                  # Vitest unit tests
├── Dockerfile              # Multi-stage Chainguard Wolfi distroless build
├── next.config.js          # Next.js configuration (standalone output)
├── package.json            # Dependencies and npm scripts
├── postcss.config.mjs      # Tailwind CSS v4 PostCSS plugin configuration
├── proxy.ts                # NextAuth session & route protection proxy
└── tsconfig.json           # TypeScript configuration
```

## Features

- **Real-time monitoring** of system metrics (CPU, memory, disk, network)
- **Dark/light mode** support with theme persistence
- **Responsive design** that works on mobile, tablet, and desktop
- **Interactive charts** for visualizing system performance
- **Animated UI** with smooth transitions and interactions
- **Alerts dashboard** for monitoring system health
- **Service status** indicators

## API Integration

The UI connects to the following monitoring services:

- **Prometheus** - For system metrics and Blackbox probe metrics
- **Loki** - For log aggregation
- **Alertmanager** - For alert management & silences

Authenticated API proxying is handled server-side through `app/api/proxy/[service]/[...path]/route.ts` with allowlisted paths in `lib/server/upstream.ts` to keep monitoring backends private and avoid CORS issues.

## Build & Verify

```bash
npm run verify   # ESLint, TypeScript check, Vitest unit suite, and production build
npm run build    # Prisma generate + Next.js standalone production build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.