import { useMemo } from "react"; 

import type { ShootingSession } from "../types"; 

 

interface LiveSignal { 

  type: "cascade" | "instability" | "tempo" | null; 

  severity: "low" | "medium" | "high" | null; 

  message: string | null; 

} 

 

export const useLiveMentalSignals = ( 

  session: ShootingSession | null 

): LiveSignal => { 

  return useMemo(() => { 

 

    if (!session) { 

      return { type: null, severity: null, message: null }; 

    } 

 

    const allShots = 

      session.seriesList 

        ?.flatMap(series => series.shots ?? []) ?? []; 

 

    if (allShots.length < 3) { 

      return { type: null, severity: null, message: null }; 

    } 

 

    // ✅ ---------------- CASCADE ---------------- 

 

    const lastFour = allShots.slice(-4); 

 

    let consecutiveLow = 0; 

 

    for (let i = lastFour.length - 1; i >= 0; i--) { 

      if (lastFour[i].value <= 10.2) { 

        consecutiveLow++; 

      } else { 

        break; 

      } 

    } 

 

    if (consecutiveLow >= 4) { 

      return { 

        type: "cascade", 

        severity: "high", 

        message: "Izražen serijski pad u toku" 

      }; 

    } 

 

    if (consecutiveLow === 3) { 

      return { 

        type: "cascade", 

        severity: "medium", 

        message: "Serijski pad u toku" 

      }; 

    } 

 

    // ✅ ---------------- INSTABILITY (5-shot avg) ---------------- 

 

    if (allShots.length >= 5) { 

 

      const lastFive = allShots.slice(-5); 

 

      const avg5 = 

        lastFive.reduce((sum, s) => sum + s.value, 0) / 5; 

 

      if (avg5 < 10.4) { 

        return { 

          type: "instability", 

          severity: "low", 

          message: "Nestabilna faza u toku" 

        }; 

      } 

    } 

 

    if (consecutiveLow === 2) { 

      return { 

        type: "cascade", 

        severity: "low", 

        message: "Rizik od kaskade" 

      }; 

    } 

 

    // ✅ ---------------- TEMPO (Dynamic Z-score) ---------------- 

 

    const tempoValues = allShots 

      .map(shot => shot.shotTime) 

      .filter((v): v is number => typeof v === "number"); 

 

    if (tempoValues.length >= 5) { 

 

      const sessionMeanTempo = 

        tempoValues.reduce((a, b) => a + b, 0) / 

        tempoValues.length; 

 

      const tempoVariance = 

        tempoValues.reduce( 

          (sum, value) => 

            sum + Math.pow(value - sessionMeanTempo, 2), 

          0 

        ) / tempoValues.length; 

 

      const sessionStdDevTempo = Math.sqrt(tempoVariance); 

 

      const lastThree = allShots.slice(-3); 

 

      const lastTempoValues = lastThree 

        .map(s => s.shotTime) 

        .filter((v): v is number => typeof v === "number"); 

 

      if (lastTempoValues.length === 3 && sessionStdDevTempo > 0) { 

 

        const lastTempoMean = 

          lastTempoValues.reduce((a, b) => a + b, 0) / 3; 

 

        const tempoZ = 

          (lastTempoMean - sessionMeanTempo) / 

          sessionStdDevTempo; 

 

        if (tempoZ > 1.5) { 

          return { 

            type: "tempo", 

            severity: "high", 

            message: "Tempo značajno produžen" 

          }; 

        } 

 

        if (tempoZ > 1.0) { 

          return { 

            type: "tempo", 

            severity: "medium", 

            message: "Tempo produžen u poslednjim hicima" 

          }; 

        } 

 

        if (tempoZ < -1.5) { 

          return { 

            type: "tempo", 

            severity: "high", 

            message: "Tempo značajno ubrzan" 

          }; 

        } 

 

        if (tempoZ < -1.0) { 

          return { 

            type: "tempo", 

            severity: "medium", 

            message: "Tempo ubrzan u poslednjim hicima" 

          }; 

        } 

      } 

    } 

 

    return { type: null, severity: null, message: null }; 

 

  }, [session]); 

}; 