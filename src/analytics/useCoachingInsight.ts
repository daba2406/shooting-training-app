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

): { insight: string; recommendation: string } { 

 

  const { 

    recovery, 

    cascade, 

    tempoZ, 

    fatigue, 

    focus 

  } = profile; 

 

  let insightParts: string[] = []; 

  let recommendationParts: string[] = []; 

 

  // ✅ Recovery 

  if (recovery < 70) { 

    insightParts.push( 

      "Oporavak nakon greške je sporiji od optimalnog." 

    ); 

    recommendationParts.push( 

      "Uvesti strukturisani reset protokol između hitaca (kratko prekidanje niza i fokusirano disanje)." 

    ); 

  } else if (recovery >= 85) { 

    insightParts.push( 

      "Mentalni reset nakon greške je stabilan i brz." 

    ); 

  } 

 

  // ✅ Cascade 

  if (cascade > 30) { 

    insightParts.push( 

      "Prisutan je obrazac serijskog pada nakon početne greške." 

    ); 

    recommendationParts.push( 

      "Vežbati simulaciju namernih grešaka tokom treninga uz kontrolisani mentalni reset." 

    ); 

  } 

 

  // ✅ Tempo 

  if (tempoZ < -0.5) { 

    insightParts.push( 

      "Tempo se ubrzava nakon greške." 

    ); 

    recommendationParts.push( 

      "Stabilizovati ritam disanja pre narednog hica i izbegavati impulsivno reagovanje." 

    ); 

  } else if (tempoZ > 0.5) { 

    insightParts.push( 

      "Tempo se produžava nakon greške." 

    ); 

    recommendationParts.push( 

      "Raditi na održavanju automatizma bez prekomerne kontrole u sledećem pokušaju." 

    ); 

  } 

 

  // ✅ Fatigue 

  if (fatigue < -0.3) { 

    insightParts.push( 

      "Uočava se pad performanse u završnici." 

    ); 

    recommendationParts.push( 

      "Uvesti blok treninge sa naglaskom na poslednjih 15 hitaca pod opterećenjem." 

    ); 

  } 

 

  // ✅ Focus 

  if (focus > 0.35) { 

    insightParts.push( 

      "Prisustvo mikro-oscilacija ukazuje na fluktuacije fokusa." 

    ); 

    recommendationParts.push( 

      "Raditi na održavanju stabilne mentalne rutine unutar svake serije." 

    ); 

  } 

 

  if (insightParts.length === 0) { 

    insightParts.push( 

      "Mentalni profil pokazuje stabilnost bez izraženih slabosti." 

    ); 

  } 

 

  if (recommendationParts.length === 0) { 

    recommendationParts.push( 

      "Održavati postojeći trenažni režim uz periodičnu proveru mentalnih obrazaca." 

    ); 

  } 

 

  return { 

    insight: insightParts.join(" "), 

    recommendation: recommendationParts.join(" ") 

  }; 

} 