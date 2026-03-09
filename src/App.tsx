import { useEffect, useState, useRef } from "react"; 
import type {Shot, Series, ShootingSession, MatchEvent} from "./types";
import "./App.css";  
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
 const QUALIFICATION_TIME_LIMIT = 75 * 60; //sekunde

  const MAX_SERIES = 6; 

  const MAX_SHOTS = 10; 

 

  // ================= LOAD FROM STORAGE ================= 

 

const sessions = loadSessions(); 

const activeId = getActiveSessionId(); 

 

const foundSession = sessions.find(s => s.id === activeId); 

 

const [activeSessionState, setActiveSessionState] = useState<ShootingSession>
(foundSession ?? createNewSession()); 
const seriesList = activeSessionState.seriesList

useEffect(() => { 

  const sessions = loadSessions(); 

  const activeId = getActiveSessionId(); 

  const active = sessions.find(s => s.id === activeId); 

 

  if (active?.matchStartTimestamp) { 

    setActiveSessionState(active); 

    setMatchRunning(true); 

  } 

}, []); 

 

useEffect(() => { 

  if (!foundSession) { 

    setActiveSessionId(activeSessionState.id); 

  } 

}, []); 

const [historyStack, setHistoryStack] = useState<ShootingSession[]>([]); 
const [redoStack, setRedoStack] = useState<ShootingSession[]>([]); 

const MAX_HISTORY = 50;
const pushToHistory = (session: ShootingSession) => { 

  const snapshot = JSON.parse(JSON.stringify(session)); 

 

  setHistoryStack(prev => { 

    const updated = [...prev, snapshot]; 

 

    if (updated.length > MAX_HISTORY) { 

      return updated.slice(updated.length - MAX_HISTORY); 

    } 

 

    return updated; 

  }); 

 

  setRedoStack([]); 

}; 

// ✅ SINKRONIZACIJA MATCH START TIMESTAMP NAKON REFRESH-A 

useEffect(() => { 

  if (activeSessionState?.matchStartTimestamp) { 

    

  } 

}, []); 
 

   const formatDateForPrint = (dateString: string) => { 

  const dateObj = new Date(dateString); 

 

  const day = dateObj.getDate(); 

  const year = dateObj.getFullYear(); 

 

  const months = [ 

    "Januar", 

    "Februar", 

    "Mart", 

    "April", 

    "Maj", 

    "Jun", 

    "Jul", 

    "Avgust", 

    "Septembar", 

    "Oktobar", 

    "Novembar", 

    "Decembar" 

  ]; 

 

  const month = months[dateObj.getMonth()]; 

 

  return `${day} ${month} ${year}`; 

}; 


 

  const [matchRunning, setMatchRunning] = useState<boolean>( 

    localStorage.getItem("shooting-session") ? true : false 

  ); 

 

  const [selectedScore, setSelectedScore] = useState<number | null>(null); 

  const [shotRunning, setShotRunning] = useState(false); 

  

  const [shotElapsed, setShotElapsed] = useState(0);

  const [view, setView] = useState<"setup" | "shooting" | "archive">("setup"); 

  const [isReadOnly, setIsReadOnly] = useState(false);
  const [selectedSeriesIndex, setSelectedSeriesIndex] = useState<number | null>(null);
  const [manualTimeMode, setManualTimeMode] = useState(false);
  const [manualShotTime, setManualShotTime] = useState ("");
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [, forceTick] = useState(0);

  const shotStartRef = useRef<number | null>(null); 

  const intervalRef = useRef<number | null>(null); 
  const [sessionsState, setSessionsState] = useState<ShootingSession[]>(loadSessions());

  const getCurrentMatchTime = () => { 

  if (!activeSessionState.matchStartTimestamp) return 0; 

 

  // ✅ Ako je meč ručno završen – zamrzni vreme 

  const referenceTime = 

    activeSessionState.matchEndedTimestamp ?? Date.now(); 

 

  const totalPaused = activeSessionState.totalPausedTime ?? 0; 

 

  // ✅ Ako je trenutno pauza i meč nije završen 

  if ( 

    activeSessionState.pauseStartTimestamp && 

    !activeSessionState.matchEndedTimestamp 

  ) { 

    const currentPauseDuration = 

      Date.now() - activeSessionState.pauseStartTimestamp; 



    return ( 

      (Date.now() - 

        activeSessionState.matchStartTimestamp - 

        totalPaused - 

        currentPauseDuration) / 

      1000 

    ); 

  } 

  

  return ( 

    (referenceTime - 

      activeSessionState.matchStartTimestamp - 

      totalPaused) / 

    1000 

  ); 

}; 

const addMatchEvent = ( 

  type: "leave_line" | "pause_on_line" | "dry_fire" 

) => { 

 

  if (!activeSessionState.matchStartTimestamp) return; 

 

  const now = Date.now(); 

  const startMatchTime = getCurrentMatchTime(); 

 

  const event = { 

    type, 

    timestamp: now, 

    matchTime: startMatchTime, 

 

    startMatchTime, 

    endMatchTime: startMatchTime, 

    duration: 0, 

 

    seriesIndex: currentSeries.index 

  }; 

  pushToHistory(activeSessionState); 

  setActiveSessionState(prev => ({ 

    ...prev, 

    matchEvents: [...(prev.matchEvents ?? []), event] 

  })); 

}; 

const getOpenEventIndex = () => { 

  const events = activeSessionState.matchEvents ?? []; 

 

  return events.findIndex( 

    e => 

      e.seriesIndex === currentSeries.index && 

      e.endMatchTime === e.startMatchTime // још није затворен 

  ); 

}; 

const registerDryFire = () => { 

 

  if (!activeSessionState.matchStartTimestamp) return; 

 

  if (!shotStartRef.current) return; 

 

  const endMatchTime = getCurrentMatchTime(); 

  const duration = shotElapsed; 

 

  const event = { 

    type: "dry_fire" as const, 

    timestamp: Date.now(), 

    matchTime: endMatchTime, 

 

    startMatchTime: endMatchTime - duration, 

    endMatchTime, 

    duration, 

 

    seriesIndex: currentSeries.index 

  }; 

  pushToHistory(activeSessionState); 

  setActiveSessionState(prev => ({ 

    ...prev, 

    matchEvents: [...(prev.matchEvents ?? []), event] 

  })); 

 // ✅ RESET štoperice nakon dry fire 

setShotElapsed(0); 

shotStartRef.current = null; 

setShotRunning(false); 

  setShotElapsed(0); 

  shotStartRef.current = null; 

}; 

 

  const currentSeries = 
    isReadOnly && selectedSeriesIndex !== null
    ? seriesList[selectedSeriesIndex]
    : seriesList[seriesList.length - 1]; 

 

  // ================= AUTOSAVE ================= 

 

useEffect(() => { 

  if (isReadOnly) return; 

 

  const sessions = loadSessions(); 

  const activeId = activeSessionState.id; 

 

  const updatedSessions = sessions.map(session => 

    session.id === activeId 

      ? { 

          ...activeSessionState, 

          totalResult: activeSessionState.seriesList.reduce( 

            (s, ser) => s + ser.total, 

            0 

          ), 

          completed: activeSessionState.completed,



        } 

      : session 

  ); 

 

  saveSessions(updatedSessions); 
  setSessionsState(updatedSessions);

}, [activeSessionState, isReadOnly]); 

 

  // ================= TIMER ================= 

 

  useEffect(() => { 

 

  if (shotRunning) { 

 

    intervalRef.current = window.setInterval(() => { 

 

      if (shotStartRef.current !== null) { 

 

        const now = performance.now(); 

        const elapsed = (now - shotStartRef.current) / 1000; 

 

        setShotElapsed(elapsed); 

 

      } 

 

    }, 50); 

 

  } else { 

 

    if (intervalRef.current !== null) { 

      clearInterval(intervalRef.current); 

    } 

 

  } 

 

  return () => { 

    if (intervalRef.current !== null) { 

      clearInterval(intervalRef.current); 

    } 

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

 useEffect(() => { 

  if (!activeSessionState.matchStartTimestamp || activeSessionState.matchEndedTimestamp

  ) 
  return; 

 

  const interval = setInterval(() => { 

    forceTick(prev => prev + 1); 

  }, 1000); 

 

  return () => clearInterval(interval); 

}, [activeSessionState.matchStartTimestamp]); 

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

 // ===== FINAL MODE: Dynamic series limit ===== 

const getMaxShotsForSeries = (seriesIndex: number) => { 


  if (activeSessionState.mode !== "final") { 

    return MAX_SHOTS; 

  } 

 

  if (seriesIndex === 1 || seriesIndex === 2) { 

    return 5; 

  } 

 

  return 2; 

}; 

// ===== FINAL MODE: Dynamic series count ===== 

const getMaxSeriesCount = () => { 

  if (activeSessionState.mode === "final") { 

    return 9; // 2 serije po 5 + 7 serija po 2 

  } 

 
  return MAX_SERIES; 

}; 


  // ================= CLICK ================= 

 

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => { 

  if (activeSessionState.completed) return; 

  if (matchTimeExpired) {  

  alert("Vreme meča je isteklo."); 

  return; 

} 
    if (isReadOnly) return; 

    if (!matchRunning) { 

  alert("Prvo pokrenite mec.");
  return;

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
    let seriesIndex = updatedSeriesList.findIndex(
      s => s.index == workingSeries.index
    );

 

    if (currentSeries.completed) { 

       const maxSeriesCount = getMaxSeriesCount(); 
      if (seriesList.length >= maxSeriesCount) return; 
 
      const newSeries: Series = { 

        index: seriesList.length + 1, 

        shots: [], 

        total: 0, 

        completed: false 

      }; 

 

      updatedSeriesList = [...seriesList, newSeries]; 

      workingSeries = newSeries; 
      seriesIndex = updatedSeriesList.length -1;

    } 

 

    const maxShotsThisSeries = getMaxShotsForSeries(workingSeries.index); 

 

    if (workingSeries.shots.length >= maxShotsThisSeries) return; 

 

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
      activeSessionState.matchStartTimestamp
      ? (Date.now() - activeSessionState.matchStartTimestamp) / 1000
      : 0;
    
    const finalShotTime = manualTimeMode
    ? parseFloat(manualShotTime) || 0
    : shotElapsed;
      
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

 

    updatedSeriesList[seriesIndex] = { 

      ...workingSeries, 

      shots: updatedShots, 

      total: seriesTotal, 

      completed: updatedShots.length === maxShotsThisSeries 

    }; 

    pushToHistory(activeSessionState); 

    setActiveSessionState(prev => ({
      ...prev,
      seriesList: updatedSeriesList
  })); 
  // ✅ RESET štoperice nakon pogotka 

setShotElapsed(0); 

shotStartRef.current = null; 

setShotRunning(false); 

    const sessions = loadSessions(); 
    const activeId = getActiveSessionId(); 
    const exists = sessions.some(s => s.id === activeId); 
    if (!exists) { 
    const newArchiveSession: ShootingSession = { 
  
    id: activeId as string, 

    date: activeSessionState.date, 

    mode: activeSessionState.mode, 

    format: activeSessionState.format, 

    maxShots: activeSessionState.maxShots, 

    seriesList: updatedSeriesList, 

    totalResult: 0, 

    completed: false 

  }; 

 

  saveSessions([...sessions, newArchiveSession]); 

} 

 

    setShotElapsed(0); 

    shotStartRef.current = null; 

    if (manualTimeMode) {
      setManualShotTime("");
    }

  }; 

 

  const highScores = Array.from({ length: 10 }, (_, i) => 10 + i / 10); 

  const lowScores = Array.from({ length: 10 }, (_, i) => 9 + i / 10); 

 

  const allShots = seriesList 

  .flatMap(s => s.shots); 

  // ✅ Analiza po vremenu opaljenja 

 

const timeBuckets: { 

  under25: number[]; 

  between25and30: number[]; 

  over30: number[]; 

} = { 

  under25: [], 

  between25and30: [], 

  over30: [] 

}; 

 

allShots.forEach(shot => { 

  const time = shot.shotTime; 

  const value = shot.value; 

 

  if (time < 25) { 

    timeBuckets.under25.push(value); 

  } else if (time >= 25 && time <= 30) { 

    timeBuckets.between25and30.push(value); 

  } else { 

    timeBuckets.over30.push(value); 

  } 

}); 

 

const timeAnalysis = { 

  under25: { 

    count: timeBuckets.under25.length, 

    avg: 

      timeBuckets.under25.length > 0 

        ? ( 

            timeBuckets.under25.reduce((a, b) => a + b, 0) / 

            timeBuckets.under25.length 

          ).toFixed(1) 

        : "-" 

  }, 

  between25and30: { 

    count: timeBuckets.between25and30.length, 

    avg: 

      timeBuckets.between25and30.length > 0 

        ? ( 

            timeBuckets.between25and30.reduce((a, b) => a + b, 0) / 

            timeBuckets.between25and30.length 

          ).toFixed(1) 

        : "-" 

  }, 

  over30: { 

    count: timeBuckets.over30.length, 

    avg: 

      timeBuckets.over30.length > 0 

        ? ( 

            timeBuckets.over30.reduce((a, b) => a + b, 0) / 

            timeBuckets.over30.length 

          ).toFixed(1) 

        : "-" 

  } 

}; 

  // ✅ Analitika po serijama 

const analyticsTable = { 

  max: seriesList.map(series => { 

    if (series.shots.length === 0) return { value: "-", time: "-" }; 

 

    const values = series.shots.map(s => s.value); 

    const times = series.shots.map(s => s.shotTime); 

 

    return { 

      value: Math.max(...values).toFixed(1), 

      time: Math.max(...times).toFixed(0) 

    }; 

  }), 

 

  min: seriesList.map(series => { 

    if (series.shots.length === 0) return { value: "-", time: "-" }; 

 

    const values = series.shots.map(s => s.value); 

    const times = series.shots.map(s => s.shotTime); 

 

    return { 

      value: Math.min(...values).toFixed(1), 

      time: Math.min(...times).toFixed(0) 

    }; 

  }), 

 

  avg: seriesList.map(series => { 

    if (series.shots.length === 0) return { value: "-", time: "-" }; 

 

    const values = series.shots.map(s => s.value); 

    const times = series.shots.map(s => s.shotTime); 

 

    return { 

      value: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1), 

      time: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(0) 

    }; 

  }) 

}; 

  // ===== PRVIH 5 I DRUGIH 5 U SERIJI ===== //

  const firstSecondFive = seriesList.map(series => { 

 

  if (series.shots.length < 10) { 

    return { 

      index: series.index, 

      firstFive: "-", 

      secondFive: "-" 

    }; 

  } 

 

  const first = series.shots.slice(0, 5) 

    .reduce((sum, shot) => sum + shot.value, 0); 

 

  const second = series.shots.slice(5, 10) 

    .reduce((sum, shot) => sum + shot.value, 0); 

 

  return { 

    index: series.index, 

    firstFive: first.toFixed(1), 

    secondFive: second.toFixed(1) 

  }; 

}); 

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
  const elapsedTime = getCurrentMatchTime(); 

 

const remainingTime = 

  activeSessionState.format === "60" 

    ? Math.max(0, QUALIFICATION_TIME_LIMIT - elapsedTime) 

    : null; 

 

const matchTimeExpired = 

activeSessionState.mode !== "final" &&   
activeSessionState.format === "60" && 

  elapsedTime >= QUALIFICATION_TIME_LIMIT; 
  
  useEffect(() => { 

  if (activeSessionState.completed) return; 

 

  const maxShots = activeSessionState.maxShots; 

 

  const shotsLimitReached = 

    maxShots !== null && totalShots >= maxShots; 

 

  if (shotsLimitReached || matchTimeExpired) { 

    const now = Date.now(); 

 

    setActiveSessionState(prev => ({ 

  ...prev, 

  completed: true, 

  matchEndedTimestamp: now, 

  finishReason: 
  maxShots !== null && totalShots >= maxShots 

    ? "shots_limit" 

    : "time_limit" 

})); 

  } 

}, [totalShots, matchTimeExpired]); 

const projectionBase = 

  activeSessionState.mode === "final" ? 24 : 60; 

const expectedResult = 

  totalShots > 0 ? (matchTotal / totalShots) * projectionBase : 0; 

const idealTimePerShot = 75; // sekundi po hicu (75min / 60) 

 

const expectedShotsByNow = 

  activeSessionState.format === "60" 

    ? elapsedTime / idealTimePerShot 

    : 0; 

 

const tempoDifference = 

  activeSessionState.format === "60" 

    ? totalShots - expectedShotsByNow 

    : 0; 

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

    setActiveSessionState(active); 

  } 

}; 
const startNewSession = () => { 

 

  const newSession = createNewSession(); 
  setActiveSessionState(newSession);
  setActiveSessionId(newSession.id); 
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
  startTime: string,
  shooterName: string
  

) => { 

   const newSession = createNewSession(); 

 

  let maxShots: number | null = 60; 

 

  if (format === "40") maxShots = 40; 

  if (format === "trial") maxShots = null; 

  if (format === "custom") maxShots = 60; 
  if (mode === "final") maxShots = 24;

 

  newSession.format = format; 

  newSession.maxShots = maxShots; 

  newSession.competitionName = competitionName;

  newSession.date = date || new Date().toISOString();

  newSession.startTime = startTime;

  newSession.shooterName = shooterName;

  newSession.mode = mode;

  setActiveSessionId(newSession.id); 

 setActiveSessionState(newSession);


  setIsReadOnly(false); 

  setSelectedSeriesIndex(null); 

 setSelectedScore(null);
 setManualTimeMode(false);
 setManualShotTime("");

  setView("shooting"); 

}; 
const formatMatchTime = ( 

  seconds: number) => { 

  if (!activeSessionState.matchStartTimestamp) 

    return "00:00:00"; 

   const realTime = new Date( 

    activeSessionState.matchStartTimestamp + seconds * 1000 

  ); 

  const hours = realTime.getHours().toString().padStart(2, "0"); 

  const minutes = realTime.getMinutes().toString().padStart(2, "0"); 

  const secs = realTime.getSeconds().toString().padStart(2, "0"); 

 

  return `${hours}:${minutes}:${secs}`; 

}; 

const formatDurationHMS = (seconds: number) => { 

  const totalSeconds = Math.floor(seconds); 

 

  const hours = Math.floor(totalSeconds / 3600) 

    .toString() 

    .padStart(2, "0"); 

 

  const minutes = Math.floor((totalSeconds % 3600) / 60) 

    .toString() 

    .padStart(2, "0"); 

 

  const secs = (totalSeconds % 60) 

    .toString() 

    .padStart(2, "0"); 

 

  return `${hours}:${minutes}:${secs}`; 

}; 

const formatDuration = (ms: number) => { 

  const totalSeconds = Math.floor(ms / 1000); 

 

  const hours = Math.floor(totalSeconds / 3600) 

    .toString() 

    .padStart(2, "0"); 

 

  const minutes = Math.floor((totalSeconds % 3600) / 60) 

    .toString() 

    .padStart(2, "0"); 

 

  const seconds = (totalSeconds % 60) 

    .toString() 

    .padStart(2, "0"); 

 

  return `${hours}:${minutes}:${seconds}`; 

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

const seriesPairs: Series[][] = []; 

 

for (let i = 0; i < seriesList.length; i += 2) { 

  seriesPairs.push(seriesList.slice(i, i + 2)); 

} 
const seriesEvents = 

  (activeSessionState.matchEvents ?? []).filter( 

    event => event.seriesIndex === currentSeries.index 

  ); 

 type TimelineItem = 

  | { type: "shot"; time: number; data: Shot } 

  | { type: "event"; time: number; data: MatchEvent }; 

const seriesTimeline: TimelineItem[] = [ 

  ...currentSeries.shots.map((shot): TimelineItem => ({ 

    type: "shot", 

    time: shot.matchTime, 

    data: shot 

  })), 

  ...seriesEvents.map((event): TimelineItem => ({ 

    type: "event", 

    time: event.matchTime, 

    data: event 

  })) 

].sort((a, b) => a.time - b.time); 

return ( 

  <> 
  {view === "setup" && ( 

  <SetupView 

    onStart={(mode, format, competitionName, date, startTime, shooterName) => { 

      startNewSessionWithFormat(
        mode,
        format,
        competitionName,
        date,
        startTime,
        shooterName
      ); 

    }} 

    onArchive={() => setView("archive")} 

  /> 

)} 

    {view === "archive" && ( 

      <ArchiveView sessions={sessionsState} 

  onOpenSession={(id) => { 

  const sessions = loadSessions(); 

  const selected = sessions.find(s => s.id === id); 

 

  if (selected) { 

    setActiveSessionId(id);
    
    setActiveSessionState(selected);

    setIsReadOnly(true); 

    setView("shooting"); 

  } 

}} 
onDeleteSession={(id) => {     

const sessions = loadSessions();     

const updated = sessions.filter(s => s.id !== id);     

saveSessions(updated);     

setSessionsState(updated);   

}} 
onBack={() => setView("setup")} 

/> 

    )} 

 

    {view === "shooting" && ( 

      <div className="app-container"> 

<div className="print-header"> 

 

  <h2 style={{ marginBottom: "15px" }}>IZVEŠTAJ MEČA</h2> 

 

  <div className="print-summary-wrapper"> 

 

    {/* LEVA STRANA */} 

    <div className="print-summary-left"> 

 

      <div><strong>Takmičenje:</strong> {activeSessionState.competitionName ?? "Trening"}</div> 
      <div><strong>Strelac:</strong> {activeSessionState.shooterName ?? "-"}</div>
      <div><strong>Datum:</strong>{" "} 
      {formatDateForPrint(activeSessionState.date)} </div> 

      <div><strong>Vreme početka:</strong> {activeSessionState.startTime ?? "-"}</div> 

 

      <hr style={{ margin: "10px 0" }} /> 

 

      <div><strong>Ukupno:</strong> {matchTotal.toFixed(1)}</div> 
      <div style={{ display: "flex", gap: "20px" }}> 

        <div><strong>HIT:</strong> {hitCount}</div> 

        <div><strong>MUŠ:</strong> {musCount}</div> 

      </div> 

      <div><strong>Broj hitaca:</strong> {allShots.length}</div> 

      <div><strong>Ukupno vreme meča:</strong> {formatDurationHMS(totalMatchTime)}</div> 

 

      {activeSessionState.matchStartTimestamp && 

        activeSessionState.matchEndedTimestamp && ( 

          <div> 

            <strong>Trajanje:</strong>{" "} 

            {formatDuration( 

              activeSessionState.matchEndedTimestamp - 

              activeSessionState.matchStartTimestamp 

            )} 

            
          </div> 

      )} 

 

      <div><strong>Prosek:</strong> {averageScore.toFixed(2)}</div> 

      <div><strong>SD:</strong> {standardDeviation.toFixed(3)}</div> 

      <div><strong>Extreme Spread:</strong> {extremeSpreadMm.toFixed(2)} mm</div> 

      <div><strong>Mean Radius:</strong> {meanRadiusMm.toFixed(2)} mm</div> 

 

      <div style={{ marginTop: "10px" }}> 

        <strong>Mean Radius po seriji:</strong> 

        {meanRadiusBySeries.map((mr, i) => ( 

          <div key={i}>Serija {i + 1}: {mr.toFixed(2)} mm</div> 

        ))} 

      </div> 

    <div style={{ marginTop: "20px" }}> 

  <strong>Analitika po serijama:</strong> 

 

  <table 

    style={{ 

      width: "100%", 

      marginTop: "10px", 

      borderCollapse: "collapse", 

      fontSize: "12px" 

    }} 

  > 

    <thead> 

      <tr> 

        <th></th> 

        {seriesList.map(series => ( 

          <th colSpan={2} key={series.index}> 

            Serija {series.index} 
            <span style={{ fontWeight: "normal" }}>
              {" "} ({series.total.toFixed(1)})
            </span>
          </th> 

        ))} 

      </tr> 

      <tr> 

        <th></th> 

        {seriesList.map(series => ( 

          <> 

            <th key={`v-${series.index}`}>Vrednost</th> 

            <th key={`t-${series.index}`}>Vreme</th> 

          </> 

        ))} 

      </tr> 

    </thead> 

 

    <tbody> 

      <tr> 

        <td><strong>MAX</strong></td> 

        {analyticsTable.max.map((row, i) => ( 

          <> 

            <td key={`max-v-${i}`}>{row.value}</td> 

            <td key={`max-t-${i}`}>{row.time}</td> 

          </> 

        ))} 

      </tr> 

 

      <tr> 

        <td><strong>MIN</strong></td> 

        {analyticsTable.min.map((row, i) => ( 

          <> 

            <td key={`min-v-${i}`}>{row.value}</td> 

            <td key={`min-t-${i}`}>{row.time}</td> 

          </> 

        ))} 

      </tr> 

 

      <tr> 

        <td><strong>AVG</strong></td> 

        {analyticsTable.avg.map((row, i) => ( 

          <> 

            <td key={`avg-v-${i}`}>{row.value}</td> 

            <td key={`avg-t-${i}`}>{row.time}</td> 

          </> 

        ))} 

      </tr> 

    </tbody> 

  </table> 

</div>  

<div style={{ marginTop: "20px" }}> 

  <strong>Raspodela serije (5 + 5):</strong> 

 

  <table 

    style={{ 

      width: "100%", 

      marginTop: "10px", 

      borderCollapse: "collapse", 

      fontSize: "12px" 

    }} 

  > 

    <thead> 

      <tr> 

        <th></th> 

        {seriesList.map(series => ( 

          <th key={series.index}> 

            Serija {series.index} 

          </th> 

        ))} 

      </tr> 

    </thead> 

 

    <tbody> 

      <tr> 

        <td><strong>Prvih 5</strong></td> 

        {firstSecondFive.map(row => ( 

          <td key={`f-${row.index}`}>{row.firstFive}</td> 

        ))} 

      </tr> 

 

      <tr> 

        <td><strong>Drugih 5</strong></td> 

        {firstSecondFive.map(row => ( 

          <td key={`s-${row.index}`}>{row.secondFive}</td> 

        ))} 

      </tr> 

    </tbody> 

  </table> 

</div> 

 <div style={{ marginTop: "20px" }}> 

  <strong>Analiza po vremenu opaljenja:</strong> 

  <table 

    style={{ 

      width: "75%", 

      marginTop: "10px", 

      borderCollapse: "collapse", 

      fontSize: "12px" 

    }} 

  > 

    <thead> 

      <tr> 

        <th>Vreme (s)</th> 

        <th>Broj pogodaka</th> 

        <th>Prosečna vrednost</th> 

      </tr> 

    </thead> 

    <tbody> 

      <tr> 

        <td>&lt; 25</td> 

        <td>{timeAnalysis.under25.count}</td> 

        <td>{timeAnalysis.under25.avg}</td> 

      </tr> 

      <tr> 

        <td>25 – 30</td> 

        <td>{timeAnalysis.between25and30.count}</td> 

        <td>{timeAnalysis.between25and30.avg}</td> 

      </tr> 

      <tr> 

        <td>&gt; 30</td> 

        <td>{timeAnalysis.over30.count}</td> 

        <td>{timeAnalysis.over30.avg}</td> 

      </tr> 

    </tbody> 

  </table> 

</div> 
 
    </div> 

     {/* DESNA STRANA */} 

    <div className="print-summary-right"> 


      <h3 style={{ marginBottom: "10px" }}>Statistika pogodaka</h3> 


      <table className="print-stats-table"> 

        <thead> 

          <tr> 

            <th>Vrednost</th> 

            <th>Broj</th> 

            <th>%</th> 

          </tr> 

        </thead> 

        <tbody> 

          {Object.entries(shotDistribution).map(([key, count]) => { 

 

            const percent = 

              totalShotCount > 0 

                ? ((count / totalShotCount) * 100).toFixed(1) 

                : "0.0"; 

 

            return ( 

              <tr key={key}> 

                <td>{key}</td> 

                <td>{count}</td> 

                <td>{percent}%</td> 

              </tr> 

            ); 

          })} 

        </tbody> 

      </table> 

 

    </div> 

 

  </div> 

 

</div> 
      
        
        <div className="print-only"> 
         

 

{seriesList.map((series, i) => ( 

  <div 

    key={i} 

    className="print-series-block" 


  > 

 

      <h3>Serija {i + 1} — Ukupno: {series.total.toFixed(1)}</h3> 


 

      <div className="print-series-content"> 

 

        <PrintCanvasTarget series={series} /> 

 {(() => { 

  const seriesEvents = 

    (activeSessionState.matchEvents ?? []).filter( 

      event => event.seriesIndex === series.index 

    ); 

 

  const seriesTimeline = [ 

    ...series.shots.map(shot => ({ 

      type: "shot" as const, 

      time: shot.matchTime, 

      data: shot 

    })), 

    ...seriesEvents.map(event => ({ 

      type: "event" as const, 

      time: event.startMatchTime ?? event.matchTime, 

      data: event 

    })) 

  ].sort((a, b) => a.time - b.time); 

 

  return ( 

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

        {seriesTimeline.map((item, index) => { 

 

          if (item.type === "shot") { 

            const shot = item.data; 

 

            return ( 

              <tr key={`shot-${index}`}> 

                <td>{shot.index}</td> 

                <td>{shot.value.toFixed(1)}</td> 

                <td>{getShotDirection(shot)}</td> 

                <td>{shot.shotTime.toFixed(2)}</td> 

                <td>{formatMatchTime(shot.matchTime ?? 0)}</td> 

              </tr> 

            ); 

          } 

 

          if (item.type === "event") { 

            const event = item.data; 

 

            return ( 

              <tr key={`event-${index}`}> 

                <td colSpan={5} style={{ fontSize: "12px", fontStyle: "italic" }}> 

                  {event.type === "dry_fire" && "⚪ OKIDANJE NA PRAZNO"} 

                  {event.type === "pause_on_line" && "⏸ PAUZA NA LINIJI"} 

                  {event.type === "leave_line" && "↩ IZLAZAK SA LINIJE"} 

                  {" — "} 

                  {event.duration?.toFixed(2)} s 

                </td> 

              </tr> 

            ); 

          } 

 

          return null; 

        })} 

      </tbody> 

    </table> 

  ); 

})()} 

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
 {activeSessionState.completed && !isReadOnly && ( 

  
  <div 

    style={{ 

      background: "#1a3a1a", 

      color: "#4cff4c", 

      padding: "10px", 

      marginBottom: "10px", 

      textAlign: "center", 

      fontWeight: "bold", 

      fontSize: "18px" 

    }} 

  > 

    MEČ ZAVRŠEN 

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

  disabled={activeSessionState.completed} 

  onClick={() => { 

    pushToHistory(activeSessionState);
    const now = Date.now(); 
    setActiveSessionState(prev => ({ 

      ...prev, 

      completed: true, 

      matchEndedTimestamp: now,
      finishReason: "manual"


    })); 

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
 
<button 

  disabled={historyStack.length === 0} 

  onClick={() => { 

    if (historyStack.length === 0) return; 
    const previous = historyStack[historyStack.length - 1]; 
    // ✅ тренутно стање иде у redoStack 

  setRedoStack(prev => [ 

    ...prev, 

    JSON.parse(JSON.stringify(activeSessionState)) 

  ]);  

    setActiveSessionState(previous); 

    setHistoryStack(prev => prev.slice(0, -1)); 

  }} 

  style={{ 

    marginLeft: "", 

    background: "transparent", 

    border: "1px solid #444", 

    

    cursor: historyStack.length === 0 ? "default" : "pointer", 

    fontSize: "11px", 

    padding: "2px 8px"

  }} 

> 

  UNDO 

</button> 

<button 

  disabled={redoStack.length === 0} 

  onClick={() => { 

 

    if (redoStack.length === 0) return; 

    const next = redoStack[redoStack.length - 1]; 

    // ✅ тренутно стање враћамо у history 

    setHistoryStack(prev => [ 

      ...prev, 

      JSON.parse(JSON.stringify(activeSessionState)) 

    ]); 

 

    setActiveSessionState(next); 

    setRedoStack(prev => prev.slice(0, -1)); 

  }} 

  style={{ 

    marginLeft: "", 

    fontSize: "11px", 

    padding: "2px 8px" 

  }} 

> 

  REDO 

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

  disabled={isReadOnly || manualTimeMode || activeSessionState.completed} 

  onClick={() => { 

     const now = Date.now(); 

    
    
    const sessions = loadSessions(); 

    const activeId = getActiveSessionId(); 

    const updated = sessions.map(s => 

      s.id === activeId 

        ? { ...s, matchStartTimestamp: now } 

        : s 

    ); 

     saveSessions(updated); 
    setActiveSessionState(prev => ({
      ...prev,
      matchStartTimestamp: now,
      matchEndedTimestamp: null,
      completed: false
    }));

    setMatchRunning(true); 

  }} 

> 

  START MEČА 

</button> 

 

          <button 
            disabled={isReadOnly || manualTimeMode || activeSessionState.completed}
            onClick={() => { 

  // ✅ ако постоји активан event (pauza / izlazak), затвори га 

  const openEventIndex = getOpenEventIndex(); 

  if (openEventIndex !== -1) { 

    const endMatchTime = getCurrentMatchTime(); 

    setActiveSessionState(prev => { 

      const updatedEvents = [...(prev.matchEvents ?? [])]; 

      const event = updatedEvents[openEventIndex]; 

      event.endMatchTime = endMatchTime; 

      event.duration = endMatchTime - event.startMatchTime; 

      return { 

        ...prev, 

        matchEvents: updatedEvents 

      }; 

    }); 

  } 

            if (shotStartRef.current === null) { 

  // reset старт 

  shotStartRef.current = performance.now(); 

} else { 

  // resume 

  shotStartRef.current = performance.now() - shotElapsed * 1000; 

} 

setShotRunning(true);  

          }}> 

            START POGODAK 

          </button> 

          <button 
            disabled={isReadOnly || manualTimeMode || activeSessionState.completed}
            onClick={() => setShotRunning(false)}> 

            STOP POGODAK 

          </button> 

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}> 

  <div> 

    Vreme: {shotElapsed.toFixed(2)} s 

  </div> 

  {!shotRunning && shotElapsed > 0 && ( 

    <button 

      onClick={() => { 

        setShotElapsed(0); 

        shotStartRef.current = null; 

        setShotRunning(false); 

      }} 

      style={{ 

        background: "none", 

        border: "none", 

        color: "#ff5555", 

        cursor: "pointer", 

        fontSize: "12px", 

        textDecoration: "underline" 

      }} 

    > 

      RESET 

    </button> 

  )} 

</div> 

          {activeSessionState.mode !== "final" && 

          activeSessionState.format === "60" && ( 

  <div style={{ marginTop: "10px", fontSize: "18px", fontWeight: "bold" }}> 

    Preostalo vreme:{" "} 

    {remainingTime !== null 

      ? `${Math.floor(remainingTime / 60) 

          .toString() 

          .padStart(2, "0")}:${Math.floor( 

          remainingTime % 60 

        ) 

          .toString() 

          .padStart(2, "0")}` 

      : "--:--"} 

  </div> 
  

)} 
{activeSessionState.format === "60" && ( 

  <div style={{ marginTop: "5px" }}> 

    Tempo:{" "} 

    {tempoDifference >= 0 ? "ISPRED" : "IZA"}{" "} 

    ({tempoDifference.toFixed(1)} hitaca) 

  </div> 

)}  

          <div style={{ marginTop: "10px" }}> 

  <strong>Događaji u meču</strong> 

  <div style={{ display: "flex", gap: "8px", marginTop: "5px" }}> 

    <button 
    disabled={activeSessionState.completed}
    onClick={() => addMatchEvent("leave_line")}> 

      IZLAZAK SA LINIJE 

    </button> 

    <button 
    disabled={activeSessionState.completed}
    onClick={() => addMatchEvent("pause_on_line")}> 

      PAUZA NA LINIJI 

    </button> 

 

<button 

  disabled={!shotElapsed || activeSessionState.completed} 

  onClick={registerDryFire} 

> 

  OKIDANJE NA PRAZNO 

</button> 

  </div> 

</div> 

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
                disabled={isReadOnly || activeSessionState.completed}

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

        <div className={`shot-list-panel 
          ${activeSessionState.mode === "final" ? "final-mode" : ""}`}> 

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

                {seriesTimeline.map((item, index) => { 

  if (item.type === "shot") { 

    const shot = item.data; 

    return ( 

      <tr key={`shot-${index}`}> 

        <td>{shot.index}</td> 

        <td>{shot.value.toFixed(1)}</td> 

        <td>{getShotDirection(shot)}</td> 

        <td>{shot.shotTime.toFixed(2)}</td> 

        <td>{formatMatchTime(shot.matchTime ?? 0)}</td> 

      </tr> 

    ); 

  } 

 

  if (item.type === "event") { 

    const event = item.data; 

    return ( 

      <tr 

  key={`event-${index}`} 

  style={{ 

    backgroundColor: 

      event.type === "pause_on_line" 

        ? "#2c2415" 

        : event.type === "leave_line" 

        ? "#2a1f1f" 

        : "#1f1f1f" 

  }} 

> 

<td 

  colSpan={5} 

  style={{ 

    textAlign: "center", 

    fontSize: "12px", 

    fontWeight: 500, 

    letterSpacing: "0.3px", 

    color: 

      event.type === "pause_on_line" 

        ? "#ffb74d" 

        : event.type === "leave_line" 

        ? "#ef5350" 

        : "#9ecbff" 

  }} 

> 

{event.type === "dry_fire" && "⚪ OKIDANJE NA PRAZNO"} 

{event.type === "leave_line" && "↩ IZLAZAK SA LINIJE"} 

{event.type === "pause_on_line" && "⏸ PAUZA NA LINIJI"} 

          {" — "} 

          {event.duration?.toFixed(2) ?? event.matchTime.toFixed(2)} s 

        </td> 

      </tr> 

    ); 

  } 

  return null; 

})} 

              </tbody> 

            </table> 

          </div> 

 

          <div className="series-grid"> 

  {Array.from({ length: getMaxSeriesCount() }).map((_, i) => { 

    const s = seriesList[i]; 

 const seriesPairs: typeof seriesList[] = []; 

for (let i = 0; i < seriesList.length; i += 2) { 

  seriesPairs.push(seriesList.slice(i, i + 2)); 

} 

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