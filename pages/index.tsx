// pages/index.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface GameState {
  currentBlock: any;
  nextBlock: any;
  isGameActive: boolean;
  timeRemaining: number;
  userPrediction: any;
  score: number;
  streak: number;
  totalGames: number;
  wins: number;
  showSettings: boolean;
}

interface User {
  fid: string | null;
  username: string | null;
  displayName: string | null;
  pfpUrl: string | null;
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    currentBlock: null,
    nextBlock: null,
    isGameActive: false,
    timeRemaining: 0,
    userPrediction: null,
    score: 0,
    streak: 0,
    totalGames: 0,
    wins: 0,
    showSettings: false
  });

  const [user, setUser] = useState<User>({
    fid: null,
    username: null,
    displayName: null,
    pfpUrl: null
  });

  const [blockCheckInterval, setBlockCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Bitcoin API functions
  const fetchLatestBlock = async () => {
    try {
      const response = await fetch('https://blockstream.info/api/blocks/tip/height');
      return await response.json();
    } catch (error) {
      console.error('Error fetching latest block:', error);
      return null;
    }
  };

  const fetchBlockData = async (height: number) => {
    try {
      const response = await fetch(`https://blockstream.info/api/block-height/${height}`);
      const blockHash = await response.text();
      
      const blockResponse = await fetch(`https://blockstream.info/api/block/${blockHash}`);
      const blockData = await blockResponse.json();
      
      const txResponse = await fetch(`https://blockstream.info/api/block/${blockHash}/txs`);
      const transactions = await txResponse.json();
      
      return {
        ...blockData,
        transactions: transactions.slice(0, 10)
      };
    } catch (error) {
      console.error('Error fetching block data:', error);
      return null;
    }
  };

  const startNewGame = async () => {
    const latestHeight = await fetchLatestBlock();
    if (!latestHeight) return;

    const currentBlockData = await fetchBlockData(latestHeight);
    if (!currentBlockData) return;

    setGameState(prev => ({
      ...prev,
      currentBlock: currentBlockData,
      nextBlock: null,
      isGameActive: true,
      timeRemaining: 600,
      userPrediction: null
    }));

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer);
          checkForNewBlock();
          return { ...prev, timeRemaining: 0, isGameActive: false };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    const checker = setInterval(checkForNewBlock, 30000);
    setBlockCheckInterval(checker);
  };

  const checkForNewBlock = async () => {
    const latestHeight = await fetchLatestBlock();
    if (!latestHeight || !gameState.currentBlock) return;

    if (latestHeight > gameState.currentBlock.height) {
      const newBlockData = await fetchBlockData(latestHeight);
      if (newBlockData) {
        setGameState(prev => ({
          ...prev,
          nextBlock: newBlockData,
          isGameActive: false
        }));
        
        if (gameState.userPrediction) {
          calculateResults(newBlockData);
        }
      }
    }
  };

  const calculateResults = (actualBlock: any) => {
    if (!gameState.userPrediction || !actualBlock) return;

    const prediction = gameState.userPrediction;
    let points = 0;
    let correct = true;

    if (prediction.txCount) {
      const actualTxCount = actualBlock.tx_count;
      const predicted = parseInt(prediction.txCount);
      if (Math.abs(actualTxCount - predicted) <= 50) {
        points += 100;
      } else {
        correct = false;
      }
    }

    if (prediction.blockSize) {
      const actualSize = actualBlock.size;
      const predicted = parseInt(prediction.blockSize);
      if (Math.abs(actualSize - predicted) <= 50000) {
        points += 150;
      } else {
        correct = false;
      }
    }

    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      streak: correct ? prev.streak + 1 : 0,
      totalGames: prev.totalGames + 1,
      wins: correct ? prev.wins + 1 : prev.wins
    }));
  };

  const makePrediction = (predictionData: any) => {
    setGameState(prev => ({
      ...prev,
      userPrediction: predictionData
    }));
  };

  const resetGame = () => {
    if (blockCheckInterval) {
      clearInterval(blockCheckInterval);
    }
    
    setGameState(prev => ({
      ...prev,
      currentBlock: null,
      nextBlock: null,
      isGameActive: false,
      timeRemaining: 0,
      userPrediction: null
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blockCheckInterval) {
        clearInterval(blockCheckInterval);
      }
    };
  }, [blockCheckInterval]);

  return (
    <>
      <Head>
        <title>Bitcoin TX Battle Royale</title>
        <meta name="description" content="Real-time blockchain competition - predict Bitcoin transactions!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Farcaster Frame Meta Tags */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://bitcoin-tx-battle-farcaster.vercel.app/assets/og-image.png" />
        <meta property="fc:frame:button:1" content="🎯 Play Game" />
        <meta property="fc:frame:post_url" content="https://bitcoin-tx-battle-farcaster.vercel.app/api/frame" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Bitcoin TX Battle Royale" />
        <meta property="og:description" content="Real-time blockchain competition - predict Bitcoin transactions and win!" />
        <meta property="og:image" content="https://bitcoin-tx-battle-farcaster.vercel.app/assets/og-image.png" />
        <meta property="og:url" content="https://bitcoin-tx-battle-farcaster.vercel.app/" />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        {/* Header */}
        <header className="bg-black bg-opacity-30 backdrop-blur-md border-b border-orange-500/20">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  ₿ Battle Royale
                </div>
                <div className="text-orange-400 font-mono text-sm">
                  Score: {gameState.score} | Streak: {gameState.streak}
                </div>
              </div>
              <button
                onClick={() => setGameState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
              >
                ⚙️
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Block Info Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20">
                <h2 className="text-2xl font-bold text-white mb-4">Current Block</h2>
                {gameState.currentBlock ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Height:</span>
                        <p className="text-orange-400 font-mono">{gameState.currentBlock.height}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Transactions:</span>
                        <p className="text-white font-mono">{gameState.currentBlock.tx_count}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Size:</span>
                        <p className="text-white font-mono">{gameState.currentBlock.size} bytes</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Timestamp:</span>
                        <p className="text-white font-mono">
                          {new Date(gameState.currentBlock.timestamp * 1000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {gameState.isGameActive && (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-400 font-mono">
                          ⏱️ {formatTime(gameState.timeRemaining)}
                        </div>
                        <p className="text-gray-400">until next block prediction</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No active game</p>
                    <button
                      onClick={startNewGame}
                      className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-glow"
                    >
                      🎯 Start New Game
                    </button>
                  </div>
                )}
              </div>

              {/* Prediction Panel */}
              {gameState.isGameActive && (
                <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
                  <h3 className="text-xl font-bold text-white mb-4">Make Your Prediction</h3>
                  <PredictionForm onSubmit={makePrediction} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-2xl p-6 border border-green-500/20">
                <h3 className="text-xl font-bold text-white mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Games:</span>
                    <span className="text-white font-mono">{gameState.totalGames}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wins:</span>
                    <span className="text-green-400 font-mono">{gameState.wins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="text-yellow-400 font-mono">
                      {gameState.totalGames > 0 ? Math.round((gameState.wins / gameState.totalGames) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best Streak:</span>
                    <span className="text-orange-400 font-mono">{gameState.streak}</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              {gameState.nextBlock && (
                <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-2xl p-6 border border-green-500/20">
                  <h3 className="text-xl font-bold text-white mb-4">Block Results</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Actual TX Count:</span>
                      <span className="text-white font-mono">{gameState.nextBlock.tx_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Actual Size:</span>
                      <span className="text-white font-mono">{gameState.nextBlock.size}</span>
                    </div>
                  </div>
                  <button
                    onClick={resetGame}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// Prediction Form Component
function PredictionForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [txCount, setTxCount] = useState('');
  const [blockSize, setBlockSize] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (txCount && blockSize) {
      onSubmit({
        txCount: parseInt(txCount),
        blockSize: parseInt(blockSize)
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-400 text-sm mb-2">
          Transaction Count Prediction
        </label>
        <input
          type="number"
          value={txCount}
          onChange={(e) => setTxCount(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          placeholder="e.g., 2500"
          required
        />
      </div>
      <div>
        <label className="block text-gray-400 text-sm mb-2">
          Block Size Prediction (bytes)
        </label>
        <input
          type="number"
          value={blockSize}
          onChange={(e) => setBlockSize(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          placeholder="e.g., 1500000"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-glow-purple"
      >
        🎯 Submit Prediction
      </button>
    </form>
  );
    }
