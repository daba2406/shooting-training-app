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

 

type InsightItem = { 

  key: string; 

  params?: Record<string, any>; 

}; 

 

export function generateCoachingInsight( 

  profile: MentalProfile 

): { 

  insightKeys: InsightItem[]; 

  recommendationKeys: InsightItem[]; 

  compositeKey: string; 

} { 

 

  const { recovery, cascade, tempoZ, fatigue, focus } = profile; 

 

  const insightKeys: InsightItem[] = []; 

  const recommendationKeys: InsightItem[] = []; 

 

  let severityScore = 0; 

 

  // ✅ Recovery 

  if (recovery < 70) { 

    severityScore += 3; 

 

    insightKeys.push({ 

      key: "recovery_slow", 

      params: { value: recovery.toFixed(1) } 

    }); 

 

    recommendationKeys.push({ 

      key: "recovery_protocol", 

      params: { percent: Math.round(100 - recovery) } 

    }); 

 

  } else if (recovery >= 85 && cascade < 20) { 

 

    insightKeys.push({ 

      key: "recovery_stable" 

    }); 

 

    recommendationKeys.push({ 

      key: "recovery_maintain" 

    }); 

 

  } else { 

 

    insightKeys.push({ 

      key: "recovery_partial", 

      params: { value: recovery.toFixed(1) } 

    }); 

 

    recommendationKeys.push({ 

      key: "recovery_shorten" 

    }); 

  } 

 

  // ✅ Cascade 

  if (cascade > 40) { 

    severityScore += 3; 

 

    insightKeys.push({ 

      key: "cascade_strong", 

      params: { value: cascade.toFixed(1) } 

    }); 

 

    recommendationKeys.push({ 

      key: "cascade_interrupt" 

    }); 

 

  } else if (cascade > 25) { 

    severityScore += 2; 

 

    insightKeys.push({ 

      key: "cascade_moderate", 

      params: { value: cascade.toFixed(1) } 

    }); 

 

    recommendationKeys.push({ 

      key: "cascade_simulation" 

    }); 

 

  } else if (cascade > 10) { 

 

    insightKeys.push({ 

      key: "cascade_mild", 

      params: { value: cascade.toFixed(1) } 

    }); 

 

    recommendationKeys.push({ 

      key: "cascade_reaction_speed" 

    }); 

  } 

 

  // ✅ Tempo 

  if (tempoZ < -1.0) { 

 

    insightKeys.push({ 

      key: "tempo_fast_strong", 

      params: { value: tempoZ.toFixed(2) } 

    }); 

 

    recommendationKeys.push({ 

      key: "tempo_pause_after_error" 

    }); 

 

  } else if (tempoZ < -0.5) { 

 

    insightKeys.push({ 

      key: "tempo_fast_mild", 

      params: { value: tempoZ.toFixed(2) } 

    }); 

 

    recommendationKeys.push({ 

      key: "tempo_breathing_control" 

    }); 

 

  } else if (tempoZ > 1.0) { 

 

    insightKeys.push({ 

      key: "tempo_slow_strong", 

      params: { value: tempoZ.toFixed(2) } 

    }); 

 

    recommendationKeys.push({ 

      key: "tempo_automation" 

    }); 

 

  } else if (tempoZ > 0.5) { 

 

    insightKeys.push({ 

      key: "tempo_slow_mild", 

      params: { value: tempoZ.toFixed(2) } 

    }); 

 

    recommendationKeys.push({ 

      key: "tempo_rhythm_consistency" 

    }); 

  } 

 

  // ✅ Fatigue 

  if (fatigue < -0.6) { 

 

    insightKeys.push({ 

      key: "fatigue_strong_decline", 

      params: { value: fatigue.toFixed(2) } 

    }); 

 

    recommendationKeys.push({ 

      key: "fatigue_finish_training" 

    }); 

 

  } else if (fatigue < -0.3) { 

 

    insightKeys.push({ 

      key: "fatigue_mild_decline", 

      params: { value: fatigue.toFixed(2) } 

    }); 

 

    recommendationKeys.push({ 

      key: "fatigue_rhythm_stability" 

    }); 

 

  } else if (fatigue > 0.6) { 

 

    insightKeys.push({ 

      key: "fatigue_strong_growth", 

      params: { value: fatigue.toFixed(2) } 

    }); 

 

    recommendationKeys.push({ 

      key: "fatigue_early_structure" 

    }); 

 

  } else if (fatigue > 0.3) { 

 

    insightKeys.push({ 

      key: "fatigue_mild_growth", 

      params: { value: fatigue.toFixed(2) } 

    }); 

 

    recommendationKeys.push({ 

      key: "fatigue_adaptive_start" 

    }); 

  } 

 

  // ✅ Focus 

  if (focus > 0.6) { 

 

    insightKeys.push({ 

      key: "focus_strong_instability", 

      params: { value: focus.toFixed(2) } 

    }); 

 

    recommendationKeys.push({ 

      key: "focus_strict_routine" 

    }); 

 

  } else if (focus > 0.4) { 

 

    insightKeys.push({ 

      key: "focus_moderate_instability", 

      params: { value: focus.toFixed(2) } 

    }); 

 

    recommendationKeys.push({ 

      key: "focus_stabilization" 

    }); 

 

  } else if (focus > 0.25) { 

 

    insightKeys.push({ 

      key: "focus_mild_instability", 

      params: { value: focus.toFixed(2) } 

    }); 

 

    recommendationKeys.push({ 

      key: "focus_continuity" 

    }); 

  } 

 

  if (recommendationKeys.length === 0) { 

    recommendationKeys.push({ 

      key: "maintain_regime" 

    }); 

  } 

 

// ✅ Composite Coaching Insight (original logic preserved) 

 

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

 

let compositeKey = "stable_profile"; 

 

if (!dominantFactor) { 

  compositeKey = "stable_profile"; 

} else if (dominantFactor === "recovery") { 

  compositeKey = "dominant_recovery"; 

} else if (dominantFactor === "cascade") { 

  compositeKey = "dominant_cascade"; 

} else if (dominantFactor === "tempo") { 

  compositeKey = "dominant_tempo"; 

} else if (dominantFactor === "fatigue") { 

  compositeKey = "dominant_fatigue"; 

} else if (dominantFactor === "focus") { 

  compositeKey = "dominant_focus"; 

} 

 

  return { 

    insightKeys, 

    recommendationKeys, 

    compositeKey 

  }; 

} 