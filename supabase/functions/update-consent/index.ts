import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Server configuration missing" }, 500);

  try {
    const authorization = req.headers.get("Authorization") ?? "";
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: userResult } = await supabase.auth.getUser(authorization.replace("Bearer ", ""));
    const user = userResult.user;
    if (!user) return json({ error: "Authentication required" }, 401);

    const body = await req.json();
    const payload = {
      user_id: user.id,
      research_data_sharing: Boolean(body.research_data_sharing),
      credit_bureau_exchange: Boolean(body.credit_bureau_exchange),
      african_jurisdiction_only: true,
      ethics_board_oversight: Boolean(body.ethics_board_oversight),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from("consent_settings").upsert(payload, { onConflict: "user_id" }).select("id").single();
    if (error) throw error;

    await supabase.from("audit_logs").insert({
      event: "Consent updated",
      application_id: data.id,
      agent: "Consent Service",
      status: "completed",
      metadata: payload
    });

    return json({ consent_id: data.id });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unhandled error" }, 500);
  }
});
