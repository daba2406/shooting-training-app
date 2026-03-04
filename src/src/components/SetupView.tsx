import { useState } from "react"; 

 

interface Props { 

  onStart: ( 

    mode: "training" | "qualification" | "final", 

    format: "60" | "40" | "trial" | "custom", 

    competitionName: string, 

    date: string, 

    startTime: string 

  ) => void; 

 

  onArchive: () => void; 

} 

 

export default function SetupView({ onStart, onArchive }: Props) { 

 

  const [mainMode, setMainMode] = useState<"training" | "competition">("training"); 

 

  const [competitionName, setCompetitionName] = useState(""); 

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

          type="date" 

          value={date} 

          onChange={(e) => setDate(e.target.value)} 

        /> 

 

        <input 

          type="time" 

          value={startTime} 

          onChange={(e) => setStartTime(e.target.value)} 

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

                onStart("training", "60", competitionName, date, startTime) 

              }> 

                60 dijabola 

              </button> 

 

              <button onClick={() => 

                onStart("training", "40", competitionName, date, startTime) 

              }> 

                40 dijabola 

              </button> 

 

              <button onClick={() => 

                onStart("training", "trial", competitionName, date, startTime) 

              }> 

                Proba 

              </button> 

 

              <button onClick={() => 

                onStart("training", "custom", competitionName, date, startTime) 

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

                onStart("qualification", "60", competitionName, date, startTime) 

              }> 

                Kvalifikacije 

              </button> 

 

              <button onClick={() => 

                onStart("final", "60", competitionName, date, startTime) 

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