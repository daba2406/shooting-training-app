import { useMemo } from "react"; 

import type { ShootingSession } from "../types"; 

 

export const useFatigueDrift = ( 

  sessions: ShootingSession[] 

) => { 

  return useMemo(() => { 

 

    const calculateDriftForSession = ( 

      session: ShootingSession 

    ) => { 

 

      const allShots = 

        session.seriesList 

          ?.flatMap(series => series.shots ?? []) ?? []; 

          

 

      if (allShots.length < 10) return null; 

 

      const midpoint = Math.floor(allShots.length / 2); 

 

      const firstHalf = allShots.slice(0, midpoint); 

      const secondHalf = allShots.slice(midpoint); 

 

      const mean = (shots: typeof allShots) => 

        shots.reduce((sum, s) => sum + s.value, 0) / 

        shots.length; 

 

      const firstMean = mean(firstHalf); 

      const secondMean = mean(secondHalf); 

 

      return secondMean - firstMean; 

    }; 

 

    const trainingSessions = sessions.filter( 

      s => s.mode === "training" && s.completed 

    ); 

 

    const qualificationSessions = sessions.filter( 

      s => s.mode === "qualification" && s.completed 

    ); 

 

    const calculateAverage = (arr: number[]) => 

      arr.length > 0 

        ? parseFloat( 

            ( 

              arr.reduce((a, b) => a + b, 0) / 

              arr.length 

            ).toFixed(2) 

          ) 

        : 0; 

 

    const trainingDrift = calculateAverage( 

      trainingSessions 

        .map(calculateDriftForSession) 

        .filter((v): v is number => v !== null) 

    ); 

 

    const qualificationDrift = calculateAverage( 

      qualificationSessions 

        .map(calculateDriftForSession) 

        .filter((v): v is number => v !== null) 

    ); 

 

    return { 

      trainingDrift, 

      qualificationDrift 

    }; 

 

  }, [sessions]); 

}; 