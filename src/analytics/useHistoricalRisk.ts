import { useMemo } from "react"; 

import type { ShootingSession } from "../types"; 

 

export const useHistoricalRisk = ( 

  sessions: ShootingSession[] 

) => { 

  return useMemo(() => { 

 

    const qualificationSessions = sessions.filter( 

      s => s.mode === "qualification" && s.completed 

    ); 

 

    if (qualificationSessions.length === 0) { 

      return { cascadeRisk: 0 }; 

    } 

 

    const cascadeValues = qualificationSessions.map(session => { 

 

      const allShots = 

        session.seriesList 

          ?.flatMap(series => series.shots ?? []) ?? []; 

 

      if (allShots.length < 5) return 0; 

 

      let dropCount = 0; 

      let cascadeCount = 0; 

 

      for (let i = 0; i < allShots.length - 2; i++) { 

 

        if (allShots[i].value <= 10.2) { 

 

          dropCount++; 

 

          const nextTwo = allShots.slice(i + 1, i + 3); 

 

          if (nextTwo.length === 2 && 

              nextTwo.every(s => s.value <= 10.2)) { 

            cascadeCount++; 

          } 

        } 

      } 

 

      return dropCount > 0 

        ? (cascadeCount / dropCount) * 100 

        : 0; 

 

    }); 

 

    const avgCascade = 

      cascadeValues.reduce((a, b) => a + b, 0) / 

      cascadeValues.length; 

 

    return { 

      cascadeRisk: avgCascade 

    }; 

 

  }, [sessions]); 

}; 