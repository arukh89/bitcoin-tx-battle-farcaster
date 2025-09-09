// pages/api/farcaster-config.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const config = {
    name: "Bitcoin TX Battle Royale",
    version: "1.0.0",
    description: "Real-time blockchain competition - predict Bitcoin transactions and win rewards!",
    icon: "https://bitcoin-tx-battle-farcaster.vercel.app/assets/icon.svg",
    homeUrl: "https://bitcoin-tx-battle-farcaster.vercel.app/",
    imageUrl: "https://bitcoin-tx-battle-farcaster.vercel.app/assets/og-image.png",
    buttonTitle: "🎯 Play Game",
    splashImageUrl: "https://bitcoin-tx-battle-farcaster.vercel.app/assets/splash.png",
    splashBackgroundColor: "#1e3a8a",
    theme: {
      colorScheme: "dark",
      buttonColor: "#f97316",
      backgroundColor: "#1e3a8a"
    },
    author: {
      name: "Bitcoin Battle Team",
      url: "https://warpcast.com/bitcoinbattle"
    },
    permissions: ["identity", "transactions"],
    categories: ["games", "defi", "social"],
    screenshots: [
      "https://bitcoin-tx-battle-farcaster.vercel.app/assets/screenshot1.png",
      "https://bitcoin-tx-battle-farcaster.vercel.app/assets/screenshot2.png",
      "https://bitcoin-tx-battle-farcaster.vercel.app/assets/screenshot3.png"
    ],
    minVersion: "0.4.0",
    frameUrl: "https://bitcoin-tx-battle-farcaster.vercel.app/api/frame"
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json(config);
}
