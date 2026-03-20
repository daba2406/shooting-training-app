import { useMemo } from "react"; 

import type { ShootingSession } from "../types"; 

 

export const usePressureAnalysis = ( 

  sessions: ShootingSession[] 

) => { 

  return useMemo(() => { 

    if (!sessions || sessions.length === 0) { 

      return null; 

    } 

 

    // Uzimamo samo qualification + completed 

    const matches = sessions;

 

    if (matches.length === 0) { 

      return null; 

    } 

 

    const pressureValues: number[] = []; 

 

    matches.forEach(session => { 

      // ✅ Skupljamo sve hitce iz svih serija 

      const allShots = 

        session.seriesList 

          ?.flatMap((series: any) => series.shots ?? []) ?? []; 

 

      // ✅ Mora imati barem 60 hitaca (standard match) 

if (allShots.length < 30) { 

  return; 

} 

 

const firstSegment = allShots.slice(0, 15); 

const lastSegment = allShots.slice(-15); 

 

const mean = (shots: any[]) => 

  shots.reduce((sum: number, s: any) => sum + (s.value ?? 0), 0) / 

  shots.length; 

 

const firstMean = mean(firstSegment); 

const lastMean = mean(lastSegment); 

 

const diffPerShot = lastMean - firstMean; 

 

      pressureValues.push(diffPerShot); 

    }); 

 

    if (pressureValues.length === 0) { 

      return null; 

    } 

 

    const pressureMean = 

      pressureValues.reduce((a, b) => a + b, 0) / 

      pressureValues.length; 

 

    const pressureBest = Math.max(...pressureValues); 

    const pressureWorst = Math.min(...pressureValues); 

 

    // ✅ ORIGINALNA LOGIKA BOJA 

    let pressureStatus = "Stabilan"; 

    let pressureColor = "#4caf50"; 

 

    if (pressureMean < -0.15) { 

      pressureStatus = "Veliki pad pod pritiskom"; 

      pressureColor = "#e53935"; 

    } else if (pressureMean < -0.05) { 

      pressureStatus = "Blagi pad pod pritiskom"; 

      pressureColor = "#ff7043"; 

    } 

 

    return { 

      pressureMean, 

      pressureBest, 

      pressureWorst, 

      pressureStatus, 

      pressureColor 

    }; 

  }, [sessions]); 

}; 