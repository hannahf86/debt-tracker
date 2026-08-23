import { Html, Head, Main, NextScript } from "next/document";
import { NO_FLASH_SCRIPT } from "@/lib/theme";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/mark.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="theme-color" content="#1a666a" />
      </Head>
      <body>
        {/* Applies the saved theme before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
