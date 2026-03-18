import { useMemo } from "react"; 

import type { ShootingSession } from "../types"; 

 

export const useMatchStatistics = ( 

  sessions: ShootingSession[] 

) => { 

  return useMemo(() => { 

    if (!sessions || sessions.length === 0) { 

      return null; 

    } 

 

    const scores = sessions.map( 

      s => s.totalResult ?? 0 

    ); 

 

    if (scores.length === 0) { 

      return null; 

    } 

 

    const matchCount = scores.length; 

 

    const mean = 

      scores.reduce((a, b) => a + b, 0) / matchCount; 

 

    const variance = 

      scores.reduce( 

        (sum, val) => sum + Math.pow(val - mean, 2), 

        0 

      ) / matchCount; 

 

    const stdDev = Math.sqrt(variance); 

 

    // ✅ Weighted recent (više težine novijim mečevima) 

    const weightedRecent = 

      scores.reduce((sum, val, index) => { 

        const weight = index + 1; 

        return sum + val * weight; 

      }, 0) / 

      scores.reduce((sum, _, index) => sum + (index + 1), 0); 

 

    // ✅ Linear regression (trend) 

    const n = scores.length; 

    const xVals = scores.map((_, i) => i + 1); 

 

    const xMean = 

      xVals.reduce((a, b) => a + b, 0) / n; 

 

    const yMean = mean; 

 

    const numerator = xVals.reduce( 

      (sum, x, i) => 

        sum + (x - xMean) * (scores[i] - yMean), 

      0 

    ); 

 

    const denominator = xVals.reduce( 

      (sum, x) => sum + Math.pow(x - xMean, 2), 

      0 

    ); 

 

    const slope = 

      denominator !== 0 ? numerator / denominator : 0; 

 

    const predictedNext = 

      mean + slope * (n + 1 - xMean); 

 

    const best = Math.max(...scores); 

    const worst = Math.min(...scores); 

 

    return { 

      mean, 

      stdDev, 

      weightedRecent, 

      slope, 

      predictedNext, 

      best, 

      worst, 

      matchCount 

    }; 

  }, [sessions]); 

}; 