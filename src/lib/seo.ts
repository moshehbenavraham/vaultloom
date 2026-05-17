/**
 * Centralized SEO helpers for AssetWise.
 *
 * Usage in routes:
 *
 *   import { buildHead } from '@/lib/seo';
 *
 *   export const Route = createFileRoute('/some-path')({
 *     head: () => buildHead({
 *       title: 'Page title',
 *       description: 'Page description',
 *       path: '/some-path',
 *     }),
 *     component: ...,
 *   });
 *
 * For auth-walled routes pass `noindex: true` so robots emit `noindex, nofollow`.
 *
 * `SITE_URL` is the canonical production origin used to build absolute
 * canonical/OG/Twitter URLs and sitemap entries. Override this with the real
 * hostname once it is known.
 */

export const SITE_URL = 'https://assetwise.app';
export const SITE_NAME = 'AssetWise';
export const SITE_DESCRIPTION =
  'Asset management workspace for tracking equipment, employee assignments, depreciation, categories, and AI-assisted inventory insights.';
export const SOCIAL_IMAGE = '/social-preview.svg';

// Loose record types so TanStack Router's permissive meta/links shape is happy.
export type MetaEntry = Record<string, string>;
export type LinkEntry = Record<string, string>;
export type ScriptEntry = Record<string, string>;

export interface BuildHeadOptions {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  image?: string;
  ogType?: 'website' | 'article' | 'profile';
}

function joinUrl(base: string, path?: string): string {
  if (!path) return base;
  const trimmedBase = base.replace(/\/+$/, '');
  const trimmedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
}

function absoluteImage(image: string): string {
  if (/^https?:\/\//i.test(image)) return image;
  return joinUrl(SITE_URL, image);
}

/**
 * Build a TanStack Router-compatible `head()` payload with the SEO meta
 * (title, description, canonical, Open Graph, Twitter card) and the
 * stylesheet links the root route needs.
 *
 * Callers typically spread the result into their `head()` return:
 *
 *   head: () => ({
 *     ...buildHead({ title: 'Assets', path: '/assets', noindex: true }),
 *   })
 */
export function buildHead(options: BuildHeadOptions = {}): {
  meta: MetaEntry[];
  links: LinkEntry[];
} {
  const {
    title,
    description = SITE_DESCRIPTION,
    path,
    noindex = false,
    image = SOCIAL_IMAGE,
    ogType = 'website',
  } = options;

  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const canonical = joinUrl(SITE_URL, path);
  const absoluteImg = absoluteImage(image);

  const meta: MetaEntry[] = [
    { title: fullTitle },
    { name: 'description', content: description },
    {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow',
    },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:type', content: ogType },
    { property: 'og:url', content: canonical },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:image', content: absoluteImg },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: absoluteImg },
  ];

  const links: LinkEntry[] = [{ rel: 'canonical', href: canonical }];

  return { meta, links };
}

/**
 * Build the WebSite + Organization + SoftwareApplication JSON-LD graph
 * for the root layout. Returns a JSON string suitable for the `children`
 * field of a `{ type: 'application/ld+json' }` script entry.
 */
export function buildSiteJsonLd(): string {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: absoluteImage(SOCIAL_IMAGE),
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#app`,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    ],
  };

  return JSON.stringify(graph);
}
