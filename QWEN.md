# Project Context for Qwen Code

## Project Overview

This is a Next.js 15 application named "Screenbolt". Based on the dependencies and file structure, it appears to be a video management platform with features for user authentication, workspaces, and video storage. Key technologies include:

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Redux Toolkit, React Context (Auth), TanStack Query (React Query)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom implementation with localStorage and HTTP-only cookies, potentially integrating with NextAuth
- **Cloud Services**:
  - Vercel Blob for storage
  - Google Drive API integration
  - Dropbox API integration
  - Stripe for payments (indicated by `@stripe/stripe-js` and Stripe-related fields in the Prisma schema)
- **UI Components**: Extensive use of Radix UI primitives and shadcn/ui
- **AI Integration**: Anthropic and OpenAI SDKs are included

The application has a clear structure for handling users, workspaces, and videos, with support for tracking video views.

## Building and Running

### Prerequisites

- Node.js (version not specified, but likely 18+ given Next.js 15)
- pnpm (package manager)
- PostgreSQL database
- Environment variables configured (especially `DATABASE_URL`)

### Development

1. Install dependencies: `pnpm install`
2. Run the development server: `pnpm dev`
   - This starts the Next.js development server, typically on port 3000.
   - The `postinstall` script automatically runs `prisma generate`.

### Building for Production

1. Build the application: `pnpm build`
   - This command first runs `prisma generate` to update the Prisma client, then `next build` to create an optimized production build.

### Running in Production

1. Start the production server: `pnpm start`
   - This runs `next start` to serve the built application.

### Other Scripts

- `pnpm lint`: Runs Next.js's built-in ESLint.
- `prisma generate`: Generates the Prisma client based on `schema.prisma`.

## Development Conventions

### File Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable React components, including shadcn/ui components in `components/ui/`.
- `hooks/`: Custom React hooks.
- `interfaces/`: TypeScript interfaces for type definitions.
- `lib/`: Utility functions and generated code (like the Prisma client).
- `prisma/`: Prisma schema and migrations.
- `providers/`: React context providers (Auth, Theme, Redux, Query).
- `public/`: Static assets.
- `schemas/`: Likely Zod schemas for validation.
- `store/`: Redux store configuration.
- `types/`: Additional TypeScript types.

### Styling

- Uses Tailwind CSS for utility-first styling.
- shadcn/ui components are used for consistent UI elements.
- A `cn` utility function (`lib/utils.ts`) is available for merging Tailwind classes with `clsx` and `twMerge`.

### State Management

- Authentication state is managed with a custom React Context (`AuthProvider`) and persisted in `localStorage`.
- Global application state uses Redux Toolkit.
- Server state (API data) is managed with TanStack Query (React Query).

### Data Layer

- Prisma ORM is used for database interactions.
- The schema defines models for `User`, `Workspace`, `Video`, and `VideoView`.
- Users can have multiple workspaces and videos.
- OAuth tokens for Google Drive and Dropbox are stored for file access.

### Authentication and Routing

- Custom middleware (`middleware.ts`) handles route protection.
- Public routes are defined (e.g., `/`, `/login`, `/signup`, `/watch/:id`).
- All other routes require an `auth-token` cookie.
- Authentication logic is centralized in `AuthProvider`.

### UI/UX

- Implements a theme provider for light/dark mode switching.
- Uses a floating theme toggle button in the layout.
- Integrates `sonner` for toast notifications.
