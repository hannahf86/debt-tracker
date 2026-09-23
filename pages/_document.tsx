import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en-GB">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/mark.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="theme-color" content="#1a666a" />
      </Head>
      <body>
        {/* Applies the saved theme before first paint. Deliberately
            synchronous: it has to run before anything renders. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme-init.js" />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
