import { useEffect, useState, useRef } from "react"; 
import type {Shot, Series} from "./types";
import "./App.css"; 
import type { ShootingSession } from "./types"; 
import ArchiveView from "./components/ArchiveView";
import SetupView from "./components/SetupView";

import PrintCanvasTarget from "./components/PrintCanvasTarget";

import { 

  loadSessions, 

  saveSessions, 

  createNewSession, 

  getActiveSessionId, 

  setActiveSessionId 

} from "./sessionManager"; 

 

 

export default function App() { 

 

  const MAX_SERIES = 6; 

  const MAX_SHOTS = 10; 

 

  // ================= LOAD FROM STORAGE ================= 

 

const sessions = loadSessions(); 

const activeId = getActiveSessionId(); 

 

let activeSession: ShootingSession; 

 

const foundSession = sessions.find(s => s.id === activeId); 

 

if (foundSession) { 

  activeSession = foundSession; 

} else { 

  activeSession = createNewSession(); 

  setActiveSessionId(activeSession.id); 

} 

 

  const [seriesList, setSeriesList] = useState<Series[]>( 

  activeSession.seriesList 

); 

 

  const [matchRunning, setMatchRunning] = useState<boolean>( 

    localStorage.getItem("shooting-session") ? true : false 

  ); 

 

  const [selectedScore, setSelectedScore] = useState<number | null>(null); 

  const [shotRunning, setShotRunning] = useState(false); 

  const [shotDisplayTime, setShotDisplayTime] = useState(0); 

  const [view, setView] = useState<"setup" | "shooting" | "archive">("setup"); 

  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedSeriesIndex, setSelectedSeriesIndex] = useState<number | null>(null);
  const [manualTimeMode, setManualTimeMode] = useState(false);
  const [manualShotTime, setManualShotTime] = useState ("");
  const [matchStartTimestamp, setMatchStartTimestamp] = useState<number | null>(null);

  const [isFullScreen, setIsFullScreen] = useState(false);
 


  const matchStartRef = useRef<number | null>(null); 

  const shotStartRef = useRef<number | null>(null); 

  const intervalRef = useRef<number | null>(null); 

 

  const currentSeries = 
    isReadOnly && selectedSeriesIndex !== null
    ? seriesList[selectedSeriesIndex]
    : seriesList[seriesList.length - 1]; 

 

  // ================= AUTOSAVE ================= 

 

useEffect(() => { 

 if (isReadOnly) return;

  const sessions = loadSessions(); 

  const activeId = getActiveSessionId(); 

  const updatedSessions = sessions.map(session => 

    session.id === activeId 

      ? { 

          ...session, 

          seriesList, 

          totalResult: seriesList.reduce( 

            (s, ser) => s + ser.total, 

            0 

          ),
          completed:
          session.maxShots !== null
          ? seriesList.flatMap(s => s.shots).length >= session.maxShots
          : false

        } 

      : session 

  ); 

 

  saveSessions(updatedSessions); 

 

}, [seriesList, isReadOnly]); 

 

  // ================= TIMER ================= 

 

  useEffect(() => { 

    if (shotRunning) { 

      intervalRef.current = window.setInterval(() => { 

        if (shotStartRef.current) { 

          const now = performance.now(); 

          setShotDisplayTime((now - shotStartRef.current) / 1000); 

        } 

      }, 50); 

    } else { 

      if (intervalRef.current !== null) clearInterval(intervalRef.current); 

    } 

 

    return () => { 

      if (intervalRef.current !== null) clearInterval(intervalRef.current); 

    }; 

  }, [shotRunning]); 

  // ================= FULLSCREEN LISTENER ================= 

useEffect(() => { 

  const handleChange = () => { 

    setIsFullScreen(!!document.fullscreenElement); 

  }; 

  document.addEventListener("fullscreenchange", handleChange); 

  return () => { 

    document.removeEventListener("fullscreenchange", handleChange); 

  }; 

}, []); 

 

  // ================= META ================= 

 

  useEffect(() => { 

 

    const canvas = document.getElementById("targetCanvas") as HTMLCanvasElement; 

    if (!canvas) return; 

    const ctx = canvas.getContext("2d"); 

    if (!ctx) return; 

 

    const centerX = canvas.width / 2; 

    const centerY = canvas.height / 2; 

 

    const stepMm = 2.5; 

    

    const visibleMm = 7.75; 

    const radius = canvas.width / 2 - 10; 

    const mmToPx = radius / visibleMm; 

 

    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    ctx.fillStyle = "black"; 

    ctx.fillRect(0, 0, canvas.width, canvas.height); 

 

    [7,8,9,10].forEach(ring => { 

      const ringRadiusMm = 

        ring === 10 ? 0.25 : (10 - ring) * stepMm + 0.25; 

 

      const ringPx = ringRadiusMm * mmToPx; 

 

      ctx.beginPath(); 

      ctx.arc(centerX, centerY, ringPx, 0, Math.PI * 2); 

      ctx.strokeStyle = "white"; 

      ctx.stroke(); 

    }); 

 

    ctx.font = "16px Arial"; 

    ctx.textAlign = "center"; 

    ctx.textBaseline = "middle"; 

    ctx.fillStyle = "white"; 

 

    [7,8,9].forEach(ring => { 

      const ringRadiusMm = (10 - ring) * stepMm + 0.25; 

      const ringPx = ringRadiusMm * mmToPx; 

      const labelRadius = ringPx + 14; 

 

      ctx.fillText(ring.toString(), centerX + labelRadius, centerY); 

      ctx.fillText(ring.toString(), centerX - labelRadius, centerY); 

    }); 

 

    currentSeries.shots.forEach((shot, index) => { 

 

      ctx.beginPath(); 

      ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2); 

 

      ctx.fillStyle = 

        index === currentSeries.shots.length - 1 

          ? "rgba(180,255,0,0.9)" 

          : "rgba(0,200,255,0.4)"; 

 

      ctx.fill(); 

 

      if (index === currentSeries.shots.length - 1) { 

        ctx.fillStyle = "black"; 

        ctx.font = "12px Arial"; 

        ctx.fillText(shot.index.toString(), shot.x, shot.y); 

      } 

    }); 

 

    if (currentSeries.shots.length > 1) { 

      const avgX = 

        currentSeries.shots.reduce((s, sh) => s + sh.x, 0) / 

        currentSeries.shots.length; 

      const avgY = 

        currentSeries.shots.reduce((s, sh) => s + sh.y, 0) / 

        currentSeries.shots.length; 

 

      ctx.fillStyle = "white"; 

      ctx.fillRect(avgX - 4, avgY - 4, 8, 8); 

    } 

 

  }, [seriesList, selectedSeriesIndex, isReadOnly]); 

 

  // ================= CLICK ================= 

 

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => { 
    if (isReadOnly) return; 

    if (!matchRunning) { 

  // Ако није стартован меč, а уносимо погодак 

  matchStartRef.current = performance.now(); 

  setMatchRunning(true); 

} 

    if (!manualTimeMode) {
      if (shotRunning) return;
      if (!shotStartRef.current) return;
    }


    if (!selectedScore) return; 
    if (manualTimeMode) {
      if (!manualShotTime || parseFloat(manualShotTime) <= 0) {
        alert('Unesite vreme hica.');
        return;
      }
    }

 

    let updatedSeriesList = [...seriesList]; 

    let workingSeries = currentSeries; 

 

    if (currentSeries.completed) { 

 

      if (seriesList.length >= MAX_SERIES) return; 

 

      const newSeries: Series = { 

        index: seriesList.length + 1, 

        shots: [], 

        total: 0, 

        completed: false 

      }; 

 

      updatedSeriesList = [...seriesList, newSeries]; 

      workingSeries = newSeries; 

    } 

 

    if (workingSeries.shots.length >= MAX_SHOTS) return; 

 

    const canvas = event.currentTarget; 

    const rect = canvas.getBoundingClientRect(); 

 

    const centerX = canvas.width / 2; 

    const centerY = canvas.height / 2; 

 

    const stepMm = 2.5; 

    const pelletRadiusMm = 2.25; 

    const visibleMm = 7.75; 

    const radius = canvas.width / 2 - 10; 

    const mmToPx = radius / visibleMm; 

 

    const mouseX = event.clientX - rect.left; 

    const mouseY = event.clientY - rect.top; 

 

    const dx = mouseX - centerX; 

    const dy = centerY - mouseY; 

    const angle = Math.atan2(dy, dx); 

 

    let radialCenterMm = 0; 

 

    if (selectedScore >= 10) { 

      radialCenterMm = (10.9 - selectedScore) / 0.9 * stepMm; 

    } else { 

      const integer = Math.floor(selectedScore); 

      const decimal = selectedScore - integer; 

      const innerBoundary = (10 - integer) * stepMm; 

      radialCenterMm = 

        innerBoundary + (1 - decimal) * stepMm; 

    } 

 

    const radialCenterPx = radialCenterMm * mmToPx; 

    const pelletRadiusPx = pelletRadiusMm * mmToPx; 

 

    const hitX = centerX + radialCenterPx * Math.cos(angle); 

    const hitY = centerY - radialCenterPx * Math.sin(angle); 

 

    const matchTime = 
      matchStartRef.current
      ? (performance.now() - matchStartRef.current) / 1000
      : 0;
    
    const finalShotTime = manualTimeMode
    ? parseFloat(manualShotTime) || 0
    : shotDisplayTime;
      
    const newShot: Shot = { 

      index: workingSeries.shots.length + 1, 

      value: selectedScore, 

      x: hitX, 

      y: hitY, 

      radius: pelletRadiusPx, 

      shotTime: finalShotTime, 

      matchTime: matchTime

    }; 

 

    const updatedShots = [...workingSeries.shots, newShot]; 

    const seriesTotal = updatedShots.reduce((s, sh) => s + sh.value, 0); 

 

    updatedSeriesList[updatedSeriesList.length - 1] = { 

      ...workingSeries, 

      shots: updatedShots, 

      total: seriesTotal, 

      completed: updatedShots.length === MAX_SHOTS 

    }; 

 

    setSeriesList(updatedSeriesList); 

    const sessions = loadSessions(); 
    const activeId = getActiveSessionId(); 
    const exists = sessions.some(s => s.id === activeId); 
    if (!exists) { 
    const newArchiveSession: ShootingSession = { 
  
    id: activeId as string, 

    date: activeSession.date, 

    mode: activeSession.mode, 

    format: activeSession.format, 

    maxShots: activeSession.maxShots, 

    seriesList: updatedSeriesList, 

    totalResult: 0, 

    completed: false 

  }; 

 

  saveSessions([...sessions, newArchiveSession]); 

} 

 

    setShotDisplayTime(0); 

    shotStartRef.current = null; 

    if (manualTimeMode) {
      setManualShotTime("");
    }

  }; 

 

  const highScores = Array.from({ length: 10 }, (_, i) => 10 + i / 10); 

  const lowScores = Array.from({ length: 10 }, (_, i) => 9 + i / 10); 

 

  const allShots = seriesList.flatMap(s => s.shots); 

  // ===== KONVERZIJA U mm (GLOBALNO) ===== 

const visibleMm = 7.75; 

const radius = 450 / 2 - 10; 

const mmToPx = radius / visibleMm; 

const pxToMm = 1 / mmToPx; 

  const averageScore =
  allShots.length > 0
  ? allShots.reduce((sum, s) => sum + s.value, 0) / allShots.length
  : 0;

  const standardDeviation = 

  allShots.length > 1 

    ? Math.sqrt( 

        allShots.reduce((sum, s) => { 

          const diff = s.value - averageScore; 

          return sum + diff * diff; 

        }, 0) / (allShots.length - 1) 

      ) 

    : 0; 

    let extremeSpread = 0; 

 

for (let i = 0; i < allShots.length; i++) { 

  for (let j = i + 1; j < allShots.length; j++) { 

 

    const dx = allShots[i].x - allShots[j].x; 

    const dy = allShots[i].y - allShots[j].y; 

 

    const distance = Math.sqrt(dx * dx + dy * dy); 

 

    if (distance > extremeSpread) { 

      extremeSpread = distance; 

    } 

  } 

} 
const extremeSpreadMm = extremeSpread * pxToMm;
  
  // ================= DISTRIBUCIJA POGODAKA ================= 

 

const totalShotCount = allShots.length; 

 

const shotDistribution: Record<string, number> = { 

  "10.9": 0, 

  "10.8": 0, 

  "10.7": 0, 

  "10.6": 0, 

  "10.5": 0, 

  "10.4": 0, 

  "10.3": 0, 

  "10.2": 0, 

  "10.1": 0, 

  "10.0": 0, 

  "9.x": 0 

}; 

 

allShots.forEach(shot => { 

  if (shot.value >= 10) { 

    const key = shot.value.toFixed(1); 

    if (shotDistribution[key] !== undefined) { 

      shotDistribution[key]++; 

    } 

  } else { 

    shotDistribution["9.x"]++; 

  } 

}); 

  const hitCount = allShots.filter(s => s.value >= 10.3).length; 

  const musCount = allShots.filter(s => s.value >= 10.2).length; 

  const matchTotal = seriesList.reduce((s, ser) => s + ser.total, 0); 

  const totalShots = allShots.length; 

  const expectedResult = 

    totalShots > 0 ? (matchTotal / totalShots) * 60 : 0; 
    // ===== DIRECTION ARROW ===== 

    const getShotDirection = (shot: Shot) => { 


    const center = 450 / 2; // 225 

 
    const dx = shot.x - center; 

    const dy = center - shot.y; 

    const threshold = 3; // mali prag da ignorišemo mikro odstupanja 

 

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) { 

    return "•"; 

  } 

 
const isRight = dx > threshold; 

  const isLeft = dx < -threshold; 

  const isUp = dy > threshold; 

  const isDown = dy < -threshold; 

 

  // ✅ Dijagonale prvo 

  if (isRight && isUp) return "↗"; 

  if (isRight && isDown) return "↘"; 

  if (isLeft && isUp) return "↖"; 

  if (isLeft && isDown) return "↙"; 

 

  // ✅ Onda čiste ose 

  if (isRight) return "→"; 

  if (isLeft) return "←"; 

  if (isUp) return "↑"; 

  if (isDown) return "↓"; 

 

  return "•"; 

}; 



    // ===== LAST 5 OFFSET (mm) ===== 

const last5Shots = currentSeries.shots.slice(-5); 

 

let deltaXmm = 0; 

let deltaYmm = 0; 

 

if (last5Shots.length > 1) { 

 

  const avgX = 

    last5Shots.reduce((s, sh) => s + sh.x, 0) / last5Shots.length; 

 

  const avgY = 

    last5Shots.reduce((s, sh) => s + sh.y, 0) / last5Shots.length; 

 

  const canvasCenter = 450 / 2; // 225 

  const deltaXpx = avgX - canvasCenter; 

  const deltaYpx = canvasCenter - avgY; 

 

  deltaXmm = deltaXpx * pxToMm; 

  deltaYmm = deltaYpx * pxToMm; 

} 
// ===== SIGHT CORRECTION ===== 

const CLICK_VALUE_MM = 0.1; // promeni ako tvoj nisan ima drugačiji klik 

 

const clickX = deltaXmm !== 0 

  ? Math.round((-deltaXmm) / CLICK_VALUE_MM) 

  : 0; 

  //======TOTAL MATCH TIMA=====
const allMatchTimes = seriesList 

  .flatMap(s => s.shots) 

  .map(s => s.matchTime ?? 0) 

  .filter(t => typeof t === "number"); 

 

const totalMatchTime = 

  allMatchTimes.length > 0 

    ? Math.max(...allMatchTimes) 

    : 0; 

 

const clickY = deltaYmm !== 0 

  ? Math.round((-deltaYmm) / CLICK_VALUE_MM) 

  : 0; 
 
const loadActiveSession = () => { 

  const sessions = loadSessions(); 

  const activeId = getActiveSessionId(); 

  const active = sessions.find(s => s.id === activeId); 

 

  if (active) { 

    setSeriesList(active.seriesList); 

  } 

}; 
const startNewSession = () => { 

 

  const newSession = createNewSession(); 
  setActiveSessionId(newSession.id); 
  setSeriesList(newSession.seriesList); 
  setIsReadOnly(false); 
  setSelectedSeriesIndex(null); 
  setManualTimeMode(false);
  setManualShotTime("");
  setSelectedScore(null);
  setView("shooting"); 

}; 

 

const startNewSessionWithFormat = ( 

  mode: "training" | "qualification" | "final",
  format: "60" | "40" | "trial" | "custom" ,
  competitionName: string,
  date: string,
  startTime: string
  

) => { 

   const newSession = createNewSession(); 

 

  let maxShots: number | null = 60; 

 

  if (format === "40") maxShots = 40; 

  if (format === "trial") maxShots = null; 

  if (format === "custom") maxShots = 60; 

 

  newSession.format = format; 

  newSession.maxShots = maxShots; 

  newSession.competitionName = competitionName;

  newSession.date = date || new Date().toISOString();

  newSession.startTime = startTime;

  newSession.mode = mode;

  setActiveSessionId(newSession.id); 

 

  setSeriesList(newSession.seriesList); 

  setIsReadOnly(false); 

  setSelectedSeriesIndex(null); 

 setSelectedScore(null);
 setManualTimeMode(false);
 setManualShotTime("");

  setView("shooting"); 

}; 
const formatMatchTime = (seconds: number) => { 

 

  if (!matchStartTimestamp) return "00:00:00"; 

 

  const realTime = new Date( 

    matchStartTimestamp + seconds * 1000 

  ); 

 

  const hours = realTime.getHours().toString().padStart(2, "0"); 

  const minutes = realTime.getMinutes().toString().padStart(2, "0"); 

  const secs = realTime.getSeconds().toString().padStart(2, "0"); 

 

  return `${hours}:${minutes}:${secs}`; 

}; 

const enterFullScreen = () => { 

  if (document.documentElement.requestFullscreen) { 

    document.documentElement.requestFullscreen(); 

  } 

}; 

 

const exitFullScreen = () => { 

  if (document.fullscreenElement) { 

    document.exitFullscreen(); 

  } 

}; 
// ===== MEAN RADIUS ===== 

 

let meanRadiusPx = 0; 

 

if (allShots.length > 1) { 

 

  const avgX = 

    allShots.reduce((s, sh) => s + sh.x, 0) / allShots.length; 

 

  const avgY = 

    allShots.reduce((s, sh) => s + sh.y, 0) / allShots.length; 

 

  const totalDistance = allShots.reduce((sum, shot) => { 

    const dx = shot.x - avgX; 

    const dy = shot.y - avgY; 

    return sum + Math.sqrt(dx * dx + dy * dy); 

  }, 0); 

 

  meanRadiusPx = totalDistance / allShots.length; 

} 
 

const meanRadiusMm = meanRadiusPx * pxToMm; 
// ===== MEAN RADIUS PO SERIJI ===== 

 

const meanRadiusBySeries = seriesList.map(series => { 

 

  if (series.shots.length <= 1) return 0; 

 

  const avgX = 

    series.shots.reduce((s, sh) => s + sh.x, 0) / series.shots.length; 

 

  const avgY = 

    series.shots.reduce((s, sh) => s + sh.y, 0) / series.shots.length; 

 

  const totalDistance = series.shots.reduce((sum, shot) => { 

    const dx = shot.x - avgX; 

    const dy = shot.y - avgY; 

    return sum + Math.sqrt(dx * dx + dy * dy); 

  }, 0); 

 

  const meanRadiusPxSeries = totalDistance / series.shots.length; 

 

  return meanRadiusPxSeries * pxToMm; 

}); 

return ( 

  <> 
  {view === "setup" && ( 

  <SetupView 

    onStart={(mode, format, competitionName, date, startTime) => { 

      startNewSessionWithFormat(
        mode,
        format,
        competitionName,
        date,
        startTime
      ); 

    }} 

    onArchive={() => setView("archive")} 

  /> 

)} 

    {view === "archive" && ( 

      <ArchiveView 

  sessions={loadSessions()} 

  onOpenSession={(id) => { 

  const sessions = loadSessions(); 

  const selected = sessions.find(s => s.id === id); 

 

  if (selected) { 

    
    setSeriesList(selected.seriesList); 

    setIsReadOnly(true); 

    setView("shooting"); 

  } 

}} 
onDeleteSession={(id) => {     

const sessions = loadSessions();     

const updated = sessions.filter(s => s.id !== id);     

saveSessions(updated);     

setView("archive");   

}} 

 

/> 

    )} 

 

    {view === "shooting" && ( 

      <div className="app-container"> 

      <div className="print-header">
                <h2>IZVESTAJ MECA</h2>
        <div>Datum: {new Date().toLocaleString()}</div>
        <div>Ukupno: {matchTotal.toFixed(1)}</div>
        <div>Broj hitaca: {allShots.length}</div>
        <div>Ukupno vreme meca: {totalMatchTime.toFixed(2)} s</div>
        <div>Prosek: {averageScore.toFixed(2)}</div> 
        <div>SD: {standardDeviation.toFixed(3)}</div> 
        <div>Extreme Spread: {extremeSpreadMm.toFixed(2)} mm</div> 
        <div>Mean Radius: {meanRadiusMm.toFixed(2)} mm</div>
  <div style={{ marginTop: "10px" }}> 

  <strong>Mean Radius po seriji:</strong> 

  {meanRadiusBySeries.map((mr, i) => ( 

    <div key={i}> 

      Serija {i + 1}: {mr.toFixed(2)} mm 

    </div> 

  ))} 

</div> 
        </div>
        <div className="print-only"> 

 

  {seriesList.map((series, i) => ( 

    <div key={i} className="print-series-block"> 

 

      <h3>Serija {i + 1} — Ukupno: {series.total.toFixed(1)}</h3> 

 

      <div className="print-series-content"> 

 

        <PrintCanvasTarget series={series} /> 

 

        <table> 

          <thead> 

            <tr> 

              <th>#</th> 

              <th>Vrednost</th> 

              <th>Smer</th> 

              <th>Vreme</th> 

              <th>Vreme u mecu</th> 

            </tr> 

          </thead> 

          <tbody> 

            {series.shots.map(shot => ( 

              <tr key={shot.index}> 

                <td>{shot.index}</td> 

                <td>{shot.value.toFixed(1)}</td> 

                <td>{getShotDirection(shot)}</td> 

                <td>{shot.shotTime.toFixed(2)}</td> 
                <td>{formatMatchTime(shot.matchTime ?? 0)}</td> 

              </tr> 

            ))} 

          </tbody> 

        </table> 

 

      </div> 

 

    </div> 

  ))} 

 

</div> 


 

        <div className="data-panel"> 
        {isReadOnly && ( 

  <div style={{ 

    background: "#330000", 

    color: "#ff5555", 

    padding: "8px", 

    marginBottom: "10px", 

    textAlign: "center", 

    fontWeight: "bold" 

  }}> 

    ARHIVSKA SESIJA – READ ONLY 

  </div> 

)} 
 

         <div className="top-controls"> 

 

  <button onClick={() => setView("archive")}> 

    ARHIVA 

  </button> 

 

  <button  

    onClick={() => { 

      if (allShots.length > 0) { 

        const confirmLeave = window.confirm( 

          "Da li ste sigurni da želite da započnete novi meč?" 

        ); 

        if (!confirmLeave) return; 

      } 

      setView("setup"); 

    }} 

  > 

    NOVI MEČ 

  </button> 

 

  {isReadOnly && ( 

    <button 

      onClick={() => { 

        setIsReadOnly(false); 

        setSelectedSeriesIndex(null); 

        loadActiveSession(); 

      }} 

    > 

      NAZAD 

    </button> 

  )} 

 

  <button onClick={() => window.print()}> 

    PRINT 

  </button> 

 

  <button 

    onClick={() => { 

      const sessions = loadSessions(); 

      const activeId = getActiveSessionId(); 

      const updated = sessions.map(s => 

        s.id === activeId 

          ? { ...s, completed: true } 

          : s 

      ); 

      saveSessions(updated); 

      alert("Meč označen kao završen."); 

    }} 

  > 

    ZAVRŠI 

  </button> 
<button 

  onClick={() => { 

    if (!isFullScreen) { 

      enterFullScreen(); 

    } else { 

      exitFullScreen(); 

    } 

  }} 

> 

  {isFullScreen ? "EXIT FS" : "FULL SCREEN"} 

</button> 
 

</div> 
    <label style={{ display: "block", marginTop: "10px" }}> 

  <input 

    type="checkbox" 

    checked={manualTimeMode} 

    onChange={(e) => setManualTimeMode(e.target.checked)} 

  /> 

  Ručni unos vremena hica 

</label> 

 

{manualTimeMode && ( 

  <input 

    type="number" 

    placeholder="Vreme hica (s)" 

    value={manualShotTime} 

    onChange={(e) => setManualShotTime(e.target.value)} 

    style={{ marginTop: "5px", width: "100%" }} 

  /> 

)} 
 

          <button 

  disabled={isReadOnly || manualTimeMode} 

  onClick={() => { 

    matchStartRef.current = performance.now(); 

    setMatchStartTimestamp(Date.now()); 

    setMatchRunning(true); 

  }} 

> 

  START MEČА 

</button> 

 

          <button 
            disabled={isReadOnly || manualTimeMode}
            onClick={() => { 

            shotStartRef.current = performance.now(); 

            setShotRunning(true); 

          }}> 

            START POGODAK 

          </button> 

 

          <button 
            disabled={isReadOnly || manualTimeMode}
            onClick={() => setShotRunning(false)}> 

            STOP POGODAK 

          </button> 

 

          <p>Vreme: {shotDisplayTime.toFixed(2)} s</p> 

 

          {false && (
          <button 

          disabled={isReadOnly} 

          onClick={startNewSession} 

        > 

          NOVA SESIJA 

          </button>
          )} 

 
{!isReadOnly && (
  <>
          <div className="score-buttons high-row"> 

            {highScores.map(score => ( 

              <button 

                key={score} 
                disabled={isReadOnly}

                className={`big-btn ${selectedScore === score ? "active-btn" : ""}`} 

                onClick={() => setSelectedScore(score)} 

              > 

                {score.toFixed(1)} 

              </button> 

            ))} 

          </div> 

 

          <div className="score-buttons low-row"> 

            {lowScores.map(score => ( 

              <button 

                key={score} 
                disabled={isReadOnly}

                className={`small-btn ${selectedScore === score ? "active-btn" : ""}`} 

                onClick={() => setSelectedScore(score)} 

              > 

                {score.toFixed(1)} 

              </button> 

            ))} 
          </div> 
          </>
)}

          <div style={{ marginTop: "8px" }}> 

  <h4>Statistika pogodaka</h4> 

 

  <div className="stats-grid"> 

    {Object.entries(shotDistribution).map(([key, count]) => { 

 

      const percent = 

        totalShotCount > 0 

          ? ((count / totalShotCount) * 100).toFixed(1) 

          : "0.0"; 

 

      return ( 

        <div 

          key={key} 

          className="stats-item" 

        > 

          <span>{key}</span> 

          <span>{count} ({percent}%)</span> 

        </div> 

      ); 

    })} 

  </div> 

</div> 

 

        </div> 

 

        <div className="meta-panel"> 

          <canvas 

            id="targetCanvas" 

            width={450} 

            height={450} 

            onClick={handleClick} 

          /> 

 

          <div className="offset-panel"> 

            <div className="offset-title"> 

              POMERANJE (poslednjih 5) 

            </div> 

 

            <div className="offset-values"> 

              <div> 

                X: {deltaXmm >= 0 ? "+" : ""} 

                {deltaXmm.toFixed(2)} mm 

              </div> 

              <div> 

                Y: {deltaYmm >= 0 ? "+" : ""} 

                {deltaYmm.toFixed(2)} mm 

              </div> 

            </div> 

 

            <div className="click-correction"> 

              <div className="click-title"> 

                KOREKCIJA NIŠANA 

              </div> 

 

              <div className="click-values"> 

                <div> 

                  X: {clickX > 0 ? "→" : clickX < 0 ? "←" : "•"}{" "} 

                  {Math.abs(clickX)} klik 

                </div> 

                <div> 

                  Y: {clickY > 0 ? "↑" : clickY < 0 ? "↓" : "•"}{" "} 

                  {Math.abs(clickY)} klik 

                </div> 

              </div> 

            </div> 

 

          </div> 

        </div> 

 

        <div className="shot-list-panel"> 

 

          <div className="shots-table"> 

            <table> 

              <thead> 

                <tr> 

                  <th>#</th> 

                  <th>Vrednost</th> 

                  <th>Smer</th> 

                  <th>Vreme</th> 

                  <th>Vreme u mecu</th>

                </tr> 

              </thead> 

              <tbody> 

                {currentSeries.shots.map(shot => ( 

                  <tr key={shot.index}> 

                    <td>{shot.index}</td> 

                    <td>{shot.value.toFixed(1)}</td> 

                    <td style={{ fontSize: "18px", textAlign: "center" }}> 

                      {getShotDirection(shot)} 

                    </td> 

                    <td>{shot.shotTime.toFixed(2)}</td> 
                    <td>{formatMatchTime(shot.matchTime ?? 0)}</td>

                  </tr> 

                ))} 

              </tbody> 

            </table> 

          </div> 

 

          <div className="series-grid"> 

  {Array.from({ length: 6 }).map((_, i) => { 

    const s = seriesList[i]; 

 

    return ( 

      <div 

        key={i} 

        className={`series-cell  

          ${s?.completed ? "series-completed" : ""} 

          ${isReadOnly && selectedSeriesIndex === i ? "series-selected" : ""} 

        `} 

        style={{ cursor: isReadOnly && s ? "pointer" : "default" }} 

        onClick={() => { 

          if (isReadOnly && s) { 

            setSelectedSeriesIndex(i); 

          } 

        }} 

      > 

        <div>S{i + 1}</div> 

        <div>{s ? s.total.toFixed(1) : "-"}</div> 

      </div> 

    ); 

  })} 

</div> 

 

          <div className="stats-row"> 

            <div className="stats-left"> 

              <div>HIT: {hitCount}</div> 

              <div>MUŠ: {musCount}</div> 

            </div> 

 

            <div className="stats-right"> 

              <div>Ukupno: {matchTotal.toFixed(1)}</div> 

              <div>Očekivano: {expectedResult.toFixed(1)}</div> 

            </div> 

          </div> 

 

        </div> 

 

      </div> 

    )} 

  </> 

); }