// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-br">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="description" content="JuriQuest — Cruzadinhas jurídicas com IA para estudantes de Direito. Teste seus conhecimentos em Direito Constitucional, Penal, Civil, Trabalhista e muito mais." />
        <meta name="theme-color" content="#0e1117" />

        {/* Open Graph */}
        <meta property="og:type"        content="website" />
        <meta property="og:title"       content="JuriQuest — Cruzadinhas de Direito" />
        <meta property="og:description" content="Aprenda Direito jogando cruzadinhas geradas por IA." />
        <meta property="og:locale"      content="pt_BR" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />

        {/* Preconnect fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
