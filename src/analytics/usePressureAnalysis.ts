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

      if (allShots.length < 60) { 

        return; 

      } 

 

      const first30 = allShots 

        .slice(0, 30) 

        .reduce((sum: number, shot: any) => { 

          return sum + (shot.value ?? 0); 

        }, 0); 

 

      const last30 = allShots 

        .slice(30, 60) 

        .reduce((sum: number, shot: any) => { 

          return sum + (shot.value ?? 0); 

        }, 0); 

 

      // ✅ IDENTIČNO STAROJ LOGICI 

      const diffPerShot = (last30 - first30) / 30; 

 

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