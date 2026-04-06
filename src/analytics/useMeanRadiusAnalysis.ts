import { useMemo } from "react"; 

import type { ShootingSession } from "../types"; 

 

export const useMeanRadiusAnalysis = ( 

  sessions: ShootingSession[] 

) => { 

  return useMemo(() => { 

    if (!sessions || sessions.length === 0) { 

      return null; 

    } 

 

    const radiusValues: number[] = []; 

    const scoreValues: number[] = []; 

 

    sessions.forEach(session => { 

      const allShots = 

        session.seriesList 

          ?.flatMap(series => series.shots ?? []) ?? []; 

 

      if (allShots.length === 0) return; 

 

      // ✅ 1. CENTROID GRUPE 

      const avgX = 

        allShots.reduce( 

          (sum, shot) => sum + shot.x, 

          0 

        ) / allShots.length; 

 

      const avgY = 

        allShots.reduce( 

          (sum, shot) => sum + shot.y, 

          0 

        ) / allShots.length; 

 

      // ✅ 2. MEAN RADIUS U PX (OD CENTROIDA) 

      const meanRadiusPx = 

        allShots.reduce((sum, shot) => { 

          const dx = shot.x - avgX; 

          const dy = shot.y - avgY; 

          return sum + Math.sqrt(dx * dx + dy * dy); 

        }, 0) / allShots.length; 

 

      // ✅ 3. KONVERZIJA PX → MM 

      const visibleMm = 7.75; 

      const targetRadiusPx = 450 / 2 - 10; 

      const mmToPx = targetRadiusPx / visibleMm; 

      const pxToMm = 1 / mmToPx; 

 

      const meanRadiusMm = meanRadiusPx * pxToMm; 

 

      radiusValues.push(meanRadiusMm); 

      scoreValues.push(session.totalResult ?? 0); 

    }); 

 

    if (radiusValues.length === 0) { 

      return null; 

    } 

 

    const count = radiusValues.length; 

 

    const meanRadiusAverage = 

      radiusValues.reduce((a, b) => a + b, 0) / count; 

 

    // ✅ TREND (linear regression) 

    const xVals = radiusValues.map((_, i) => i + 1); 

    const xMean = 

      xVals.reduce((a, b) => a + b, 0) / count; 

 

    const yMean = meanRadiusAverage; 

 

    const numerator = xVals.reduce( 

      (sum, x, i) => 

        sum + (x - xMean) * (radiusValues[i] - yMean), 

      0 

    ); 

 

    const denominator = xVals.reduce( 

      (sum, x) => sum + Math.pow(x - xMean, 2), 

      0 

    ); 

 

    const meanRadiusSlope = 

      denominator !== 0 ? numerator / denominator : 0; 

 

    // ✅ KORELACIJA 

    const scoreMean = 

      scoreValues.reduce((a, b) => a + b, 0) / 

      scoreValues.length; 

 

    const correlationNumerator = radiusValues.reduce( 

      (sum, radius, i) => 

        sum + 

        (radius - meanRadiusAverage) * 

          (scoreValues[i] - scoreMean), 

      0 

    ); 

 

    const radiusStd = Math.sqrt( 

      radiusValues.reduce( 

        (sum, r) => 

          sum + Math.pow(r - meanRadiusAverage, 2), 

        0 

      ) 

    ); 

 

    const scoreStd = Math.sqrt( 

      scoreValues.reduce( 

        (sum, s) => 

          sum + Math.pow(s - scoreMean, 2), 

        0 

      ) 

    ); 

 

    const meanRadiusCorrelation = 

      radiusStd !== 0 && scoreStd !== 0 

        ? correlationNumerator / 

          (radiusStd * scoreStd) 

        : 0; 

 

    const meanRadiusChartData = radiusValues.map( 

      (value, index) => ({ 

        index: index + 1, 

        radius: value 

      }) 

    ); 

 

let technicalKey = "stable_group"; 

let technicalColor = "#4caf50"; 

 

if (meanRadiusCorrelation > 0.3) { 

  technicalKey = "unstable_technique"; 

  technicalColor = "#e53935"; 

} 

 

    return { 

      meanRadiusAverage, 

      meanRadiusSlope, 

      meanRadiusCorrelation, 

      technicalKey, 

      technicalColor, 

      meanRadiusChartData 

    }; 

  }, [sessions]); 

}; 