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

 

interface Props { 

  sessions: ShootingSession[]; 

  onBack: () => void; 

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

  Status:{" "} 

  <span style={{ color: gapColor, fontWeight: 600 }}> 

    {gapStatus} 

  </span> 

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

  Status:{" "} 

  <span style={{ color: pressureColor, fontWeight: 600 }}> 

    {pressureStatus} 

  </span> 

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

        Status:{" "} 

        <span style={{ color: technicalColor, fontWeight: 600 }}> 

          {technicalStatus} 

        </span> 

      </div> 

 

      <div style={{ marginBottom: "6px" }}> 

        Prosečan Mean Radius:{" "} 

        {meanRadiusAverage.toFixed(2)} mm 

      </div> 

 

      <div> 

        Trend Mean Radius:{" "} 

        {meanRadiusSlope.toFixed(4)} 

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
</div> 
      

 </div> 
  
  ); 

} 