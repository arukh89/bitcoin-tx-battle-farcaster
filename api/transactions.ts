// pages/api/transactions.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface TransactionData {
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

// Mock data - replace with actual Bitcoin API calls
const mockTransactions: TransactionData[] = [
  {
    id: '1',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
    from: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
    to: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
    value: '0.00150000',
    gasPrice: '10',
    timestamp: Date.now(),
    status: 'confirmed'
  },
  {
    id: '2',
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    from: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    to: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
    value: '0.00250000',
    gasPrice: '15',
    timestamp: Date.now() - 300000,
    status: 'pending'
  },
  {
    id: '3',
    hash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fe',
    from: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
    to: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    value: '0.00075000',
    gasPrice: '8',
    timestamp: Date.now() - 600000,
    status: 'confirmed'
  }
];

const mockStats: BattleStats = {
  totalTransactions: 1247,
  totalVolume: '15.67834521',
  activeBattles: 23,
  topPerformer: '1BvBM...VN2'
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // In a real implementation, you would:
      // 1. Connect to Bitcoin node/API (like BlockCypher, Blockchain.info, etc.)
      // 2. Fetch recent transactions
      // 3. Filter/process the data
      // 4. Calculate statistics
      
      // For now, return mock data
      const response = {
        transactions: mockTransactions,
        stats: mockStats,
        success: true
      };
      
      res.status(200).json(response);
    } 
    else if (req.method === 'POST') {
      // Handle new transaction submission
      const { from, to, value } = req.body;
      
      if (!from || !to || !value) {
        return res.status(400).json({
          error: 'Missing required fields: from, to, value',
          success: false
        });
      }
      
      // In a real implementation, you would:
      // 1. Validate the transaction data
      // 2. Submit to Bitcoin network
      // 3. Store in database
      // 4. Return transaction hash
      
      const newTransaction: TransactionData = {
        id: Date.now().toString(),
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from,
        to,
        value: value.toString(),
        gasPrice: '10',
        timestamp: Date.now(),
        status: 'pending'
      };
      
      res.status(201).json({
        transaction: newTransaction,
        success: true
      });
    } 
    else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        error: `Method ${req.method} not allowed`,
        success: false
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      success: false
    });
  }
        }
