import type { ShootingSession } from "../types"; 

import { useState} from "react";

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

    // ✅ Филтрирамо само завршене qualification мечеве 

const selectedMatches = sessions 

  .filter( 

    s => 

      s.mode === analyticsMode && 

      s.completed 

  ) 

  .sort( 

    (a, b) => 

      new Date(a.date).getTime() - 

      new Date(b.date).getTime() 

  ); 

  

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

// ✅ Series consistency (Training only) 

 

let seriesConsistencyValues: number[] = []; 

 

if (analyticsMode === "training") { 

  seriesConsistencyValues = selectedMatches.map(match => { 

    const totals = match.seriesList.map(s => s.total); 

 

    if (totals.length === 0) return 0; 

 

    return Math.max(...totals) - Math.min(...totals); 

  }); 

} 

 

let avgSeriesConsistency = 0; 

 

if (seriesConsistencyValues.length > 0) { 

  avgSeriesConsistency = 

    seriesConsistencyValues.reduce((a, b) => a + b, 0) / 

    seriesConsistencyValues.length; 

} 

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

// ✅ Pressure Index по мечу (30 vs 30) 

 

const pressureValues = selectedMatches.map(match => { 

  const shots = match.seriesList 

    .flatMap(series => series.shots) 

    .sort((a, b) => (a.matchTime ?? 0) - (b.matchTime ?? 0)); 

 

  if (shots.length < 60) return 0; 

 

  const first30 = shots.slice(0, 30); 

  const last30 = shots.slice(30, 60); 

 

  const avgFirst = 

    first30.reduce((sum, s) => sum + s.value, 0) / 30; 

 

  const avgLast = 

    last30.reduce((sum, s) => sum + s.value, 0) / 30; 

 

  return avgLast - avgFirst; 

}); 

let pressureMean = 0; 

let pressureBest = 0; 

let pressureWorst = 0; 

 

if (pressureValues.length > 0) { 

  pressureMean = 

    pressureValues.reduce((a, b) => a + b, 0) / 

    pressureValues.length; 

 

  pressureBest = Math.max(...pressureValues); 

  pressureWorst = Math.min(...pressureValues); 

} 

// ✅ Pressure Status interpretacija 

 

let pressureStatus = "Stabilan"; 

let pressureColor = "#4caf50"; // neutral 

 

if (pressureMean > 0.15) { 

  pressureStatus = "Jak finiš"; 

  pressureColor = "#4caf50"; 

} else if (pressureMean > 0.05) { 

  pressureStatus = "Blago jači završetak"; 

  pressureColor = "#8bc34a"; 

} else if (pressureMean < -0.15) { 

  pressureStatus = "Izražen pad pod pritiskom"; 

  pressureColor = "#e53935"; 

} else if (pressureMean < -0.05) { 

  pressureStatus = "Blagi pad pod pritiskom"; 

  pressureColor = "#ff7043"; 

} 

const matchCount = matchResults.length; 

 

const mean = 

  matchCount > 0 

    ? matchResults.reduce((a, b) => a + b, 0) / matchCount 

    : 0; 

 

const best = 

  matchCount > 0 ? Math.max(...matchResults) : 0; 

 

const worst = 

  matchCount > 0 ? Math.min(...matchResults) : 0; 

  // ✅ Mean Radius по мечу 

 

const meanRadiusPerMatch = selectedMatches.map(match => { 

  const shots = match.seriesList.flatMap(series => series.shots); 

 

  if (shots.length < 2) return 0; 

 

  const avgX = 

    shots.reduce((sum, s) => sum + s.x, 0) / shots.length; 

 

  const avgY = 

    shots.reduce((sum, s) => sum + s.y, 0) / shots.length; 

 

const totalDistancePx = shots.reduce((sum, shot) => { 

  const dx = shot.x - avgX; 

  const dy = shot.y - avgY; 

  return sum + Math.sqrt(dx * dx + dy * dy); 

}, 0); 

 

const meanRadiusPx = totalDistancePx / shots.length; 

 

// ✅ Конверзија у mm (исто као у App.tsx) 

const visibleMm = 7.75; 

const radius = 450 / 2 - 10; 

const mmToPx = radius / visibleMm; 

const pxToMm = 1 / mmToPx; 

 

const meanRadiusMm = meanRadiusPx * pxToMm; 

 

return meanRadiusMm; 

}); 

// ✅ Chart data за Mean Radius 

const meanRadiusChartData = meanRadiusPerMatch.map( 

  (radius, index) => ({ 

    index: index + 1, 

    radius: radius 

  }) 

); 

// ✅ Просек Mean Radius 

 

let meanRadiusAverage = 0; 

 

if (meanRadiusPerMatch.length > 0) { 

  meanRadiusAverage = 

    meanRadiusPerMatch.reduce((a, b) => a + b, 0) / 

    meanRadiusPerMatch.length; 

} 

// ✅ Trend Mean Radius 

 

let meanRadiusSlope = 0; 

 

if (meanRadiusPerMatch.length > 1) { 

  const xValues = meanRadiusPerMatch.map((_, index) => index); 

  const yValues = meanRadiusPerMatch; 

 

  const xMean = 

    xValues.reduce((a, b) => a + b, 0) / 

    xValues.length; 

 

  const yMean = 

    yValues.reduce((a, b) => a + b, 0) / 

    yValues.length; 

 

  let numerator = 0; 

  let denominator = 0; 

 

  for (let i = 0; i < yValues.length; i++) { 

    numerator += 

      (xValues[i] - xMean) * 

      (yValues[i] - yMean); 

 

    denominator += 

      (xValues[i] - xMean) * 

      (xValues[i] - xMean); 

  } 

 

  meanRadiusSlope = 

    denominator !== 0 ? numerator / denominator : 0; 

} 

// ✅ Technical Status (Mean Radius trend) 

 

let technicalStatus = "Stabilno"; 

let technicalColor = "#4caf50"; // зелено као позитивно/стабилно 

 

if (meanRadiusSlope < -0.01) { 

  technicalStatus = "Poboljšanje grupe"; 

  technicalColor = "#4caf50"; // зелено 

} else if (meanRadiusSlope > 0.01) { 

  technicalStatus = "Pogoršanje grupe"; 

  technicalColor = "#e53935"; // црвено 

} else { 

  technicalStatus = "Stabilno"; 

  technicalColor = "#4caf50"; // стабилно је позитивно 

} 

// ✅ Correlation: Mean Radius vs Qualification Score 

 

let meanRadiusCorrelation = 0; 

 

if ( 

  analyticsMode === "qualification" && 

  meanRadiusPerMatch.length > 1 

) { 

  const scores = selectedMatches.map( 

    m => m.totalResult ?? 0 

  ); 

 

  meanRadiusCorrelation = pearsonCorrelation( 

    meanRadiusPerMatch, 

    scores 

  ); 

} 

  // ✅ Стандардна девијација 

const stdDev = 

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

let correlationStrength = ""; 

let correlationDirection = ""; 

let correlationColor = "#aaa"; 

 

const absR = Math.abs(pearsonR); 

 

// Jačina povezanosti 

if (absR < 0.2) { 

  correlationStrength = "Bez značajne povezanosti"; 

} else if (absR < 0.4) { 

  correlationStrength = "Slaba povezanost"; 

} else if (absR < 0.6) { 

  correlationStrength = "Umerena povezanost"; 

} else if (absR < 0.8) { 

  correlationStrength = "Jaka povezanost"; 

} else { 

  correlationStrength = "Veoma jaka povezanost"; 

} 

 

// Smer 

if (pearsonR > 0.2) { 

  correlationDirection = "Duže ciljanje je povezano sa boljim rezultatom."; 

  correlationColor = "#4caf50"; 

} else if (pearsonR < -0.2) { 

  correlationDirection = "Duže ciljanje je povezano sa padom rezultata."; 

  correlationColor = "#f44336"; 

} else { 

  correlationDirection = "Vreme opaljenja nema jasan uticaj na rezultat."; 

} 

const rSquared = pearsonR * pearsonR;
const explainedVariance = (rSquared * 100).toFixed(1);
// ✅ Линеарна регресија (trend) 

 

let slope = 0; 

 

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

 

  slope = 

    denominator !== 0 ? numerator / denominator : 0; 

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

 

let weightedRecent = 0; 

 

if (recentCount > 0) { 

  const recentMatches = matchResults.slice(-recentCount); 

 

  let weightSum = 0; 

  let weightedSum = 0; 

 

  recentMatches.forEach((value, index) => { 

    const weight = index + 1; // 1,2,3,4,5 

    weightedSum += value * weight; 

    weightSum += weight; 

  }); 

 

  weightedRecent = weightedSum / weightSum; 

} 

// ✅ Competition Gap 

 

const qualificationMatchesAll = sessions.filter( 

  s => s.mode === "qualification" && s.completed 

); 

 

const trainingMatchesAll = sessions.filter( 

  s => s.mode === "training" && s.completed 

); 

 

const qualificationMean = 

  qualificationMatchesAll.length > 0 

    ? qualificationMatchesAll.reduce( 

        (sum, s) => sum + (s.totalResult ?? 0), 

        0 

      ) / qualificationMatchesAll.length 

    : 0; 

 

const trainingMean = 

  trainingMatchesAll.length > 0 

    ? trainingMatchesAll.reduce( 

        (sum, s) => sum + (s.totalResult ?? 0), 

        0 

      ) / trainingMatchesAll.length 

    : 0; 

 

let competitionGap = 0; 

let gapStatus = "Odličan transfer"; 

let gapColor = "#4caf50"; 

 

if (competitionGap < -1.0) { 

  gapStatus = "Značajan pad na takmičenju"; 

  gapColor = "#e53935"; 

} else if (competitionGap < -0.3) { 

  gapStatus = "Blagi pad na takmičenju"; 

  gapColor = "#ff7043"; 

} else if (competitionGap > 1.0) { 

  gapStatus = "Takmičenje bolje od treninga"; 

  gapColor = "#4caf50"; 

} 
 

if ( 

  qualificationMatchesAll.length > 0 && 

  trainingMatchesAll.length > 0 

) { 

  competitionGap = qualificationMean - trainingMean; 

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

 

let predictedNext = 0; 

 

if (matchCount > 0) { 

  predictedNext = 

    0.6 * weightedRecent + 

    0.4 * mean + 

    slope; 

} 

const lower68 = predictedNext - stdDev; 

const upper68 = predictedNext + stdDev; 

 

const lower95 = predictedNext - 2 * stdDev; 

const upper95 = predictedNext + 2 * stdDev; 

// ✅ Performance Transfer Index (PTI) 

 

let pti = 0; 

let ptiStatus = ""; 

let ptiColor = "#aaa"; 

 

const hasQualification = qualificationMatchesAll.length > 0; 

const hasTraining = trainingMatchesAll.length > 0; 

 

if (hasQualification && hasTraining) { 

 

  // 1️⃣ Gap score (основа) 

  const gapScore = Math.max( 

    0, 

    1 - Math.abs(competitionGap) / 5 

  ); 

 

  // 2️⃣ Stability score 

  const stabilityScore = Math.max( 

    0, 

    1 - stdDev / 5 

  ); 

 

  // 3️⃣ Series consistency score (ако постоји) 

  const consistencyScore = 

    analyticsMode === "training" 

      ? Math.max(0, 1 - avgSeriesConsistency / 10) 

      : 1; 

 

  // 4️⃣ Pressure score (ако постоји) 

  const pressureScore = 

    analyticsMode === "qualification" 

      ? Math.max(0, 1 - Math.abs(pressureMean)) 

      : 1; 

 

  // Комбиновани индекс 

  pti = 

    0.5 * gapScore + 

    0.3 * stabilityScore + 

    0.1 * consistencyScore + 

    0.1 * pressureScore; 

 

  pti = Math.min(1, Math.max(0, pti)) * 100; 

 

  // Статус 

  if (pti >= 80) { 

    ptiStatus = "Odličan transfer"; 

    ptiColor = "#4caf50"; 

  } else if (pti >= 65) { 

    ptiStatus = "Dobar transfer"; 

    ptiColor = "#8bc34a"; 

  } else if (pti >= 50) { 

    ptiStatus = "Umeren transfer"; 

    ptiColor = "#ff9800"; 

  } else { 

    ptiStatus = "Slab transfer"; 

    ptiColor = "#e53935"; 

  } 

} 

// ✅ Pearson correlation 

 

function pearsonCorrelation( 

  x: number[], 

  y: number[] 

): number { 

  if (x.length !== y.length || x.length === 0) { 

    return 0; 

  } 

 

  const n = x.length; 

 

  const meanX = 

    x.reduce((a, b) => a + b, 0) / n; 

 

  const meanY = 

    y.reduce((a, b) => a + b, 0) / n; 

 

  let numerator = 0; 

  let denomX = 0; 

  let denomY = 0; 

 

  for (let i = 0; i < n; i++) { 

    const dx = x[i] - meanX; 

    const dy = y[i] - meanY; 

 

    numerator += dx * dy; 

    denomX += dx * dx; 

    denomY += dy * dy; 

  } 

 

  const denominator = 

    Math.sqrt(denomX) * Math.sqrt(denomY); 

 

  if (denominator === 0) return 0; 

 

  return numerator / denominator; 

} 

// ✅ Correlation status 

 

let correlationStatus = ""; 

correlationColor = "#4caf50"; 

 

if (analyticsMode === "qualification") { 

  const r = meanRadiusCorrelation; 

 

  if (r <= -0.7) { 

    correlationStatus = "Veoma jaka negativna povezanost"; 

    correlationColor = "#4caf50"; 

  } else if (r <= -0.4) { 

    correlationStatus = "Umerena negativna povezanost"; 

    correlationColor = "#8bc34a"; 

  } else if (r < 0) { 

    correlationStatus = "Slaba negativna povezanost"; 

    correlationColor = "#ff9800"; 

  } else if (r >= 0.4) { 

    correlationStatus = "Neočekivana pozitivna povezanost"; 

    correlationColor = "#e53935"; 

  } else { 

    correlationStatus = "Slaba ili bez značajne povezanosti"; 

    correlationColor = "#aaa"; 

  } 

} 

// ✅ Verovatnoća rezultata ≥ 630 

let probability630 = 0; 

if (stdDev > 0) { 

  const z = (630 - predictedNext) / stdDev; 

  probability630 = 1 - normalCDF(z); 

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

        <h2 style={{ marginBottom: "20px" }}> 

          Qualification Analytics 

        </h2> 

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

      Qualification 

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

      Training 

    </button> 

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

    Nazad 

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

    Overview 

  </h3> 

<div style={{ marginBottom: "10px" }}> 

  Broj kvalifikacionih mečeva: {matchCount} 

</div> 

 

<div style={{ marginBottom: "10px" }}> 

  Prosek: {mean.toFixed(1)} 

</div> 
<div style={{ marginBottom: "10px" }}> 

  Najbolji rezultat: {best.toFixed(1)} 

</div> 
<div style={{ marginBottom: "10px" }}> 

  Najslabiji rezultat: {worst.toFixed(1)} 

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

      Competition Gap 

    </div> 

 

<div style={{ marginBottom: "5px" }}> 

  Razlika (Qualification − Training):{" "} 

  {competitionGap.toFixed(2)} 

</div> 

 

<div> 

<StatusWithHelp 

  label="Status" 

  status={gapStatus} 

  color={gapColor} 

  description="Competition Gap pokazuje razliku između proseka takmičenja i treninga. Negativna vrednost znači pad na takmičenju, pozitivna znači bolji rezultat pod pritiskom." 

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

  label="Status" 

  status={ptiStatus} 

  color={ptiColor} 

  description="Performance Transfer Index pokazuje koliko se forma sa treninga prenosi na takmičenje. Viši indeks znači bolji transfer." 

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

    Predikcija 

  </h3> 

<div style={{ marginBottom: "10px", fontWeight: 600 }}> 

  Predviđeni sledeći rezultat: {predictedNext.toFixed(1)} 

</div> 
<div style={{ marginBottom: "10px" }}> 

  Realističan opseg (68%): {lower68.toFixed(1)} – {upper68.toFixed(1)} 

</div> 

<div style={{ marginBottom: "10px" }}> 

  Realističan opseg (95%): {lower95.toFixed(1)} – {upper95.toFixed(1)} 

</div> 

<div style={{ marginBottom: "10px" }}> 

  Verovatnoća rezultata ≥ 630: {(probability630 * 100).toFixed(1)}% 


</div> 
{analyticsMode === "qualification" && (
  <>

  <h3 style={{ marginBottom: "10px" }}> 

    Pressure Index 

  </h3> 

 

<div style={{ marginBottom: "10px" }}> 

<StatusWithHelp 

  label="Status" 

  status={pressureStatus} 

  color={pressureColor} 

  description="Pressure Index meri razliku između prve i druge polovine meča. Negativna vrednost znači pad pod pritiskom, pozitivna znači jači završetak." 

/> 

</div> 

 

<div> 

  Prosečan: {pressureMean.toFixed(2)} 

</div> 

 

<div> 

  Najbolji završetak: +{pressureBest.toFixed(2)} 

</div> 

 

<div style={{ marginBottom: "10px" }}> 

  Najveći pad: {pressureWorst.toFixed(2)} 

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

  <h3 style={{ marginBottom: "10px" }}> 

    Trendiranje

  </h3> 

<div style={{ marginBottom: "10px" }}> 

  Trend (po meču): {slope.toFixed(3)} 

</div> 

 <div style={{ marginBottom: "10px" }}> 

  Standardna devijacija: {stdDev.toFixed(2)} 

</div> 
<div style={{ marginBottom: "10px" }}> 

  Ponderisani prosek (poslednjih 5): {weightedRecent.toFixed(1)} 

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

    Tehnička analiza (Mean Radius) 

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

  label="Status" 

  status={technicalStatus} 

  color={technicalColor} 

  description="Mean Radius trend pokazuje da li se grupa zatvara ili širi kroz vreme. Negativan trend znači tehničko poboljšanje." 

/> 

      </div> 

 

      <div style={{ marginBottom: "6px" }}> 

        Prosečan Mean Radius:{" "} 

        {meanRadiusAverage.toFixed(2)} mm 

      </div> 

 

      <div> 

        Trend Mean Radius:{" "} 

        {meanRadiusSlope.toFixed(4)} 

      </div> 

          {analyticsMode === "qualification" && ( 

  <div style={{ 
    marginTop: "10px", 
    paddingTop: "8px",
    borderTop: "1px solid #333"
  }}> 

    Korelacija (Mean Radius ↔ Rezultat):{" "} 

    {meanRadiusCorrelation.toFixed(2)} 

  </div> 

)} 
<div style={{ marginTop: "4px" }}> 

    <StatusWithHelp 

  label="Status" 

  status={correlationStatus} 

  color={correlationColor} 

  description="Korelacija pokazuje koliko je tehnička stabilnost (Mean Radius) povezana sa rezultatom. Negativna jaka korelacija znači da zatezanje grupe direktno poboljšava rezultat." 

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

      Analiza vremena opaljenja 

    </h3> 

 

    {/* Osnovna statistika vremena */} 

    <div style={{ marginBottom: "12px" }}> 

      <div>Prosečno vreme: {meanTime.toFixed(2)} s</div> 

      <div>Standardna devijacija: {stdDevTime.toFixed(2)} s</div> 

    </div> 

 

    <div 

      style={{ 

        borderTop: "1px solid #333", 

        paddingTop: "12px", 

        marginTop: "10px" 

      }} 

    > 

      <div style={{ fontWeight: 600, marginBottom: "8px" }}> 

        Performanse po vremenskim zonama 

      </div> 

 

      <div style={{ display: "grid", gap: "6px" }}> 

  <div> 

    Rano opaljenje ({bucketStats.fast.count} hitaca) <br /> 

    <span style={{ color: "#aaa", fontSize: "0.9rem" }}> 

      &lt; {earlyThreshold.toFixed(2)} s 

    </span> 

    {" — "} 

    Prosek: {bucketAverages.fast.toFixed(2)} 

  </div> 

 

  <div> 

    Optimalno opaljenje ({bucketStats.optimal.count} hitaca) <br /> 

    <span style={{ color: "#aaa", fontSize: "0.9rem" }}> 

      {earlyThreshold.toFixed(2)} – {meanTime.toFixed(2)} s 

    </span> 

    {" — "} 

    Prosek: {bucketAverages.optimal.toFixed(2)} 

  </div> 

 

  <div> 

    Stabilno opaljenje ({bucketStats.stable.count} hitaca) <br /> 

    <span style={{ color: "#aaa", fontSize: "0.9rem" }}> 

      {meanTime.toFixed(2)} – {stableThreshold.toFixed(2)} s 

    </span> 

    {" — "} 

    Prosek: {bucketAverages.stable.toFixed(2)} 

  </div> 

 

  <div> 

    Kasno opaljenje ({bucketStats.slow.count} hitaca) <br /> 

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

    Analiza povezanosti vremena i rezultata 

  </div> 

 

  <div 

    style={{ 

      fontSize: "1.2rem", 

      fontWeight: 600, 

      color: correlationColor, 

      marginBottom: "6px" 

    }} 

  > 

    Pearson r = {pearsonR.toFixed(3)} 

  </div> 

 

  <div style={{ marginBottom: "6px", color: "#ccc" }}> 

    {correlationStrength} 

  </div> 

 

  <div style={{ marginBottom: "6px", color: "#ccc" }}> 

    {correlationDirection} 

  </div> 

 

  <div style={{ color: "#aaa", fontSize: "0.9rem" }}> 

    Objašnjena varijansa (R²): {explainedVariance}% 

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

      Stability Heatmap (serije po meču) 

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

  Datum 

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

  Ukupno 

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

          Datum:{" "} 

          {new Date(selectedMatches[matchIndex].date) 

            .toLocaleDateString("sr-RS", { 

              day: "2-digit", 

              month: "2-digit", 

              year: "2-digit" 

            })} 

        </div> 

        <div>Serija: {seriesIndex + 1}</div> 

        <div>Rezultat: {seriesValue.toFixed(1)}</div> 

        <div> 

          Razlika u odnosu na prosek meca: {diff >= 0 ? "+" : ""} 

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

Serija: ${seriesIndex + 1} 

Hitac: ${hitIndex + 1} 

Prosek: ${rounded} 

Najveći: ${cell.max.toFixed(1)} 

Najmanji: ${cell.min.toFixed(1)} 

Broj uzoraka: ${cell.count} 

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
