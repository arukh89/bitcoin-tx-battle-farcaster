// pages/api/frame.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface FrameRequest {
  untrustedData: {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: number;
    buttonIndex: number;
    castId: {
      fid: number;
      hash: string;
    };
  };
  trustedData: {
    messageBytes: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { untrustedData }: FrameRequest = req.body;
    
    // Basic validation
    if (!untrustedData || !untrustedData.fid) {
      return res.status(400).json({ error: 'Invalid frame data' });
    }

    const { buttonIndex, fid } = untrustedData;

    // Handle different button interactions
    let responseImage = 'https://bitcoin-tx-battle-farcaster.vercel.app/assets/game-start.png';
    let buttons = [
      { text: '🎯 Play Game', action: 'link', target: 'https://bitcoin-tx-battle-farcaster.vercel.app/' },
      { text: '📊 View Stats', action: 'post' }
    ];

    switch (buttonIndex) {
      case 1:
        // Start game - redirect to main app
        responseImage = 'https://bitcoin-tx-battle-farcaster.vercel.app/assets/game-active.png';
        buttons = [
          { text: '🎮 Launch Game', action: 'link', target: 'https://bitcoin-tx-battle-farcaster.vercel.app/' },
          { text: '📋 Rules', action: 'post' }
        ];
        break;
      
      case 2:
        // Show stats/rules
        responseImage = 'https://bitcoin-tx-battle-farcaster.vercel.app/assets/game-rules.png';
        buttons = [
          { text: '⬅️ Back', action: 'post' },
          { text: '🎯 Play Now', action: 'link', target: 'https://bitcoin-tx-battle-farcaster.vercel.app/' }
        ];
        break;
    }

    // Return Farcaster Frame response
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${responseImage}" />
  <meta property="fc:frame:button:1" content="${buttons[0].text}" />
  <meta property="fc:frame:button:1:action" content="${buttons[0].action}" />
  ${buttons[0].target ? `<meta property="fc:frame:button:1:target" content="${buttons[0].target}" />` : ''}
  
  ${buttons[1] ? `<meta property="fc:frame:button:2" content="${buttons[1].text}" />` : ''}
  ${buttons[1] ? `<meta property="fc:frame:button:2:action" content="${buttons[1].action}" />` : ''}
  ${buttons[1]?.target ? `<meta property="fc:frame:button:2:target" content="${buttons[1].target}" />` : ''}
  
  <meta property="fc:frame:post_url" content="https://bitcoin-tx-battle-farcaster.vercel.app/api/frame" />
  
  <meta property="og:title" content="Bitcoin TX Battle Royale" />
  <meta property="og:description" content="Real-time blockchain competition!" />
  <meta property="og:image" content="${responseImage}" />
  
  <title>Bitcoin TX Battle Royale</title>
</head>
<body>
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #1e3a8a, #7c3aed); color: white; font-family: Arial, sans-serif;">
    <h1 style="font-size: 3rem; margin-bottom: 1rem;">₿ Battle Royale</h1>
    <p style="font-size: 1.2rem; margin-bottom: 2rem; text-align: center;">
      Predict Bitcoin block transactions and compete!
    </p>
    <a href="https://bitcoin-tx-battle-farcaster.vercel.app/" 
       style="padding: 1rem 2rem; background: linear-gradient(135deg, #f97316, #eab308); 
              color: white; text-decoration: none; border-radius: 0.5rem; 
              font-weight: bold; font-size: 1.1rem;">
      🎯 Launch Game
    </a>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

  } catch (error) {
    console.error('Frame API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
