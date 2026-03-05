import type { ShootingSession } from "../types"; 

import { loadSessions, saveSessions } from "../sessionManager"; 

import {useState} from "react";

interface Props { 

  sessions: ShootingSession[]; 

  onOpenSession: (id: string) => void; 

  onDeleteSession: (id: string) => void; 

  onBack: () => void;

} 

 

export default function ArchiveView({ 

  sessions, 

  onOpenSession, 

  onDeleteSession,

  onBack

}: Props) 

{ 
 const [filterMode, setFilterMode] = useState<
 "all" | "training" | "qualification" | "final"
 >("all");

const [sortField, setSortField] = useState<
"date" | "total" | "duration" | "status"
>("date");

const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

const handleSort = ( 

  field: "date" | "total" | "duration" | "status" 

) => { 

  if (sortField === field) { 

    setSortDirection(prev => (prev === "asc" ? "desc" : "asc")); 

  } else { 

    setSortField(field); 

    setSortDirection("desc"); 

  } 

}; 

  return ( 

    <div style={{ padding: "20px" }}> 

 

      <h2>Arhiva sesija</h2> 

      <div style={{ marginBottom: "15px" }}> 
  
  <div style={{ marginBottom: "15px" }}> 

  <button 

    onClick={onBack} 

    style={{ 

      padding: "6px 12px", 

      backgroundColor: "#222", 

      border: "1px solid #555", 

      color: "#fff", 

      cursor: "pointer", 

      borderRadius: "4px" 

    }} 

  > 

    ← Povratak na glavni ekran 

  </button> 

</div> 

  <button onClick={() => setFilterMode("all")}>Sve</button> 

  <button onClick={() => setFilterMode("training")}>Training</button> 

  <button onClick={() => setFilterMode("qualification")}>Qualification</button> 

  <button onClick={() => setFilterMode("final")}>Final</button> 

</div> 

 

      {/* EXPORT */} 

      <div style={{ marginBottom: "10px" }}> 

        <button 

          onClick={() => { 

            const sessions = loadSessions(); 

 

            const blob = new Blob( 

              [JSON.stringify(sessions, null, 2)], 

              { type: "application/json" } 

            ); 

 

            const url = URL.createObjectURL(blob); 

            const a = document.createElement("a"); 

            a.href = url; 

            a.download = "shooting-archive.json"; 

            a.click(); 

 

            URL.revokeObjectURL(url); 

          }} 

        > 

          EXPORT ARHIVE 

        </button> 

      </div> 

 

      {/* IMPORT */} 

      <div style={{ marginBottom: "20px" }}> 

        <input 

          type="file" 

          accept="application/json" 

          onChange={(e) => { 

            const file = e.target.files?.[0]; 

            if (!file) return; 

 

            const reader = new FileReader(); 

 

            reader.onload = (event) => { 

              try { 

                const importedSessions = JSON.parse( 

                  event.target?.result as string 

                ); 

 

                if (!Array.isArray(importedSessions)) { 

                  alert("Neispravan format fajla."); 

                  return; 

                } 

 

                saveSessions(importedSessions); 

                alert("Arhiva uspešno učitana."); 

                window.location.reload(); 

              } catch { 

                alert("Greška pri učitavanju fajla."); 

              } 

            }; 

 

            reader.readAsText(file); 

          }} 

        /> 

      </div> 

 

      {sessions.length === 0 && ( 

        <div>Nema sačuvanih sesija.</div> 

      )} 

 

      {sessions.length > 0 && ( 

        <table className="archive-table"> 

<thead> 

  <tr> 

    <th style={{ width: "120px", cursor: "pointer" }}
    
    onClick={() => handleSort("date")}
    >
      Datum
      </th> 

    <th style={{ width: "100px" }}>Tip</th> 

    <th style={{ width: "180px" }}>Takmičenje</th> 

    <th style={{ width: "80px" }}>Format</th> 

    <th style={{ cursor: "pointer", width: "90px", textAlign: "left" }}
    onClick={() => handleSort("total")}
    >
      Ukupno
      </th>

    <th style={{ cursor: "pointer", width: "80px", textAlign: "center"}}
    onClick={() => handleSort("duration")}
    >
      Trajanje
      </th>

    <th style={{ cursor: "pointer", width: "120px", textAlign: "center" }}
    onClick={() => handleSort("status")}
    >
      Status
      </th> 

    <th style={{ width: "80px", textAlign: "left" }}>Akcija</th> 

  </tr> 

</thead> 

 

          <tbody> 

{[...sessions] 

  .filter(session => 

    filterMode === "all" 

      ? true 

      : session.mode === filterMode 

  ) 

  .sort((a, b) => { 

  let comparison = 0; 

 

  if (sortField === "date") { 

    comparison = 

      new Date(a.date).getTime() - new Date(b.date).getTime(); 

  } 

 

  if (sortField === "total") { 

    comparison = (a.totalResult ?? 0) - (b.totalResult ?? 0); 

  } 

 

  if (sortField === "duration") { 

    const aDuration = 

      a.matchStartTimestamp && a.matchEndedTimestamp 

        ? a.matchEndedTimestamp - a.matchStartTimestamp 

        : 0; 

 

    const bDuration = 

      b.matchStartTimestamp && b.matchEndedTimestamp 

        ? b.matchEndedTimestamp - b.matchStartTimestamp 

        : 0; 

 

    comparison = aDuration - bDuration; 

  } 

 

  if (sortField === "status") { 

  const statusValue = (s: ShootingSession) => { 

    if (!s.completed) return 0; 

    if (s.finishReason === "manual") return 1; 

    if (s.finishReason === "shots_limit") return 2; 

    if (s.finishReason === "time_limit") return 3; 

    return 1; 

  }; 

 

  comparison = statusValue(a) - statusValue(b); 

} 

 

  return sortDirection === "asc" ? comparison : -comparison; 

}) 

  .map(session => {  

 

  let duration = "-"; 

 

  if (session.matchStartTimestamp && session.matchEndedTimestamp) { 

    const diffMs = 

      session.matchEndedTimestamp - session.matchStartTimestamp; 

 

    const totalSeconds = Math.floor(diffMs / 1000); 

 

    const hours = Math.floor(totalSeconds / 3600) 

      .toString() 

      .padStart(2, "0"); 

 

    const minutes = Math.floor((totalSeconds % 3600) / 60) 

      .toString() 

      .padStart(2, "0"); 

 

    const seconds = (totalSeconds % 60) 

      .toString() 

      .padStart(2, "0"); 

 

    duration = `${hours}:${minutes}:${seconds}`; 

  } 

 

  return ( 

                <tr 
                key={session.id}
                style={{ cursor: "pointer" }}> 

                  <td onClick={() => onOpenSession(session.id)}> 

                    {new Date(session.date).toLocaleDateString()} 

                  </td> 

                  <td>{session.mode}</td> 

                  <td>{session.competitionName ?? "-"}</td> 

                  <td style={{ textAlign: "right" }}>
                    {session.format}</td> 

                  <td style={{ width: "90px", textAlign: "left" }}>
                    {session.totalResult?.toFixed(1) ?? "0.0"}</td> 
                  <td style={{ textAlign: "center" }}>
                    {duration}
                  </td>




 

 <td style={{ width: "180px", textAlign: "left" }}> 

  <span 

    style={{ 

      display: "inline-block", 

      minWidth: "140px", 

      padding: "6px 12px", 

      borderRadius: "20px", 

      fontSize: "12px", 

      fontWeight: 600, 

      textAlign: "center", 

      backgroundColor: !session.completed 

        ? "#ffe082" 

        : session.finishReason === "manual" 

        ? "#81c784" 

        : session.finishReason === "shots_limit" 

        ? "#64b5f6" 

        : session.finishReason === "time_limit" 

        ? "#e57373" 

        : "#81c784", 

      color: "#1b1b1b" 

    }} 

  > 

    {!session.completed && "U toku"} 

 

    {session.completed && session.finishReason === "manual" && "Ručno završeno"} 

    {session.completed && session.finishReason === "shots_limit" && "Limit hitaca"} 

    {session.completed && session.finishReason === "time_limit" && "Isteklo vreme"} 

    {session.completed && !session.finishReason && "Završeno"} 

  </span> 

</td> 

                  <td> 

                    <button 

                      className="delete-btn" 

                      onClick={(e) => { 

                        e.stopPropagation(); 

                        const confirmDelete = window.confirm( 

                          "Da li ste sigurni da želite da obrišete ovu sesiju?" 

                        ); 

                        if (!confirmDelete) return; 

                        onDeleteSession(session.id); 

                      }} 

                    > 

                      Obriši 

                    </button> 

                  </td> 

                </tr> 
  );

}) }

          </tbody> 

        </table> 

      )} 

 

    </div> 

  ); 

} 