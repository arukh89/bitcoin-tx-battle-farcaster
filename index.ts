import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { ethers } from 'ethers';

interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

interface BattleStats {
  totalTransactions: number;
  totalVolume: string;
  activeBattles: number;
  topPerformer: string;
}

const Home: NextPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [battleStats, setBattleStats] = useState<BattleStats>({
    totalTransactions: 0,
    totalVolume: '0',
    activeBattles: 0,
    topPerformer: 'N/A'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string>('');

  // Connect to wallet
  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        setAddress(userAddress);
        setConnected(true);
      } else {
        setError('MetaMask not detected. Please install MetaMask to continue.');
      }
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
    }
  };

  // Fetch transaction data
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      // Replace with your API endpoint
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const data = await response.json();
      setTransactions(data.transactions || []);
      setBattleStats(data.stats || battleStats);
    } catch (err) {
      setError('Failed to fetch transaction data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Post to Farcaster
  const shareToFarcaster = async (txHash: string) => {
    try {
      const text = `🚀 New Bitcoin TX Battle! Check out this transaction: ${txHash}`;
      // Replace with your Farcaster integration
      const response = await fetch('/api/farcaster/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, txHash }),
      });
      
      if (response.ok) {
        alert('Shared to Farcaster successfully!');
      }
    } catch (err) {
      console.error('Failed to share to Farcaster:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    
    // Set up real-time updates
    const interval = setInterval(fetchTransactions, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Bitcoin TX Battle - Farcaster Edition</title>
        <meta name="description" content="Battle transactions on Bitcoin network with Farcaster integration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              ⚡ Bitcoin TX Battle ⚡
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Real-time Bitcoin transaction battles on Farcaster
            </p>
            
            {/* Wallet Connection */}
            <div className="mb-8">
              {!connected ? (
                <button
                  onClick={connectWallet}
                  className="bg-white text-orange-600 font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="text-white">
                  <p className="mb-2">Connected:</p>
                  <p className="font-mono text-sm bg-white/20 rounded-full px-4 py-2 inline-block">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                </div>
              )}
            </div>
          </header>

          {/* Battle Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">{battleStats.totalTransactions}</h3>
              <p className="text-white/80">Total Battles</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">{battleStats.totalVolume} BTC</h3>
              <p className="text-white/80">Total Volume</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">{battleStats.activeBattles}</h3>
              <p className="text-white/80">Active Battles</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">{battleStats.topPerformer}</h3>
              <p className="text-white/80">Top Performer</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-8 text-white">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Transaction List */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🥊 Recent Battles
                {isLoading && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                )}
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left">Transaction Hash</th>
                    <th className="px-6 py-3 text-left">From</th>
                    <th className="px-6 py-3 text-left">To</th>
                    <th className="px-6 py-3 text-left">Value</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-white/60">
                        {isLoading ? 'Loading battles...' : 'No battles found'}
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="px-6 py-4 font-mono text-sm">
                          {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">
                          {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">
                          {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                        </td>
                        <td className="px-6 py-4">
                          {parseFloat(tx.value).toFixed(4)} BTC
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            tx.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                            tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => shareToFarcaster(tx.hash)}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded-full transition-colors"
                          >
                            Share to FC
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create New Battle */}
          <div className="mt-12 text-center">
            <button
              onClick={() => {/* Handle create battle */}}
              disabled={!connected}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-500 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors"
            >
              🚀 Start New Battle
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
