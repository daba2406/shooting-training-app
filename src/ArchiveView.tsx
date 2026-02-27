

interface Series { 

  index: number; 

  shots: any[]; 

  total: number; 

  completed: boolean; 

} 

 

interface StoredSession { 

  id: string; 

  date: string; 

  data: Series[]; 

} 

 

interface ArchiveProps { 

  archiveList: StoredSession[]; 

  onOpenSession: (data: Series[]) => void; 

  onBack: () => void; 

} 

 

export default function ArchiveView({ 

  archiveList, 

  onOpenSession, 

  onBack 

}: ArchiveProps) { 

 

  return ( 

    <div className="archive-view"> 

 

      <h2>Arhiva</h2> 

 

      {archiveList.length === 0 && ( 

        <p>Nema sačuvanih sesija.</p> 

      )} 

 

      {archiveList.map(session => ( 

        <div 

          key={session.id} 

          className="archive-item" 

          onClick={() => onOpenSession(session.data)} 

        > 

          {session.date} 

        </div> 

      ))} 

 

      <button onClick={onBack}> 

        Nazad 

      </button> 

 

    </div> 

  ); 

} 