import { useState } from "react"; 

 

interface Props { 

  onStart: ( 

    mode: "training" | "qualification" | "final", 

    format: "60" | "40" | "trial" | "custom", 

    competitionName: string, 

    date: string, 

    startTime: string, 

    shooterName: string

  ) => void; 

 

  onArchive: () => void; 

} 

 

export default function SetupView({ onStart, onArchive }: Props) { 

 

  const [mainMode, setMainMode] = useState<"training" | "competition">("training"); 

 

  const [competitionName, setCompetitionName] = useState(""); 
  const [shooterName, setShooterName] = useState("")

  const [date, setDate] = useState(""); 

  const [startTime, setStartTime] = useState(""); 

 

  return ( 

    <div className="setup-container"> 

 

      <div className="setup-card"> 

 

        <h1 className="setup-title">SHOOTING CONTROL</h1> 

 

        <h2 className="setup-subtitle">Podaci o meču</h2> 

 

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

 

        <h2 className="setup-subtitle">Tip sesije</h2> 

 

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

 

        <div className="setup-divider" /> 

 

        {mainMode === "training" && ( 

          <> 

            <h2 className="setup-subtitle">Format treninga</h2> 

 

            <div className="setup-buttons"> 

 

              <button onClick={() => 

                onStart("training", "60", competitionName, date, startTime, shooterName) 

              }> 

                60 dijabola 

              </button> 

 

              <button onClick={() => 

                onStart("training", "40", competitionName, date, startTime, shooterName) 

              }> 

                40 dijabola 

              </button> 

 

              <button onClick={() => 

                onStart("training", "trial", competitionName, date, startTime, shooterName) 

              }> 

                Proba 

              </button> 

 

              <button onClick={() => 

                onStart("training", "custom", competitionName, date, startTime, shooterName) 

              }> 

                Custom 

              </button> 

 

            </div> 

          </> 

        )} 

 

        {mainMode === "competition" && ( 

          <> 

            <h2 className="setup-subtitle">Takmičenje</h2> 

 

            <div className="setup-buttons"> 

 

              <button onClick={() => 

                onStart("qualification", "60", competitionName, date, startTime, shooterName) 

              }> 

                Kvalifikacije 

              </button> 

 

              <button onClick={() => 

                onStart("final", "60", competitionName, date, startTime, shooterName) 

              }> 

                Finale 

              </button> 

 

            </div> 

          </> 

        )} 

 

        <div className="setup-divider" /> 

 

        <button className="archive-btn" onClick={onArchive}> 

          Arhiva 

        </button> 

 

      </div> 

 

    </div> 

  ); 

} 