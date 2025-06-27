import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const payload = await req.json();
    console.log("📥 Received webhook payload:", payload);

    // Create automation job for code improvement
    const { data: job, error: jobError } = await supabaseClient
      .from("automation_jobs")
      .insert({
        job_type: "code_improvement",
        status: "running",
        progress_data: {
          repository: payload.repository,
          branch: payload.branch,
          commit: payload.commit,
          files: payload.files,
        },
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) {
      throw jobError;
    }

    // Trigger AI code review
    const reviewResponse = await supabaseClient.functions.invoke(
      "ai-code-evaluator",
      {
        body: {
          files: payload.files,
          context: {
            repository: payload.repository,
            branch: payload.branch,
            commit: payload.commit,
          },
        },
      },
    );

    if (reviewResponse.error) {
      throw new Error(`Code review failed: ${reviewResponse.error.message}`);
    }

    // If improvements needed, trigger auto-fix
    if (reviewResponse.data?.needsImprovement) {
      const fixResponse = await supabaseClient.functions.invoke(
        "ai-error-fix",
        {
          body: {
            files: payload.files,
            suggestions: reviewResponse.data.suggestions,
            context: {
              repository: payload.repository,
              branch: payload.branch,
              commit: payload.commit,
            },
          },
        },
      );

      if (fixResponse.error) {
        throw new Error(`Auto-fix failed: ${fixResponse.error.message}`);
      }

      // Update job with improvements made
      await supabaseClient
        .from("automation_jobs")
        .update({
          status: "completed",
          progress_data: {
            ...job.progress_data,
            improvements: fixResponse.data.improvements,
            files_modified: fixResponse.data.files_modified,
          },
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    } else {
      // No improvements needed
      await supabaseClient
        .from("automation_jobs")
        .update({
          status: "completed",
          progress_data: {
            ...job.progress_data,
            message: "No improvements needed",
          },
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    }

    return new Response(JSON.stringify({ success: true, job_id: job.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
