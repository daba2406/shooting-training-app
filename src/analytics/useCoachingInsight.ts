interface MentalProfile { 

  recovery: number; 

  cascade: number; 

  tempoZ: number; 

  fatigue: number; 

  focus: number; 

  closing: number; 

  trend: number; 

  meanRadius: number; 

  volatility: number; 

} 

 

export function generateCoachingInsight( 

  profile: MentalProfile 

): { insight: string; recommendation: string; composite: string } { 

 

  const { 

    recovery, 

    cascade, 

    tempoZ, 

    fatigue, 

    focus 

  } = profile; 

 

  let insightParts: string[] = []; 

  let recommendationParts: string[] = []; 

 let severityScore = 0; 



// Recovery severity 

if (recovery < 70) { 

  severityScore += 3; 



} 

 

// Cascade severity 

if (cascade > 40) { 

  severityScore += 3; 



} else if (cascade > 25) { 

  severityScore += 2; 

} 

 

// Tempo severity 

if (Math.abs(tempoZ) > 1) { 

  severityScore += 2; 

} 

 

// Fatigue severity 

if (fatigue < -0.5) { 

  severityScore += 2; 

} 

 

// Focus severity 

if (focus > 0.5) { 

  severityScore += 1; 

} 

  // ✅ Recovery 

if (recovery < 70) { 

 

  insightParts.push( 

    `Oporavak nakon greške je sporiji od optimalnog (Recovery ${recovery.toFixed(1)}).` 

  ); 

 

  recommendationParts.push( 

    `U ${Math.round(100 - recovery)}% situacija reset traje više od jednog hica. Uvesti obavezni 1–2 sekundi mentalni prekid nakon hica ispod dinamičkog praga pre ponovnog podizanja puške.` 

  ); 

 

} else if (recovery >= 85 && cascade < 20) { 

 

  insightParts.push( 

    "Mentalni reset nakon greške je stabilan i bez širenja pada." 

  ); 

 

  recommendationParts.push( 

    "Održavati postojeću rutinu resetovanja i povremeno je testirati u kontrolisanim uslovima sa namernim greškama." 

  ); 

 

} else { 

 

insightParts.push( 

  `Reset nakon greške je stabilan (uspešnost ${recovery.toFixed(1)}%), ali povremeno zahteva više od jednog hica za potpunu stabilizaciju.` 

); 

 

  recommendationParts.push( 

    "Raditi na skraćivanju mentalnog intervala između greške i sledećeg hica kako bi se reset sveo na jedan pokušaj." 

  ); 

} 

 

 // ✅ Cascade 

if (cascade > 40) { 

 

  insightParts.push( 

    `U ${cascade.toFixed(1)}% padova dolazi do produžene serije slabijih hitaca.` 

  ); 

 

  recommendationParts.push( 

    "Uvesti obavezni reset protokol odmah nakon prvog slabijeg hica (prekid niza, spuštanje puške, verbalni reset signal) pre nastavka." 

  ); 

 

} else if (cascade > 25) { 

 

  insightParts.push( 

    `U ${cascade.toFixed(1)}% situacija pad performanse prerasta u mini-seriju.` 

  ); 

 

  recommendationParts.push( 

    "Simulirati namerne greške tokom treninga i vežbati povratak u stabilan režim već sledećim hicem." 

  ); 

 

} else if (cascade > 10) { 

 

  insightParts.push( 

    `Prisutan je povremen obrazac širenja pada (${cascade.toFixed(1)}%).` 

  ); 

 

  recommendationParts.push( 

    "Raditi na skraćivanju reakcije nakon greške bez menjanja tempa i tehnike." 

  ); 

 

} 

 

 // ✅ Tempo 

if (tempoZ < -1.0) { 

 

  insightParts.push( 

    `Tempo pokazuje izraženo ubrzavanje nakon greške (Z = ${tempoZ.toFixed(2)}).` 

  ); 

 

  recommendationParts.push( 

    "Uvesti obaveznu pauzu od 1–2 sekunde nakon greške pre sledećeg podizanja puške kako bi se prekinula impulsivna reakcija." 

  ); 

 

} else if (tempoZ < -0.5) { 

 

  insightParts.push( 

    `Tempo blago ubrzava nakon greške (Z = ${tempoZ.toFixed(2)}).` 

  ); 

 

  recommendationParts.push( 

    "Stabilizovati ritam disanja i zadržati standardno vreme nišanjenja bez ubrzavanja sledećeg hica." 

  ); 

 

} else if (tempoZ > 1.0) { 

 

  insightParts.push( 

    `Tempo pokazuje izraženo produžavanje nakon greške (Z = ${tempoZ.toFixed(2)}).` 

  ); 

 

  recommendationParts.push( 

    "Raditi na vraćanju automatizma bez preteranog produžavanja nišanjenja nakon greške." 

  ); 

 

} else if (tempoZ > 0.5) { 

 

  insightParts.push( 

    `Tempo se produžava nakon greške (Z = ${tempoZ.toFixed(2)}).` 

  ); 

 

  recommendationParts.push( 

    "Zadržati isti vremenski obrazac kao u stabilnim serijama i izbegavati preanalizu sledećeg hica." 

  ); 

} 

 

// ✅ Fatigue 

if (fatigue < -0.6) { 

 

  insightParts.push( 

    `Izražen pad performanse u završnici (drift ${fatigue.toFixed(2)}).` 

  ); 

 

  recommendationParts.push( 

    "Uvesti produžene serije sa simuliranim završnim pritiskom i kontrolom tempa u poslednjih 15 hitaca." 

  ); 

 

} else if (fatigue < -0.3) { 

 

  insightParts.push( 

    `Blagi pad performanse u drugoj polovini meča (drift ${fatigue.toFixed(2)}).` 

  ); 

 

  recommendationParts.push( 

    "Fokusirati trening na održavanje stabilnog ritma i mentalne rutine u završnoj fazi meča." 

  ); 

 

} else if (fatigue > 0.6) { 

 

  insightParts.push( 

    `Performansa značajno raste u završnici (drift ${fatigue.toFixed(2)}).` 

  ); 

 

  recommendationParts.push( 

    "Analizirati strukturu početka meča kako bi se stabilan ritam uspostavio ranije." 

  ); 

 

} else if (fatigue > 0.3) { 

 

  insightParts.push( 

    `Uočava se blagi rast performanse u drugoj polovini (drift ${fatigue.toFixed(2)}).` 

  ); 

 

  recommendationParts.push( 

    "Razmotriti kraće adaptivne rutine na početku meča kako bi stabilnost bila prisutna od starta." 

  ); 

} 

 

 // ✅ Focus Stability 

if (focus > 0.6) { 

 

  insightParts.push( 

    `Izražene mikro-oscilacije fokusa (rolling std ${focus.toFixed(2)}).` 

  ); 

 

  recommendationParts.push( 

    "Uvesti striktno ponavljanje iste mentalne i fizičke rutine pre svakog hica kako bi se smanjile unutrašnje fluktuacije." 

  ); 

 

} else if (focus > 0.4) { 

 

  insightParts.push( 

    `Uočljive mikro-fluktuacije unutar serija (rolling std ${focus.toFixed(2)}).` 

  ); 

 

  recommendationParts.push( 

    "Raditi na stabilizaciji pažnje unutar serije bez promene tehnike ili tempa." 

  ); 

 

} else if (focus > 0.25) { 

 

  insightParts.push( 

    `Blage oscilacije fokusa unutar kraćih sekvenci (rolling std ${focus.toFixed(2)}).` 

  ); 

 

  recommendationParts.push( 

    "Održavati postojeću rutinu uz dodatni naglasak na kontinuitet između uzastopnih hitaca." 

  ); 

} 

 

  if (recommendationParts.length === 0) { 

    recommendationParts.push( 

      "Održavati postojeći trenažni režim uz periodičnu proveru mentalnih obrazaca." 

    ); 

  } 

// ✅ Composite Coaching Insight v3 

 

let dominantFactor: string | null = null; 

let maxSeverity = 0; 

 

// Recovery 

if (recovery < 70 && 3 > maxSeverity) { 

  dominantFactor = "recovery"; 

  maxSeverity = 3; 

} 

 

// Cascade 

if (cascade > 40 && 3 > maxSeverity) { 

  dominantFactor = "cascade"; 

  maxSeverity = 3; 

} else if (cascade > 25 && 2 > maxSeverity) { 

  dominantFactor = "cascade"; 

  maxSeverity = 2; 

} 

 

// Tempo 

if (Math.abs(tempoZ) > 1 && 2 > maxSeverity) { 

  dominantFactor = "tempo"; 

  maxSeverity = 2; 

} 

 

// Fatigue 

if (fatigue < -0.5 && 2 > maxSeverity) { 

  dominantFactor = "fatigue"; 

  maxSeverity = 2; 

} 

 

// Focus 

if (focus > 0.5 && 1 > maxSeverity) { 

  dominantFactor = "focus"; 

  maxSeverity = 1; 

} 

 

let compositeInsight = ""; 

 

if (!dominantFactor) { 

 

  compositeInsight = 

    "Ukupan mentalni profil pokazuje stabilnost bez dominantnih slabosti. Reakcija na greške, tempo i završnica su u ravnoteži."; 

 

} else if (dominantFactor === "recovery") { 

 

  compositeInsight = 

    "Najizraženiji obrazac vezan je za produženi mentalni reset nakon greške, što može narušiti kontinuitet serije. Stabilizacija reakcije odmah nakon pada treba biti prioritet."; 

 

} else if (dominantFactor === "cascade") { 

 

  compositeInsight = 

    "Dominantan obrazac je serijsko širenje pada nakon početne greške, što ukazuje na emocionalnu inerciju u toku meča. Fokus treba usmeriti na prekidanje niza već sledećim hicem."; 

 

} else if (dominantFactor === "tempo") { 

 

  compositeInsight = 

    "Tempo reakcija nakon greške pokazuje izraženo odstupanje od stabilnog obrasca. Kontrola ritma i disanja nakon pada može značajno stabilizovati performansu."; 

 

} else if (dominantFactor === "fatigue") { 

 

  compositeInsight = 

    "Završnica meča pokazuje pad performanse koji može biti povezan sa mentalnim ili fizičkim zamorom. Održavanje stabilnosti u poslednjem segmentu treba biti fokus treninga."; 

 

} else if (dominantFactor === "focus") { 

 

  compositeInsight = 

    "Uočljive su mikro-oscilacije fokusa unutar kraćih sekvenci, što može uticati na preciznost u kontinuitetu. Stabilnost mentalne rutine unutar serije treba dodatno učvrstiti."; 

 

} 

return { 

  insight: insightParts.join(" "), 

  recommendation: recommendationParts.join(" "), 

  composite: compositeInsight 

}; 

} 