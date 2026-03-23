import { useMemo } from "react"; 

import type { ShootingSession } from "../types"; 

 

export const useFocusStability = ( 

  sessions: ShootingSession[] 

) => { 

  return useMemo(() => { 

 

    const calculateForSession = (session: ShootingSession) => { 

 

      const allShots = 

        session.seriesList 

          ?.flatMap(series => series.shots ?? []) ?? []; 

 

      if (allShots.length < 5) return null; 

 

      const windowSize = 5; 

      const rollingStdValues: number[] = []; 

 

      for (let i = 0; i <= allShots.length - windowSize; i++) { 

 

        const window = allShots.slice(i, i + windowSize); 

 

        const mean = 

          window.reduce((sum, s) => sum + s.value, 0) / 

          window.length; 

 

        const variance = 

          window.reduce( 

            (sum, s) => 

              sum + Math.pow(s.value - mean, 2), 

            0 

          ) / window.length; 

 

        rollingStdValues.push(Math.sqrt(variance)); 

      } 

 

      const avgRollingStd = 

        rollingStdValues.reduce((a, b) => a + b, 0) / 

        rollingStdValues.length; 

 

      return avgRollingStd; 

    }; 

 

    const qualificationSessions = sessions.filter( 

      s => s.mode === "qualification" && s.completed 

    ); 

 

    const trainingSessions = sessions.filter( 

      s => s.mode === "training" && s.completed 

    ); 

 

    const calculateAverage = (arr: number[]) => 

      arr.length > 0 

        ? arr.reduce((a, b) => a + b, 0) / arr.length 

        : 0; 

 

    const qualificationFocus = calculateAverage( 

      qualificationSessions 

        .map(calculateForSession) 

        .filter((v): v is number => v !== null) 

    ); 

 

    const trainingFocus = calculateAverage( 

      trainingSessions 

        .map(calculateForSession) 

        .filter((v): v is number => v !== null) 

    ); 

 

    return { 

      qualificationFocus, 

      trainingFocus 

    }; 

 

  }, [sessions]); 

}; 