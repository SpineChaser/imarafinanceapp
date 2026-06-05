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
    const { application_id, reason } = await req.json();
    if (!application_id || !reason || reason.length < 10) return json({ error: "Application id and appeal reason are required." }, 422);

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase.from("appeals").insert({ application_id, reason }).select("id").single();
    if (error) throw error;

    await supabase.from("audit_logs").insert({
      event: "Appeal filed",
      application_id,
      agent: "Appeals Desk",
      status: "pending",
      metadata: { appeal_id: data.id }
    });

    return json({ appeal_id: data.id, status: "pending" });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unhandled error" }, 500);
  }
});
