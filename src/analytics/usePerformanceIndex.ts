import { useMemo } from "react"; 

 

interface PTIInput { 

  hasQualification: boolean; 

  hasTraining: boolean; 

  competitionGap: number; 

  stdDev: number; 

  avgSeriesConsistency: number; 

  pressureMean: number; 

  analyticsMode: "qualification" | "training"; 

} 

 

export const usePerformanceIndex = ({ 

  hasQualification, 

  hasTraining, 

  competitionGap, 

  stdDev, 

  avgSeriesConsistency, 

  pressureMean, 

  analyticsMode 

}: PTIInput) => { 

  return useMemo(() => { 

    let pti = 0; 

    let ptiStatus = ""; 

    let ptiColor = "#aaa"; 

 

    if (hasQualification && hasTraining) { 

      // 1️⃣ Gap score 

      const gapScore = Math.max( 

        0, 

        1 - Math.abs(competitionGap) / 5 

      ); 

 

      // 2️⃣ Stability score 

      const stabilityScore = Math.max( 

        0, 

        1 - stdDev / 5 

      ); 

 

      // 3️⃣ Consistency score 

const consistencyScore = Math.max( 

  0, 

  1 - avgSeriesConsistency / 10 

); 

 

const pressureScore = Math.max( 

  0, 

  1 - Math.abs(pressureMean) 

); 

 

      pti = 

        0.5 * gapScore + 

        0.3 * stabilityScore + 

        0.1 * consistencyScore + 

        0.1 * pressureScore; 

 

      pti = Math.min(1, Math.max(0, pti)) * 100; 

 

      if (pti >= 80) { 

        ptiStatus = "Odličan transfer"; 

        ptiColor = "#4caf50"; 

      } else if (pti >= 65) { 

        ptiStatus = "Dobar transfer"; 

        ptiColor = "#8bc34a"; 

      } else if (pti >= 50) { 

        ptiStatus = "Umeren transfer"; 

        ptiColor = "#ff9800"; 

      } else { 

        ptiStatus = "Slab transfer"; 

        ptiColor = "#e53935"; 

      } 

    } 

 

    return { 

      pti, 

      ptiStatus, 

      ptiColor 

    }; 

  }, [ 

    hasQualification, 

    hasTraining, 

    competitionGap, 

    stdDev, 

    avgSeriesConsistency, 

    pressureMean, 

    analyticsMode 

  ]); 

}; 