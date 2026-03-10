import type { ShootingSession } from "../types"; 

 

interface Props { 

  sessions: ShootingSession[]; 

  onBack: () => void; 

} 

 

export default function AnalyticsView({ sessions, onBack }: Props) { 
    // ✅ Филтрирамо само завршене qualification мечеве 

const qualificationMatches = sessions 

  .filter(s => s.mode === "qualification" && s.completed) 

  .sort((a, b) => 

    new Date(a.date).getTime() - new Date(b.date).getTime() 

  ); 
  // ✅ Основна статистика 

const matchResults = qualificationMatches.map( 

  s => s.totalResult ?? 0 

); 

// ✅ Pressure Index по мечу (30 vs 30) 

 

const pressureValues = qualificationMatches.map(match => { 

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

    <div className="app-container"> 

      <div style={{ padding: "20px", width: "100%", color: "white" }}> 

        <h2 style={{ marginBottom: "20px" }}> 

          Qualification Analytics 

        </h2> 

 

        <button onClick={onBack} style={{ marginBottom: "20px" }}> 

          Nazad 

        </button> 

 

<div style={{ marginBottom: "10px" }}> 

  Broj kvalifikacionih mečeva: {matchCount} 

</div> 

 

<div style={{ marginBottom: "10px" }}> 

  Prosek: {mean.toFixed(1)} 

</div> 

 <div style={{ marginBottom: "10px" }}> 

  Standardna devijacija: {stdDev.toFixed(2)} 

</div> 

<div style={{ marginBottom: "10px" }}> 

  Trend (po meču): {slope.toFixed(3)} 

</div> 

<div style={{ marginBottom: "10px" }}> 

  Ponderisani prosek (poslednjih 5): {weightedRecent.toFixed(1)} 

</div> 

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

<div style={{ marginTop: "15px", fontWeight: 600 }}> 

  Pressure Index 

</div> 

 

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

<div style={{ marginBottom: "10px" }}> 

  Najbolji rezultat: {best.toFixed(1)} 

</div> 

<div style={{ marginBottom: "10px" }}> 

  Najslabiji rezultat: {worst.toFixed(1)} 

</div> 

      </div> 

    </div> 

  ); 

} 