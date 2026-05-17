import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider, themeBootstrapScript } from "@/hooks/use-theme";
import { buildHead, buildSiteJsonLd } from "@/lib/seo";
import appCss from "../styles.css?url";

const queryClient = new QueryClient();

/**
 * Imperatively flag unmatched URLs as noindex, nofollow on mount.
 *
 * TanStack Router's `notFoundComponent` runs outside of the route's `head()`
 * lifecycle, so the root's `index, follow` robots directive would otherwise
 * leak to 404 URLs. We swap the robots tag in / out for the lifetime of the
 * NotFound view and restore the previous value on unmount.
 */
function useNotFoundRobots() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const previousTitle = document.title;
    document.title = 'Page not found — AssetWise';

    const existing = document.querySelector('meta[name="robots"]');
    const previousRobots = existing?.getAttribute('content') ?? null;
    let injected = false;

    if (existing) {
      existing.setAttribute('content', 'noindex, nofollow');
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      meta.setAttribute('content', 'noindex, nofollow');
      document.head.appendChild(meta);
      injected = true;
    }

    return () => {
      document.title = previousTitle;
      if (injected) {
        const created = document.querySelector('meta[name="robots"][content="noindex, nofollow"]');
        created?.parentNode?.removeChild(created);
      } else if (existing && previousRobots !== null) {
        existing.setAttribute('content', previousRobots);
      }
    };
  }, []);
}

function NotFoundComponent() {
  useNotFoundRobots();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-landing-bg px-4 focus:outline-none"
      style={{
        backgroundImage: `radial-gradient(circle, var(--landing-grid) 1.2px, transparent 1.2px)`,
        backgroundSize: '24px 24px',
      }}
    >
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-landing-dark">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-landing-dark">Page not found</h2>
        <p className="mt-2 text-sm text-landing-light-muted">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-landing-dark px-6 py-2 text-sm font-medium text-landing-light transition-colors hover:bg-landing-dark-subtle">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRoute({
  head: () => {
    const head = buildHead({
      description:
        "Asset tracking workspace for equipment, assignments, depreciation, and employee inventory.",
      path: '/',
    });
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#1a1a1a' },
        { name: 'format-detection', content: 'telephone=no' },
        ...head.meta,
      ],
      links: [
        ...head.links,
        { rel: 'stylesheet', href: appCss },
        { rel: 'icon', type: 'image/svg+xml', href: '/social-preview.svg' },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: buildSiteJsonLd(),
        },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/*
          Anti-FOUC bootstrap: read the stored theme (or prefers-color-scheme
          when unset) and apply .dark + color-scheme to <html> before paint.
          Keep in sync with `useTheme`'s initial resolver — both share the
          same `THEME_STORAGE_KEY` and matchMedia logic.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to main content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <ThemedToaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

// Render the Toaster inside the ThemeProvider so it can read `resolvedTheme`.
function ThemedToaster() {
  return <Toaster />;
}
