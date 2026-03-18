import { useMemo } from "react"; 

import type { ShootingSession } from "../types"; 

 

interface TransferMetrics { 

  hasQualification: boolean; 

  hasTraining: boolean; 

  qualificationMean: number; 

  trainingMean: number; 

  competitionGap: number; 

  avgSeriesConsistency: number; 

  gapStatus: string; 

  gapColor: string; 

} 

 

export const useTransferMetrics = ( 

  sessions: ShootingSession[], 

  analyticsMode: "qualification" | "training" 

): TransferMetrics => { 

  return useMemo(() => { 

    const qualificationMatches = sessions.filter( 

      s => s.mode === "qualification" && s.completed 

    ); 

 

    const trainingMatches = sessions.filter( 

      s => s.mode === "training" && s.completed 

    ); 

 

    const hasQualification = qualificationMatches.length > 0; 

    const hasTraining = trainingMatches.length > 0; 

 

    // ✅ Qualification mean 

    const qualificationMean = 

      hasQualification 

        ? qualificationMatches.reduce( 

            (sum, m) => sum + (m.totalResult ?? 0), 

            0 

          ) / qualificationMatches.length 

        : 0; 

 

    // ✅ Training mean 

    const trainingMean = 

      hasTraining 

        ? trainingMatches.reduce( 

            (sum, m) => sum + (m.totalResult ?? 0), 

            0 

          ) / trainingMatches.length 

        : 0; 

 

    // ✅ Competition gap 

    const competitionGap = 

      qualificationMean - trainingMean; 

 

    // ✅ Series consistency (RANGE, kao u originalu) 

    let avgSeriesConsistency = 0; 

 

    if (analyticsMode === "training" && hasTraining) { 

      const consistencyValues: number[] = []; 

 

      trainingMatches.forEach(session => { 

        const totals = session.seriesList.map( 

          s => s.total ?? 0 

        ); 

 

        if (totals.length === 0) return; 

 

        const range = 

          Math.max(...totals) - 

          Math.min(...totals); 

 

        consistencyValues.push(range); 

      }); 

 

      if (consistencyValues.length > 0) { 

        avgSeriesConsistency = 

          consistencyValues.reduce((a, b) => a + b, 0) / 

          consistencyValues.length; 

      } 

    } 

 

    // ✅ Gap status (realniji pragovi) 

    let gapStatus = "Stabilan transfer"; 

    let gapColor = "#4caf50"; 

 

    if (competitionGap < -2.0) { 

      gapStatus = "Značajan pad na takmičenju"; 

      gapColor = "#e53935"; 

    } else if (competitionGap < -1.0) { 

      gapStatus = "Blagi pad na takmičenju"; 

      gapColor = "#ff7043"; 

    } else if (competitionGap > 2.0) { 

      gapStatus = "Takmičenje bolje od treninga"; 

      gapColor = "#4caf50"; 

    } 

 

    return { 

      hasQualification, 

      hasTraining, 

      qualificationMean, 

      trainingMean, 

      competitionGap, 

      avgSeriesConsistency, 

      gapStatus, 

      gapColor 

    }; 

  }, [sessions, analyticsMode]); 

}; 