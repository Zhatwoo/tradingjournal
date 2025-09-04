'use client';

import { useMemo } from 'react';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function EquityCurve({ sortedTrades, windowWidth }) {
  // Calculate equity curve data
  const equityCurve = sortedTrades.reduce((acc, t, i) => {
    const previousEquity = acc[i - 1] || 0;
    const newEquity = previousEquity + (t.profit || 0);
    return [...acc, newEquity];
  }, []);

  const chartData = {
    labels: sortedTrades.map((t) => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: "Equity Growth",
        data: equityCurve,
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "#6366F1",
        tension: 0.3,
        pointBackgroundColor: "#6366F1",
        pointBorderColor: "#fff",
      },
    ],
  };

  const chartOptions = useMemo(() => {
    const isSmallScreen = windowWidth > 0 ? windowWidth < 768 : false;
    
    return {
      plugins: { 
        legend: { 
          display: true,
          labels: {
            color: '#ffffff',
            font: {
              size: isSmallScreen ? 10 : 12
            }
          }
        } 
      }, 
      responsive: true, 
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#ffffff',
            font: {
              size: isSmallScreen ? 10 : 12
            },
            maxTicksLimit: isSmallScreen ? 5 : 8,
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#ffffff',
            font: {
              size: isSmallScreen ? 10 : 12
            },
            maxTicksLimit: isSmallScreen ? 6 : 10
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    };
  }, [windowWidth]);

  return (
    <div className="mb-4 sm:mb-6 lg:mb-8">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
        Account Growth Equity Curve
      </h2>
      
      <div className="bg-gray-800/80 backdrop-blur-lg p-2 sm:p-3 lg:p-4 xl:p-6 rounded-xl shadow-lg border border-gray-700/50">
        <div className="h-48 sm:h-60 md:h-72 lg:h-80 xl:h-96">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
