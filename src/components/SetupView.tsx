import { useState, useEffect } from "react"; 

 

interface Props { 

onStart: ( 

  mode: "training" | "qualification" | "final", 

  format: "60" | "40" | "trial" | "custom", 

  competitionName: string, 

  date: string, 

  startTime: string, 

  shooterName: string, 

) => void; 

 

  onArchive: () => void; 
  onAnalytics: () => void;
  onStartTrainingMode?: (mode: "shots" | "series") => void; 

} 

 

export default function SetupView({ onStart, onArchive, onAnalytics, onStartTrainingMode }: 
  Props) { 

   const [mainMode, setMainMode] = useState<"training" | "competition">("training"); 
  const [trainingInputMode, setTrainingInputMode] = useState< 

  "shots" | "series" 

>("shots"); 

  
  const [competitionName, setCompetitionName] = useState(""); 
  const [shooterName, setShooterName] = useState("")

  const [date, setDate] = useState(""); 

  const [startTime, setStartTime] = useState(""); 

 // ✅ Baza strelaca (privremeno lokalna) 

const defaultShooters = [ 

  { id: 1, name: "Natalija Jovanovic" }

]; 
const loadShooters = () => { 

  const stored = localStorage.getItem("shooters"); 

  if (stored) { 

    return JSON.parse(stored); 

  } 

  return defaultShooters; 

}; 



const [shooters, setShooters] = useState(loadShooters); 

const [newShooterName, setNewShooterName] = useState(""); 

const [manageShootersOpen, setManageShootersOpen] = useState(false); 

const handleAddShooter = () => { 

  if (!newShooterName.trim()) return; 

 

  const newShooter = { 

    id: shooters.length + 1, 

    name: newShooterName.trim() 

  }; 



  setShooters([...shooters, newShooter]); 

  setShooterName(newShooter.name); // automatski selektuje novog 

  setNewShooterName(""); 

}; 
 const handleDeleteShooter = (id: number) => { 

  const shooterToDelete = shooters.find( 

  (s: { id: number; name: string }) => s.id === id 

); 

  if (!shooterToDelete) return; 

 

  const confirmDelete = window.confirm( 

    `Da li ste sigurni da želite da obrišete strelca "${shooterToDelete.name}"?` 

  ); 

 

  if (!confirmDelete) return; 

 

 const updatedShooters = shooters.filter( 

  (s: { id: number; name: string }) => s.id !== id 

); 

 

  setShooters(updatedShooters); 

 

  // Ako brišemo trenutno izabranog, resetuj selekciju 

  if (shooterName === shooterToDelete.name) { 

    setShooterName(""); 

  } 

}; 

useEffect(() => { 

  localStorage.setItem("shooters", JSON.stringify(shooters)); 

}, [shooters]); 

  return ( 

    
      <div className="setup-container">  

 

  

 

      <div className="setup-card"> 

 

  <div 

    style={{ 

      display: "grid", 

      gridTemplateColumns: "1fr 1fr", 

      gap: "30px" 

    }} 

  > 

 

    {/* LEVA STRANA – PODACI */} 

    <div> 

 

      <h2 className="setup-subtitle"> 

        Podaci o meču / treningu 

      </h2> 

 

      <input 

        type="text" 

        placeholder="Naziv takmičenja" 

        value={competitionName} 

        onChange={(e) => setCompetitionName(e.target.value)} 

      /> 

 

<select 

  value={shooterName} 

  onChange={(e) => setShooterName(e.target.value)} 

> 

  <option value="">Izaberi strelca</option> 

  {shooters.map((shooter: { id: number; name: string }) => ( 

    <option key={shooter.id} value={shooter.name}> 

      {shooter.name} 

    </option> 

  ))} 

</select> 

<div style={{ marginTop: "10px", display: "flex", gap: "6px" }}> 

  <input 

    type="text" 

    placeholder="Dodaj novog strelca" 

    value={newShooterName} 

    onChange={(e) => setNewShooterName(e.target.value)} 

    style={{ flex: 1 }} 

  /> 

 

  <button onClick={handleAddShooter}> 

    Dodaj 

  </button> 

</div> 

{manageShootersOpen && ( 

  <div 

    style={{ 

      marginTop: "12px", 

      maxHeight: "200px", 

      overflowY: "auto", 

      border: "1px solid #333", 

      borderRadius: "8px", 

      padding: "8px" 

    }} 

  > 

    {shooters.map((shooter: { id: number; name: string }) => ( 

      <div 

        key={shooter.id} 

        style={{ 

          display: "flex", 

          justifyContent: "space-between", 

          alignItems: "center", 

          marginBottom: "6px", 

          padding: "6px", 

          background: "#ffffff", 

          borderRadius: "6px" 

        }} 

      > 

        <span>{shooter.name}</span> 

 

        <button 

          onClick={() => handleDeleteShooter(shooter.id)} 

          style={{ 

            background: "transparent", 

            color: "#ff5555", 

            border: "none", 

            cursor: "pointer", 

            fontWeight: "bold" 

          }} 

        > 

          ✕ 

        </button> 

      </div> 

    ))} 

  </div> 

)} 

<button 

  style={{ 

    marginTop: "8px", 

    background: "transparent", 

    border: "1px solid #444", 

    color: "#00ccff", 

    borderRadius: "6px", 

    padding: "4px 8px", 

    cursor: "pointer", 

    fontSize: "12px" 

  }} 

  onClick={() => setManageShootersOpen(!manageShootersOpen)} 

> 

  {manageShootersOpen ? "Zatvori upravljanje" : "Uredi strelce"} 

</button> 

      <input 

        type="date" 

        value={date} 

        onChange={(e) => setDate(e.target.value)} 

      /> 

 

      <input 

        type="text" 

        placeholder="HH:MM" 

        value={startTime} 

        onChange={(e) => setStartTime(e.target.value)} 

        pattern="^([01]\d|2[0-3]):([0-5]\d)$" 

        inputMode="numeric" 

        maxLength={5} 

        style={{ 

          width: "90px", 

          textAlign: "center", 

          letterSpacing: "1px" 

        }} 

      /> 

 <div className="setup-buttons"> 

 

        <button 

          className={mainMode === "training" ? "active-btn" : ""} 

          onClick={() => setMainMode("training")} 

        > 

          Trening 

        </button> 

 

        <button 

          className={mainMode === "competition" ? "active-btn" : ""} 

          onClick={() => setMainMode("competition")} 

        > 

          Takmičenje 

        </button> 

 

      </div> 


    </div> 

 

    {/* DESNA STRANA – TIP SESIJE */} 

    
    <div 

  style={{ 

    minHeight: "400px"   // ✅ прилагоди ако треба 

  }} 

> 

 

      <h2 className="setup-subtitle"> 

        Tip sesije 

      </h2> 

 <div style={{ marginTop: "25px" }}> 

 

  {mainMode === "training" && ( 

    <> 

<h3 style={{ marginTop: "15px", marginBottom: "10px", color: "white" }}> 

  Način unosa 

</h3> 

 

<div className="setup-buttons"> 

  <button 

    className={trainingInputMode === "shots" ? "active-btn" : ""} 

    onClick={() => setTrainingInputMode("shots")} 

  > 

    Unos po pogocima 

  </button> 

 

  <button 

    className={trainingInputMode === "series" ? "active-btn" : ""} 

    onClick={() => setTrainingInputMode("series")} 

  > 

    Ručni unos serija 

  </button> 

</div> 

<h3 style={{ color: "white", marginTop: "15px", marginBottom: "10px" }}> 

  Format treninga 

</h3> 

 

      <div className="setup-buttons"> 

 <div style={{ marginTop: "15px"}}>

<div className="setup-buttons"> 

</div> 
</div>

        <button 

          onClick={() => { 

  if (onStartTrainingMode) { 

    onStartTrainingMode(trainingInputMode); 

  } 

            onStart( 

              "training", 

              "60", 

              competitionName, 

              date, 

              startTime, 

              shooterName,

            ) 

          } }

        > 

          60 dijabola 

        </button> 

 

        <button 

          onClick={() => { 

  if (onStartTrainingMode) { 

    onStartTrainingMode(trainingInputMode); 

  } 

            onStart( 

              "training", 

              "40", 

              competitionName, 

              date, 

              startTime, 

              shooterName,
              

            ) 

          } }

        > 

          40 dijabola 

        </button> 

 

        <button 

          onClick={() => { 

  if (onStartTrainingMode) { 

    onStartTrainingMode(trainingInputMode); 

  } 

            onStart( 

              "training", 

              "trial", 

              competitionName, 

              date, 

              startTime, 

              shooterName 

            ) 

          } }

        > 

          Proba 

        </button> 

      </div> 

    </> 

  )} 

 

  {mainMode === "competition" && ( 

    <> 

      <h3 style={{ color: "white", marginTop: "15px", marginBottom: "10px" }}> 

        Takmičenje 

      </h3> 

 

      <div className="setup-buttons"> 

        <button 

          onClick={() => 

            onStart( 

              "qualification", 

              "60", 

              competitionName, 

              date, 

              startTime, 

              shooterName 

            ) 

          } 

        > 

          Kvalifikacije 

        </button> 

 

        <button 

          onClick={() => 

            onStart( 

              "final", 

              "60", 

              competitionName, 

              date, 

              startTime, 

              shooterName 

            ) 

          } 

        > 

          Finale 

        </button> 

      </div> 

    </> 

  )} 

 

</div> 

      

 

    </div> 

 

  </div> 

 

  {/* DONJI RED – ARHIVA I ANALYTICS */} 

  <div 

    style={{ 

      marginTop: "30px", 

      display: "flex", 

      gap: "15px", 

      justifyContent: "center" 

    }} 

  > 

    <button className="archive-btn" onClick={onArchive}> 

      Arhiva 

    </button> 

 

    <button className="archive-btn" onClick={onAnalytics}> 

      Analytics 

    </button> 

  </div> 

 

</div> 
</div>

 

  ); 

} 