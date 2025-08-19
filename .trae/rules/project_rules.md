# Cursor Rules - Next.js Clean Architecture

## Project Structure

Gunakan struktur folder clean architecture berikut:

```
/src
├── /lib                 # Utilities & Konfigurasi
│   ├── db.ts           # Prisma client instance
│   ├── cache.ts        # Caching utilities
│   ├── query-client.ts # TanStack Query config
│   └── auth.ts         # Authentication config
├── /app                # Next.js App Router
│   ├── layout.tsx      # Root layout dengan providers
│   ├── page.tsx        # Homepage
│   ├── /api            # API routes (server-side)
│   │   └── /[feature]  # Feature-based API grouping
│   └── /[pages]        # App pages
├── /components         # React Components
│   ├── /ui             # Base reusable components
│   └── /features       # Feature-specific components
├── /hooks              # Custom React hooks
├── /types              # TypeScript type definitions
├── /schemas            # Zod validation schemas
└── middleware.ts       # Route protection
```

## Architecture Principles

### 1. Separation of Concerns

- **Presentation Layer**: `/components` dan `/app` untuk UI
- **Business Logic**: `/hooks` untuk data fetching dan state management
- **Data Layer**: `/lib` untuk database dan caching
- **Validation**: `/schemas` untuk input validation
- **Types**: `/types` untuk type safety

### 2. File Naming Conventions

- Components: PascalCase (`user-list.tsx`, `button.tsx`)
- Hooks: kebab-case with use prefix (`use-users.ts`, `use-auth.ts`)
- API routes: kebab-case (`route.ts` in folder structure)
- Types: kebab-case (`user.ts`, `api-response.ts`)
- Schemas: kebab-case (`user.ts`, `auth.ts`)

### 3. Component Organization

- Base UI components di `/components/ui` (button, input, modal)
- Page components di `/components/[page-name]`
- One component per file
- Co-locate related components dalam feature folder

## Technology Stack Rules

### Next.js App Router

- Gunakan App Router (bukan Pages Router)
- Server Components untuk initial data loading
- Client Components untuk interactivity
- API routes untuk server-side operations
- Hybrid approach: navigation client-side, data fetching mixed

### TanStack Query

- Semua client-side data fetching harus pakai TanStack Query
- Query keys harus konsisten: `['feature', 'action', params]`
- Set proper staleTime dan cacheTime
- Gunakan optimistic updates untuk better UX
- Error handling dengan retry mechanism

### Prisma + Database

- Database calls hanya di server-side (API routes atau Server Components)
- Prisma client instance di `/lib/db.ts`
- Gunakan connection pooling
- Handle database errors gracefully

### Zod Validation

- Semua input validation harus pakai Zod
- Schema di `/schemas` folder
- Share schema antara client dan server
- Type inference dari Zod schema

### Authentication & Session

- Authentication logic di `/lib/auth.ts`
- Session management dengan cookies atau JWT
- Protected routes pakai middleware
- User state management dengan custom hooks

## Code Style Rules

### TypeScript

- Strict mode enabled
- Proper type definitions, avoid `any`
- Use type inference where possible
- Interface untuk object shapes, type untuk unions

### React Patterns

- Functional components dengan hooks
- Custom hooks untuk reusable logic
- Proper dependency arrays di useEffect
- Memoization hanya ketika perlu (useMemo, useCallback)

### Error Handling

- Try-catch di async operations
- Proper error boundaries untuk React
- User-friendly error messages
- Loading states untuk async operations

### Performance

- Lazy loading untuk components berat
- Image optimization dengan Next.js Image
- Bundle splitting dengan dynamic imports
- Proper caching strategies

## API Design Rules

### REST API Conventions

- RESTful naming: `/api/users`, `/api/users/[id]`
- HTTP methods: GET, POST, PUT, DELETE
- Consistent response format
- Proper status codes

### Data Fetching Strategy

- Server-side untuk initial page load (SEO + security)
- Client-side untuk subsequent interactions
- Cache di multiple layers (TanStack Query + server)
- Optimistic updates untuk instant feedback

### Request/Response

- Input validation dengan Zod di API routes
- Type-safe API responses
- Error handling dengan proper status codes
- Rate limiting untuk public endpoints

## Best Practices

### Security

- Input sanitization dan validation
- Environment variables untuk secrets
- CSRF protection
- Proper authentication checks

### SEO & Performance

- Server-side rendering untuk public pages
- Meta tags dan Open Graph
- Sitemap generation
- Performance monitoring

### Testing Strategy

- Unit tests untuk utility functions
- Integration tests untuk API routes
- Component testing dengan React Testing Library
- E2E testing untuk critical user flows

### Development Workflow

- Feature-based development
- Git conventional commits
- Code review requirements
- TypeScript strict mode
- ESLint + Prettier configuration

## Common Patterns

### Data Fetching Hook Template

```typescript
// /hooks/use-[feature].ts
export const useFeature = (params?) => {
  return useQuery({
    queryKey: ["feature", params],
    queryFn: () => fetchFeature(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!params, // conditional fetching
  });
};
```

### API Route Template

```typescript
// /app/api/[feature]/route.ts
import { schema } from "@/schemas/feature";
import { db } from "@/lib/db";

export async function GET() {
  // Server-side logic with proper error handling
}
```

### Component Structure

```typescript
// Feature component dengan proper typing
interface Props {
  // Clear prop definitions
}

export function FeatureComponent({ ...props }: Props) {
  // Hooks di top
  // Event handlers
  // Render logic
}
```

## Don'ts

- ❌ Jangan campur client dan server logic
- ❌ Jangan pakai `any` type tanpa alasan kuat
- ❌ Jangan fetch data di useEffect untuk initial load
- ❌ Jangan lupa error handling
- ❌ Jangan over-engineer untuk simple cases
- ❌ Jangan bypass Zod validation
- ❌ Jangan expose sensitive data ke client

## Performance Considerations

- Bundle size monitoring
- Loading states untuk UX
- Progressive enhancement
- Proper caching headers
- Database query optimization
- Image dan asset optimization
