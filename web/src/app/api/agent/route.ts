import { NextResponse } from 'next/server';

// Mock data - in production this would read from the agent's SQLite database
// or connect via WebSocket to the running agent
export async function GET() {
  // This would be replaced with actual data from the agent
  const data = {
    stats: {
      balance: 1250.45,
      state: 'healthy',
      runwayDays: 45,
      totalTrades: 127,
      totalProfit: 45.32,
      winRate: 62.3,
      lastTrade: {
        action: 'buy',
        profit: 2.15,
        timestamp: new Date().toISOString(),
      },
    },
    trades: [
      { id: 127, action: 'buy', profit: 2.15, timestamp: new Date().toISOString() },
      { id: 126, action: 'sell', profit: -0.85, timestamp: new Date(Date.now() - 300000).toISOString() },
      { id: 125, action: 'buy', profit: 3.42, timestamp: new Date(Date.now() - 600000).toISOString() },
      { id: 124, action: 'sell', profit: 1.28, timestamp: new Date(Date.now() - 900000).toISOString() },
      { id: 123, action: 'buy', profit: -1.12, timestamp: new Date(Date.now() - 1200000).toISOString() },
    ],
    balanceHistory: [
      { date: 'Mon', value: 1200 },
      { date: 'Tue', value: 1180 },
      { date: 'Wed', value: 1220 },
      { date: 'Thu', value: 1190 },
      { date: 'Fri', value: 1240 },
      { date: 'Sat', value: 1210 },
      { date: 'Sun', value: 1250 },
    ],
  };

  return NextResponse.json(data);
}
