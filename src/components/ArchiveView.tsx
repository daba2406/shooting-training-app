import type { ShootingSession } from "../types"; 

 

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

 

      {sessions.length === 0 && ( 

        <div>Nema sačuvanih sesija.</div> 

      )} 

 

<table className="archive-table"> 

  <thead> 

    <tr> 

      <th>Datum</th> 

      <th>Tip</th> 

      <th>Takmicenje</th>

      <th>Format</th> 

      <th>Ukupno</th> 

      <th>Status</th> 

      <th>Akcija</th> 

    </tr> 

  </thead> 

  <tbody> 

    {sessions.map(session => ( 

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

    </div> 

  ); 

} 