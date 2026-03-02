import type { ShootingSession } from "../types"; 

import { loadSessions, saveSessions } from "../sessionManager"; 

 

interface Props { 

  sessions: ShootingSession[]; 

  onOpenSession: (id: string) => void; 

  onDeleteSession: (id: string) => void; 

} 

 

export default function ArchiveView({ 

  sessions, 

  onOpenSession, 

  onDeleteSession 

}: Props) { 

 

  return ( 

    <div style={{ padding: "20px" }}> 

 

      <h2>Arhiva sesija</h2> 

 

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

              <th>Datum</th> 

              <th>Tip</th> 

              <th>Takmičenje</th> 

              <th>Format</th> 

              <th>Ukupno</th> 

              <th>Status</th> 

              <th>Akcija</th> 

            </tr> 

          </thead> 

 

          <tbody> 

            {[...sessions] 

              .sort((a, b) => 

                new Date(b.date).getTime() - new Date(a.date).getTime() 

              ) 

              .map(session => ( 

                <tr key={session.id}> 

                  <td onClick={() => onOpenSession(session.id)}> 

                    {new Date(session.date).toLocaleDateString()} 

                  </td> 

                  <td>{session.mode}</td> 

                  <td>{session.competitionName ?? "-"}</td> 

                  <td>{session.format}</td> 

                  <td>{session.totalResult?.toFixed(1) ?? "0.0"}</td> 

                  <td> 

                    {session.completed ? "Završeno" : "U toku"} 

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

              ))} 

          </tbody> 

        </table> 

      )} 

 

    </div> 

  ); 

} 