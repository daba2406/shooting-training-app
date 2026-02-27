import type { ShootingSession, Series } from "./types"; 

 

const STORAGE_KEY = "shooting-sessions"; 

const ACTIVE_KEY = "active-session-id"; 

 

export const loadSessions = (): ShootingSession[] => { 

  const saved = localStorage.getItem(STORAGE_KEY); 

  return saved ? JSON.parse(saved) : []; 

}; 

 

export const saveSessions = (sessions: ShootingSession[]) => { 

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); 

}; 

 

export const getActiveSessionId = (): string | null => { 

  return localStorage.getItem(ACTIVE_KEY); 

}; 

 

export const setActiveSessionId = (id: string) => { 

  localStorage.setItem(ACTIVE_KEY, id); 

}; 

 

export const createNewSession = (): ShootingSession => { 

 

  const initialSeries: Series[] = [ 

    { index: 1, shots: [], total: 0, completed: false } 

  ]; 

 

  return { 

    id: Date.now().toString(), 

    date: new Date().toISOString(), 

    mode: "training", 

    format: "60", 

    maxShots: 60, 

    seriesList: initialSeries, 

    totalResult: 0, 

    completed: false 

  }; 

}; 