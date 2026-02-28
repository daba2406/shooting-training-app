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

} 

 

export interface ShootingSession { 

  id: string; 

  date: string; 
  competitionName?: string;
  startTime?: string;

  mode: "training" | "qualification" | "final"; 

  format: "60" | "40" | "trial" | "custom"; 

  maxShots: number | null; 

  seriesList: Series[]; 

  totalResult: number; 

  completed: boolean; 

} 