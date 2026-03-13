export interface Shot { 

  index: number; 

  value: number; 

  x: number; 

  y: number; 

  radius: number; 

  shotTime: number; 

  matchTime: number; //vreme od pocetka meca

} 

 

export interface Series { 

  index: number; 

  shots: Shot[]; 

  total: number; 

  completed: boolean; 

  type?: "normal" | "shotoff";

} 

 

export interface ShootingSession { 

  id: string; 

  date: string; 
  competitionName?: string;
  startTime?: string;
  shooterName?: string;

  mode: "training" | "qualification" | "final"; 

  format: "60" | "40" | "trial" | "custom"; 

  trainingInputMode?: "shots" | "series";

  maxShots: number | null; 
  matchStartTimestamp?: number;

  seriesList: Series[]; 

  totalResult: number; 

  completed: boolean; 

  finishReason?: "manual" | "shots_limit" | "time_limit";

  pauseStartTimestamp?: number | null; 

totalPausedTime?: number; 

matchEvents?: MatchEvent[]; 

matchEndedTimestamp?: number | null;



} 
export type MatchEventType = 

  | "leave_line" 

  | "pause_on_line" 

  | "dry_fire"; 

 

export interface MatchEvent { 

  type: MatchEventType; 

  timestamp: number; 

  matchTime: number; 

  startMatchTime: number; // novo 

  endMatchTime?: number;  // novo 

  duration?: number;      // novo 

  seriesIndex: number;    // novo 

} 

