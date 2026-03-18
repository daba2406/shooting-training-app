import { useMemo } from "react"; 

import type { ShootingSession } from "../types"; 

 

export const useVolatilityIndex = ( 

  sessions: ShootingSession[] 

) => { 

  return useMemo(() => { 

    if (!sessions || sessions.length === 0) { 

      return null; 

    } 

 

    const volatilityValues = sessions.map(session => { 

      const allShots = 

        session.seriesList 

          ?.flatMap(series => series.shots ?? []) ?? []; 

 

      if (allShots.length === 0) return 0; 

 

      const meanScore = 

        allShots.reduce((sum, shot) => sum + shot.value, 0) / 

        allShots.length; 

 

      const variance = 

        allShots.reduce((sum, shot) => sum + Math.pow(shot.value - meanScore, 2), 0) / 

        allShots.length; 

 

      return Math.sqrt(variance); 

    }); 

 

    const averageVolatility = 

      volatilityValues.reduce((a, b) => a + b, 0) / 

      volatilityValues.length; 

 

    return averageVolatility; 

  }, [sessions]); 

}; 