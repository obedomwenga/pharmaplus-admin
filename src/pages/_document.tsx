import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="PharmaPlus Admin Dashboard - Manage your pharmacy inventory, promotions, and more" />
        <link rel="icon" href="/images/pharma-logo.png" />
        <link rel="apple-touch-icon" href="/images/pharma-logo.png" />
        <meta name="theme-color" content="#38bdf8" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 