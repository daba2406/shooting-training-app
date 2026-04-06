import type { ShootingSession } from "../types"; 
import { useMatchStatistics } from "../analytics/useMatchStatistics";
import { usePressureAnalysis } from "../analytics/usePressureAnalysis";
import { useMeanRadiusAnalysis } from "../analytics/useMeanRadiusAnalysis";
import { useVolatilityIndex } from "../analytics/useVolatilityIndex";
import { useTransferMetrics } from "../analytics/useTransferMetrics";
import { useRecoveryScore } from "../analytics/useRecoveryScore";
import { useFatigueDrift } from "../analytics/useFatigueDrift";
import { useFocusStability } from "../analytics/useFocusStability";
import { generateCoachingInsight } from "../analytics/useCoachingInsight";
import { useState} from "react";
import { useTranslation } from "react-i18next";

import { 

  LineChart, 

  Line, 

  XAxis, 

  YAxis, 

  CartesianGrid, 

  Tooltip, 

  ResponsiveContainer, 

  ReferenceLine 

} from "recharts"; 

import StatusWithHelp from "./StatusWithHelp";
 

interface Props { 

  sessions: ShootingSession[]; 

  onBack: () => void; 

} 

 function HeatmapCell({ 

  value, 

  tooltipText, 

  color 

}: { 

  value: number; 

  tooltipText: string; 

  color: string; 

}) { 

  const [hover, setHover] = useState(false); 

 

  return ( 

    <div 

      style={{ 

        backgroundColor: color, 

        padding: "6px", 

        textAlign: "center", 

        borderRadius: "4px", 

        fontSize: "12px", 

        position: "relative", 

        cursor: "help" 

      }} 

      onMouseEnter={() => setHover(true)} 

      onMouseLeave={() => setHover(false)} 

    > 

      {value.toFixed(1)} 

 

{hover && ( 

  <div 

    style={{ 

      position: "absolute", 

      bottom: "110%", 

      left: "0", 

      background: "#2a2a2a", 

      color: "white", 

      padding: "6px 8px", 

      borderRadius: "6px", 

      fontSize: "12px", 

      lineHeight: "1.3", 

      width: "130px", 

      boxShadow: "0 0 10px rgba(0,0,0,0.4)", 

      zIndex: 1000 

    }} 

  > 

    {tooltipText 

      .trim() 

      .split("\n") 

      .map((line, i) => ( 

        <div key={i} style={{ marginBottom: "2px" }}> 

          {line} 

        </div> 

      ))} 

  </div> 

)} 

    </div> 

  ); 

} 

export default function AnalyticsView({ sessions, onBack }: Props) { 

  const [analyticsMode, setAnalyticsMode] = useState< 

  "qualification" | "training" 

>("qualification"); 
const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null); 
const [selectedShooterQualification, setSelectedShooterQualification] = useState<string>("all"); 

const [selectedShooterTraining, setSelectedShooterTraining] = useState<string>("all"); 

const storedShooters = localStorage.getItem("shooters"); 

const shooters = storedShooters ? JSON.parse(storedShooters) : []; 
const { t } = useTranslation ();

const availableSessions = sessions 

  .filter(s => 

    s.mode === analyticsMode && 

    s.completed && 

    ( 

      analyticsMode === "qualification" 

        ? (selectedShooterQualification === "all" 

            ? true 

            : s.shooterName === selectedShooterQualification) 

        : (selectedShooterTraining === "all" 

            ? true 

            : s.shooterName === selectedShooterTraining) 

    ) 

  ) 

  .sort( 

    (a, b) => 

      new Date(b.date).getTime() - 

      new Date(a.date).getTime() 

  ); 

    // ✅ Филтрирамо само завршене qualification мечеве 

const selectedMatches = sessions 

  .filter(s => 

    s.mode === analyticsMode && 

    s.completed && 

    ( 

      analyticsMode === "qualification" 

        ? (selectedShooterQualification === "all" 

            ? true 

            : s.shooterName === selectedShooterQualification) 

        : (selectedShooterTraining === "all" 

            ? true 

            : s.shooterName === selectedShooterTraining) 

    ) 

  ) 

  .sort( 

    (a, b) => 

      new Date(a.date).getTime() - 

      new Date(b.date).getTime() 

  ); 
  if (!selectedMatches.length) { 

  return <div>{t("analytics.no_data")}</div>; 

} 


const qualificationMatchesAll = sessions.filter( 

  s => s.mode === "qualification" && s.completed 

); 

 

const trainingMatchesAll = sessions.filter( 

  s => s.mode === "training" && s.completed 

); 

const transferMetrics = useTransferMetrics( 

  sessions, 

  analyticsMode 

); 

 

const hasQualification = 

  transferMetrics.hasQualification; 

 

const hasTraining = 

  transferMetrics.hasTraining; 

 

const competitionGap = 

  transferMetrics.competitionGap; 

 const gapKey = transferMetrics.gapKey; 

const gapColor = transferMetrics.gapColor; 

const avgSeriesConsistency = 

  transferMetrics.avgSeriesConsistency; 



const meanRadiusStats = 

  useMeanRadiusAnalysis(selectedMatches); 

 

const meanRadiusAverage = 

  meanRadiusStats?.meanRadiusAverage ?? 0; 

 

const meanRadiusSlope = 

  meanRadiusStats?.meanRadiusSlope ?? 0; 

 

const meanRadiusCorrelation = 

  meanRadiusStats?.meanRadiusCorrelation ?? 0; 

 

const technicalKey = 

  meanRadiusStats?.technicalKey ?? "stable_group"; 

 

const technicalColor = 

  meanRadiusStats?.technicalColor ?? "#4caf50"; 

 

const meanRadiusChartData = 

  meanRadiusStats?.meanRadiusChartData ?? []; 

const pressureStats = usePressureAnalysis(selectedMatches); 

const pressureMean = pressureStats?.pressureMean ?? 0; 

const pressureBest = pressureStats?.pressureBest ?? 0; 

const pressureWorst = pressureStats?.pressureWorst ?? 0; 

const pressureKey = pressureStats?.pressureKey ?? "stable"; 

const pressureColor = pressureStats?.pressureColor ?? "#4caf50"; 

const volatilityIndex = 

  useVolatilityIndex(selectedMatches) ?? 0; 

let volatilityKey = "no_data"; 

let volatilityColor = "#aaa"; 

 

if (volatilityIndex < 0.5) { 

  volatilityKey = "very_stable"; 

  volatilityColor = "#4caf50"; 

} else if (volatilityIndex < 1) { 

  volatilityKey = "moderate"; 

  volatilityColor = "#ff9800"; 

} else { 

  volatilityKey = "unstable"; 

  volatilityColor = "#e53935"; 

} 


  const matchStats = useMatchStatistics(selectedMatches); 

 

if (!matchStats) { 

  return <div>No qualification data available</div>; 

} 



const { 

  mean, 

  stdDev, 

  weightedRecent, 

  slope, 

  predictedNext, 
  best,
  worst,
  matchCount 

} = matchStats; 

const focusSessions = 

  selectedSessionId === null 

    ? sessions 

    : sessions.filter(s => s.id === selectedSessionId); 

const recoveryData = useRecoveryScore(focusSessions); 
const { qualificationDrift } = useFatigueDrift(focusSessions); 

const { qualificationFocus, trainingFocus } = 

  useFocusStability(focusSessions); 

const { 

  recoveryTraining, 

  recoveryQualification, 

  // trainingImmediate, 

  qualificationImmediate, 

  // trainingDepth, 

  qualificationDepth,
  
  qualificationTempoZ,

  qualificationCascade

} = recoveryData; 

const mentalProfile = { 

  recovery: recoveryQualification, 

  cascade: qualificationCascade, 

  tempoZ: qualificationTempoZ, 

  fatigue: qualificationDrift, 

  focus: qualificationFocus, 

  closing: pressureMean, 

  trend: slope, 

  meanRadius: meanRadiusAverage, 

  volatility: volatilityIndex 

}; 


const coaching = generateCoachingInsight(mentalProfile); 


let tempoStatusKey = "stable"; 

let tempoColor = "#4caf50"; 

 

if (qualificationTempoZ > 0.5) { 

   tempoStatusKey = "slow_after_error"; 

  tempoColor = "#ff9800"; 

} else if (qualificationTempoZ < -0.5) { 

  tempoStatusKey = "fast_after_error"; 

  tempoColor = "#e53935"; 

} 

  // ✅ Recovery Status – Training 

let recoveryTrainingKey = "no_data"; 

let recoveryTrainingColor = "#aaa"; 

 

if (recoveryTraining >= 90) {
  
  recoveryTrainingKey = "elite"; 

  recoveryTrainingColor = "#4caf50";} 

else if (recoveryTraining >= 75) {

  recoveryTrainingKey = "stable_reset"; 

  recoveryTrainingColor = "#8bc34a";} 

else if (recoveryTraining >= 60)  {

  recoveryTrainingKey = "extended_drop"; 

  recoveryTrainingColor = "#ff9800";} 

 else if (recoveryTraining > 0)  {

  recoveryTrainingKey = "cascade_drop"; 

  recoveryTrainingColor = "#e53935";} 

 

// ✅ Recovery Status – Qualification 

let recoveryQualificationKey = "no_data"; 

let recoveryQualificationColor = "#aaa"; 

 

if (recoveryQualification >= 90) { 

  recoveryQualificationKey = "elite"; 

  recoveryQualificationColor = "#4caf50"; 

} else if (recoveryQualification >= 75) { 

  recoveryQualificationKey = "stable_reset"; 

  recoveryQualificationColor = "#8bc34a"; 

} else if (recoveryQualification >= 60) { 

  recoveryQualificationKey = "extended_drop"; 

  recoveryQualificationColor = "#ff9800"; 

} else if (recoveryQualification > 0) { 

  recoveryQualificationKey = "cascade_drop"; 

  recoveryQualificationColor = "#e53935"; 

} 

let fatigueKey = "stable_finish"; 

let fatigueColor = "#4caf50"; 

 

if ((qualificationDrift ?? 0) < -0.3) { 

  fatigueKey = "decline"; 

  fatigueColor = "#e53935"; 

} else if ((qualificationDrift ?? 0) > 0.3) { 

  fatigueKey = "growth"; 

  fatigueColor = "#8bc34a"; 

} 

let cascadeKey = "none"; 

let cascadeColor = "#4caf50"; 

 

if (qualificationCascade > 40) { 

  cascadeKey = "strong"; 

  cascadeColor = "#e53935"; 

} else if (qualificationCascade > 25) { 

  cascadeKey = "moderate"; 

  cascadeColor = "#ff9800"; 

} else if (qualificationCascade > 10) { 

  cascadeKey = "mild"; 

  cascadeColor = "#fbc02d"; 

} 

// ✅ Performance Transfer Index (PTI) 

 

let pti = 0; 

let ptiKey = "none"; 

let ptiColor = "#aaa"; 

 

if (hasQualification && hasTraining) { 

 

  const gapScore = Math.max( 

    0, 

    1 - Math.abs(competitionGap) / 5 

  ); 

 

  const stabilityScore = Math.max( 

    0, 

    1 - stdDev / 5 

  ); 

 

  const consistencyScore = 

    analyticsMode === "training" 

      ? Math.max(0, 1 - avgSeriesConsistency / 10) 

      : 1; 

 

  const pressureScore = 

    analyticsMode === "qualification" 

      ? Math.max(0, 1 - Math.abs(pressureMean)) 

      : 1; 

 

  pti = 

    0.5 * gapScore + 

    0.3 * stabilityScore + 

    0.1 * consistencyScore + 

    0.1 * pressureScore; 

 

  pti = Math.min(1, Math.max(0, pti)) * 100; 

 

  if (pti >= 80) { 

    ptiKey = "excellent"; 

    ptiColor = "#4caf50"; 

  } else if (pti >= 65) { 

    ptiKey = "good"; 

    ptiColor = "#8bc34a"; 

  } else if (pti >= 50) { 

    ptiKey = "moderate"; 

    ptiColor = "#ff9800"; 

  } else { 

    ptiKey = "weak"; 

    ptiColor = "#e53935"; 

  } 

} 


  // ✅ Heatmap матрица (Qualification only) 

 

let heatmapMatrix: number[][] = []; 

 

  heatmapMatrix = selectedMatches.map(match => 

    match.seriesList.map(series => series.total) 

  ); 

 

const seriesCount = 

  heatmapMatrix.length > 0 

    ? heatmapMatrix[0].length 

    : 0; 

// ✅ Просек по мечу (за tooltip) 

 

const matchMeans = selectedMatches.map(match => { 

  const totals = match.seriesList.map(s => s.total); 

  if (totals.length === 0) return 0; 

 

  return ( 

    totals.reduce((a, b) => a + b, 0) / 

    totals.length 

  ); 

}); 

// ✅ Боја за серију (фиксни праг) 

 

function getHeatmapColor(value: number) { 

  if (value >= 104.5) return "#4caf50"; // зелено 

  if (value >= 104.0) return "#fbc02d"; // жуто 

  return "#e53935"; // црвено 

} 

// ✅ Боја за појединачни погодак (shot-level) 

 

function getShotHeatmapColor(value: number) { 

  if (value >= 10.5) return "#4caf50"; // зелено 

  if (value > 10.3) return "#fbc02d"; // жуто 

  return "#e53935"; // црвено 

} 

  // ✅ Основна статистика 

const matchResults = selectedMatches.map( 

  s => s.totalResult ?? 0 

); 



// ✅ Shot-level agregatna matrica (6×10) 

 

type ShotCell = { 

  sum: number; 

  count: number; 

  min: number; 

  max: number; 

}; 

 

let shotMatrix: ShotCell[][] = []; 

 

if (analyticsMode === "qualification") { 

 

  // иницијализација 6×10 

  shotMatrix = Array.from({ length: 6 }, () => 

    Array.from({ length: 10 }, () => ({ 

      sum: 0, 

      count: 0, 

      min: Infinity, 

      max: -Infinity 

    })) 

  ); 

 

  selectedMatches.forEach(match => { 

    match.seriesList.forEach((series, sIndex) => { 

      series.shots.forEach((shot, hIndex) => { 

 

        if (sIndex < 6 && hIndex < 10) { 

          const cell = shotMatrix[sIndex][hIndex]; 

 

          cell.sum += shot.value; 

          cell.count += 1; 

          cell.min = Math.min(cell.min, shot.value); 

          cell.max = Math.max(cell.max, shot.value); 

        } 

 

      }); 

    }); 

  }); 

} 
 

// ✅ Матрица са агрегатним подацима 

 

type ShotAggregateCell = { 

  avg: number; 

  min: number; 

  max: number; 

  count: number; 

}; 

 

let shotAggregateMatrix: ShotAggregateCell[][] = []; 

 

if (analyticsMode === "qualification" && shotMatrix.length > 0) { 

  shotAggregateMatrix = shotMatrix.map(row => 

    row.map(cell => ({ 

      avg: cell.count > 0 ? cell.sum / cell.count : 0, 

      min: cell.count > 0 ? cell.min : 0, 

      max: cell.count > 0 ? cell.max : 0, 

      count: cell.count 

    })) 

  ); 

} 

// ✅ Транспонована агрегатна матрица (10×6) 

 

let shotAggregateMatrixT: ShotAggregateCell[][] = []; 

 

if (shotAggregateMatrix.length > 0) { 

  shotAggregateMatrixT = Array.from({ length: 10 }, (_, hitIndex) => 

    Array.from({ length: 6 }, (_, seriesIndex) => 

      shotAggregateMatrix[seriesIndex]?.[hitIndex] ?? { 

        avg: 0, 

        min: 0, 

        max: 0, 

        count: 0 

      } 

    ) 

  ); 

} 

// ✅ Dynamic Y axis domain 

 

const minScore = Math.min(...matchResults); 

const maxScore = Math.max(...matchResults); 

 

const yPadding = 2; // мало простора изнад и испод 

 

const yMin = Math.floor(minScore - yPadding); 

const yMax = Math.ceil(maxScore + yPadding); 


// const matchCount = matchResults.length; 

 

// const mean = 

  matchCount > 0 

    ? matchResults.reduce((a, b) => a + b, 0) / matchCount 

    : 0; 

 

// const best = 

  matchCount > 0 ? Math.max(...matchResults) : 0; 

 

// const worst = 

  matchCount > 0 ? Math.min(...matchResults) : 0; 



  // ✅ Стандардна девијација 

// const stdDev = 

  matchCount > 1 

    ? Math.sqrt( 

        matchResults.reduce((sum, value) => { 

          const diff = value - mean; 

          return sum + diff * diff; 

        }, 0) / 

        (matchCount - 1) 

      ) 

    : 0; 



// ✅ Shot timing data (Qualification only) 

 

let shotTimes: number[] = []; 

let shotValues: number[] = []; 

 

if (analyticsMode === "qualification") { 

  selectedMatches.forEach(match => { 

    match.seriesList.forEach(series => { 

      series.shots.forEach(shot => { 

        if (typeof shot.shotTime === "number") { 

          shotTimes.push(shot.shotTime); 

          shotValues.push(shot.value); 

        } 

      }); 

    }); 

  }); 

} 



// ✅ Просечно време и стандардна девијација времена 

 

let meanTime = 0; 

let stdDevTime = 0; 

 

if (shotTimes.length > 1) { 

  meanTime = 

    shotTimes.reduce((a, b) => a + b, 0) / 

    shotTimes.length; 

 

  const variance = 

    shotTimes.reduce((sum, value) => { 

      const diff = value - meanTime; 

      return sum + diff * diff; 

    }, 0) / 

    (shotTimes.length - 1); 

 

  stdDevTime = Math.sqrt(variance); 

} 

const earlyThreshold = meanTime - stdDevTime; 

const stableThreshold = meanTime + stdDevTime; 

let pearsonR = 0; 

 

if (shotTimes.length > 1) { 

  const meanValue = 

    shotValues.reduce((sum: number, v: number) => sum + v, 0) / 

    shotValues.length; 

 

  let numerator = 0; 

  let sumSqTime = 0; 

  let sumSqValue = 0; 

 

  for (let i = 0; i < shotTimes.length; i++) { 

    const timeDiff = shotTimes[i] - meanTime; 

    const valueDiff = shotValues[i] - meanValue; 

 

    numerator += timeDiff * valueDiff; 

    sumSqTime += timeDiff * timeDiff; 

    sumSqValue += valueDiff * valueDiff; 

  } 

 

  const denominator = Math.sqrt(sumSqTime * sumSqValue); 

 

  pearsonR = denominator !== 0 ? numerator / denominator : 0; 

} 

let correlationStrengthKey = "none"; 

let correlationDirectionKey = ""; 

let correlationColor = "#aaa"; 

 

const absR = Math.abs(pearsonR); 

 

// Jačina povezanosti 

if (absR < 0.2) { 

  correlationStrengthKey = "none"; 

} else if (absR < 0.4) { 

  correlationStrengthKey = "weak"; 

} else if (absR < 0.6) { 

  correlationStrengthKey = "moderate"; 

} else if (absR < 0.8) { 

  correlationStrengthKey = "strong"; 

} else { 

  correlationStrengthKey = "very_strong"; 

} 

 

// Smer 

if (pearsonR > 0.2) { 

  correlationDirectionKey = "positive"; 

  correlationColor = "#4caf50"; 

} else if (pearsonR < -0.2) { 

  correlationDirectionKey = "negative"; 

  correlationColor = "#f44336"; 

} else { 

  correlationDirectionKey = "neutral"; 

} 

const rSquared = pearsonR * pearsonR;
const explainedVariance = (rSquared * 100).toFixed(1);
// ✅ Линеарна регресија (trend) 

 

if (matchCount > 1) { 

  const xValues = matchResults.map((_, index) => index); 

  const yValues = matchResults; 

 

  const xMean = 

    xValues.reduce((a, b) => a + b, 0) / matchCount; 

 

  const yMean = mean; 

 

  let numerator = 0; 

  let denominator = 0; 

 

  for (let i = 0; i < matchCount; i++) { 

    numerator += 

      (xValues[i] - xMean) * (yValues[i] - yMean); 

    denominator += 

      (xValues[i] - xMean) * 

      (xValues[i] - xMean); 

  } 



} 

// ✅ Податак за графикон 


const chartData = selectedMatches.map((match, index) => { 

  const score = match.totalResult ?? 0; 

 

  const trendValue = 

    mean + slope * (index - (matchCount - 1) / 2); 

 

  return { 

    index: index + 1, 

    score, 

    trend: trendValue 

  }; 

}); 

// ✅ Weighted recent (последњих 5 мечева) 

 

const recentCount = Math.min(5, matchCount); 
 

if (recentCount > 0) { 

  const recentMatches = matchResults.slice(-recentCount); 

 

  let weightSum = 0; 

  let weightedSum = 0; 

 

  recentMatches.forEach((value, index) => { 

    const weight = index + 1; // 1,2,3,4,5 

    weightedSum += value * weight; 

    weightSum += weight; 

  }); 

 

 
} 


// ✅ Динамички bucket интервали 

 

let timeBuckets = { 

  fast: { min: 0, max: 0 }, 

  optimal: { min: 0, max: 0 }, 

  stable: { min: 0, max: 0 }, 

  slow: { min: 0, max: Infinity } 

}; 

 

if (shotTimes.length > 1) { 

  const lower = meanTime - stdDevTime; 

  const upper = meanTime + stdDevTime; 

 

  timeBuckets = { 

    fast: { min: 0, max: lower }, 

    optimal: { min: lower, max: meanTime }, 

    stable: { min: meanTime, max: upper }, 

    slow: { min: upper, max: Infinity } 

  }; 

} 

// ✅ Bucket анализа 

 

type BucketStats = { 

  count: number; 

  sum: number; 

}; 

 

let bucketStats: Record<string, BucketStats> = { 

  fast: { count: 0, sum: 0 }, 

  optimal: { count: 0, sum: 0 }, 

  stable: { count: 0, sum: 0 }, 

  slow: { count: 0, sum: 0 } 

}; 

 

if (analyticsMode === "qualification") { 

  selectedMatches.forEach(match => { 

    match.seriesList.forEach(series => { 

      series.shots.forEach(shot => { 

        const t = shot.shotTime ?? 0; 

        const v = shot.value; 

 

        if (t < timeBuckets.fast.max) { 

          bucketStats.fast.count++; 

          bucketStats.fast.sum += v; 

        } else if (t < timeBuckets.optimal.max) { 

          bucketStats.optimal.count++; 

          bucketStats.optimal.sum += v; 

        } else if (t < timeBuckets.stable.max) { 

          bucketStats.stable.count++; 

          bucketStats.stable.sum += v; 

        } else { 

          bucketStats.slow.count++; 

          bucketStats.slow.sum += v; 

        } 

      }); 

    }); 

  }); 

} 

const bucketAverages = { 

  fast: 

    bucketStats.fast.count > 0 

      ? bucketStats.fast.sum / bucketStats.fast.count 

      : 0, 

 

  optimal: 

    bucketStats.optimal.count > 0 

      ? bucketStats.optimal.sum / 

        bucketStats.optimal.count 

      : 0, 

 

  stable: 

    bucketStats.stable.count > 0 

      ? bucketStats.stable.sum / 

        bucketStats.stable.count 

      : 0, 

 

  slow: 

    bucketStats.slow.count > 0 

      ? bucketStats.slow.sum / bucketStats.slow.count 

      : 0 

}; 



// ✅ Нормална CDF апроксимација (без Math.erf) 

 

function normalCDF(x: number) { 

  const t = 1 / (1 + 0.2316419 * Math.abs(x)); 

  const d = 

    0.3989423 * 

    Math.exp((-x * x) / 2); 

 

  const probability = 

    d * 

    t * 

    (0.3193815 + 

      t * 

        (-0.3565638 + 

          t * 

            (1.781478 + 

              t * 

                (-1.821256 + 

                  t * 1.330274)))); 

 

  if (x > 0) { 

    return 1 - probability; 

  } else { 

    return probability; 

  } 

} 

// ✅ Предикција следећег резултата 



if (matchCount > 0) { 

 

} 

const lower68 = predictedNext - stdDev; 

const upper68 = predictedNext + stdDev; 

 

const lower95 = predictedNext - 2 * stdDev; 

const upper95 = predictedNext + 2 * stdDev; 




// ✅ Correlation status 

 

let correlationKey = "none"; 

correlationColor = "#aaa"; 

 

if (analyticsMode === "qualification") { 

  const r = meanRadiusCorrelation; 

  if (r <= -0.7) { 

    correlationKey = "very_strong_negative"; 

    correlationColor = "#4caf50"; 

  } else if (r <= -0.4) { 

    correlationKey = "moderate_negative"; 

    correlationColor = "#8bc34a"; 

  } else if (r < 0) { 

    correlationKey = "weak_negative"; 

    correlationColor = "#ff9800"; 

  } else if (r >= 0.4) { 

    correlationKey = "unexpected_positive"; 

    correlationColor = "#e53935"; 

  } else { 

    correlationKey = "insignificant"; 

    correlationColor = "#aaa"; 

  } 

} 

// ✅ Verovatnoća rezultata ≥ 630 

let probability630 = 0; 

if (stdDev > 0) { 

  const z = (630 - predictedNext) / stdDev; 

  probability630 = 1 - normalCDF(z); 

} 

const currentFocus = 

  analyticsMode === "qualification" 

    ? qualificationFocus 

    : trainingFocus; 

 

let focusKey = "stable"; 

let focusColor = "#4caf50"; 

 

if (currentFocus > 0.35) { 

  focusKey = "micro_instability"; 

  focusColor = "#ff9800"; 

} else if (currentFocus > 0.5) { 

  focusKey = "oscillation"; 

  focusColor = "#e53935"; 

} 

  return ( 


    <div className="app-container"
    style={{ overflowY: "auto"}}> 

      <div 

  style={{ 

    padding: "26px", 

    width: "100%", 

    color: "white", 

    display: "grid", 

    gridTemplateColumns: "1fr 1fr", 
    gridAutoRows: "min-content",

    gap: "20px" 

  }} 

> 
{/* ✅ AXIOM TOP BAR */} 

<div 

  className="app-topbar" 

  style={{ 

    gridColumn: "1 / -1",   // ✅ zauzima obe kolone 

    marginBottom: "10px" 

  }} 

> 

  <div className="app-topbar-brand"> 

    AXIOM <span className="app-topbar-tagline">| Precision Intelligence</span> 

  </div> 

</div> 

<div 

  style={{ 

    display: "flex", 

    justifyContent: "space-between", 

    alignItems: "center", 

    marginBottom: "20px" 

  }} 

> 


  <h2 style={{ margin: 0 }}> 

  {analyticsMode === "qualification" 

    ? t("analytics.qualification.title") 

    : t("analytics.training.title")} 

</h2> 

 

  <select 

    value={ 

      analyticsMode === "qualification" 

        ? selectedShooterQualification 

        : selectedShooterTraining 

    } 

    onChange={(e) => 

      analyticsMode === "qualification" 

        ? setSelectedShooterQualification(e.target.value) 

        : setSelectedShooterTraining(e.target.value) 

    } 

    style={{ 

      padding: "6px 10px", 

      borderRadius: "6px", 

      background: "#222", 

      color: "white", 

      border: "1px solid #444", 

      minWidth: "160px" 

    }} 

  > 

    <option value="all">{t("common.all_shooters")}</option> 

    {shooters.map((s: any) => ( 

      <option key={s.id} value={s.name}> 

        {s.name} 

      </option> 

    ))} 

  </select> 

</div> 
        

<div 

  style={{ 

    marginBottom: "20px", 

    display: "flex", 

    justifyContent: "space-between", 

    alignItems: "center" 

  }} 

> 

  <div style={{ display: "flex", gap: "10px" }}> 

    <button 

      onClick={() => setAnalyticsMode("qualification")} 

      style={{ 

        padding: "6px 12px", 

        background: 

          analyticsMode === "qualification" 

            ? "#4caf50" 

            : "#2a2a2a", 

        color: "white", 

        border: "none", 

        borderRadius: "6px", 

        cursor: "pointer" 

      }} 

    > 

      {t("analytics.qualification.button")}

    </button> 

 

    <button 

      onClick={() => setAnalyticsMode("training")} 

      style={{ 

        padding: "6px 12px", 

        background: 

          analyticsMode === "training" 

            ? "#4caf50" 

            : "#2a2a2a", 

        color: "white", 

        border: "none", 

        borderRadius: "6px", 

        cursor: "pointer" 

      }} 

    > 

      {t("analytics.training.button")}

    </button> 

  </div> 



 <div style={{ marginLeft: "auto" }}> 

  <label style={{ marginRight: "6px" }}> 

    {t("analytics.analysis")}

  </label> 

 

  <select 

    value={selectedSessionId ?? ""} 

    onChange={(e) => 

      setSelectedSessionId( 

        e.target.value === "" ? null : e.target.value 

      ) 

    } 

  > 

    <option value=""> 

      {t("analytics.all_matches")}

    </option> 

 

    {availableSessions.map(session => ( 

      <option key={session.id} value={session.id}> 

        {new Date(session.date).toLocaleDateString()} – {session.competitionName ?? "Trening"} 

      </option> 

    ))} 

  </select> 

</div> 

  <button 

    onClick={onBack} 

    style={{ 

      padding: "6px 12px", 

      background: "#2a2a2a", 

      color: "white", 

      border: "none", 

      borderRadius: "6px", 

      cursor: "pointer" 

    }} 

  > 

    {t("common.back")}

  </button> 


</div> 



 
<div 

  style={{ 

    background: "#1f1f1f", 

    padding: "20px", 

    borderRadius: "8px", 

    marginBottom: "14px", 

    color: "white" 

  }} 

> 

  <h3 style={{ marginBottom: "10px" }}> 

    {t("analytics.overview")}

  </h3> 

<div style={{ marginBottom: "10px" }}> 

  {t("analytics.match_count")} {matchCount} 

</div> 

 

<div style={{ marginBottom: "10px" }}> 

  {t("analytics.average")} {mean.toFixed(1)} 

</div> 
<div style={{ marginBottom: "10px" }}> 

  {t("analytics.best")} {best.toFixed(1)} 

</div> 
<div style={{ marginBottom: "10px" }}> 

  {t("analytics.worst")} {worst.toFixed(1)} 

</div> 

{qualificationMatchesAll.length > 0 && 

 trainingMatchesAll.length > 0 && ( 

  <div 

    style={{ 

      marginTop: "15px", 

      paddingTop: "10px", 

      borderTop: "1px solid #333" 

    }} 

  > 

    <div style={{ fontWeight: 600, marginBottom: "5px" }}> 

      {t("analytics.competition_gap")}

    </div> 

 

<div style={{ marginBottom: "5px" }}> 

  {t("analytics.gap_difference")}:{" "} 

  {competitionGap.toFixed(2)} 

</div> 

 

<div> 

<StatusWithHelp 

  label={t("analytics.status")} 

  status={t(`analytics.gap.${gapKey}`)} 

  color={gapColor} 

  description={t("analytics.gap_description")}

/>  

</div> 

  </div> 

)} 

{hasQualification && hasTraining && ( 

  <div 

    style={{ 

      marginTop: "20px", 

      paddingTop: "10px", 

      borderTop: "1px solid #333" 

    }} 

  > 

    <div style={{ fontWeight: 600, marginBottom: "5px" }}> 

      Performance Transfer Index 

    </div> 

 

    <div style={{ marginBottom: "5px" }}> 

      Vrednost: {pti.toFixed(1)} 

    </div> 

 

    <div> 

<StatusWithHelp 

  label={t("analytics.status")}

   

status={t(`analytics.pti.${ptiKey}`)}  

  color={ptiColor} 

  description={t("analytics.pti_description")} 

/>  

    </div> 

  </div> 

)} 

{analyticsMode === "training" && ( 

  <div style={{ marginTop: "10px" }}> 

    Prosečna razlika između serija:{" "} 

    {avgSeriesConsistency.toFixed(2)} 

  </div> 

)} 

  <h3 style={{ marginBottom: "10px" }}> 

    {t("analytics.prediction")}

  </h3> 

<div style={{ marginBottom: "10px", fontWeight: 600 }}> 

  {t("analytics.predicted_next")} {predictedNext.toFixed(1)} 

</div> 
<div style={{ marginBottom: "10px" }}> 

  {t("analytics.range_68")} {lower68.toFixed(1)} – {upper68.toFixed(1)} 

</div> 

<div style={{ marginBottom: "10px" }}> 

  {t("analytics.range_95")} {lower95.toFixed(1)} – {upper95.toFixed(1)} 

</div> 

<div style={{ marginBottom: "10px" }}> 

  {t("analytics.probability_630")} {(probability630 * 100).toFixed(1)}% 


</div> 
{analyticsMode === "qualification" && (
  <>

  <h3 style={{ marginBottom: "10px" }}> 

    {t("analytics.closing.title")} 

  </h3> 

 

<div style={{ marginBottom: "10px" }}> 

<StatusWithHelp 

  label={t("analytics.status")}

  status={t(`analytics.closing_status.${pressureKey}`)} 

  color={pressureColor} 

  description={t("analytics.closing.description")} 

/> 

</div> 

 
<div> 

  {t("analytics.closing.average")} {pressureMean.toFixed(2)} 

</div> 

 

<div> 

  {t("analytics.closing.best_growth")} +{pressureBest.toFixed(2)} 

</div> 

 

<div style={{ marginBottom: "10px" }}> 

  {t("analytics.closing.biggest_drop")} {pressureWorst.toFixed(2)} 

</div> 

<div style={{ marginBottom: "10px" }}> 

  <StatusWithHelp 

    label={`Focus Stability (${currentFocus.toFixed(2)})`} 

    status={t(`analytics.focus.${focusKey}`)} 

    color={focusColor} 

    description={t("analytics.focus.description")} 

  /> 

</div> 
</>
)}

</div>


<div 

  style={{ 

    background: "#1f1f1f", 

    padding: "20px", 

    borderRadius: "8px", 

    marginBottom: "14px", 

    color: "white" 

  }} 

> 

<div> 

  <StatusWithHelp 

    label="Volatility Index" 

    status={volatilityIndex.toFixed(2)} 

    color={volatilityColor} 

    description={t("analytics.volatility.description")} 
  /> 

  <p>{t("analytics.status")}: {t(`analytics.volatility.${volatilityKey}`)}</p> 

</div> 

<div style={{ marginTop: "20px" }}> 

  <h3 style={{ marginBottom: "10px" }}> 

    🧠 {t("analytics.mental.title")} 

  </h3> 

 <div 

  style={{ 

    display: "grid", 

    gridTemplateColumns: "1fr 1fr", 

    gap: "20px", 

    marginTop: "15px" 

  }} 

> 

  <div className="mental-card"> 

    <StatusWithHelp 

      label={`Recovery – Training (${recoveryTraining.toFixed(1)})`} 

      status={t(`analytics.recovery.${recoveryTrainingKey}`)} 

      color={recoveryTrainingColor} 

      description={t("analytics.mental.recovery_training_desc")}

    /> 

  </div> 

 

  <div className="mental-card"> 

    <StatusWithHelp 

      label={`Recovery – Qualification (${recoveryQualification.toFixed(1)})`} 

      status={t(`analytics.recovery.${recoveryQualificationKey}`)} 

      color={recoveryQualificationColor} 

      description={t("analytics.mental.recovery_qualification_desc")}

    /> 

    <div className="mental-details"> 

  <div> 

    {t("analytics.mental.immediate_recovery")} {qualificationImmediate.toFixed(1)}% 

  </div> 

 

  <div> 

    {t("analytics.mental.recovery_depth")} {qualificationDepth.toFixed(1)} 

  </div> 

  <StatusWithHelp 

  label={`Cascade (${qualificationCascade.toFixed(1)}%)`} 

  status={t(`analytics.cascade.${cascadeKey}`)} 

  color={cascadeColor} 

  description={t("analytics.mental.cascade_desc")}

/> 

</div> 


</div>

<div className="mental-card"> 

  <StatusWithHelp 

    label={`Tempo (${qualificationTempoZ.toFixed(2)})`} 

    status={t(`analytics.tempo.${tempoStatusKey}`)} 

    color={tempoColor} 

    description={t("analytics.mental.tempo_desc")}

  /> 

</div> 

<div className="mental-card"> 

  <StatusWithHelp 

    label={`Fatigue (${qualificationDrift.toFixed(2)})`} 

    status={t(`analytics.fatigue.${fatigueKey}`)} 

    color={fatigueColor} 

    description={t("analytics.mental.fatigue_desc")}

  /> 

</div> 

  </div> 

</div> 

<div style={{ marginTop: "25px" }}> 

  <h3 style={{ marginBottom: "10px" }}> 

    🎯 {t("analytics.coaching.title")}

  </h3> 

 

  <div 

    style={{ 

      background: "#1e1e1e", 

      padding: "14px", 

      borderRadius: "8px", 

      fontSize: "14px", 

      lineHeight: "1.6", 

      color: "#ccc" 

    }} 

  > 

    <strong>{t("analytics.coaching.insight_label")}</strong> 

    <div style={{ marginTop: "6px", marginBottom: "12px" }}> 

      {coaching.insightKeys.map((item, i) => ( 

  <div key={i}> 

    {t(`analytics.coaching.insight.${item.key}`, item.params)} 

  </div> 

))} 

    </div> 

 

    <strong>{t("analytics.coaching.recommendation_label")}</strong> 

    <div style={{ marginTop: "6px" }}> 

      {coaching.recommendationKeys.map((item, i) => ( 

  <div key={i}> 

    {t(`analytics.coaching.recommendation.${item.key}`, item.params)} 

  </div> 

))} 

    
    
    </div> 


  </div> 
<div style={{ marginTop: "20px" }}> 

  <h3 style={{ marginBottom: "10px" }}> 

    🧭 {t("analytics.coaching.composite_title")}

  </h3> 

 

  <div 

    style={{ 

      background: "#202020", 

      padding: "14px", 

      borderRadius: "8px", 

      fontSize: "14px", 

      lineHeight: "1.6", 

      color: "#ddd" 

    }} 

  > 

    {t(`analytics.coaching.composite.${coaching.compositeKey}`)}  

  </div> 

</div> 

</div> 

  <h3 style={{ marginBottom: "10px" }}> 

    {t("analytics.trend.title")}

  </h3> 

<div style={{ marginBottom: "10px" }}> 

  {t("analytics.trend.per_match")} {slope.toFixed(3)} 

</div> 

 <div style={{ marginBottom: "10px" }}> 

  {t("analytics.trend.std_dev")} {stdDev.toFixed(2)} 

</div> 
<div style={{ marginBottom: "10px" }}> 

  {t("analytics.trend.weighted_recent")} {weightedRecent.toFixed(1)} 

</div> 

<div style={{ width: "100%", height: 250, marginTop: "15px" }}> 

  <ResponsiveContainer> 

    <LineChart data={chartData}> 

      <CartesianGrid stroke="#333" strokeDasharray="3 3" /> 

      <XAxis dataKey="index" stroke="#ccc" /> 

      <YAxis 
        stroke="#ccc"
        domain={[yMin, yMax]} 
        /> 

      <Tooltip 

  formatter={(value: any) => 

    typeof value === "number" 

      ? value.toFixed(1) 

      : value 

  } 

/> 

      <ReferenceLine 

        y={mean} 

        stroke="#888" 

        strokeDasharray="5 5" 

      /> 

      <Line 

        type="monotone" 

        dataKey="score" 

        stroke="#4caf50" 

        strokeWidth={2} 

        dot={{ r: 4 }} 

      /> 

      <Line 

  type="monotone" 

  dataKey="trend" 

  stroke="#ff9800" 

  strokeWidth={2} 

  strokeDasharray="5 5" 

  dot={false} 

/> 

    </LineChart> 

  </ResponsiveContainer> 

</div> 

</div>

{analyticsMode === "qualification" && (

<div 

  style={{ 

    gridColumn: "1 / span 2", 

    background: "#1f1f1f", 

    padding: "5px", 

    borderRadius: "8px", 

    marginTop: "5px", 

    color: "white" 

  }} 

> 

  <h3 style={{ marginBottom: "10px" }}> 

    {t("analytics.technical.title")}

  </h3> 

 

  <div 

    style={{ 

      display: "grid", 

      gridTemplateColumns: "0.8fr 1.2fr", 

      gap: "20px", 

      alignItems: "center" 

    }} 

  > 

    {/* LEVA KOLONA – tekst */} 

    <div> 

      <div style={{ marginBottom: "8px" }}> 

<StatusWithHelp 

  label={t("analytics.status")}
  status={t(`analytics.technical_status.${technicalKey}`)} 

  color={technicalColor} 

  description={t("analytics.technical.mean_radius_desc")} 

/> 

      </div> 

 

      <div style={{ marginBottom: "6px" }}> 

        {t("analytics.technical.mean_radius")}{" "} 

        {meanRadiusAverage.toFixed(2)} mm 

      </div> 

 

      <div> 

        {t("analytics.technical.mean_radius_trend")}{" "} 

        {meanRadiusSlope.toFixed(4)} 

      </div> 

          {analyticsMode === "qualification" && ( 

  <div style={{ 
    marginTop: "10px", 
    paddingTop: "8px",
    borderTop: "1px solid #333"
  }}> 

    {t("analytics.technical.correlation_label")}{" "} 

    {meanRadiusCorrelation.toFixed(2)} 

  </div> 

)} 
<div style={{ marginTop: "4px" }}> 

    <StatusWithHelp 

  label="Status" 

  status={t(`analytics.correlation_strength.${correlationKey}`)} 

  color={correlationColor} 

  description={t("analytics.technical.correlation_desc")}
/> 

  </div> 

    </div> 

 

    {/* DESNA KOLONA – grafikon */} 

    <div style={{ width: "100%", height: 220 }}> 

      <ResponsiveContainer> 

        <LineChart data={meanRadiusChartData}> 

          <CartesianGrid 

            stroke="#333" 

            strokeDasharray="3 3" 

          /> 

          <XAxis 

            dataKey="index" 

            stroke="#ccc" 

          /> 

          <YAxis 

            stroke="#ccc" 

          /> 

          <Tooltip 

            formatter={(value) => 

              typeof value === "number" 

                ? value.toFixed(2) + " mm" 

                : value 

            } 

          /> 

          <Line 

            type="monotone" 

            dataKey="radius" 

            stroke="#00bcd4" 

            strokeWidth={2} 

            dot={{ r: 4 }} 

          /> 

        </LineChart> 

      </ResponsiveContainer> 

    </div> 
  

  </div> 

</div> 
)}

{analyticsMode === "qualification" && shotTimes.length > 0 && ( 

  <div 

    style={{ 

      gridColumn: "1 / span 2", 

      background: "#1f1f1f", 

      padding: "20px", 

      borderRadius: "8px", 

      marginTop: "10px", 

      color: "white" 

    }} 

  > 

    <h3 style={{ marginBottom: "12px" }}> 

      {t("analytics.timing.title")}

    </h3> 

 

    {/* Osnovna statistika vremena */} 

    <div style={{ marginBottom: "12px" }}> 

      <div>{t("analytics.timing.mean_time")} {meanTime.toFixed(2)} s</div> 

      <div>{t("analytics.timing.std_dev")} {stdDevTime.toFixed(2)} s</div> 

    </div> 

 

    <div 

      style={{ 

        borderTop: "1px solid #333", 

        paddingTop: "12px", 

        marginTop: "10px" 

      }} 

    > 

      <div style={{ fontWeight: 600, marginBottom: "8px" }}> 

        {t("analytics.timing.zone_performance")}

      </div> 

 

      <div style={{ display: "grid", gap: "6px" }}> 

  <div> 

    {t("analytics.timing.fast")} ({bucketStats.fast.count} {t("analytics.timing.shot_count_label")})  <br /> 

    <span style={{ color: "#aaa", fontSize: "0.9rem" }}> 

      &lt; {earlyThreshold.toFixed(2)} s 

    </span> 

    {" — "} 

    Prosek: {bucketAverages.fast.toFixed(2)} 

  </div> 

 

  <div> 

    {t("analytics.timing.optimal")} ({bucketStats.optimal.count} {t("analytics.timing.shot_count_label")})  <br /> 

    <span style={{ color: "#aaa", fontSize: "0.9rem" }}> 

      {earlyThreshold.toFixed(2)} – {meanTime.toFixed(2)} s 

    </span> 

    {" — "} 

    Prosek: {bucketAverages.optimal.toFixed(2)} 

  </div> 

 

  <div> 

    {t("analytics.timing.stable")} ({bucketStats.stable.count} {t("analytics.timing.shot_count_label")})  <br /> 

    <span style={{ color: "#aaa", fontSize: "0.9rem" }}> 

      {meanTime.toFixed(2)} – {stableThreshold.toFixed(2)} s 

    </span> 

    {" — "} 

    {t("analytics.timing.average_label")} {bucketAverages.stable.toFixed(2)} 

  </div> 

 

  <div> 

    {t("analytics.timing.slow")} ({bucketStats.slow.count} {t("analytics.timing.shot_count_label")})  <br /> 

    <span style={{ color: "#aaa", fontSize: "0.9rem" }}> 

      &gt; {stableThreshold.toFixed(2)} s 

    </span> 

    {" — "} 

    Prosek: {bucketAverages.slow.toFixed(2)} 

  </div> 

</div> 

<div 

  style={{ 

    marginTop: "20px", 

    paddingTop: "15px", 

    borderTop: "1px solid #333" 

  }} 

> 

  <div style={{ fontWeight: 600, marginBottom: "8px" }}> 

    {t("analytics.timing.correlation_title")}

  </div> 

 <div style={{ marginTop: "15px" }}> 

  

</div> 


<StatusWithHelp 

  label={`Pearson r = ${pearsonR.toFixed(3)}`} 

  status={t(`analytics.correlation_strength.${correlationStrengthKey}`)}  

  color={correlationColor} 

  description={ 

  t("analytics.timing.pearson_description") + 

  " " + 

  t(`analytics.timing.pearson_direction.${correlationDirectionKey}`) 

} 
/> 
 

  <div style={{ color: "#aaa", fontSize: "0.9rem" }}> 

    {t("analytics.timing.explained_variance")} {explainedVariance}% 

  </div> 

</div> 

    </div> 

  </div> 

)} 

{heatmapMatrix.length > 0 && ( 

  <div 

    style={{ 

      marginTop: "20px", 

      background: "#1f1f1f", 

      padding: "16px", 

      borderRadius: "8px", 

      color: "white" 

    }} 

  > 

    <h3 style={{ marginBottom: "15px" }}> 

      {t("analytics.heatmap.title")}

    </h3> 

 

    <div 

      style={{ 

        display: "grid", 

        gridTemplateColumns: `repeat(${seriesCount + 2}, 1fr)`, 

        gap: "6px" 

      }} 

    > 
   {/* Заглавље */} 

 

<div 

  style={{ 

    textAlign: "center", 

    fontWeight: 600, 

    fontSize: "12px" 

  }} 

> 

  {t("analytics.heatmap.date")}

</div> 

 

{Array.from({ length: seriesCount }).map((_, i) => ( 

  <div 

    key={`header-${i}`} 

    style={{ 

      textAlign: "center", 

      fontWeight: 600, 

      fontSize: "12px" 

    }} 

  > 

    S{i + 1} 

  </div> 

))} 

 

<div 

  style={{ 

    textAlign: "center", 

    fontWeight: 600, 

    fontSize: "12px" 

  }} 

> 

  {t("analytics.heatmap.total")}

</div> 

{heatmapMatrix.map((match, matchIndex) => ( 

  <> 

    {/* Datum */} 

    <div 

      style={{ 

        backgroundColor: "#2a2a2a", 

        padding: "8px", 

        textAlign: "center", 

        borderRadius: "4px", 

        fontSize: "12px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"

      }} 

    > 

      {new Date(selectedMatches[matchIndex].date) 

        .toLocaleDateString("sr-RS", { 

  day: "2-digit", 

  month: "2-digit", 

  year: "2-digit" 

}) }

    </div> 

 

    {/* Serije */} 

{match.map((seriesValue, seriesIndex) => { 

  const mean = matchMeans[matchIndex]; 

  const diff = seriesValue - mean; 

 

  const competitionName = 

    selectedMatches[matchIndex].competitionName; 

 

  return ( 

    <div 

      key={`${matchIndex}-${seriesIndex}`} 

      style={{ 

        backgroundColor: getHeatmapColor(seriesValue), 

        padding: "6px", 

        textAlign: "center", 

        borderRadius: "4px", 

        fontSize: "12px", 

        position: "relative", 

        cursor: "help" 

      }} 

      onMouseEnter={(e) => { 

        const tooltip = e.currentTarget.querySelector( 

          ".heatmap-tooltip" 

        ); 

        if (tooltip) { 

          (tooltip as HTMLElement).style.display = "block"; 

        } 

      }} 

      onMouseLeave={(e) => { 

        const tooltip = e.currentTarget.querySelector( 

          ".heatmap-tooltip" 

        ); 

        if (tooltip) { 

          (tooltip as HTMLElement).style.display = "none"; 

        } 

      }} 

    > 

      {seriesValue.toFixed(1)} 

 

      <div 

        className="heatmap-tooltip" 

        style={{ 

          display: "none", 

          position: "absolute", 

          bottom: "110%", 

          left: "0", 

          background: "#2a2a2a", 

          color: "white", 

          padding: "6px 8px", 

          borderRadius: "6px", 

          fontSize: "12px", 

          lineHeight: "1.3", 

          width: "220px", 

          boxShadow: "0 0 10px rgba(0,0,0,0.4)", 

          zIndex: 1000 

        }} 

      > 

        {competitionName && ( 

          <div style={{ fontWeight: 600, marginBottom: "4px" }}> 

            {competitionName} 

          </div> 

        )} 

<div> 

  {t("analytics.heatmap.date")}:{" "} 

  {new Date(selectedMatches[matchIndex].date) 

    .toLocaleDateString()} 

</div> 

 

<div> 

  {t("analytics.heatmap.series")}: {seriesIndex + 1} 

</div> 

 

<div> 

  {t("analytics.heatmap.result")}: {seriesValue.toFixed(1)} 

</div> 

        <div> 

          {t("analytics.heatmap.diff_from_mean")} {diff >= 0 ? "+" : ""} 

          {diff.toFixed(2)} 

        </div> 

      </div> 

    </div> 

  ); 

})} 



    {/* Ukupno */} 

    <div 

      style={{ 

        backgroundColor: "#2a2a2a", 

        padding: "6px", 

        textAlign: "center", 

        borderRadius: "4px", 

        fontSize: "12px", 

        fontWeight: 600 

      }} 

    > 

      {selectedMatches[matchIndex].totalResult.toFixed(1)} 

    </div> 

  </> 

))} 


    </div> 


  </div> 

)} 

{analyticsMode === "qualification" && shotAggregateMatrix.length > 0 && ( 

  <div style={{ marginTop: "30px" }}> 

    <h3 style={{ marginBottom: "15px" }}> 

      Shot Heatmap (6×10) 

    </h3> 

 

    {/* HEADER ROW */} 

    <div 

      style={{ 

        display: "grid", 

        gridTemplateColumns: "80px repeat(6, 1fr)", 

        gap: "6px" 

      }} 

    > 

      <div></div> 

      {Array.from({ length: 6 }).map((_, i) => ( 

        <div 

          key={`header-${i}`} 

          style={{ 

            textAlign: "center", 

            fontWeight: 600, 

            fontSize: "12px" 

          }} 

        > 

          S{i + 1} 

        </div> 

      ))} 

    </div> 

 

    {/* DATA ROWS */} 

    {shotAggregateMatrixT.map((row, hitIndex) => { 

  return ( 

    <div 

      key={hitIndex} 

      style={{ 

        display: "grid", 

        gridTemplateColumns: "80px repeat(6, 1fr)", 

        gap: "6px", 

        marginTop: "6px" 

      }} 

    > 

      {/* Row label */} 

      <div 

        style={{ 

          textAlign: "center", 

          fontWeight: 600, 

          fontSize: "12px", 

          background: "#2a2a2a", 

          borderRadius: "4px", 

          padding: "6px" 

        }} 

      > 

        H{hitIndex + 1} 

      </div> 

 

      {/* Cells */} 

      {row.map((cell, seriesIndex) => { 

        const rounded = parseFloat(cell.avg.toFixed(1)); 


const tooltipText = ` 

${t("analytics.heatmap.series")}: ${seriesIndex + 1} 

${t("analytics.heatmap.shot")}: ${hitIndex + 1} 

${t("analytics.heatmap.average")}: ${rounded} 

${t("analytics.heatmap.max")}: ${cell.max.toFixed(1)} 

${t("analytics.heatmap.min")}: ${cell.min.toFixed(1)} 

${t("analytics.heatmap.sample_count")}: ${cell.count} 

`; 

 

        return ( 

          <HeatmapCell 

            key={`${hitIndex}-${seriesIndex}`} 

            value={rounded} 

            tooltipText={tooltipText} 

            color={getShotHeatmapColor(rounded)} 

          /> 

        ); 

      })} 

    </div> 

  ); 

})} 

  </div> 

)} 

</div> 
      

 </div> 

 
  
  ); 

} 
