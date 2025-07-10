# ICUPA Platform

This repository contains the client PWA, vendor app, and admin panel for the ICUPA platform.

## Documentation

- [Admin Panel](ICUPA_ADMIN_PANEL.md)
- [Client Flow](ICUPA_CLIENT_FLOW.md)
- [Vendor App](ICUPA_VENDOR_APP.md)

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL & Edge Functions)

## Getting Started

Install dependencies and start the development server:
```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
```dotenv
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

## License

TBD
