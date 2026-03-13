import type { ShootingSession } from "../types"; 
import { useState} from "react";
import { loadSessions, saveSessions } from "../sessionManager";


interface Props { 

  session: ShootingSession; 

  setSession: React.Dispatch< 

    React.SetStateAction<ShootingSession> 

  >; 

} 

export default function BasicTrainingView({ 

  session,
  setSession 

}: Props) { 
     const [seriesValues, setSeriesValues] = useState<number[]>( 

  Array(6).fill(0) 

); 
  const totalScore = seriesValues.reduce( 

  (a, b) => a + b, 

  0 

); 

  return ( 
    

    <div 

      style={{ 

        maxWidth: "500px", 

        background: "#1f1f1f", 

        padding: "20px", 

        borderRadius: "8px", 

        marginBottom: "20px", 

        color: "white" 

      }} 

    > 

      <h3 style={{ marginBottom: "15px" }}> 

        Basic trening – unos serija 

      </h3> 

 

<div style={{ marginBottom: "15px" }}> 

  <label style={{ marginRight: "10px" }}> 

    Datum: 

  </label> 

  <input 

    type="date" 

    value={session.date} 

onChange={(e) => { 

  setSession(prev => ({ 

    ...prev, 

    date: e.target.value 

  })); 

}} 

  /> 

</div> 

      <div style={{ marginTop: "15px" }}> 

  {seriesValues.map((value, index) => ( 

    <div key={index} style={{ marginBottom: "8px" }}> 

      <label style={{ marginRight: "10px" }}> 

        Serija {index + 1}: 

      </label> 

 

      <input 

  type="number" 

  step="0.1" 

  min="0" 

  max="109" 

  value={value} 

  onChange={(e) => { 

    const newValues = [...seriesValues]; 

    newValues[index] = parseFloat(e.target.value) || 0; 

    setSeriesValues(newValues); 

  }} 

  style={{ 

    width: "70px", 

    textAlign: "center" 

  }} 

/>  

    </div> 

  ))} 

</div> 

<div style={{ marginTop: "15px", fontWeight: 600 }}> 

  Ukupno:{" "} 

  {seriesValues 

    .reduce((a, b) => a + b, 0) 

    .toFixed(1)} 

</div> 

<div style={{ marginTop: "20px" }}> 

  <button 

    onClick={() => { 

  const newSeriesList = seriesValues.map( 

    (value, index) => ({ 

      index: index + 1, 

      shots: [], 

      total: value, 

      completed: true 

    }) 

  ); 

 

  const updatedSession = { 

    ...session, 

    seriesList: newSeriesList, 

    totalResult: totalScore, 

    completed: true 

  }; 

 

  // ✅ Упиши у state 

  setSession(updatedSession); 

 

  // ✅ Упиши у архиву 

  const sessions = loadSessions(); 

  const exists = sessions.some(s => s.id === session.id); 

 

  let updatedSessions; 

 

  if (!exists) { 

    updatedSessions = [...sessions, updatedSession]; 

  } else { 

    updatedSessions = sessions.map(s => 

      s.id === session.id ? updatedSession : s 

    ); 

  } 

 

  saveSessions(updatedSessions); 

}} 

  > 

    Završi trening 

  </button> 

</div> 

    </div> 

    

  ); 


} 