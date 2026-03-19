import { useMemo } from "react"; 

import type { ShootingSession } from "../types"; 

 

interface RecoveryResult { 

  score: number; 

  dropCount: number; 

  immediatePercent: number; 

  avgDepth: number; 

} 

 

export const useRecoveryScore = ( 

  sessions: ShootingSession[] 

) => { 

  return useMemo(() => { 

 

    const calculateRecoveryForSession = ( 

      session: ShootingSession 

    ): RecoveryResult | null => { 

 

      const allShots = 

        session.seriesList 

          ?.flatMap(series => series.shots ?? []) ?? []; 

 

      if (allShots.length < 5) return null; 

 

      const mean = 

        allShots.reduce((sum, shot) => sum + shot.value, 0) / 

        allShots.length; 

 

      const variance = 

        allShots.reduce( 

          (sum, shot) => 

            sum + Math.pow(shot.value - mean, 2), 

          0 

        ) / allShots.length; 

 

      const stdDev = Math.sqrt(variance); 

 

      const dropThreshold = mean - stdDev; 

      const recoveryThreshold = mean - 0.5 * stdDev; 

 

      let dropCount = 0; 

      let instantRecoveryCount = 0; 

      let totalRecoveryDepth = 0; 

 

      for (let i = 0; i < allShots.length - 2; i++) { 

 

        const currentShot = allShots[i]; 

 

        if (currentShot.value <= dropThreshold) { 

 

          dropCount++; 

 

          const nextShot = allShots[i + 1]; 

 

          // ✅ Immediate recovery 

          if (nextShot.value > currentShot.value) { 

            instantRecoveryCount++; 

          } 

 

          // ✅ Recovery depth 

          let depth = 0; 

 

          for (let j = i + 1; j < allShots.length; j++) { 

            depth++; 

 

            if (allShots[j].value >= recoveryThreshold) { 

              break; 

            } 

          } 

 

          totalRecoveryDepth += depth; 

        } 

      } 

 

      if (dropCount === 0) { 

        return { 

          score: 100, 

          dropCount: 0, 

          immediatePercent: 100, 

          avgDepth: 0 

        }; 

      } 

 

      const recoveryPercent = 

        (instantRecoveryCount / dropCount) * 100; 

 

      const avgDepth = 

        totalRecoveryDepth / dropCount; 

 

      const depthPenalty = Math.min(avgDepth * 5, 40); 

 

      const finalScore = 

        Math.max(0, recoveryPercent - depthPenalty); 

 

      return { 

        score: finalScore, 

        dropCount, 

        immediatePercent: recoveryPercent, 

        avgDepth 

      }; 

    }; 

 

    const trainingSessions = sessions.filter( 

      s => s.mode === "training" && s.completed 

    ); 

 

    const qualificationSessions = sessions.filter( 

      s => s.mode === "qualification" && s.completed 

    ); 

 

    const trainingResults = trainingSessions 

      .map(calculateRecoveryForSession) 

      .filter( 

        (v): v is RecoveryResult => v !== null 

      ); 

 

    const qualificationResults = qualificationSessions 

      .map(calculateRecoveryForSession) 

      .filter( 

        (v): v is RecoveryResult => v !== null 

      ); 

 

    const calculateAverage = (arr: number[]) => 

      arr.length > 0 

        ? parseFloat( 

            ( 

              arr.reduce((a, b) => a + b, 0) / 

              arr.length 

            ).toFixed(1) 

          ) 

        : 0; 

 

    const recoveryTraining = calculateAverage( 

      trainingResults.map(r => r.score) 

    ); 

 

    const recoveryQualification = calculateAverage( 

      qualificationResults.map(r => r.score) 

    ); 

 

    const trainingImmediate = calculateAverage( 

      trainingResults.map(r => r.immediatePercent) 

    ); 

 

    const qualificationImmediate = calculateAverage( 

      qualificationResults.map(r => r.immediatePercent) 

    ); 

 

    const trainingDepth = calculateAverage( 

      trainingResults.map(r => r.avgDepth) 

    ); 

 

    const qualificationDepth = calculateAverage( 

      qualificationResults.map(r => r.avgDepth) 

    ); 

 

    return { 

      recoveryTraining, 

      recoveryQualification, 

      trainingImmediate, 

      qualificationImmediate, 

      trainingDepth, 

      qualificationDepth 

    }; 

 

  }, [sessions]); 

}; 