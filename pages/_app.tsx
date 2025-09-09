// pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Farcaster Frame Meta Tags */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://bitcoin-tx-battle-farcaster.vercel.app/assets/og-image.png" />
        <meta property="fc:frame:button:1" content="🎯 Play Game" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="https://bitcoin-tx-battle-farcaster.vercel.app/" />
        <meta property="fc:frame:post_url" content="https://bitcoin-tx-battle-farcaster.vercel.app/api/frame" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Bitcoin TX Battle Royale" />
        <meta property="og:description" content="Real-time blockchain competition - predict Bitcoin transactions and win!" />
        <meta property="og:image" content="https://bitcoin-tx-battle-farcaster.vercel.app/assets/og-image.png" />
        <meta property="og:url" content="https://bitcoin-tx-battle-farcaster.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Bitcoin TX Battle Royale" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bitcoin TX Battle Royale" />
        <meta name="twitter:description" content="Real-time blockchain competition - predict Bitcoin transactions and win!" />
        <meta name="twitter:image" content="https://bitcoin-tx-battle-farcaster.vercel.app/assets/og-image.png" />
        
        {/* Additional Meta Tags */}
        <meta name="description" content="Real-time blockchain competition - predict Bitcoin transactions and win rewards! Play now on Farcaster." />
        <meta name="keywords" content="bitcoin, blockchain, game, farcaster, prediction, crypto, battle royale" />
        <meta name="author" content="Bitcoin Battle Team" />
        <meta name="theme-color" content="#1e3a8a" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://blockstream.info" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>
      
      <Component {...pageProps} />
    </>
  );
}
