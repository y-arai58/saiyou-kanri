import { FLOWS, SCHEDULED_STEP_IDS, AWAITING_STEP_IDS } from "../constants/flows";

export function getStepCategory(app) {
  const stepId = FLOWS[app.flow]?.[app.stepIdx]?.id;
  if (!stepId) return "action";
  if (SCHEDULED_STEP_IDS.has(stepId)) return "scheduled";
  if (AWAITING_STEP_IDS.has(stepId)) return "awaiting";
  return "action";
}

export function resolveFlow(baseFlow, internRoute) {
  if (baseFlow === "intern_eng") {
    return internRoute === "ゼロワン" ? "intern_zero_eng" : "intern_site_eng";
  }
  return baseFlow;
}

export function resolveSource(baseFlow, internRoute) {
  return baseFlow === "intern_eng" ? internRoute : "採用サイト";
}

export function getFlowDateFields(flow) {
  const seen = new Set();
  return (FLOWS[flow] ?? []).filter(s => s.dateInput && s.dateField).reduce((acc, s) => {
    if (!seen.has(s.dateField)) { seen.add(s.dateField); acc.push({ field: s.dateField, label: s.dateLabel }); }
    return acc;
  }, []);
}

export function getDaysStalled(app) {
  const ref = app.stepUpdatedAt || app.created;
  if (!ref) return 0;
  const d = new Date(ref);
  if (isNaN(d.getTime())) return 0;
  return Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
}

export function progressPercent(flow, stepIdx) {
  const steps = FLOWS[flow] ?? [];
  if (steps.length <= 1) return 100;
  return Math.round((stepIdx / (steps.length - 1)) * 100);
}
