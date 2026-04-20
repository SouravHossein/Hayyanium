# Hayyanium

A Vite + React + TypeScript periodic table with:

- interactive grid and list views
- favorites, compare mode, and compound builder
- optional Gemini-powered chemistry helpers
- Tailwind-powered styling with local build-time dependencies

## Getting Started

1. Install dependencies with `npm install`
2. Create `.env.local` from `.env.example`
3. Start the dev server with `npm run dev`

## Environment

This project uses Vite-style client env vars:

- `VITE_GEMINI_API_KEY`

If the Gemini key is missing, the app still works and AI-only actions degrade gracefully.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run typecheck`
# Integrating LinkedIn OAuth with Next.js and Supabase

This guide outlines the steps to integrate LinkedIn OAuth for user authentication in a Next.js application using Supabase. The process involves configuring a LinkedIn OAuth application, setting up the Supabase project, and implementing the authentication flow within your Next.js client.

## 1. Set up LinkedIn Developer Application

To begin, you need to create and configure an application on the LinkedIn Developer Dashboard [1].

1.  Go to the [LinkedIn Developer Dashboard](https://developer.linkedin.com/).
2.  Log in with your LinkedIn account.
3.  Click on `Create App` in the top right corner.
4.  Provide your `LinkedIn Page` and `App Logo`, then save your application.
5.  Navigate to the `Products` tab from the top menu.
6.  Find `Sign In with LinkedIn using OpenID Connect` and click `Request Access`.
7.  Go to the `Auth` tab.
8.  In the `Authorized Redirect URLs for your app` section, add your Supabase callback URL. This URL will be in the format `https://<project-ref>.supabase.co/auth/v1/callback`. You can obtain this from your Supabase Project Dashboard (see Section 2).
9.  Copy and securely save your `Client ID` and `Client Secret`.
10. Ensure that the appropriate scopes are added under `OAuth 2.0 Scopes` at the bottom of the `Auth` screen. For basic sign-in, `openid`, `profile`, and `email` scopes are typically required.

## 2. Configure Supabase Project

Next, you need to configure your Supabase project to use the LinkedIn (OIDC) provider [1].

1.  Go to your [Supabase Project Dashboard](https://app.supabase.com/).
2.  In the left sidebar, click the `Authentication` icon.
3.  Under the `Configuration` section, click on `Providers`.
4.  Find `LinkedIn (OIDC)` in the accordion list, expand it, and toggle `LinkedIn (OIDC) Enabled` to ON.
5.  Enter the `LinkedIn (OIDC) Client ID` and `LinkedIn (OIDC) Client Secret` that you obtained from the LinkedIn Developer Dashboard.
6.  Click `Save`.

### Supabase Callback URL

To find your Supabase callback URL:

1.  In your Supabase Project Dashboard, navigate to `Authentication` -> `Sign In / Providers`.
2.  Expand the `LinkedIn` provider section. Your callback URL will be displayed there. Copy it for use in the LinkedIn Developer Application setup.

## 3. Integrate with Next.js Application

This section details how to integrate LinkedIn OAuth into your Next.js application, focusing on Server-Side Rendering (SSR) with Supabase [2].

### 3.1 Install Dependencies

Install the necessary Supabase client libraries:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 3.2 Environment Variables

Create a `.env.local` file in your project's root directory and add your Supabase project URL and publishable key:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

You can find these keys in your Supabase Project Dashboard under `Project Settings` -> `API Keys`.

### 3.3 Create Supabase Client Utilities

Create a `lib/supabase` folder (or `src/lib/supabase` if you use `src`) and add `client.ts` and `server.ts` files for your Supabase client configurations.

#### `lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

#### `lib/supabase/server.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `cookies().set()` method can only be called in a Server Component or Route Handler
            // from a "use client" Component, it's not available.
            // Https://nextjs.org/docs/messages/cookies-server-action
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `cookies().set()` method can only be called in a Server Component or Route Handler
            // from a "use client" Component, it's not available.
            // Https://nextjs.org/docs/messages/cookies-server-action
          }
        },
      },
    }
  )
}
```

### 3.4 Implement Authentication Flow

#### Sign In with LinkedIn

In your Next.js component or page, you can initiate the LinkedIn OAuth flow using `signInWithOAuth`:

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

async function signInWithLinkedIn() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo: `${location.origin}/auth/callback`,
    },
  })
  if (error) {
    console.error('Error signing in with LinkedIn:', error.message)
  }
}

// Example usage in a React component:
// <button onClick={signInWithLinkedIn}>Sign in with LinkedIn</button>
```

#### Handle Callback

Create a new file at `app/auth/callback/route.ts` to handle the OAuth callback and exchange the code for a user session:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    next = '/'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
```

### 3.5 Sign Out

To sign out a user, you can call the `signOut()` method:

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error.message)
  }
}
```

## References

1.  [Login with LinkedIn | Supabase Docs](https://supabase.com/docs/guides/auth/social-login/auth-linkedin)
2.  [Creating a Supabase client for SSR | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)