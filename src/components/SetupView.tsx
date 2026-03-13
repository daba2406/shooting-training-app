import { useState } from "react"; 

 

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

 

export default function SetupView({ onStart, onArchive, onAnalytics, onStartTrainingMode }: Props) { 

 

  const [mainMode, setMainMode] = useState<"training" | "competition">("training"); 
  const [trainingInputMode, setTrainingInputMode] = useState< 

  "shots" | "series" 

>("shots"); 

  
  const [competitionName, setCompetitionName] = useState(""); 
  const [shooterName, setShooterName] = useState("")

  const [date, setDate] = useState(""); 

  const [startTime, setStartTime] = useState(""); 

 

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

 

      <input 

        type="text" 

        placeholder="Ime i prezime strelca" 

        value={shooterName} 

        onChange={(e) => setShooterName(e.target.value)} 

      /> 

 

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