import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="../public/favicon.png"
        />
        <link rel="apple-touch-icon" href="../public/favicon.png" />
        <meta name="theme-color" content="#5b7d74" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
