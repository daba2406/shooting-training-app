import type { ShootingSession } from "../types"; 

import { loadSessions, saveSessions } from "../sessionManager"; 

import { useState } from "react"; 
import { useTranslation } from "react-i18next";

 

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

  onBack, 

}: Props) { 

 const { t } = useTranslation();

  const [filterMode, setFilterMode] = useState< 

    "all" | "training" | "qualification" | "final" 

  >("all"); 

 

  const [selectedShooter, setSelectedShooter] = useState<string>("all"); 

 

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

 

  // ✅ Učitavanje strelaca iz localStorage 

  const storedShooters = localStorage.getItem("shooters"); 

  const shooters = storedShooters ? JSON.parse(storedShooters) : []; 

 

  return ( 

    <div style={{ padding: "20px" }}> 

    <div className="app-topbar"> 

  <div className="app-topbar-brand"> 

    AXIOM <span className="app-topbar-tagline">| Precision Intelligence</span> 

  </div> 

</div> 

 

      {/* HEADER */} 

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}> 

        <h2>{t("archive.title")}</h2> 

 

        {/* ✅ DROPDOWN ZA STRELCA */} 

        <select 

          value={selectedShooter} 

          onChange={(e) => setSelectedShooter(e.target.value)} 

          style={{ 

            padding: "6px 10px", 

            borderRadius: "6px", 

            background: "#222", 

            color: "white", 

            border: "1px solid #444" 

          }} 

        > 

          <option value="all">{t("common.all_shooters")}</option> 

          {shooters.map((s: any) => ( 

            <option key={s.id} value={s.name}> 

              {s.name} 

            </option> 

          ))} 

        </select> 

      </div> 

 

      {/* BACK BUTTON */} 

      <div style={{ marginBottom: "15px", marginTop: "10px" }}> 

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

          ← {t("common.back")} 

        </button> 

      </div> 

 

      {/* MODE FILTER */} 

      <div style={{ marginBottom: "15px" }}> 

<button onClick={() => setFilterMode("all")}> 

  {t("archive.filters.all")} 

</button> 

 

<button onClick={() => setFilterMode("training")}> 

  {t("archive.filters.training")} 

</button> 

 

<button onClick={() => setFilterMode("qualification")}> 

  {t("archive.filters.qualification")} 

</button> 

 

<button onClick={() => setFilterMode("final")}> 

  {t("archive.filters.final")} 

</button> 

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

          {t("archive.export")}

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

      alert(t("archive.import.invalid_format"));  

      return; 

    } 

 

    console.log("Parsed OK"); 

 

    const normalizedSessions = importedSessions.map((s: any) => ({ 

      ...s, 

      shooterName: s.shooterName ?? "Nepoznat strelac" 

    })); 

 

    console.log("Normalized OK"); 

 

    try { 

      saveSessions(normalizedSessions); 

      console.log("Saved OK"); 

    } catch (saveErr) { 

      console.error("Save error:", saveErr); 

      alert("Greška pri čuvanju u localStorage."); 

      return; 

    } 

 

    alert(t("archive.import.success")); 

    window.location.reload(); 

 

  } catch (err) { 

    console.error("Parse error:", err); 

    alert(t("archive.import.error"));  

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

              <th style={{ width: "120px", cursor: "pointer" }} onClick={() => handleSort("date")}>{t("archive.table.date")} </th> 

              <th style={{ width: "160px" }}>{t("archive.table.shooter")} </th> {/* ✅ NOVA KOLONA */} 

              <th style={{ width: "100px" }}>{t("archive.table.type")} </th> 

              <th style={{ width: "180px" }}>{t("archive.table.competition")} </th> 

              <th style={{ width: "80px" }}>{t("archive.table.format")}</th> 

              <th style={{ width: "90px", cursor: "pointer" }} onClick={() => handleSort("total")}>{t("archive.table.total")} </th> 

              <th style={{ width: "80px", cursor: "pointer" }} onClick={() => handleSort("duration")}>{t("archive.table.duration")} </th> 

              <th style={{ width: "120px", cursor: "pointer" }} onClick={() => handleSort("status")}>{t("archive.table.status")} </th> 

              <th style={{ width: "80px" }}>{t("archive.table.action")} </th> 

            </tr> 

          </thead> 

 

          <tbody> 

            {[...sessions] 

              .filter(session => 

                (filterMode === "all" ? true : session.mode === filterMode) && 

                (selectedShooter === "all" 

                  ? true 

                  : session.shooterName === selectedShooter) 

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

                  <tr key={session.id} style={{ cursor: "pointer" }}> 

                    <td onClick={() => onOpenSession(session.id)}> 

                      {new Date(session.date).toLocaleDateString()} 

                    </td> 

                    <td>{session.shooterName ?? "-"}</td> {/* ✅ PRIKAZ STRELCA */} 

                    <td>{session.mode}</td> 

                    <td>{session.competitionName ?? "-"}</td> 

                    <td>{session.format}</td> 

                    <td>{session.totalResult?.toFixed(1) ?? "0.0"}</td> 

                    <td>{duration}</td> 

                    <td> 

{!session.completed && t("archive.status.in_progress")} 

{session.completed && session.finishReason === "manual" && t("archive.status.manual")} 

{session.completed && session.finishReason === "shots_limit" && t("archive.status.shots_limit")} 

{session.completed && session.finishReason === "time_limit" && t("archive.status.time_limit")} 

{session.completed && !session.finishReason && t("archive.status.finished")} 

                    </td> 

                    <td> 

                      <button 

                        className="delete-btn" 

                        onClick={(e) => { 

                          e.stopPropagation(); 

                          if (!window.confirm(t("archive.delete_confirm"))) return; 

                          onDeleteSession(session.id); 

                        }} 

                      > 

                       {t("archive.delete")}

                      </button> 

                    </td> 

                  </tr> 

                ); 

              })} 

          </tbody> 

        </table> 

      )} 

    </div> 

  ); 

} 