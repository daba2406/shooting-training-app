import type { Series } from "../types"; 

 

interface Props { 

  series: Series; 

} 

 

export default function PrintTarget({ series }: Props) { 

 

  const size = 200; 

  const center = size / 2; 

 

  const visibleMm = 7.75; 

  const radiusPx = size / 2 - 10; 

  const mmToPx = radiusPx / visibleMm; 

 

  const stepMm = 2.5; 

 

  return ( 

    <svg width={size} height={size}> 

 

      {/* Background */} 

      <rect width={size} height={size} fill="white" /> 

 

      {/* Rings */} 

      {[7,8,9,10].map(ring => { 

        const ringRadiusMm = 

          ring === 10 ? 0.25 : (10 - ring) * stepMm + 0.25; 

 

        const ringPx = ringRadiusMm * mmToPx; 

 

        return ( 

          <circle 

            key={ring} 

            cx={center} 

            cy={center} 

            r={ringPx} 

            stroke="black" 

            fill="none" 

          /> 

        ); 

      })} 

 

      {/* Shots */} 

      {series.shots.map((shot, i) => ( 

        <circle 

          key={i} 

          cx={center + (shot.x - 225) * (size / 450)} 

          cy={center + (shot.y - 225) * (size / 450)} 

          r={shot.radius * (size / 450)} 

          fill="black" 

        /> 

      ))} 

 

    </svg> 

  ); 

} 