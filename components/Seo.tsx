import Head from "next/head";
import { useRouter } from "next/router";

/**
 * Page metadata: the title, the description, and what a link to this page
 * looks like when somebody shares it.
 *
 * Two kinds of page live in this app and they want opposite things:
 *
 * - The public site (/, /contact, /feedback, /privacy) wants to be found.
 * - Everything behind the sign-in — dashboards, debts, the tracker, settings,
 *   the auth screens themselves — must never be indexed. It is somebody's
 *   debt, and none of it belongs in a search result. Those pages pass
 *   `noindex`, which also keeps their titles out of search listings while
 *   still naming the tab properly.
 */

/**
 * Where the site actually lives, for canonical and share URLs.
 *
 * With the www: the bare domain 308-redirects here, so this is the address
 * that answers with a page, and a canonical has to name the URL that does.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.mirian-debt-tracker.app";

const SITE_NAME = "Mirian";
const OG_IMAGE = `${SITE_URL}/og.png`;
const OG_ALT =
  "Mirian: a debt-free date, not a running total of everything you owe.";

type Props = {
  /** Without the site name — that's added, except on the home page. */
  title: string;
  description: string;
  /** Leave off to use the current path. */
  path?: string;
  /** Keep this page out of search results. True for anything signed-in. */
  noindex?: boolean;
  /** The home page carries its own full title. */
  bareTitle?: boolean;
  children?: React.ReactNode;
};

export default function Seo({
  title,
  description,
  path,
  noindex = false,
  bareTitle = false,
  children,
}: Props) {
  const router = useRouter();
  // Query strings and #fragments are the same page as far as search is
  // concerned, so the canonical is always the bare path.
  const canonicalPath = path ?? router.asPath.split(/[?#]/)[0];
  const url = `${SITE_URL}${canonicalPath}`;
  const fullTitle = bareTitle ? title : `${title} · ${SITE_NAME}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={url} />
        </>
      )}

      {/* Shared links */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={OG_ALT} />
      <meta property="og:locale" content="en_GB" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="twitter:image:alt" content={OG_ALT} />

      {children}
    </Head>
  );
}
