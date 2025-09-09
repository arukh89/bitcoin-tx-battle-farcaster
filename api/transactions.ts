// pages/api/transactions.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface BitcoinTransaction {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    prevout: {
      value: number;
      scriptpubkey_address: string;
    };
  }>;
  vout: Array<{
    value: number;
    scriptpubkey_address: string;
  }>;
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
}

interface BlockData {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  merkle_root: string;
  previousblockhash: string;
  mediantime: number;
  nonce: number;
  bits: number;
  difficulty: number;
}

interface GameStats {
  totalTransactions: number;
  totalVolume: string;
  activePlayers: number;
  currentBlock: number;
  nextBlockEta: number;
  averageBlockTime: number;
}

// Cache for API responses
let cachedBlockData: BlockData | null = null;
let cachedTransactions: BitcoinTransaction[] = [];
let lastFetch = 0;
const CACHE_DURATION = 30000; // 30 seconds

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { type } = req.query;
      
      switch (type) {
        case 'latest-block':
          const blockData = await fetchLatestBlockData();
          return res.status(200).json({ success: true, data: blockData });
          
        case 'transactions':
          const { blockHash } = req.query;
          const transactions = await fetchBlockTransactions(blockHash as string);
          return res.status(200).json({ success: true, data: transactions });
          
        case 'stats':
          const stats = await fetchGameStats();
          return res.status(200).json({ success: true, data: stats });
          
        default:
          // Return combined data
          const [latestBlock, gameStats] = await Promise.all([
            fetchLatestBlockData(),
            fetchGameStats()
          ]);
          
          return res.status(200).json({
            success: true,
            block: latestBlock,
            stats: gameStats,
            cached: Date.now() - lastFetch < CACHE_DURATION
          });
      }
    }
    
    if (req.method === 'POST') {
      const { action, data } = req.body;
      
      switch (action) {
        case 'submit-prediction':
          const result = await handlePredictionSubmission(data);
          return res.status(200).json(result);
          
        case 'get-block-result':
          const blockResult = await getBlockResult(data.blockHeight);
          return res.status(200).json(blockResult);
          
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid action'
          });
      }
    }
    
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`
    });
    
  } catch (error) {
    console.error('Bitcoin API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Bitcoin data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function fetchLatestBlockData(): Promise<BlockData> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedBlockData && (now - lastFetch) < CACHE_DURATION) {
    return cachedBlockData;
  }
  
  try {
    // Fetch latest block height
    const heightResponse = await fetch('https://blockstream.info/api/blocks/tip/height');
    const latestHeight = await heightResponse.json();
    
    // Fetch block hash for this height
    const hashResponse = await fetch(`https://blockstream.info/api/block-height/${latestHeight}`);
    const blockHash = await hashResponse.text();
    
    // Fetch full block data
    const blockResponse = await fetch(`https://blockstream.info/api/block/${blockHash}`);
    const blockData = await blockResponse.json();
    
    // Transform to our format
    const transformedData: BlockData = {
      id: blockData.id,
      height: blockData.height,
      version: blockData.version,
      timestamp: blockData.timestamp,
      tx_count: blockData.tx_count,
      size: blockData.size,
      weight: blockData.weight,
      merkle_root: blockData.merkle_root,
      previousblockhash: blockData.previousblockhash,
      mediantime: blockData.mediantime,
      nonce: blockData.nonce,
      bits: parseInt(blockData.bits, 16),
      difficulty: blockData.difficulty
    };
    
    cachedBlockData = transformedData;
    lastFetch = now;
    
    return transformedData;
    
  } catch (error) {
    console.error('Error fetching latest block:', error);
    
    // Return mock data if API fails
    return {
      id: `mock-${Date.now()}`,
      height: 850000 + Math.floor(Math.random() * 1000),
      version: 536870912,
      timestamp: Math.floor(Date.now() / 1000),
      tx_count: 2000 + Math.floor(Math.random() * 1000),
      size: 1400000 + Math.floor(Math.random() * 400000),
      weight: 4000000,
      merkle_root: "0x" + Math.random().toString(16).substr(2, 64),
      previousblockhash: "0x" + Math.random().toString(16).substr(2, 64),
      mediantime: Math.floor(Date.now() / 1000) - 300,
      nonce: Math.floor(Math.random() * 4294967295),
      bits: 386089497,
      difficulty: 55621444139429.57
    };
  }
}

async function fetchBlockTransactions(blockHash: string): Promise<BitcoinTransaction[]> {
  if (!blockHash) {
    return [];
  }
  
  try {
    const response = await fetch(`https://blockstream.info/api/block/${blockHash}/txs`);
    const transactions = await response.json();
    
    return transactions.slice(0, 10); // Return first 10 transactions
  } catch (error) {
    console.error('Error fetching block transactions:', error);
    return [];
  }
}

async function fetchGameStats(): Promise<GameStats> {
  try {
    const latestBlock = await fetchLatestBlockData();
    
    // Calculate some basic stats
    const stats: GameStats = {
      totalTransactions: latestBlock.tx_count,
      totalVolume: (Math.random() * 1000).toFixed(8), // Mock BTC volume
      activePlayers: Math.floor(Math.random() * 100) + 10,
      currentBlock: latestBlock.height,
      nextBlockEta: 600, // ~10 minutes average
      averageBlockTime: 600
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching game stats:', error);
    return {
      totalTransactions: 0,
      totalVolume: "0.00000000",
      activePlayers: 0,
      currentBlock: 0,
      nextBlockEta: 600,
      averageBlockTime: 600
    };
  }
}

async function handlePredictionSubmission(predictionData: any) {
  // Store prediction (in a real app, this would go to a database)
  console.log('Prediction submitted:', predictionData);
  
  return {
    success: true,
    message: 'Prediction submitted successfully',
    predictionId: `pred_${Date.now()}`,
    blockHeight: predictionData.blockHeight
  };
}

async function getBlockResult(blockHeight: number) {
  try {
    // Fetch the specific block data
    const hashResponse = await fetch(`https://blockstream.info/api/block-height/${blockHeight}`);
    const blockHash = await hashResponse.text();
    
    const blockResponse = await fetch(`https://blockstream.info/api/block/${blockHash}`);
    const blockData = await blockResponse.json();
    
    return {
      success: true,
      blockData: {
        height: blockData.height,
        tx_count: blockData.tx_count,
        size: blockData.size,
        timestamp: blockData.timestamp,
        hash: blockData.id
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Block not found or not yet mined'
    };
  }
        }
