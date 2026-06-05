import type { AuditRecord } from "./types";

export const counties = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo Marakwet", "Embu", "Garissa", "Homa Bay",
  "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu",
  "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit", "Meru",
  "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua",
  "Nyeri", "Samburu", "Siaya", "Taita Taveta", "Tana River", "Tharaka Nithi", "Trans Nzoia",
  "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];

export const segmentData = [
  { name: "Market Vendors", applications: 348 },
  { name: "Boda Boda Riders", applications: 286 },
  { name: "Smallholder Farmers", applications: 241 },
  { name: "Other Informal Sector", applications: 174 }
];

export const auditRecords: AuditRecord[] = [
  { id: "AUD-1001", timestamp: "2026-06-05T08:45:00Z", event: "Application submitted", application_id: "APP-5832", agent: "Data Ingestion", status: "completed", metadata: { county: "Nairobi", channel: "web" } },
  { id: "AUD-1002", timestamp: "2026-06-05T08:47:00Z", event: "Credit assessment completed", application_id: "APP-5832", agent: "Credit Agent", status: "completed", metadata: { score: 742, decision: "Approved" } },
  { id: "AUD-1003", timestamp: "2026-06-05T09:02:00Z", event: "Fairness audit executed", application_id: "APP-5798", agent: "Governance Agent", status: "completed", metadata: { fairness_score: 94 } },
  { id: "AUD-1004", timestamp: "2026-06-05T09:18:00Z", event: "Human review escalation", application_id: "APP-5799", agent: "Human Review", status: "escalated", metadata: { reason: "confidence_below_threshold" } },
  { id: "AUD-1005", timestamp: "2026-06-05T09:31:00Z", event: "Appeal filed", application_id: "APP-5721", agent: "Appeals Desk", status: "pending", metadata: { documents: 2 } },
  { id: "AUD-1006", timestamp: "2026-06-05T10:04:00Z", event: "Appeal approved", application_id: "APP-5681", agent: "Appeals Desk", status: "completed", metadata: { adjusted_amount: 42000 } },
  { id: "AUD-1007", timestamp: "2026-06-05T10:25:00Z", event: "Consent updated", application_id: "CONS-204", agent: "Consent Service", status: "completed", metadata: { research_data_sharing: true } },
  { id: "AUD-1008", timestamp: "2026-06-05T10:44:00Z", event: "Kill-switch threshold test", application_id: "SYS-001", agent: "Risk Controls", status: "completed", metadata: { bias_threshold: 0.12, result: "pass" } },
  { id: "AUD-1009", timestamp: "2026-06-05T11:15:00Z", event: "Governance review", application_id: "GOV-114", agent: "Ethics Board", status: "completed", metadata: { finding: "no_material_bias" } },
  { id: "AUD-1010", timestamp: "2026-06-05T11:42:00Z", event: "Application submitted", application_id: "APP-5841", agent: "Data Ingestion", status: "completed", metadata: { county: "Kisumu", channel: "agent" } },
  { id: "AUD-1011", timestamp: "2026-06-05T12:03:00Z", event: "Bias flag detected", application_id: "APP-5841", agent: "Fairness Agent", status: "escalated", metadata: { flag: "informal_income_penalty" } },
  { id: "AUD-1012", timestamp: "2026-06-05T12:35:00Z", event: "Decision dispatched", application_id: "APP-5832", agent: "Dispatch Service", status: "completed", metadata: { notification: "sms" } },
  { id: "AUD-1013", timestamp: "2026-06-05T13:10:00Z", event: "Fairness audit executed", application_id: "BATCH-77", agent: "Governance Agent", status: "completed", metadata: { sample_size: 300 } },
  { id: "AUD-1014", timestamp: "2026-06-05T13:38:00Z", event: "Model confidence breach", application_id: "APP-5850", agent: "Risk Controls", status: "escalated", metadata: { confidence: 61 } },
  { id: "AUD-1015", timestamp: "2026-06-05T14:11:00Z", event: "Credit bureau exchange consent checked", application_id: "APP-5854", agent: "Consent Service", status: "completed", metadata: { allowed: false } }
];
