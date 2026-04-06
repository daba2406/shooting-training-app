import { useState, useEffect } from "react"; 
import { useTranslation } from "react-i18next";
 

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

  onAnalytics: () => void; 

  onStartTrainingMode?: (mode: "shots" | "series") => void; 

} 

 

interface Shooter { 

  id: number; 

  name: string; 

} 

 

export default function SetupView({ 

  onStart, 

  onArchive, 

  onAnalytics, 

  onStartTrainingMode, 

}: Props) { 

 const { t, i18n } = useTranslation();

  const [mainMode, setMainMode] = useState<"training" | "competition">("training"); 

  const [trainingInputMode, setTrainingInputMode] = useState<"shots" | "series">("shots"); 

 

  const [competitionName, setCompetitionName] = useState(""); 

  const [shooterName, setShooterName] = useState(""); 

  const [date, setDate] = useState(""); 

  const [startTime, setStartTime] = useState(""); 

 

  const [isShooterModalOpen, setIsShooterModalOpen] = useState(false); 

 

  const defaultShooters: Shooter[] = [ 

    { id: 1, name: "Natalija Jovanovic" } 

  ]; 

 

  const loadShooters = (): Shooter[] => { 

    const stored = localStorage.getItem("shooters"); 

    if (stored) return JSON.parse(stored); 

    return defaultShooters; 

  }; 

 

  const [shooters, setShooters] = useState<Shooter[]>(loadShooters); 

  const [newShooterName, setNewShooterName] = useState(""); 

  const [editingShooterId, setEditingShooterId] = useState<number | null>(null); 

 

  useEffect(() => { 

    localStorage.setItem("shooters", JSON.stringify(shooters)); 

  }, [shooters]); 

 

  const handleAddShooter = () => { 

    if (!newShooterName.trim()) return; 

 

    const newShooter: Shooter = { 

      id: shooters.length ? Math.max(...shooters.map(s => s.id)) + 1 : 1, 

      name: newShooterName.trim() 

    }; 

 

    setShooters([...shooters, newShooter]); 

    setNewShooterName(""); 

  }; 

 

  const handleDeleteShooter = (id: number) => { 

    const shooter = shooters.find(s => s.id === id); 

    if (!shooter) return; 

 

    if (!window.confirm(t("setup.delete_confirm", { name: shooter.name }))) return; 

 

    const updated = shooters.filter(s => s.id !== id); 

    setShooters(updated); 

 

    if (shooterName === shooter.name) { 

      setShooterName(""); 

    } 

  }; 

 

  const handleUpdateShooter = (id: number, name: string) => { 

    if (!name.trim()) return; 

 

    const updated = shooters.map(s => 

      s.id === id ? { ...s, name: name.trim() } : s 

    ); 

 

    setShooters(updated); 

    setEditingShooterId(null); 

  }; 

 

  return ( 

    <div className="setup-container"> 
<div className="axiom-header" 

 style={{ 

   position: "relative", 

   textAlign: "center", 

   width: "100%", 

   maxWidth: "1100px", 

   margin: "0 auto" 

 }} 

> 

  <div> 

    <h1 className="axiom-title"> 

      A<span className="axiom-x">X</span>IOM 

    </h1> 

    <div className="axiom-tagline"> 

      {t("brand.tagline")}. 

    </div> 

    <div className="axiom-subtitle"> 

      Shooting Performance Analytics, Risk & Knowledge 

    </div> 

  </div> 

 

  {/* ✅ LANGUAGE SWITCHER */} 

 <select 

 onChange={(e) => i18n.changeLanguage(e.target.value)} 

 value={i18n.language} 

 style={{ 

   position: "absolute", 

   right: "0", 

   top: "10px", 

   padding: "6px 10px", 

   borderRadius: "6px", 

   background: "#222", 

   color: "white", 

   border: "1px solid #444", 

   height: "36px" 

 }} 

> 

 <option value="sr">SR</option> 

 <option value="en">EN</option> 

</select> 

</div> 

      <div className="setup-card redesigned-layout"> 

 

        {/* LEVI BLOK */} 

        <div className="setup-section"> 

          <h3 className="section-title">{t("setup.session_info")}</h3> 

 

          <input 

            type="text" 

            placeholder={t("setup.competition_name")}

            value={competitionName} 

            onChange={(e) => setCompetitionName(e.target.value)} 

          /> 

 

          <div className="shooter-select-row"> 

            <select 

              value={shooterName} 

              onChange={(e) => setShooterName(e.target.value)} 

            > 

              <option value="">{t("setup.select_shooter")}</option> 

              {shooters.map((s) => ( 

                <option key={s.id} value={s.name}> 

                  {s.name} 

                </option> 

              ))} 

            </select> 

 

            <button 

              className="secondary-btn" 

              onClick={() => setIsShooterModalOpen(true)} 

            > 

             {t("setup.manage_shooters")}

            </button> 

          </div> 

 

          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /> 

          <input type="text" placeholder="HH:MM" value={startTime} onChange={(e) => setStartTime(e.target.value)} /> 

        </div> 

 

        {/* SREDNJI BLOK */} 

        <div className="setup-section"> 

          <h3 className="section-title">{t("setup.session_type")}</h3> 

 

          <div className="mode-switch"> 

            <button 

              className={mainMode === "training" ? "active-btn" : ""} 

              onClick={() => setMainMode("training")} 

            > 

              {t("setup.training")}

            </button> 

            <button 

              className={mainMode === "competition" ? "active-btn" : ""} 

              onClick={() => setMainMode("competition")} 

            > 

              {t("setup.competition")} 

            </button> 

          </div> 

 

          {mainMode === "training" && ( 

            <> 

              <h4 className="sub-title">{t("setup.input_mode")}</h4> 

              <div className="mode-switch"> 

                <button 

                  className={trainingInputMode === "shots" ? "active-btn" : ""} 

                  onClick={() => setTrainingInputMode("shots")} 

                > 

                  {t("setup.shots_input")}

                </button> 

                <button 

                  className={trainingInputMode === "series" ? "active-btn" : ""} 

                  onClick={() => setTrainingInputMode("series")} 

                > 

                  {t("setup.manual_series")}

                </button> 

              </div> 

            </> 

          )} 

        </div> 

 

        {/* DESNI BLOK */} 

        <div className="setup-section"> 

          <h3 className="section-title">{t("setup.start")}</h3> 

 

          {mainMode === "training" && ( 

            <div className="start-buttons"> 

              {["60", "40", "trial"].map((format) => ( 

                <button 

                  key={format} 

                  onClick={() => { 

                    onStartTrainingMode?.(trainingInputMode); 

                    onStart("training", format as any, competitionName, date, startTime, shooterName); 

                  }} 

                > 

                  {format === "trial" 

  ? t("setup.trial") 

  : t("setup.shots_format", { count: format })} 

                </button> 

              ))} 

            </div> 

          )} 

 

          {mainMode === "competition" && ( 

            <div className="start-buttons"> 

              <button onClick={() => 

                onStart("qualification", "60", competitionName, date, startTime, shooterName) 

              }> 

                {t("setup.qualification")}

              </button> 

              <button onClick={() => 

                onStart("final", "60", competitionName, date, startTime, shooterName) 

              }> 

               {t("setup.final")}

              </button> 

            </div> 

          )} 

        </div> 

 

      </div> 

 

      {/* FOOTER */} 

      <div className="setup-footer"> 

        <button className="archive-btn" onClick={onArchive}>{t("setup.archive")}</button> 

        <button className="archive-btn" onClick={onAnalytics}>{t("setup.analytics")}</button> 

      </div> 

 

      {/* MODAL */} 

      {isShooterModalOpen && ( 

        <div className="modal-overlay" onClick={() => setIsShooterModalOpen(false)}> 

          <div className="modal-content" onClick={(e) => e.stopPropagation()}> 

            <h3>{t("setup.manage_shooters_title")}</h3> 

 

            {shooters.map((s) => ( 

              <div key={s.id} className="modal-row"> 

                {editingShooterId === s.id ? ( 

                  <input 

                    defaultValue={s.name} 

                    onBlur={(e) => handleUpdateShooter(s.id, e.target.value)} 

                    autoFocus 

                  /> 

                ) : ( 

                  <span>{s.name}</span> 

                )} 

 

                <div> 

                  <button onClick={() => setEditingShooterId(s.id)}>{t("common.edit")}</button> 

                  <button onClick={() => handleDeleteShooter(s.id)}>✕</button> 

                </div> 

              </div> 

            ))} 

 

            <div className="modal-add"> 

              <input 

                type="text" 

                placeholder="Novo ime" 

                value={newShooterName} 

                onChange={(e) => setNewShooterName(e.target.value)} 

              /> 

              <button onClick={handleAddShooter}>{t("common.add")}</button> 

            </div> 

 

            <button className="close-btn" onClick={() => setIsShooterModalOpen(false)}> 

              {t("common.close")}

            </button> 

          </div> 

        </div> 

      )} 

    </div> 

  ); 

} 