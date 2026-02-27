import type { ShootingSession } from "../types"; 

 

interface Props { 

  sessions: ShootingSession[]; 

  onOpenSession: (id: string) => void; 

} 

 

export default function ArchiveView({ 

  sessions, 

  onOpenSession 

}: Props) { 

 

  return ( 

    <div style={{ padding: "20px" }}> 

      <h2>Arhiva sesija</h2> 

 

      {sessions.length === 0 && ( 

        <div>Nema sačuvanih sesija.</div> 

      )} 

 

<table style={{ 

  width: "100%", 

  marginTop: "20px", 

  borderCollapse: "collapse" 

}}> 

  <thead> 

    <tr> 

      <th style={{ textAlign: "left", padding: "8px" }}>Datum</th> 

      <th style={{ textAlign: "left", padding: "8px" }}>Tip</th> 

      <th style={{ textAlign: "center", padding: "8px" }}>Format</th> 

      <th style={{ textAlign: "right", padding: "8px" }}>Ukupno</th> 

      <th style={{ textAlign: "center", padding: "8px" }}>Status</th> 

    </tr> 

  </thead> 

  <tbody> 

    {sessions.map(session => ( 

      <tr 

        key={session.id} 

        style={{ 

          cursor: "pointer", 

          borderTop: "1px solid #333" 

        }} 

        onClick={() => onOpenSession(session.id)} 

      > 

        <td style={{ padding: "8px" }}> 

          {new Date(session.date).toLocaleString()} 

        </td> 

        <td style={{ padding: "8px" }}> 

          {session.mode} 

        </td> 

        <td style={{ padding: "8px", textAlign: "center" }}> 

          {session.format} 

        </td> 

        <td style={{ padding: "8px", textAlign: "right" }}> 

          {session.totalResult.toFixed(1)} 

        </td> 

        <td style={{ padding: "8px", textAlign: "center" }}> 

          {session.completed ? "Završeno" : "U toku"} 

        </td> 

      </tr> 

    ))} 

  </tbody> 

</table> 

    </div> 

  ); 

} 