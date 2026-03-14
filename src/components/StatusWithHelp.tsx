import { useState } from "react"; 

 

interface Props { 

  label: string; 

  status: string; 

  color: string; 

  description: string; 

} 

 

export default function StatusWithHelp({ 

  label, 

  status, 

  color, 

  description 

}: Props) { 

  const [hover, setHover] = useState(false); 

 

  return ( 

    <div style={{ position: "relative", marginTop: "4px" }}> 

      <span style={{ marginRight: "6px" }}> 

        {label}: 

      </span> 

 

      <span 

        style={{ color, fontWeight: 600, cursor: "help" }} 

        onMouseEnter={() => setHover(true)} 

        onMouseLeave={() => setHover(false)} 

      > 

        {status} 

      </span> 

 

      {hover && ( 

        <div 

          style={{ 

            position: "absolute", 

            bottom: "22px", 

            left: "0", 

            background: "#2a2a2a", 

            color: "white", 

            padding: "8px 10px", 

            borderRadius: "6px", 

            fontSize: "12px", 

            width: "260px", 

            boxShadow: "0 0 10px rgba(0,0,0,0.4)", 

            zIndex: 1000 

          }} 

        > 

          {description} 

        </div> 

      )} 

    </div> 

  ); 

} 