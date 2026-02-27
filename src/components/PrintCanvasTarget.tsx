import { useEffect, useRef } from "react"; 

import type { Series } from "../types"; 

 

interface Props { 

  series: Series; 

} 

 

export default function PrintCanvasTarget({ series }: Props) { 

 

  const canvasRef = useRef<HTMLCanvasElement | null>(null); 

 

  useEffect(() => { 

  const canvas = canvasRef.current; 

  if (!canvas) return; 

 

  const ctx = canvas.getContext("2d"); 

  if (!ctx) return; 

 

  const centerX = canvas.width / 2; 

  const centerY = canvas.height / 2; 

 const scale = canvas.width / 450

  const stepMm = 2.5; 

  const visibleMm = 7.75; 

  const radius = canvas.width / 2 - 10; 

  const mmToPx = radius / visibleMm; 

 

  ctx.clearRect(0, 0, canvas.width, canvas.height); 

 

  // ✅ ISTA POZADINA KAO U APLIKACIJI 

  ctx.fillStyle = "black"; 

  ctx.fillRect(0, 0, canvas.width, canvas.height); 

 

  // ✅ ISTI RINGOVI 

  [7,8,9,10].forEach(ring => { 

    const ringRadiusMm = 

      ring === 10 ? 0.25 : (10 - ring) * stepMm + 0.25; 

 

    const ringPx = ringRadiusMm * mmToPx; 

 

    ctx.beginPath(); 

    ctx.arc(centerX, centerY, ringPx, 0, Math.PI * 2); 

    ctx.strokeStyle = "white"; 

    ctx.stroke(); 

  }); 

 

  // ✅ ISTI POGOCI 

 series.shots.forEach((shot, index) => { 

 

  const scaledX = shot.x * scale; 

  const scaledY = shot.y * scale; 

  const scaledRadius = shot.radius * scale; 

 

  ctx.beginPath(); 

  ctx.arc(scaledX, scaledY, scaledRadius, 0, Math.PI * 2); 

 

  ctx.fillStyle = 

    index === series.shots.length - 1 

      ? "rgba(180,255,0,0.9)" 

      : "rgba(0,200,255,0.4)"; 

 

  ctx.fill(); 

 

  if (index === series.shots.length - 1) { 

    ctx.fillStyle = "black"; 

    ctx.font = `${12 * scale}px Arial`; 

    ctx.textAlign = "center"; 

    ctx.textBaseline = "middle"; 

    ctx.fillText( 

      shot.index.toString(), 

      scaledX, 

      scaledY 

    ); 

  } 

}); 

 

}, [series]); 

 

  return ( 

    <canvas 

      ref={canvasRef} 

      width={300} 

      height={300} 

      style={{ border: "1px solid #999" }} 

    /> 

  ); 

} 