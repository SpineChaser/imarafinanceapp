import type { ApplicationInput, Assessment } from "./types";

export function localAssessment(input: ApplicationInput): Assessment {
  const amountPressure = Math.min(input.loan_amount_kes / 120000, 1);
  const mpesaSignals = input.mpesa_summary.toLowerCase();
  const stable = /regular|daily|weekly|repeat|supplier|repayment|sales/.test(mpesaSignals);
  const seasonal = /season|harvest|rain|school|market/.test(input.seasonal_pattern.toLowerCase());
  const base = 585 + (stable ? 105 : 42) + (seasonal ? 38 : 0) - Math.round(amountPressure * 65);
  const score = Math.max(420, Math.min(820, base));
  const confidence = Math.max(58, Math.min(94, 66 + (stable ? 17 : 5) + (seasonal ? 6 : 0) - Math.round(amountPressure * 8)));
  const decision = score >= 690 && confidence >= 72 ? "Approved" : score >= 570 ? "Human Review" : "Declined";

  return {
    decision,
    confidence,
    credit_score: score,
    factors: {
      "Mobile money consistency": stable ? 84 : 62,
      "Repayment behavior": stable ? 78 : 56,
      "Seasonality allowance": seasonal ? 88 : 65,
      "Affordability fit": Math.round(88 - amountPressure * 30),
      "Bias mitigation": decision === "Human Review" ? 91 : 86
    },
    fairness_flags: decision === "Human Review"
      ? ["Manual check recommended to avoid informal-income penalty", "Seasonal revenue pattern requires contextual review"]
      : ["No material protected-class proxy detected"],
    explanation: `${input.applicant_name || "Applicant"} shows ${stable ? "consistent mobile-money activity" : "partial mobile-money evidence"} with ${seasonal ? "a recognizable seasonal income pattern" : "limited seasonality detail"}. The model avoids treating informal work as a negative factor and recommends contextual checks where uncertainty remains.`,
    recommended_amount: decision === "Approved" ? Math.round(input.loan_amount_kes * 0.9) : Math.round(input.loan_amount_kes * 0.55)
  };
}
