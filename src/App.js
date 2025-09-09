// App.js
import React, { useState, useEffect } from 'react';
import { MiniKit } from '@farcaster/minikit-react';
import GameHeader from './components/GameHeader';
import BlockInfo from './components/BlockInfo';
import PredictionPanel from './components/PredictionPanel';
import Leaderboard from './components/Leaderboard';
import Settings from './components/Settings';
import './App.css';

function App() {
  // Game state
  const [gameState, setGameState] = useState({
    currentBlock: null,
    nextBlock: null,
    isGameActive: false,
    timeRemaining: 0,
    userPrediction: null,
    score: 0,
    streak: 0,
    totalGames: 0,
    wins: 0,
    blockCheckInterval: null,
    showSettings: false
  });

  // User state
  const [user, setUser] = useState({
    fid: null,
    username: null,
    displayName: null,
    pfpUrl: null
  });

  // Initialize MiniKit
  useEffect(() => {
    if (MiniKit.isFrameContext) {
      MiniKit.ready();
      
      // Get user info from Farcaster
      const userInfo = MiniKit.user;
      if (userInfo) {
        setUser({
          fid: userInfo.fid,
          username: userInfo.username,
          displayName: userInfo.displayName,
          pfpUrl: userInfo.pfpUrl
        });
      }
    }
  }, []);

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

  const fetchBlockData = async (height) => {
    try {
      const response = await fetch(`https://blockstream.info/api/block-height/${height}`);
      const blockHash = await response.text();
      
      const blockResponse = await fetch(`https://blockstream.info/api/block/${blockHash}`);
      const blockData = await blockResponse.json();
      
      // Get transaction details for the block
      const txResponse = await fetch(`https://blockstream.info/api/block/${blockHash}/txs`);
      const transactions = await txResponse.json();
      
      return {
        ...blockData,
        transactions: transactions.slice(0, 10) // First 10 transactions
      };
    } catch (error) {
      console.error('Error fetching block data:', error);
      return null;
    }
  };

  // Game logic functions
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
      timeRemaining: 600, // 10 minutes
      userPrediction: null
    }));

    // Start countdown timer
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

    // Check for new blocks
    const blockChecker = setInterval(checkForNewBlock, 30000); // Every 30 seconds
    
    setGameState(prev => ({
      ...prev,
      blockCheckInterval: blockChecker
    }));
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
        
        // Calculate results if user made a prediction
        if (gameState.userPrediction) {
          calculateResults(newBlockData);
        }
      }
    }
  };

  const calculateResults = (actualBlock) => {
    if (!gameState.userPrediction || !actualBlock) return;

    const prediction = gameState.userPrediction;
    let points = 0;
    let correct = true;

    // Check each prediction criterion
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

    if (prediction.difficulty) {
      const actualDifficulty = actualBlock.difficulty;
      const predicted = parseFloat(prediction.difficulty);
      const tolerance = actualDifficulty * 0.1; // 10% tolerance
      if (Math.abs(actualDifficulty - predicted) <= tolerance) {
        points += 200;
      } else {
        correct = false;
      }
    }

    // Update user stats
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      streak: correct ? prev.streak + 1 : 0,
      totalGames: prev.totalGames + 1,
      wins: correct ? prev.wins + 1 : prev.wins
    }));
  };

  const makePrediction = (predictionData) => {
    setGameState(prev => ({
      ...prev,
      userPrediction: predictionData
    }));
  };

  const resetGame = () => {
    if (gameState.blockCheckInterval) {
      clearInterval(gameState.blockCheckInterval);
    }
    
    setGameState(prev => ({
      ...prev,
      currentBlock: null,
      nextBlock: null,
      isGameActive: false,
      timeRemaining: 0,
      userPrediction: null,
      blockCheckInterval: null
    }));
  };

  return (
    <div className="app">
      <GameHeader 
        user={user}
        score={gameState.score}
        streak={gameState.streak}
        onSettingsClick={() => setGameState(prev => ({ ...prev, showSettings: true }))}
      />
      
      <main className="main-content">
        <BlockInfo 
          currentBlock={gameState.currentBlock}
          nextBlock={gameState.nextBlock}
          isGameActive={gameState.isGameActive}
          timeRemaining={gameState.timeRemaining}
        />
        
        <PredictionPanel
          isGameActive={gameState.isGameActive}
          userPrediction={gameState.userPrediction}
          onMakePrediction={makePrediction}
          onStartGame={startNewGame}
          onResetGame={resetGame}
        />
        
        <Leaderboard 
          userStats={{
            totalGames: gameState.totalGames,
            wins: gameState.wins,
            score: gameState.score,
            streak: gameState.streak
          }}
        />
      </main>
      
      {gameState.showSettings && (
        <Settings 
          onClose={() => setGameState(prev => ({ ...prev, showSettings: false }))}
        />
      )}
    </div>
  );
}

export default App;
