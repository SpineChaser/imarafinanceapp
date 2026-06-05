import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type Input = {
  applicant_name: string;
  business_type: string;
  location: string;
  loan_amount_kes: number;
  mpesa_summary: string;
  seasonal_pattern: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const systemPrompt = `You are a financial inclusion specialist trained in evaluating informal-sector borrowers across East Africa.

Your role is to assess creditworthiness while actively minimizing bias against informal workers.

Evaluate applicants using mobile money history, repayment records, business type, geographic location, and seasonal income patterns.

Rules:
- Never assume formal employment is safer than informal employment.
- Consider seasonal earning patterns.
- Flag potential bias against informal workers.

Return ONLY JSON:
{"decision":"","confidence":0,"credit_score":0,"factors":{},"fairness_flags":[],"explanation":"","recommended_amount":0}`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

function validate(input: Partial<Input>) {
  if (!input.applicant_name || input.applicant_name.length < 2) return "Applicant name is required.";
  if (!input.business_type) return "Business type is required.";
  if (!input.location) return "Location is required.";
  if (!Number.isFinite(input.loan_amount_kes) || Number(input.loan_amount_kes) <= 0) return "Loan amount must be positive.";
  if (!input.mpesa_summary || input.mpesa_summary.length < 20) return "M-Pesa summary needs enough context.";
  if (!input.seasonal_pattern || input.seasonal_pattern.length < 10) return "Seasonal pattern is required.";
  return null;
}

function validateAssessment(value: Record<string, unknown>) {
  const decisions = ["Approved", "Human Review", "Declined"];
  if (!decisions.includes(String(value.decision))) throw new Error("Invalid decision.");
  if (typeof value.confidence !== "number" || value.confidence < 0 || value.confidence > 100) throw new Error("Invalid confidence.");
  if (typeof value.credit_score !== "number" || value.credit_score < 0 || value.credit_score > 850) throw new Error("Invalid credit score.");
  if (typeof value.recommended_amount !== "number" || value.recommended_amount < 0) throw new Error("Invalid recommended amount.");
  if (!Array.isArray(value.fairness_flags)) throw new Error("Invalid fairness flags.");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const input = await req.json() as Input;
    const validationError = validate(input);
    if (validationError) return json({ error: validationError }, 422);

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!anthropicKey || !supabaseUrl || !serviceKey) return json({ error: "Server configuration missing" }, 500);

    const prompt = `Assess this Kenyan microloan application:\n${JSON.stringify(input, null, 2)}`;
    let assessment: Record<string, unknown> | null = null;
    let lastError = "";

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: Deno.env.get("ANTHROPIC_MODEL") ?? "claude-3-5-sonnet-latest",
            max_tokens: 900,
            temperature: 0.1,
            system: systemPrompt,
            messages: [{ role: "user", content: prompt }]
          })
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        assessment = JSON.parse(data.content?.[0]?.text ?? "{}");
        validateAssessment(assessment);
        break;
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Unknown Claude error";
      }
    }

    if (!assessment) return json({ error: "Assessment failed", detail: lastError }, 502);

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: application, error: appError } = await supabase.from("applications").insert({
      ...input,
      credit_score: assessment.credit_score,
      decision: assessment.decision,
      confidence: assessment.confidence,
      factors: assessment.factors,
      fairness_flags: assessment.fairness_flags,
      explanation: assessment.explanation,
      recommended_amount: assessment.recommended_amount,
      status: assessment.decision === "Human Review" ? "human_review" : "assessed"
    }).select("id").single();
    if (appError) throw appError;

    await supabase.from("audit_logs").insert({
      event: "Credit assessment completed",
      application_id: application.id,
      agent: "Claude Credit Agent",
      status: assessment.decision === "Human Review" ? "escalated" : "completed",
      metadata: { decision: assessment.decision, confidence: assessment.confidence, credit_score: assessment.credit_score }
    });

    return json({ assessment, application_id: application.id });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unhandled error" }, 500);
  }
});
