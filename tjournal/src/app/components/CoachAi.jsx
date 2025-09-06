'use client';

import { useState } from 'react';
import { Brain } from 'lucide-react';

export default function CoachAi({ kpis, filtered, peso }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // AI Trading Coach Functions
  const generateAIResponse = (question, userMetrics) => {
    const lowerQuestion = question.toLowerCase();
    
    // Risk Management Questions - Ultra Specific
    if (lowerQuestion.includes('risk') || lowerQuestion.includes('position size') || lowerQuestion.includes('stop loss') || lowerQuestion.includes('risk management')) {
      const avgLoss = Math.abs(userMetrics.avgLoss);
      const avgWin = userMetrics.avgWin;
      const totalTrades = userMetrics.totalTrades;
      const maxDD = userMetrics.maxDD;
      
      // Calculate actual risk metrics
      const accountRisk = avgLoss * 50; // Estimate account size
      const recommendedRisk = accountRisk * 0.02; // 2% risk
      const currentRiskPerTrade = avgLoss / accountRisk * 100; // Current risk percentage
      const riskRewardRatio = avgWin / avgLoss;
      
      // Specific question matching
      if (lowerQuestion.includes('position size') || lowerQuestion.includes('position sizing')) {
        return `📏 **POSITION SIZING MASTERY**\n\nPosition sizing is THE most critical skill in trading. Here's your complete guide:\n\n🎯 **The 2% Rule (Your Foundation):**\n• Risk maximum 2% of account per trade\n• For ₱100,000 account: Risk ₱2,000 maximum\n• For ₱50,000 account: Risk ₱1,000 maximum\n• For ₱25,000 account: Risk ₱500 maximum\n\n📊 **Your Current Position Sizing:**\n• Average loss: ${peso(avgLoss)}\n• Estimated account: ${peso(accountRisk)}\n• Current risk: ${currentRiskPerTrade.toFixed(1)}% per trade\n• Status: ${currentRiskPerTrade > 2 ? '⚠️ TOO HIGH' : '✅ ACCEPTABLE'}\n\n🧮 **Position Size Formula:**\n**Position Size = (Account × 2%) ÷ Stop Loss Distance**\n\n📝 **Example Calculation:**\n• Account: ₱100,000\n• Risk: 2% = ₱2,000\n• Stop Loss: 50 pips\n• Position Size: ₱2,000 ÷ 50 = ₱40 per pip\n\n💡 **Position Sizing Rules:**\n1. **Never exceed 2%** - Even on "sure thing" trades\n2. **Adjust for volatility** - Reduce size in volatile markets\n3. **Scale down during drawdowns** - Use 1% when struggling\n4. **Increase gradually** - Only after consistent profits\n\n🎯 **Your Action Plan:**\n• Calculate your exact position size for next trade\n• Write it down before entering\n• Stick to it religiously\n• Review weekly for adjustments\n\nRemember: Position sizing determines your survival, not your strategy!`;
      }
      
      if (lowerQuestion.includes('stop loss') || lowerQuestion.includes('stop loss')) {
        return `🛑 **STOP LOSS MASTERY**\n\nStop losses are your lifeline in trading. Here's how to master them:\n\n🎯 **Stop Loss Fundamentals:**\n• **Purpose:** Limit your maximum loss per trade\n• **Placement:** Based on technical analysis, not emotions\n• **Size:** Should result in 1-2% account risk\n• **Execution:** Automatic, never manual\n\n📊 **Your Stop Loss Analysis:**\n• Average loss: ${peso(avgLoss)}\n• Current risk: ${currentRiskPerTrade.toFixed(1)}% per trade\n• Recommendation: ${currentRiskPerTrade > 2 ? 'Tighten stops by 50%' : 'Maintain current approach'}\n\n🎯 **Stop Loss Placement Strategies:**\n\n1. **Support/Resistance Levels:**\n   • Place stops beyond key levels\n   • Add 10-20 pips buffer\n   • Most reliable method\n\n2. **ATR-Based Stops:**\n   • Use 2x ATR for stop distance\n   • Adapts to market volatility\n   • Good for trending markets\n\n3. **Percentage-Based Stops:**\n   • 1-2% of account value\n   • Simple and consistent\n   • Good for beginners\n\n4. **Technical Pattern Stops:**\n   • Beyond chart patterns\n   • Head & shoulders, triangles\n   • Requires pattern recognition\n\n💡 **Stop Loss Rules:**\n1. **Set before entry** - Never after\n2. **Never move against you** - Only in your favor\n3. **Use mental stops** - If you can't set physical\n4. **Accept the loss** - Don't fight the stop\n\n🚨 **Common Stop Loss Mistakes:**\n• Setting stops too tight (getting stopped out)\n• Setting stops too wide (large losses)\n• Moving stops against you (hoping)\n• Not using stops at all (disaster)\n\n🎯 **Your Stop Loss Action Plan:**\n• Review your last 10 trades\n• Calculate optimal stop distances\n• Test different stop methods\n• Stick to your chosen method\n\nRemember: A good stop loss saves you from bad trades!`;
      }
      
      if (lowerQuestion.includes('risk management') || lowerQuestion.includes('risk control')) {
        return `🛡️ **COMPLETE RISK MANAGEMENT SYSTEM**\n\nRisk management is your trading foundation. Here's your comprehensive system:\n\n📊 **Your Current Risk Profile:**\n• Average loss: ${peso(avgLoss)}\n• Average win: ${peso(avgWin)}\n• Risk per trade: ${currentRiskPerTrade.toFixed(1)}%\n• Risk-reward ratio: 1:${riskRewardRatio.toFixed(2)}\n• Max drawdown: ${peso(maxDD)}\n• Total trades: ${totalTrades}\n\n🎯 **The 5 Pillars of Risk Management:**\n\n1. **Position Sizing (2% Rule):**\n   • Risk maximum 2% per trade\n   • Your current: ${currentRiskPerTrade.toFixed(1)}%\n   • Action: ${currentRiskPerTrade > 2 ? 'REDUCE IMMEDIATELY' : 'MAINTAIN'}\n\n2. **Stop Losses (Technical Levels):**\n   • Set at support/resistance\n   • Never exceed 2% account risk\n   • Use trailing stops for winners\n\n3. **Diversification (Multiple Strategies):**\n   • Don't put all eggs in one basket\n   • Trade different timeframes\n   • Use different instruments\n\n4. **Drawdown Limits (10% Maximum):**\n   • Stop trading at 10% drawdown\n   • Your max: ${peso(maxDD)}\n   • Action: ${maxDD > accountRisk * 0.1 ? 'REDUCE POSITION SIZES' : 'MONITOR CLOSELY'}\n\n5. **Emotional Control (Trading Rules):**\n   • Follow your plan religiously\n   • Take breaks after losses\n   • Never revenge trade\n\n💡 **Risk Management Checklist:**\n□ Position size calculated (2% max)\n□ Stop loss set (technical level)\n□ Take profit target (2:1 R/R minimum)\n□ Daily loss limit (3% max)\n□ Weekly loss limit (10% max)\n□ Monthly review scheduled\n\n🎯 **Your Risk Management Action Plan:**\n• Calculate exact position sizes\n• Set stop losses before entry\n• Monitor drawdowns daily\n• Review risk metrics weekly\n• Adjust system monthly\n\nRemember: Risk management is not about avoiding losses, it's about surviving them!`;
      }
      
      // General risk management response
      let riskAnalysis = `🎯 **COMPREHENSIVE RISK ANALYSIS**\n\n📊 **Your Risk Profile:**\n• Average loss: ${peso(avgLoss)}\n• Average win: ${peso(avgWin)}\n• Risk per trade: ${currentRiskPerTrade.toFixed(1)}%\n• Risk-reward: 1:${riskRewardRatio.toFixed(2)}\n• Max drawdown: ${peso(maxDD)}\n• Total trades: ${totalTrades}\n\n`;
      
      if (currentRiskPerTrade > 3) {
        riskAnalysis += `🚨 **CRITICAL RISK ALERT!**\n\nYou're risking ${currentRiskPerTrade.toFixed(1)}% per trade - this is dangerous!\n\n🛑 **IMMEDIATE ACTIONS:**\n1. **STOP TRADING** - Take a break\n2. **Reduce position sizes by 75%**\n3. **Review your risk management**\n4. **Paper trade until fixed**\n\n💡 **Emergency Fix:**\n• Use 0.5% risk per trade maximum\n• Set stops at 1% account risk\n• Take profits at 1% account risk\n• Never risk more than 1% total\n\nYour current risk level will destroy your account!`;
      } else if (currentRiskPerTrade > 2) {
        riskAnalysis += `⚠️ **HIGH RISK WARNING!**\n\nYou're risking ${currentRiskPerTrade.toFixed(1)}% per trade - reduce to 2% maximum.\n\n🎯 **Risk Reduction Plan:**\n1. **Cut position sizes by 50%**\n2. **Tighten stop losses**\n3. **Improve risk-reward ratios**\n4. **Monitor drawdowns closely**\n\n💡 **Specific Actions:**\n• Risk maximum 2% per trade\n• Target 1:2 risk-reward minimum\n• Set daily loss limit at 3%\n• Review risk metrics weekly\n\nReduce your risk to protect your capital!`;
      } else {
        riskAnalysis += `✅ **GOOD RISK MANAGEMENT!**\n\nYour risk per trade is within acceptable limits.\n\n🎯 **Optimization Plan:**\n1. **Maintain current risk levels**\n2. **Focus on improving win rate**\n3. **Optimize risk-reward ratios**\n4. **Consider scaling up gradually**\n\n💡 **Next Steps:**\n• Analyze your best trades\n• Replicate successful patterns\n• Consider increasing position size by 25%\n• Document your risk management rules\n\nKeep up the good work!`;
      }
      
      return riskAnalysis;
    }
    
    // Win Rate Questions - Ultra Specific
    if (lowerQuestion.includes('win rate') || lowerQuestion.includes('winning') || lowerQuestion.includes('losing') || lowerQuestion.includes('win percentage')) {
      const winRate = userMetrics.winRate * 100;
      const totalTrades = userMetrics.totalTrades;
      const winningTrades = Math.round(totalTrades * userMetrics.winRate);
      const losingTrades = totalTrades - winningTrades;
      const avgConfidence = userMetrics.avgConfidence;
      
      // Specific question matching
      if (lowerQuestion.includes('winning') && !lowerQuestion.includes('losing')) {
        return `🏆 **WINNING TRADE ANALYSIS**\n\nUnderstanding your winning trades is crucial for replication. Here's your complete analysis:\n\n📊 **Your Winning Trade Profile:**\n• Win rate: ${winRate.toFixed(1)}%\n• Winning trades: ${winningTrades}\n• Average confidence: ${avgConfidence.toFixed(1)}/10\n• Total trades: ${totalTrades}\n\n🎯 **What Makes Your Winners Work?**\n\n1. **Entry Timing Analysis:**\n   • Review your last 10 winning trades\n   • What time of day were they?\n   • What market conditions?\n   • What technical patterns?\n\n2. **Setup Identification:**\n   • Breakout patterns\n   • Support/resistance bounces\n   • Trend continuation\n   • Reversal patterns\n\n3. **Confidence Correlation:**\n   • Your average confidence: ${avgConfidence.toFixed(1)}/10\n   • ${avgConfidence > 7 ? 'High confidence = High win rate' : 'Low confidence = Need improvement'}\n   • Only trade when 8+/10 confident\n\n💡 **Winning Trade Replication Strategy:**\n1. **Document Everything** - Record every detail of winners\n2. **Find Common Patterns** - What do winners have in common?\n3. **Create a Checklist** - Use for future trades\n4. **Practice Recognition** - Study charts daily\n\n🎯 **Your Winning Trade Action Plan:**\n• Analyze your last 20 winning trades\n• Create a "Winning Setup" checklist\n• Only trade when setup matches checklist\n• Track success rate of checklist\n\nRemember: Replicate what works, eliminate what doesn't!`;
      }
      
      if (lowerQuestion.includes('losing') && !lowerQuestion.includes('winning')) {
        return `📉 **LOSING TRADE ANALYSIS**\n\nUnderstanding your losing trades is the key to improvement. Here's your complete analysis:\n\n📊 **Your Losing Trade Profile:**\n• Win rate: ${winRate.toFixed(1)}%\n• Losing trades: ${losingTrades}\n• Average confidence: ${avgConfidence.toFixed(1)}/10\n• Total trades: ${totalTrades}\n\n🎯 **What's Causing Your Losses?**\n\n1. **Common Loss Patterns:**\n   • Review your last 10 losing trades\n   • What went wrong?\n   • Was it entry timing?\n   • Was it stop loss placement?\n   • Was it market conditions?\n\n2. **Loss Categories:**\n   • **Technical Losses** - Wrong analysis\n   • **Emotional Losses** - Impulsive trades\n   • **Risk Management Losses** - Poor position sizing\n   • **Timing Losses** - Wrong market conditions\n\n3. **Confidence vs Reality:**\n   • Your average confidence: ${avgConfidence.toFixed(1)}/10\n   • ${avgConfidence < 6 ? 'Low confidence = More losses' : 'High confidence = Fewer losses'}\n   • Only trade when 8+/10 confident\n\n💡 **Loss Prevention Strategy:**\n1. **Identify Loss Patterns** - What causes most losses?\n2. **Create Loss Prevention Rules** - Avoid these situations\n3. **Improve Entry Criteria** - Be more selective\n4. **Better Risk Management** - Smaller positions\n\n🎯 **Your Loss Prevention Action Plan:**\n• Analyze your last 20 losing trades\n• Create a "Loss Prevention" checklist\n• Avoid trades that match loss patterns\n• Track reduction in losses\n\nRemember: Eliminate what doesn't work, focus on what does!`;
      }
      
      if (lowerQuestion.includes('win percentage') || lowerQuestion.includes('win rate')) {
        return `📊 **WIN RATE OPTIMIZATION**\n\nYour win rate is the foundation of trading success. Here's how to optimize it:\n\n📈 **Your Current Win Rate Analysis:**\n• Current win rate: ${winRate.toFixed(1)}%\n• Total trades: ${totalTrades}\n• Winning trades: ${winningTrades}\n• Losing trades: ${losingTrades}\n• Average confidence: ${avgConfidence.toFixed(1)}/10\n\n🎯 **Win Rate Benchmarks:**\n• **Professional Traders:** 60-70%\n• **Good Retail Traders:** 50-60%\n• **Average Traders:** 40-50%\n• **Struggling Traders:** <40%\n• **Your Status:** ${winRate < 40 ? '🚨 CRITICAL' : winRate < 50 ? '⚠️ NEEDS IMPROVEMENT' : winRate < 60 ? '✅ GOOD' : '🏆 EXCELLENT'}\n\n💡 **Win Rate Improvement Strategies:**\n\n1. **Entry Quality (Most Important):**\n   • Wait for perfect setups only\n   • Use multiple confirmation signals\n   • Trade with the trend\n   • Avoid choppy markets\n\n2. **Market Selection:**\n   • Trade only during high volume\n   • Avoid news events\n   • Focus on liquid markets\n   • Choose trending instruments\n\n3. **Confidence Filter:**\n   • Only trade when 8+/10 confident\n   • If unsure, don't trade\n   • Better to miss than lose\n   • Build confidence through practice\n\n4. **Risk Management:**\n   • Use proper position sizing\n   • Set stop losses correctly\n   • Take profits at targets\n   • Don't let winners become losers\n\n🎯 **Your Win Rate Action Plan:**\n• Set minimum 8/10 confidence requirement\n• Review last 20 trades for patterns\n• Create entry criteria checklist\n• Track win rate improvement weekly\n\nRemember: Quality over quantity - better to trade less and win more!`;
      }
      
      // General win rate analysis
      let winRateAnalysis = `📊 **COMPREHENSIVE WIN RATE ANALYSIS**\n\n📈 **Your Win Rate Statistics:**\n• Current win rate: ${winRate.toFixed(1)}%\n• Total trades: ${totalTrades}\n• Winning trades: ${winningTrades}\n• Losing trades: ${losingTrades}\n• Average confidence: ${avgConfidence.toFixed(1)}/10\n\n`;
      
      if (winRate < 40) {
        winRateAnalysis += `🚨 **CRITICAL WIN RATE ALERT!**\n\nYour ${winRate.toFixed(1)}% win rate is dangerously low. Immediate action required!\n\n🛑 **EMERGENCY IMPROVEMENT PLAN:**\n1. **STOP TRADING** - Take 2-4 weeks off\n2. **Paper Trade Only** - Practice without risk\n3. **Study Your Losses** - Review last 20 losing trades\n4. **Find Root Causes** - What's causing the losses?\n\n💡 **Critical Actions:**\n• Only trade when confidence is 9+/10\n• Wait for perfect setups only\n• Focus on 1 strategy until profitable\n• Use 0.5% risk per trade maximum\n\nYour win rate suggests emotional or impulsive trading. Fix this immediately!`;
      } else if (winRate < 50) {
        winRateAnalysis += `⚠️ **WIN RATE NEEDS IMPROVEMENT**\n\nYour ${winRate.toFixed(1)}% win rate is below optimal. Here's your improvement plan:\n\n🎯 **IMPROVEMENT STRATEGY:**\n1. **Better Entry Timing** - Wait for stronger setups\n2. **Quality over Quantity** - Trade less, but better\n3. **Market Structure** - Only trade with clear direction\n4. **Confidence Filter** - Only trade when 8+/10 confident\n\n💡 **Specific Actions:**\n• Review your last 10 losing trades\n• Identify common patterns in losses\n• Wait for confluence of 3+ signals\n• Practice with paper trading\n\nFocus on trade quality, not quantity!`;
      } else if (winRate < 60) {
        winRateAnalysis += `✅ **GOOD WIN RATE!**\n\nYour ${winRate.toFixed(1)}% win rate is solid. Here's how to optimize it:\n\n🎯 **OPTIMIZATION PLAN:**\n1. **Fine-tune Entries** - Look for even better setups\n2. **Improve Exits** - Take profits at better levels\n3. **Scale Up Carefully** - Consider larger positions\n4. **Document Success** - Record what works\n\n💡 **Next Steps:**\n• Analyze your winning trades\n• Replicate successful patterns\n• Consider increasing position size by 25%\n• Share your methods with others\n\nYou're on the right track - keep improving!`;
      } else {
        winRateAnalysis += `🏆 **EXCELLENT WIN RATE!**\n\nYour ${winRate.toFixed(1)}% win rate is outstanding. Here's how to leverage it:\n\n🚀 **SCALING STRATEGY:**\n1. **Increase Position Size** - You can handle more risk\n2. **Document Everything** - Record your winning methods\n3. **Teach Others** - Share your knowledge\n4. **Maintain Discipline** - Don't get overconfident\n\n💡 **Advanced Actions:**\n• Consider increasing position size by 50%\n• Start a trading journal/blog\n• Mentor other traders\n• Explore new markets\n\nYour win rate is a competitive advantage - leverage it!`;
      }
      
      return winRateAnalysis;
    }
    
    // Profit Factor Questions - Ultra Specific
    if (lowerQuestion.includes('profit factor') || lowerQuestion.includes('risk reward') || lowerQuestion.includes('r/r') || lowerQuestion.includes('risk-reward')) {
      const profitFactor = userMetrics.profitFactor;
      const avgWin = userMetrics.avgWin;
      const avgLoss = Math.abs(userMetrics.avgLoss);
      const totalTrades = userMetrics.totalTrades;
      const totalPnL = userMetrics.totalPnL;
      
      // Specific question matching
      if (lowerQuestion.includes('risk reward') || lowerQuestion.includes('r/r') || lowerQuestion.includes('risk-reward')) {
        return `⚖️ **RISK-REWARD RATIO MASTERY**\n\nRisk-reward ratios are the foundation of profitable trading. Here's your complete guide:\n\n📊 **Your Current Risk-Reward Analysis:**\n• Current R/R ratio: 1:${(avgWin/avgLoss).toFixed(2)}\n• Average win: ${peso(avgWin)}\n• Average loss: ${peso(avgLoss)}\n• Profit factor: ${profitFactor.toFixed(2)}\n• Total P&L: ${peso(totalPnL)}\n\n🎯 **Risk-Reward Ratio Benchmarks:**\n• **Excellent:** 1:3 or higher\n• **Good:** 1:2 to 1:3\n• **Acceptable:** 1:1.5 to 1:2\n• **Poor:** 1:1 to 1:1.5\n• **Dangerous:** Less than 1:1\n• **Your Status:** ${(avgWin/avgLoss) >= 2 ? '✅ GOOD' : (avgWin/avgLoss) >= 1.5 ? '⚠️ ACCEPTABLE' : '🚨 POOR'}\n\n💡 **Risk-Reward Improvement Strategies:**\n\n1. **Entry Optimization:**\n   • Enter closer to support/resistance\n   • Wait for pullbacks in trends\n   • Use limit orders for better entries\n   • Avoid chasing breakouts\n\n2. **Stop Loss Placement:**\n   • Set stops at technical levels\n   • Use ATR for stop distance\n   • Add buffer for market noise\n   • Never use arbitrary stops\n\n3. **Take Profit Targets:**\n   • Target 2:1 minimum\n   • Use technical levels for targets\n   • Take partial profits at 1:1\n   • Let winners run with trailing stops\n\n4. **Position Sizing:**\n   • Risk same % each trade\n   • Adjust size based on stop distance\n   • Never risk more than 2%\n   • Use position sizing calculator\n\n🎯 **Your Risk-Reward Action Plan:**\n• Review last 20 trades for R/R ratios\n• Identify trades with poor R/R\n• Improve entry timing\n• Set better take profit targets\n• Track R/R improvement weekly\n\nRemember: You can be wrong 50% of the time and still be profitable with good R/R!`;
      }
      
      if (lowerQuestion.includes('profit factor')) {
        return `💰 **PROFIT FACTOR OPTIMIZATION**\n\nProfit factor is the ultimate measure of trading success. Here's how to optimize yours:\n\n📊 **Your Profit Factor Analysis:**\n• Current profit factor: ${profitFactor.toFixed(2)}\n• Average win: ${peso(avgWin)}\n• Average loss: ${peso(avgLoss)}\n• Risk-reward ratio: 1:${(avgWin/avgLoss).toFixed(2)}\n• Total P&L: ${peso(totalPnL)}\n• Total trades: ${totalTrades}\n\n🎯 **Profit Factor Benchmarks:**\n• **Excellent:** 2.0 or higher\n• **Good:** 1.5 to 2.0\n• **Acceptable:** 1.2 to 1.5\n• **Poor:** 1.0 to 1.2\n• **Dangerous:** Less than 1.0\n• **Your Status:** ${profitFactor >= 2 ? '🏆 EXCELLENT' : profitFactor >= 1.5 ? '✅ GOOD' : profitFactor >= 1.2 ? '⚠️ ACCEPTABLE' : profitFactor >= 1.0 ? '🚨 POOR' : '💀 DANGEROUS'}\n\n💡 **Profit Factor Improvement Strategies:**\n\n1. **Improve Risk-Reward Ratios:**\n   • Target minimum 1:2 R/R\n   • Use technical levels for targets\n   • Take partial profits at 1:1\n   • Let winners run with trailing stops\n\n2. **Optimize Stop Losses:**\n   • Set stops at technical levels\n   • Use ATR for stop distance\n   • Never use arbitrary stops\n   • Review stop placement weekly\n\n3. **Enhance Entry Timing:**\n   • Wait for better setups\n   • Use multiple confirmation signals\n   • Enter closer to support/resistance\n   • Avoid chasing breakouts\n\n4. **Position Sizing Consistency:**\n   • Risk same % each trade\n   • Use position sizing calculator\n   • Never risk more than 2%\n   • Adjust for volatility\n\n🎯 **Your Profit Factor Action Plan:**\n• Calculate profit factor weekly\n• Review trades with poor R/R\n• Improve entry timing\n• Optimize stop losses\n• Track improvement monthly\n\nRemember: Profit factor determines your long-term success!`;
      }
      
      // General profit factor analysis
      let profitFactorAnalysis = `📊 **COMPREHENSIVE PROFIT FACTOR ANALYSIS**\n\n💰 **Your Profit Factor Metrics:**\n• Current profit factor: ${profitFactor.toFixed(2)}\n• Average win: ${peso(avgWin)}\n• Average loss: ${peso(avgLoss)}\n• Risk-reward ratio: 1:${(avgWin/avgLoss).toFixed(2)}\n• Total P&L: ${peso(totalPnL)}\n• Total trades: ${totalTrades}\n\n`;
      
      if (profitFactor < 1.0) {
        profitFactorAnalysis += `🚨 **CRITICAL PROFIT FACTOR ALERT!**\n\nYour profit factor of ${profitFactor.toFixed(2)} means you're losing money overall!\n\n🛑 **EMERGENCY ACTION PLAN:**\n1. **STOP TRADING IMMEDIATELY** - You're bleeding money\n2. **Analyze Every Loss** - Review all losing trades\n3. **Fix Risk Management** - Your stops are too wide\n4. **Paper Trade Only** - Practice until profitable\n\n💡 **Critical Fixes:**\n• Tighten stop losses by 50%\n• Aim for minimum 1:2 risk-reward\n• Use fixed 1% risk per trade\n• Take partial profits at 1:1\n\nYour current approach is not working - major changes needed!`;
      } else if (profitFactor < 1.2) {
        profitFactorAnalysis += `⚠️ **POOR PROFIT FACTOR**\n\nYour profit factor of ${profitFactor.toFixed(2)} is below acceptable levels.\n\n🎯 **IMPROVEMENT STRATEGY:**\n1. **Better Risk-Reward** - Aim for 1:2 minimum\n2. **Tighter Stops** - Use technical levels\n3. **Consistent Sizing** - Risk same % each trade\n4. **Partial Profits** - Take 50% at 1:1, 50% at 2:1\n\n💡 **Specific Actions:**\n• Set stops at support/resistance levels\n• Target 2x your risk minimum\n• Use trailing stops for winners\n• Review your exit strategy\n\nFocus on risk-reward ratios - this is crucial!`;
      } else if (profitFactor < 1.5) {
        profitFactorAnalysis += `✅ **ACCEPTABLE PROFIT FACTOR**\n\nYour profit factor of ${profitFactor.toFixed(2)} is decent but can improve.\n\n🎯 **OPTIMIZATION PLAN:**\n1. **Fine-tune Exits** - Take profits at better levels\n2. **Improve Entries** - Wait for better setups\n3. **Scale Winners** - Let profitable trades run\n4. **Cut Losers** - Exit losing trades faster\n\n💡 **Next Steps:**\n• Analyze your best trades\n• Replicate successful patterns\n• Consider trailing stops\n• Review your profit-taking strategy\n\nYou're on the right track - keep optimizing!`;
      } else {
        profitFactorAnalysis += `🏆 **EXCELLENT PROFIT FACTOR!**\n\nYour profit factor of ${profitFactor.toFixed(2)} is outstanding!\n\n🚀 **SCALING STRATEGY:**\n1. **Increase Position Size** - You can handle more risk\n2. **Document Success** - Record your winning methods\n3. **Teach Others** - Share your knowledge\n4. **Explore New Markets** - Apply your skills elsewhere\n\n💡 **Advanced Actions:**\n• Consider increasing position size by 50%\n• Start a trading course/blog\n• Mentor other traders\n• Explore different timeframes\n\nYour profit factor shows you're a skilled trader - leverage it!`;
      }
      
      return profitFactorAnalysis;
    }
    
    // Strategy Questions - More Specific
    if (lowerQuestion.includes('strategy') || lowerQuestion.includes('approach') || lowerQuestion.includes('method') || lowerQuestion.includes('best strategy')) {
      const byStrategy = filtered.reduce((acc, trade) => {
        const strategy = trade.strategy;
        if (!acc[strategy]) acc[strategy] = { total: 0, pnl: 0, wins: 0, losses: 0, avgPnl: 0, winRate: 0 };
        acc[strategy].total++;
        acc[strategy].pnl += trade.pnl;
        if (trade.pnl > 0) {
          acc[strategy].wins++;
        } else {
          acc[strategy].losses++;
        }
        acc[strategy].avgPnl = acc[strategy].pnl / acc[strategy].total;
        acc[strategy].winRate = (acc[strategy].wins / acc[strategy].total) * 100;
        return acc;
      }, {});
      
      const strategyEntries = Object.entries(byStrategy)
        .filter(([_, data]) => data.total >= 2)
        .sort((a, b) => (b[1].pnl / b[1].total) - (a[1].pnl / a[1].total));
      
      if (strategyEntries.length > 0) {
        const bestStrategy = strategyEntries[0];
        const worstStrategy = strategyEntries[strategyEntries.length - 1];
        
        let strategyAnalysis = `🏆 **Detailed Strategy Analysis**\n\n📊 **Your Strategy Performance:**\n\n`;
        
        // Best Strategy
        strategyAnalysis += `🥇 **BEST STRATEGY: "${bestStrategy[0]}"**\n`;
        strategyAnalysis += `• Total trades: ${bestStrategy[1].total}\n`;
        strategyAnalysis += `• Win rate: ${bestStrategy[1].winRate.toFixed(1)}%\n`;
        strategyAnalysis += `• Total P&L: ${peso(bestStrategy[1].pnl)}\n`;
        strategyAnalysis += `• Average per trade: ${peso(bestStrategy[1].avgPnl)}\n\n`;
        
        // Worst Strategy (if different from best)
        if (worstStrategy[0] !== bestStrategy[0]) {
          strategyAnalysis += `🥉 **WORST STRATEGY: "${worstStrategy[0]}"**\n`;
          strategyAnalysis += `• Total trades: ${worstStrategy[1].total}\n`;
          strategyAnalysis += `• Win rate: ${worstStrategy[1].winRate.toFixed(1)}%\n`;
          strategyAnalysis += `• Total P&L: ${peso(worstStrategy[1].pnl)}\n`;
          strategyAnalysis += `• Average per trade: ${peso(worstStrategy[1].avgPnl)}\n\n`;
        }
        
        // All Strategies Summary
        if (strategyEntries.length > 2) {
          strategyAnalysis += `📈 **ALL STRATEGIES SUMMARY:**\n`;
          strategyEntries.forEach(([name, data], index) => {
            strategyAnalysis += `${index + 1}. **${name}**: ${peso(data.avgPnl)} avg, ${data.winRate.toFixed(1)}% win rate\n`;
          });
          strategyAnalysis += `\n`;
        }
        
        // Recommendations
        if (bestStrategy[1].winRate > 60 && bestStrategy[1].avgPnl > 0) {
          strategyAnalysis += `🚀 **EXCELLENT STRATEGY!**\n\n🎯 **SCALING RECOMMENDATIONS:**\n1. **Increase Focus** - Allocate 70%+ to "${bestStrategy[0]}"\n2. **Document Success** - Record every detail of winning trades\n3. **Replicate Patterns** - Apply same principles to other strategies\n4. **Scale Up** - Consider larger position sizes\n\n💡 **Specific Actions:**\n• Trade "${bestStrategy[0]}" more frequently\n• Study your best trades in detail\n• Create a checklist for this strategy\n• Consider teaching others your method\n\nThis strategy is your golden goose - milk it!`;
        } else if (bestStrategy[1].winRate > 50 && bestStrategy[1].avgPnl > 0) {
          strategyAnalysis += `✅ **GOOD STRATEGY!**\n\n🎯 **OPTIMIZATION RECOMMENDATIONS:**\n1. **Focus More** - Increase allocation to "${bestStrategy[0]}"\n2. **Fine-tune** - Improve entry/exit timing\n3. **Document** - Record what makes it work\n4. **Practice** - Paper trade to improve\n\n💡 **Specific Actions:**\n• Analyze your winning trades in "${bestStrategy[0]}"\n• Identify common patterns\n• Wait for better setups\n• Consider combining with other strategies\n\nYou're on the right track - keep improving!`;
        } else {
          strategyAnalysis += `⚠️ **NEEDS IMPROVEMENT**\n\n🎯 **IMPROVEMENT PLAN:**\n1. **Study Winners** - Analyze your best trades\n2. **Fix Losers** - Identify what's going wrong\n3. **Simplify** - Focus on one strategy only\n4. **Practice** - Paper trade until profitable\n\n💡 **Specific Actions:**\n• Review your last 20 trades in "${bestStrategy[0]}"\n• Find patterns in winners vs losers\n• Wait for higher probability setups\n• Consider different strategies\n\nYour current strategies need work - focus on improvement!`;
        }
        
        return strategyAnalysis;
      } else {
        return `📈 **Strategy Development Needed**\n\nI need more data to analyze your strategies effectively.\n\n🎯 **Strategy Building Plan:**\n1. **Start Simple** - Master one approach first\n2. **Backtest** - Test on historical data\n3. **Paper Trade** - Practice before risking money\n4. **Keep Records** - Track what works\n\n💡 **Popular Strategies to Consider:**\n• **Breakout Trading** - Trade breakouts from consolidation\n• **Mean Reversion** - Trade back to average prices\n• **Trend Following** - Ride the trend direction\n• **Support/Resistance** - Trade bounces off key levels\n\n🎯 **Action Plan:**\n• Choose ONE strategy to focus on\n• Paper trade for 2-4 weeks\n• Only trade when 8+/10 confident\n• Document every trade\n\nFocus on one strategy and master it before adding others!`;
      }
    }
    
    // Psychology Questions - Enhanced with Comprehensive Analysis
    if (lowerQuestion.includes('psychology') || lowerQuestion.includes('emotion') || lowerQuestion.includes('mental') || lowerQuestion.includes('confidence') || lowerQuestion.includes('stress') || lowerQuestion.includes('fear') || lowerQuestion.includes('greed') || lowerQuestion.includes('anxiety') || lowerQuestion.includes('panic') || lowerQuestion.includes('frustration') || lowerQuestion.includes('anger') || lowerQuestion.includes('depression') || lowerQuestion.includes('overconfidence') || lowerQuestion.includes('impatience') || lowerQuestion.includes('revenge') || lowerQuestion.includes('fomo')) {
      const consecutiveLosses = userMetrics.consecutiveLosses;
      const avgConfidence = userMetrics.avgConfidence;
      const totalTrades = userMetrics.totalTrades;
      const winRate = userMetrics.winRate * 100;
      const totalPnL = userMetrics.totalPnL;
      
      let psychologyAnalysis = `🧠 **Comprehensive Trading Psychology Analysis**\n\n📊 **Your Mental State Indicators:**\n• Consecutive losses: ${consecutiveLosses}\n• Average confidence: ${avgConfidence.toFixed(1)}/10\n• Total trades: ${totalTrades}\n• Win rate: ${winRate.toFixed(1)}%\n• Total P&L: ${peso(totalPnL)}\n\n`;
      
      // Enhanced psychological analysis based on specific emotions
      if (lowerQuestion.includes('fear') || lowerQuestion.includes('anxiety') || lowerQuestion.includes('panic')) {
        psychologyAnalysis += `😰 **FEAR & ANXIETY MANAGEMENT**\n\nFear is one of the most destructive emotions in trading. Here's how to overcome it:\n\n🎯 **Understanding Trading Fear:**\n• **Fear of Loss** - Protecting capital is natural, but excessive fear paralyzes\n• **Fear of Missing Out (FOMO)** - Can lead to impulsive trades\n• **Fear of Being Wrong** - Prevents taking necessary risks\n• **Fear of Success** - Some traders sabotage themselves\n\n💡 **Fear-Busting Strategies:**\n1. **Start Small** - Use micro positions to build confidence\n2. **Set Clear Rules** - Define exactly when to enter/exit\n3. **Practice Visualization** - Imagine successful trades\n4. **Keep a Journal** - Record your fears and how you overcame them\n5. **Meditation** - 10 minutes daily to calm your mind\n\n🧘 **Mental Techniques:**\n• **Breathing Exercises** - 4-7-8 breathing before trading\n• **Positive Affirmations** - "I am a disciplined trader"\n• **Risk Acceptance** - "Losses are part of the process"\n• **Focus on Process** - Not profits, but following your plan\n\nRemember: Courage is not the absence of fear, but action despite fear!`;
      } else if (lowerQuestion.includes('greed') || lowerQuestion.includes('overconfidence') || lowerQuestion.includes('impatience')) {
        psychologyAnalysis += `💰 **GREED & OVERCONFIDENCE MANAGEMENT**\n\nGreed and overconfidence are silent killers in trading. Here's how to control them:\n\n🎯 **Understanding Trading Greed:**\n• **Position Sizing Greed** - Taking positions too large\n• **Profit Greed** - Not taking profits when you should\n• **Frequency Greed** - Trading too often\n• **Overconfidence** - Thinking you can't lose\n\n💡 **Greed-Busting Strategies:**\n1. **Set Profit Targets** - Take profits at predetermined levels\n2. **Use Position Sizing Rules** - Never risk more than 2%\n3. **Limit Daily Trades** - Set a maximum number per day\n4. **Regular Breaks** - Step away after big wins\n5. **Account for Drawdowns** - Expect losing streaks\n\n🎯 **Overconfidence Prevention:**\n• **Review Losing Trades** - Learn from every mistake\n• **Stay Humble** - Markets can humble anyone\n• **Diversify Strategies** - Don't rely on one approach\n• **Keep Learning** - Markets evolve constantly\n\nRemember: The market will humble the arrogant and reward the humble!`;
      } else if (lowerQuestion.includes('stress') || lowerQuestion.includes('frustration') || lowerQuestion.includes('anger')) {
        psychologyAnalysis += `😤 **STRESS & FRUSTRATION MANAGEMENT**\n\nTrading stress can destroy your performance. Here's how to manage it:\n\n🎯 **Understanding Trading Stress:**\n• **Performance Stress** - Pressure to make money\n• **Time Stress** - Feeling rushed to make decisions\n• **Information Overload** - Too much market data\n• **Social Pressure** - Expectations from others\n\n💡 **Stress-Reduction Techniques:**\n1. **Trading Schedule** - Set specific trading hours\n2. **Information Diet** - Limit news consumption\n3. **Physical Exercise** - 30 minutes daily\n4. **Sleep Well** - 7-8 hours minimum\n5. **Healthy Diet** - Avoid caffeine and sugar spikes\n\n🧘 **Mental Stress Relief:**\n• **Meditation** - 10-20 minutes daily\n• **Journaling** - Write down your thoughts\n• **Nature Time** - Spend time outdoors\n• **Hobbies** - Have non-trading interests\n• **Social Support** - Talk to other traders\n\n🎯 **Frustration Management:**\n• **Accept Losses** - They're part of trading\n• **Focus on Process** - Not individual results\n• **Take Breaks** - Step away when frustrated\n• **Review Your Plan** - Go back to basics\n\nRemember: A calm mind makes better decisions!`;
      } else if (lowerQuestion.includes('depression') || lowerQuestion.includes('sad') || lowerQuestion.includes('hopeless')) {
        psychologyAnalysis += `😔 **DEPRESSION & TRADING**\n\nTrading losses can lead to depression. Here's how to cope:\n\n🎯 **Recognizing Trading Depression:**\n• **Loss of Interest** - Not wanting to trade\n• **Hopelessness** - Feeling like you'll never succeed\n• **Sleep Issues** - Insomnia or oversleeping\n• **Appetite Changes** - Eating too much or too little\n• **Social Withdrawal** - Avoiding other traders\n\n💡 **Recovery Strategies:**\n1. **Seek Professional Help** - Consider therapy or counseling\n2. **Take a Break** - Stop trading for 2-4 weeks\n3. **Focus on Health** - Exercise, sleep, nutrition\n4. **Set Small Goals** - Celebrate small wins\n5. **Connect with Others** - Join trading communities\n\n🚨 **Warning Signs - Seek Help Immediately:**\n• Thoughts of self-harm\n• Severe depression lasting weeks\n• Inability to function normally\n• Substance abuse\n• Suicidal thoughts\n\n💡 **Mental Health Resources:**\n• **National Suicide Prevention Lifeline** - 988\n• **Crisis Text Line** - Text HOME to 741741\n• **Local Mental Health Services**\n• **Trading Psychology Coaches**\n\nRemember: Your mental health is more important than trading profits!`;
      } else if (lowerQuestion.includes('revenge') || lowerQuestion.includes('anger') || lowerQuestion.includes('frustration')) {
        psychologyAnalysis += `😡 **REVENGE TRADING PREVENTION**\n\nRevenge trading is one of the most dangerous behaviors. Here's how to avoid it:\n\n🎯 **Understanding Revenge Trading:**\n• **Emotional Response** - Trading to "get back" at the market\n• **Larger Positions** - Increasing size after losses\n• **Ignoring Rules** - Abandoning your trading plan\n• **Chasing Losses** - Trying to recover quickly\n\n💡 **Revenge Trading Prevention:**\n1. **Set Daily Loss Limits** - Stop trading after X losses\n2. **Cooling Off Period** - Wait 24 hours after big losses\n3. **Stick to Rules** - Never deviate from your plan\n4. **Position Sizing** - Never increase size after losses\n5. **Account for Emotions** - Plan for emotional responses\n\n🎯 **Recovery from Revenge Trading:**\n• **Acknowledge the Problem** - Admit you're revenge trading\n• **Take a Break** - Stop trading for 1-2 weeks\n• **Review Your Plan** - Go back to basics\n• **Start Small** - Use tiny positions when returning\n• **Seek Support** - Talk to other traders\n\n💡 **Mental Techniques:**\n• **Count to 10** - Before making any trade\n• **Ask "Why?"** - Why am I making this trade?\n• **Check Emotions** - Am I trading from emotion?\n• **Review Rules** - Does this trade fit my plan?\n\nRemember: The market doesn't care about your emotions - stay disciplined!`;
      } else {
        // General psychological analysis with metrics
        // Analyze consecutive losses
        if (consecutiveLosses > 5) {
          psychologyAnalysis += `🚨 **CRITICAL PSYCHOLOGY ALERT!**\n\nYou've had ${consecutiveLosses} consecutive losses - this is a major red flag!\n\n🛑 **IMMEDIATE EMERGENCY ACTIONS:**\n1. **STOP TRADING NOW** - Take 1-2 weeks off\n2. **Seek Professional Help** - Consider a trading coach\n3. **Review Everything** - Analyze all losing trades\n4. **Mental Reset** - Clear your mind completely\n\n💡 **Recovery Plan:**\n• Paper trade for 2-4 weeks\n• Focus on education, not profits\n• Join a trading community\n• Consider therapy if needed\n\nYour mental state is dangerous for trading - fix this first!`;
        } else if (consecutiveLosses > 3) {
          psychologyAnalysis += `⚠️ **PSYCHOLOGY WARNING!**\n\nYou've had ${consecutiveLosses} consecutive losses - this indicates emotional trading.\n\n🛑 **IMMEDIATE ACTIONS:**\n1. **Take a Break** - 2-3 days off from trading\n2. **Review Rules** - Go back to your trading plan\n3. **Paper Trade** - Practice without risk\n4. **Seek Support** - Talk to other traders\n\n💡 **Mental Reset:**\n• Remember: losses are part of trading\n• Focus on process, not profits\n• Come back with a clear mind\n• Don't revenge trade\n\nYour mental state needs attention - take action now!`;
        } else if (consecutiveLosses > 1) {
          psychologyAnalysis += `⚠️ **MINOR PSYCHOLOGY CONCERN**\n\nYou've had ${consecutiveLosses} consecutive losses - watch your emotions.\n\n🎯 **PREVENTIVE ACTIONS:**\n1. **Review Recent Trades** - What went wrong?\n2. **Stick to Rules** - Don't deviate from your plan\n3. **Reduce Position Size** - Trade smaller until confident\n4. **Stay Disciplined** - Don't let emotions take over\n\n💡 **Mental Tips:**\n• Take breaks between trades\n• Review your trading plan\n• Stay calm and focused\n• Remember your long-term goals\n\nStay disciplined and you'll bounce back!`;
        } else {
          psychologyAnalysis += `✅ **GOOD MENTAL STATE**\n\nYour consecutive loss pattern looks healthy.\n\n`;
        }
        
        // Analyze confidence levels
        if (avgConfidence < 5) {
          psychologyAnalysis += `🤔 **LOW CONFIDENCE ISSUE**\n\nYour average confidence of ${avgConfidence.toFixed(1)}/10 is very low - this is dangerous!\n\n🎯 **CONFIDENCE BUILDING PLAN:**\n1. **Education First** - Learn more about your strategy\n2. **Paper Trade** - Practice until confident\n3. **Start Small** - Use tiny position sizes\n4. **Seek Mentorship** - Find an experienced trader\n\n💡 **Confidence Rules:**\n• Only trade when 8+/10 confident\n• If unsure, don't trade\n• Better to miss a trade than take a bad one\n• Confidence comes from preparation\n\nBuild your confidence through knowledge and practice!`;
        } else if (avgConfidence < 7) {
          psychologyAnalysis += `⚠️ **MODERATE CONFIDENCE**\n\nYour average confidence of ${avgConfidence.toFixed(1)}/10 could be higher.\n\n🎯 **CONFIDENCE IMPROVEMENT:**\n1. **More Analysis** - Spend extra time on market study\n2. **Wait for Setups** - Only trade high-probability situations\n3. **Practice** - Paper trade to build confidence\n4. **Education** - Learn more about your strategy\n\n💡 **Confidence Boosters:**\n• Study your winning trades\n• Practice with paper trading\n• Join trading communities\n• Read trading books\n\nFocus on building confidence through preparation!`;
        } else {
          psychologyAnalysis += `💪 **STRONG CONFIDENCE!**\n\nYour average confidence of ${avgConfidence.toFixed(1)}/10 is excellent!\n\n🏆 **MAINTAIN YOUR MINDSET:**\n• Keep your current preparation routine\n• Stay disciplined with your rules\n• Continue learning and improving\n• Don't get overconfident\n\n🚀 **NEXT LEVEL:**\n• Share your knowledge with others\n• Mentor new traders\n• Document your mental processes\n• Consider trading psychology courses\n\nYour mental game is a key competitive advantage!`;
        }
      }
      
      return psychologyAnalysis;
    }
    
    // General Trading Questions - More Specific
    if (lowerQuestion.includes('improve') || lowerQuestion.includes('better') || lowerQuestion.includes('help') || lowerQuestion.includes('advice') || lowerQuestion.includes('suggestions')) {
      const totalPnL = userMetrics.totalPnL;
      const winRate = userMetrics.winRate * 100;
      const profitFactor = userMetrics.profitFactor;
      const totalTrades = userMetrics.totalTrades;
      const avgConfidence = userMetrics.avgConfidence;
      const consecutiveLosses = userMetrics.consecutiveLosses;
      const maxDD = userMetrics.maxDD;
      
      let improvementPlan = `🎯 **Comprehensive Trading Improvement Plan**\n\n📊 **Your Current Performance Analysis:**\n• Total P&L: ${peso(totalPnL)}\n• Win Rate: ${winRate.toFixed(1)}%\n• Profit Factor: ${profitFactor.toFixed(2)}\n• Total Trades: ${totalTrades}\n• Average Confidence: ${avgConfidence.toFixed(1)}/10\n• Consecutive Losses: ${consecutiveLosses}\n• Max Drawdown: ${peso(maxDD)}\n\n`;
      
      // Determine overall performance level
      let performanceLevel = '';
      let priorityActions = [];
      
      if (totalPnL < 0 && winRate < 40 && profitFactor < 1.0) {
        performanceLevel = '🚨 **CRITICAL - MAJOR IMPROVEMENTS NEEDED**';
        priorityActions = [
          '1. **STOP TRADING** - Take 2-4 weeks off',
          '2. **Paper Trade Only** - Practice without risk',
          '3. **Fix Risk Management** - Use 1% risk per trade',
          '4. **Study Education** - Learn proper trading basics',
          '5. **Seek Mentorship** - Find an experienced trader'
        ];
      } else if (totalPnL < 0 || winRate < 50 || profitFactor < 1.2) {
        performanceLevel = '⚠️ **NEEDS SIGNIFICANT IMPROVEMENT**';
        priorityActions = [
          '1. **Improve Win Rate** - Focus on better trade selection',
          '2. **Fix Risk-Reward** - Aim for 1:2 minimum',
          '3. **Reduce Position Size** - Use smaller positions',
          '4. **Paper Trade** - Practice until profitable',
          '5. **Review Losing Trades** - Find common patterns'
        ];
      } else if (winRate < 60 || profitFactor < 1.5) {
        performanceLevel = '✅ **GOOD - OPTIMIZATION NEEDED**';
        priorityActions = [
          '1. **Fine-tune Entries** - Wait for better setups',
          '2. **Improve Exits** - Take profits at better levels',
          '3. **Scale Up Carefully** - Consider larger positions',
          '4. **Document Success** - Record what works',
          '5. **Share Knowledge** - Teach others your methods'
        ];
      } else {
        performanceLevel = '🏆 **EXCELLENT - SCALING OPPORTUNITY**';
        priorityActions = [
          '1. **Increase Position Size** - You can handle more risk',
          '2. **Document Everything** - Record your winning methods',
          '3. **Teach Others** - Share your knowledge',
          '4. **Explore New Markets** - Apply skills elsewhere',
          '5. **Mentor Traders** - Help others succeed'
        ];
      }
      
      improvementPlan += `${performanceLevel}\n\n🎯 **TOP 5 PRIORITY ACTIONS:**\n`;
      priorityActions.forEach(action => {
        improvementPlan += `${action}\n`;
      });
      
      improvementPlan += `\n💡 **SPECIFIC ACTION PLAN:**\n`;
      
      // Specific recommendations based on metrics
      if (winRate < 50) {
        improvementPlan += `• **Win Rate Issue:** Review your last 20 losing trades and identify common patterns\n`;
      }
      if (profitFactor < 1.2) {
        improvementPlan += `• **Profit Factor Issue:** Tighten stop losses and aim for 1:2 risk-reward minimum\n`;
      }
      if (avgConfidence < 6) {
        improvementPlan += `• **Confidence Issue:** Only trade when 8+/10 confident, practice with paper trading\n`;
      }
      if (consecutiveLosses > 2) {
        improvementPlan += `• **Psychology Issue:** Take a break, review your trading plan, avoid revenge trading\n`;
      }
      if (maxDD > totalTrades * 100) {
        improvementPlan += `• **Drawdown Issue:** Reduce position sizes and improve risk management\n`;
      }
      
      improvementPlan += `\n🚀 **30-DAY IMPROVEMENT CHALLENGE:**\n• Week 1: Paper trade only, focus on education\n• Week 2: Trade with 50% normal position size\n• Week 3: Trade with 75% normal position size\n• Week 4: Full position size if profitable\n\nRemember: Small improvements compound over time!`;
      
      return improvementPlan;
    }
    
    // Additional specific questions
    if (lowerQuestion.includes('drawdown') || lowerQuestion.includes('max loss') || lowerQuestion.includes('worst trade')) {
      const maxDD = userMetrics.maxDD;
      const totalPnL = userMetrics.totalPnL;
      const avgLoss = Math.abs(userMetrics.avgLoss);
      
      return `📉 **Drawdown Analysis**\n\n📊 **Your Drawdown Metrics:**\n• Maximum drawdown: ${peso(maxDD)}\n• Total P&L: ${peso(totalPnL)}\n• Average loss: ${peso(avgLoss)}\n• Drawdown %: ${((maxDD / Math.abs(totalPnL)) * 100).toFixed(1)}%\n\n🎯 **Drawdown Management:**\n1. **Set Limits** - Never exceed 10% account drawdown\n2. **Reduce Size** - Cut position sizes during drawdowns\n3. **Take Breaks** - Stop trading after 3+ consecutive losses\n4. **Review Strategy** - Analyze what's causing losses\n\n💡 **Recovery Plan:**\n• Reduce position sizes by 50%\n• Focus on high-probability setups only\n• Take partial profits at 1:1\n• Review your risk management rules\n\nProtect your capital - it's your most important asset!`;
    }
    
    if (lowerQuestion.includes('session') || lowerQuestion.includes('time') || lowerQuestion.includes('when to trade')) {
      const bySession = filtered.reduce((acc, trade) => {
        const session = trade.session;
        if (!acc[session]) acc[session] = { total: 0, pnl: 0, wins: 0 };
        acc[session].total++;
        acc[session].pnl += trade.pnl;
        if (trade.pnl > 0) acc[session].wins++;
        return acc;
      }, {});
      
      const bestSession = Object.entries(bySession)
        .filter(([_, data]) => data.total >= 2)
        .sort((a, b) => (b[1].pnl / b[1].total) - (a[1].pnl / a[1].total))[0];
      
      if (bestSession) {
        return `⏰ **Trading Session Analysis**\n\n📊 **Your Session Performance:**\n\n🥇 **BEST SESSION: "${bestSession[0]}"**\n• Total trades: ${bestSession[1].total}\n• Win rate: ${((bestSession[1].wins / bestSession[1].total) * 100).toFixed(1)}%\n• Total P&L: ${peso(bestSession[1].pnl)}\n• Average per trade: ${peso(bestSession[1].pnl / bestSession[1].total)}\n\n🎯 **Session Recommendations:**\n1. **Focus on "${bestSession[0]}"** - Your most profitable time\n2. **Avoid Weak Sessions** - Don't trade during poor performance\n3. **Plan Your Day** - Schedule trading during best sessions\n4. **Market Hours** - Trade when volume is highest\n\n💡 **Action Plan:**\n• Trade more during "${bestSession[0]}"\n• Reduce activity during weak sessions\n• Study what makes "${bestSession[0]}" successful\n• Consider different strategies for different sessions\n\nTime your trades for maximum profitability!`;
      } else {
        return `⏰ **Trading Session Optimization**\n\nI need more data to analyze your session performance.\n\n🎯 **Session Trading Tips:**\n1. **Asian Session** - Good for range trading\n2. **London Session** - High volatility, trend following\n3. **New York Session** - Best volume, breakout trading\n4. **Overlap Periods** - Highest volatility\n\n💡 **Best Practices:**\n• Trade during high volume hours\n• Avoid low liquidity periods\n• Focus on 1-2 sessions maximum\n• Track your performance by session\n\nFind your most profitable trading times!`;
      }
    }
    
    if (lowerQuestion.includes('confidence') || lowerQuestion.includes('sure') || lowerQuestion.includes('uncertain')) {
      const avgConfidence = userMetrics.avgConfidence;
      const totalTrades = userMetrics.totalTrades;
      const winRate = userMetrics.winRate * 100;
      
      return `🎯 **Confidence Analysis**\n\n📊 **Your Confidence Metrics:**\n• Average confidence: ${avgConfidence.toFixed(1)}/10\n• Total trades: ${totalTrades}\n• Win rate: ${winRate.toFixed(1)}%\n• Confidence vs Performance: ${avgConfidence > 7 && winRate > 60 ? 'Excellent match!' : 'Needs improvement'}\n\n🎯 **Confidence Building Plan:**\n1. **Education** - Learn more about your strategy\n2. **Practice** - Paper trade until confident\n3. **Preparation** - Analyze markets thoroughly\n4. **Experience** - Trade more to build confidence\n\n💡 **Confidence Rules:**\n• Only trade when 8+/10 confident\n• If unsure, don't trade\n• Better to miss a trade than take a bad one\n• Confidence comes from preparation\n\nBuild your confidence through knowledge and practice!`;
    }
    
    // Enhanced question-specific responses - No more default responses
    if (lowerQuestion.includes('what') || lowerQuestion.includes('how') || lowerQuestion.includes('why') || lowerQuestion.includes('when') || lowerQuestion.includes('where')) {
      // Question-based analysis
      const totalPnL = userMetrics.totalPnL;
      const winRate = userMetrics.winRate * 100;
      const profitFactor = userMetrics.profitFactor;
      const totalTrades = userMetrics.totalTrades;
      const maxDD = userMetrics.maxDD;
      
      if (lowerQuestion.includes('what') && (lowerQuestion.includes('best') || lowerQuestion.includes('good') || lowerQuestion.includes('working'))) {
        return `🎯 **Your Best Trading Performance Analysis**\n\n📊 **Current Performance Summary:**\n• Total P&L: ${peso(totalPnL)}\n• Win Rate: ${winRate.toFixed(1)}%\n• Profit Factor: ${profitFactor.toFixed(2)}\n• Total Trades: ${totalTrades}\n• Max Drawdown: ${peso(maxDD)}\n\n🏆 **What's Working Best:**\n${winRate > 60 ? '✅ Your win rate is strong - keep your current strategy!' : '⚠️ Your win rate needs improvement - focus on trade selection'}\n${profitFactor > 1.5 ? '✅ Your profit factor is excellent - you are managing risk well!' : '⚠️ Your profit factor needs work - improve your risk-reward ratios'}\n${totalPnL > 0 ? '✅ You are profitable overall - great job!' : '🚨 You are losing money - need immediate action'}\n\n💡 **Specific Recommendations:**\n${winRate < 50 ? '• Focus on better trade selection - wait for high-probability setups\n• Review your losing trades to find common patterns\n• Consider paper trading until you improve\n' : ''}${profitFactor < 1.2 ? '• Improve your risk-reward ratios - aim for 1:2 minimum\n• Cut losses faster and let winners run longer\n• Review your exit strategies\n' : ''}${maxDD > totalPnL * 0.2 ? '• Your drawdown is too high - reduce position sizes\n• Implement stricter risk management rules\n• Consider taking breaks after losses\n' : ''}Keep analyzing your data to find what works best for you!`;
      }
      
      if (lowerQuestion.includes('how') && (lowerQuestion.includes('make') || lowerQuestion.includes('earn') || lowerQuestion.includes('profit'))) {
        return `💰 **How to Make More Profits - Data-Driven Analysis**\n\n📊 **Your Current Profit Analysis:**\n• Total P&L: ${peso(totalPnL)}\n• Win Rate: ${winRate.toFixed(1)}%\n• Profit Factor: ${profitFactor.toFixed(2)}\n• Average Win: ${peso(userMetrics.avgWin)}\n• Average Loss: ${peso(userMetrics.avgLoss)}\n\n🎯 **Profit Optimization Strategy:**\n\n${winRate < 50 ? '**PRIORITY 1: Improve Win Rate**\n• Focus on quality over quantity - trade less, win more\n• Wait for high-probability setups only\n• Review your losing trades to find patterns\n• Consider paper trading until win rate improves\n\n' : ''}${profitFactor < 1.5 ? '**PRIORITY 2: Improve Risk-Reward**\n• Aim for 1:2 minimum risk-reward ratio\n• Cut losses at 1% risk, let winners run to 2%+ profit\n• Don\'t take profits too early on winning trades\n• Review your exit strategies\n\n' : ''}**PRIORITY 3: Position Sizing**\n• Use consistent position sizing (1-2% risk per trade)\n• Don\'t increase size after losses\n• Scale up only after consistent profits\n• Keep detailed records of position sizes\n\n💡 **Specific Actions:**\n1. **Analyze Your Best Trades** - What made them successful?\n2. **Study Your Worst Trades** - What went wrong?\n3. **Optimize Your Strategy** - Focus on what works\n4. **Practice Patience** - Wait for the best setups\n5. **Track Everything** - Use data to improve\n\nRemember: Consistent small profits beat occasional big wins!`;
      }
      
      if (lowerQuestion.includes('why') && (lowerQuestion.includes('losing') || lowerQuestion.includes('fail') || lowerQuestion.includes('wrong'))) {
        return `🔍 **Why You are Losing - Root Cause Analysis**\n\n📊 **Loss Analysis:**\n• Total P&L: ${peso(totalPnL)}\n• Win Rate: ${winRate.toFixed(1)}%\n• Consecutive Losses: ${userMetrics.consecutiveLosses}\n• Max Drawdown: ${peso(maxDD)}\n• Average Loss: ${peso(userMetrics.avgLoss)}\n\n🚨 **Primary Loss Causes:**\n\n${winRate < 40 ? '**MAJOR ISSUE: Poor Trade Selection**\n• You are taking too many low-probability trades\n• Not waiting for proper setups\n• Trading against the trend\n• FOMO (Fear of Missing Out) trades\n\n' : ''}${profitFactor < 1.0 ? '**MAJOR ISSUE: Poor Risk Management**\n• Risking too much per trade\n• Not cutting losses quickly enough\n• Taking profits too early\n• No clear exit strategy\n\n' : ''}${userMetrics.consecutiveLosses > 3 ? '**MAJOR ISSUE: Emotional Trading**\n• Revenge trading after losses\n• Increasing position size after losses\n• Abandoning your trading plan\n• Trading from emotions, not logic\n\n' : ''}💡 **Immediate Action Plan:**\n1. **STOP TRADING** - Take 1-2 weeks off\n2. **Review All Losing Trades** - Find common patterns\n3. **Fix Your Trading Plan** - Address the root causes\n4. **Paper Trade** - Practice without risk\n5. **Seek Help** - Consider a trading mentor\n\n🎯 **Recovery Strategy:**\n• Start with tiny position sizes\n• Only trade high-probability setups\n• Stick to your rules religiously\n• Focus on process, not profits\n• Build confidence slowly\n\nFix the root causes before trading again!`;
      }
      
      if (lowerQuestion.includes('when') && (lowerQuestion.includes('trade') || lowerQuestion.includes('enter') || lowerQuestion.includes('time'))) {
        return `⏰ **When to Trade - Optimal Timing Analysis**\n\n📊 **Your Trading Performance by Session:**\n• Total Trades: ${totalTrades}\n• Win Rate: ${winRate.toFixed(1)}%\n• Best Session: ${userMetrics.bestSession || 'Not enough data'}\n• Worst Session: ${userMetrics.worstSession || 'Not enough data'}\n\n🎯 **Optimal Trading Times:**\n\n**HIGH PROBABILITY TIMES:**\n• **London Session (8AM-12PM GMT)** - High volatility, clear trends\n• **New York Session (1PM-5PM GMT)** - Strong momentum, good liquidity\n• **Overlap Period (1PM-3PM GMT)** - Best volatility and liquidity\n\n**AVOID THESE TIMES:**\n• **Asian Session (11PM-8AM GMT)** - Low volatility, choppy price action\n• **News Events** - High volatility, unpredictable moves\n• **Friday Afternoon** - Low liquidity, unpredictable\n• **Holiday Periods** - Reduced liquidity\n\n💡 **Your Personal Trading Schedule:**\n${winRate > 60 ? '✅ Your win rate is good - maintain your current schedule' : '⚠️ Consider changing your trading times - current schedule may not be optimal'}\n\n🎯 **Recommended Schedule:**\n• **Monday-Friday: 8AM-12PM GMT** (London Session)\n• **Monday-Friday: 1PM-5PM GMT** (New York Session)\n• **Avoid: Weekends and major news events**\n• **Take breaks: Every 2-3 hours**\n\n⏰ **Time Management Tips:**\n• Set specific trading hours and stick to them\n• Don\'t trade outside your scheduled times\n• Take regular breaks to avoid fatigue\n• Plan your trades during non-trading hours\n• Review your performance by time of day\n\nConsistency in timing leads to consistency in profits!`;
      }
      
      // Generic question response
      return `🤔 **Question Analysis**\n\nI understand you are asking about: "${question}"\n\n📊 **Your Current Performance:**\n• Total P&L: ${peso(totalPnL)}\n• Win Rate: ${winRate.toFixed(1)}%\n• Profit Factor: ${profitFactor.toFixed(2)}\n• Total Trades: ${totalTrades}\n\n💡 **To give you the most specific answer, please ask more detailed questions like:**\n• "How can I improve my win rate from ${winRate.toFixed(1)}%?"\n• "What is causing my ${peso(totalPnL < 0 ? 'losses' : 'profits')}?"\n• "Why am I losing money on ${userMetrics.worstStrategy || 'my trades'}?"\n• "When is the best time for me to trade?"\n• "How should I manage my ${peso(maxDD)} drawdown?"\n\n🎯 **I can provide specific advice on:**\n• Risk management strategies\n• Entry and exit optimization\n• Psychology and emotional control\n• Strategy development\n• Performance analysis\n\nAsk me something specific about your trading, and I will give you targeted advice!`;
    }
    
    // If no specific question pattern is detected, provide contextual help
    const totalPnL = userMetrics.totalPnL;
    const winRate = userMetrics.winRate * 100;
    const profitFactor = userMetrics.profitFactor;
    
    return `🎯 **Contextual Trading Analysis**\n\n📊 **Your Current Status:**\n• Total P&L: ${peso(totalPnL)}\n• Win Rate: ${winRate.toFixed(1)}%\n• Profit Factor: ${profitFactor.toFixed(2)}\n\n${totalPnL < 0 ? '🚨 **URGENT: You are losing money!**\n\n**IMMEDIATE ACTIONS NEEDED:**\n1. **STOP TRADING** - Take a break immediately\n2. **Review Your Strategy** - Something is fundamentally wrong\n3. **Fix Risk Management** - You are risking too much\n4. **Paper Trade** - Practice without risk\n5. **Seek Help** - Consider a trading mentor\n\n**Do not continue losing money - fix the problems first!**' : winRate < 50 ? '⚠️ **CONCERN: Your win rate is low**\n\n**FOCUS ON:**\n• Better trade selection\n• Wait for high-probability setups\n• Review your losing trades\n• Improve your strategy\n• Consider paper trading\n\n**Quality over quantity - trade less, win more!**' : '✅ **GOOD: You are on the right track**\n\n**OPTIMIZE:**\n• Fine-tune your entries\n• Improve your exits\n• Scale up carefully\n• Document what works\n• Share your knowledge\n\n**Keep improving and stay disciplined!**'}\n\n💡 **Ask me specific questions about your trading for targeted advice!**`;
  };

  const handleAICoachQuestion = async (question) => {
    if (!question.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate AI response based on current metrics
    const userMetrics = {
      totalTrades: kpis.totalTrades,
      totalPnL: kpis.totalPnL,
      winRate: kpis.winRate,
      profitFactor: kpis.profitFactor,
      avgWin: kpis.avgWin,
      avgLoss: kpis.avgLoss,
      consecutiveLosses: kpis.consecutiveLosses,
      avgConfidence: kpis.avgConfidence,
      maxDD: kpis.maxDD
    };
    
    const aiResponse = generateAIResponse(question, userMetrics);
    
    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">AI Trading Coach</h3>
          <p className="text-gray-400 text-sm">Personalized advice based on your trading performance</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            <div>
              <h4 className="font-semibold text-white">Coach AL</h4>
              <p className="text-xs text-green-400">Online • Analyzing your performance</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {/* AI Welcome Message */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-700/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
              <p className="text-white text-sm leading-relaxed">
                👋 Hello! I'm Coach AL, your AI trading coach. I've analyzed your trading performance and I'm here to help you improve. Ask me anything about your trading - I'll give you personalized advice based on your actual data!
              </p>
              <span className="text-xs text-gray-400 mt-1 block">Just now</span>
            </div>
          </div>

          {/* Chat Messages */}
          {chatMessages.map((message) => (
            <div key={message.id} className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              {message.type === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`rounded-2xl px-4 py-3 max-w-md ${
                message.type === 'user' 
                  ? 'bg-blue-500/20 border border-blue-500/30 rounded-tr-sm' 
                  : 'bg-gray-700/50 rounded-tl-sm'
              }`}>
                <div className="text-white text-sm leading-relaxed whitespace-pre-line">
                  {message.content}
                </div>
                <span className="text-xs text-gray-400 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="bg-gray-800/50 px-6 py-4 border-t border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ask Coach AL anything..."
                className="w-full bg-gray-700/60 border border-gray-600/60 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const question = e.target.value.trim();
                    if (question) {
                      handleAICoachQuestion(question);
                      e.target.value = '';
                    }
                  }
                }}
              />
            </div>
            <button
              onClick={() => {
                const input = document.querySelector('input[placeholder*="Ask Coach AL"]');
                const question = input.value.trim();
                if (question) {
                  handleAICoachQuestion(question);
                  input.value = '';
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Ask Coach AL
            </button>
          </div>
          
          {/* Quick Question Buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleAICoachQuestion("How can I improve my win rate?")}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-600/30"
            >
              Win Rate
            </button>
            <button
              onClick={() => handleAICoachQuestion("How should I manage risk?")}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-600/30"
            >
              Risk Management
            </button>
            <button
              onClick={() => handleAICoachQuestion("What's my best strategy?")}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-600/30"
            >
              Best Strategy
            </button>
            <button
              onClick={() => handleAICoachQuestion("How can I improve my trading?")}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-600/30"
            >
              General Help
            </button>
            <button
              onClick={() => handleAICoachQuestion("What's causing my drawdowns?")}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-600/30"
            >
              Drawdowns
            </button>
            <button
              onClick={() => handleAICoachQuestion("When should I trade?")}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-600/30"
            >
              Best Time
            </button>
            <button
              onClick={() => handleAICoachQuestion("I'm losing confidence, help!")}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-600/30"
            >
              Psychology
            </button>
            <button
              onClick={() => handleAICoachQuestion("I'm feeling fear and anxiety when trading")}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-600/30"
            >
              Fear & Anxiety
            </button>
            <button
              onClick={() => handleAICoachQuestion("I'm being greedy and overconfident")}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-600/30"
            >
              Greed & Overconfidence
            </button>
            <button
              onClick={() => handleAICoachQuestion("I'm feeling stressed and frustrated")}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-600/30"
            >
              Stress & Frustration
            </button>
            <button
              onClick={() => handleAICoachQuestion("I'm revenge trading after losses")}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-600/30"
            >
              Revenge Trading
            </button>
            <button
              onClick={() => handleAICoachQuestion("How can I improve my profit factor?")}
              className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-600/30"
            >
              Profit Factor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
