# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Next.js Commands
- **Development**: `npm run dev` - Starts the Next.js development server at http://localhost:3000
- **Build**: `npm run build` - Creates an optimized production build
- **Production**: `npm start` - Runs the production build (requires `npm run build` first)
- **Lint**: `npm run lint` - Runs ESLint with Next.js TypeScript configuration

### Supabase Commands
- **Generate Types**: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts` - Generate TypeScript types from Supabase schema
- **Local Development**: `npx supabase start` - Start local Supabase instance (if configured)
- **Migration Status**: `npx supabase db status` - Check migration status
- **Reset Database**: `npx supabase db reset` - Reset local database to initial state

### Package Management
- **Install Dependencies**: `npm install`
- **Add Dependency**: `npm install package-name`
- **Add Dev Dependency**: `npm install -D package-name`

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.5.3 with App Router
- **Language**: TypeScript with strict configuration
- **Database**: Supabase (PostgreSQL) with server-side auth
- **Payments**: Stripe integration for lesson payments
- **Styling**: CSS Modules for component-specific styling
- **Authentication**: Supabase Auth with server actions

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication-related pages
│   ├── checkout/          # Stripe payment flow
│   ├── dashboard/         # User dashboard (protected)
│   └── layout.tsx         # Root layout with Header/Footer
├── components/            # Reusable React components
│   ├── AuthForm.tsx       # Login/signup forms
│   ├── BookingForm.tsx    # Lesson booking interface
│   ├── PaymentForm.tsx    # Stripe payment integration
│   └── *.module.css       # Component-specific styles
└── lib/                   # Utilities and configurations
    ├── actions/           # Server actions for forms
    │   ├── auth.ts        # Authentication actions
    │   ├── booking.ts     # Booking CRUD operations
    │   └── stripe.ts      # Payment processing
    ├── supabase/          # Supabase client configurations
    │   ├── client.ts      # Browser client
    │   ├── server.ts      # Server client (read-only)
    │   └── actions.ts     # Server actions client
    └── database.types.ts  # Generated Supabase TypeScript types
```

### Database Schema
Core tables in Supabase:
- **profiles**: User profile information
- **instructors**: Driving instructors with lesson pricing
- **bookings**: Lesson bookings linking users and instructors
- **lesson_slots**: Available time slots (if implemented)

### Authentication Flow
1. **Server-Side Auth**: Uses Supabase SSR with Next.js cookies
2. **Client Types**:
   - `createSupabaseBrowserClient()`: For client-side operations
   - `createServerSupabaseClient()`: For server components (read-only)
   - `createServerActionClient()`: For server actions with cookie management
3. **Protected Routes**: Dashboard and booking pages require authentication
4. **Auth Actions**: Sign in, sign up, sign out, password reset in `lib/actions/auth.ts`

### Payment Integration
- **Stripe Elements**: Client-side payment form with PaymentElement
- **Server Actions**: Payment intent creation in `lib/actions/stripe.ts`
- **Flow**: Book lesson → Redirect to checkout → Process payment → Confirmation

### Key Patterns

#### Server Actions Pattern
All form submissions use Next.js server actions:
```typescript
// lib/actions/booking.ts
export async function createBooking(formData: FormData) {
  const supabase = createServerActionClient();
  // ... booking logic
}
```

#### Supabase Client Pattern
Different clients for different contexts:
- Browser components: `createSupabaseBrowserClient()`
- Server components: `createServerSupabaseClient()` 
- Server actions: `createServerActionClient()`

#### CSS Modules Pattern
Component-specific styling with `.module.css` files co-located with components.

## Development Guidelines

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_SECRET_KEY`: Stripe secret key (server-side only)
- `NEXT_PUBLIC_SITE_URL`: Site URL for redirects

### TypeScript Configuration
- Strict mode enabled with `noEmit: true` for type checking only
- Path mapping: `@/*` maps to `./src/*`
- Next.js plugin enabled for enhanced TypeScript support

### ESLint Configuration
- Extends Next.js core web vitals and TypeScript rules
- Ignores build directories and generated files
- Uses flat config format (ESLint v9+)

### Database Type Safety
- Generate types after schema changes: `npx supabase gen types`
- Import types from `@/lib/database.types` for type safety
- Use typed Supabase clients: `createServerClient<Database>`

### Common Workflows

#### Adding a New Protected Page
1. Create page in `src/app/new-page/page.tsx`
2. Add authentication check:
   ```typescript
   const supabase = createServerSupabaseClient();
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) redirect('/auth/sign-in');
   ```

#### Adding a New Database Operation
1. Create server action in `src/lib/actions/`
2. Use `createServerActionClient()` for database operations
3. Include proper error handling and user authentication
4. Call `revalidatePath()` for cache invalidation

#### Integrating New Stripe Features
1. Add server action in `src/lib/actions/stripe.ts`
2. Create client-side component with Stripe Elements
3. Handle payment flow with proper error states