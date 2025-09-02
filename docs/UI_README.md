# DevOps Monitoring UI

A modern monitoring dashboard for DevOps infrastructure, built with Next.js and shadcn/ui.

## Tech Stack

- **Next.js** - React framework with server-side rendering and file-based routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components built with Radix UI and Tailwind
- **Lucide Icons** - Beautiful, consistent icons
- **Recharts** - Composable charting library for visualizing metrics
- **React Query** - Data fetching and state management
- **Framer Motion** - Animation library
- **next-themes** - Theme management (dark/light mode)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/devops-monitoring-in-a-box.git
cd devops-monitoring-in-a-box/ui-next
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
devops-monitoring-in-a-box/ui-next/
├── app/                    # Next.js app directory
│   ├── dashboard/          # Dashboard page
│   ├── services/           # Services page
│   ├── metrics/            # Metrics page
│   ├── logs/               # Logs page
│   ├── alerts/             # Alerts page
│   ├── settings/           # Settings page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Root page (redirects to dashboard)
├── components/             # React components
│   ├── ui/                 # UI components from shadcn/ui
│   ├── sidebar.tsx         # Sidebar component
│   ├── theme-provider.tsx  # Theme provider component
│   ├── theme-toggle.tsx    # Theme toggle component
│   └── query-provider.tsx  # React Query provider
├── lib/                    # Utility functions
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
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

- **Prometheus** - For system metrics
- **Loki** - For log aggregation
- **Alertmanager** - For alert management

API proxying is configured in `next.config.js` to avoid CORS issues.

## Build for Production

```bash
npm run build
# or
yarn build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.