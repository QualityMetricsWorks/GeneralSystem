import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const token = authorization.replace("Bearer ", "");
    const { data: userData, error: userError } = await admin.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const inviter = userData.user;
    const body = await req.json();
    const displayName = String(body.display_name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const role = String(body.role || "").trim();

    if (!displayName || !email || !["manager", "supervisor", "guest"].includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid invitation data" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { data: inviterProfile, error: profileError } = await admin
      .from("profiles")
      .select("company_id, role, status")
      .eq("user_id", inviter.id)
      .single();

    if (profileError || !inviterProfile || inviterProfile.status !== "active") {
      return new Response(JSON.stringify({ error: "Inviter profile is not active" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const allowed =
      inviterProfile.role === "administrator" ||
      (inviterProfile.role === "manager" && ["supervisor", "guest"].includes(role));

    if (!allowed) {
      return new Response(JSON.stringify({ error: "You are not allowed to invite this role" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // GUVEL v0.0.2.3 uses Supabase's invitation lifecycle.
    // Set SITE_URL and redirect URLs in Supabase Auth configuration.
    const redirectTo = `${req.headers.get("origin") || ""}/`;

    const { data: inviteData, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: {
          display_name: displayName,
          company_id: inviterProfile.company_id
        }
      });

    if (inviteError || !inviteData.user) {
      return new Response(JSON.stringify({
        error: inviteError?.message || "Unable to create invitation"
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { error: rpcError } = await admin.rpc(
      "create_invited_company_profile",
      {
        p_user_id: inviteData.user.id,
        p_company_id: inviterProfile.company_id,
        p_display_name: displayName,
        p_email: email,
        p_role: role,
        p_invited_by: inviter.id
      }
    );

    if (rpcError) {
      // Prevent an orphaned Auth invitation if profile provisioning fails.
      await admin.auth.admin.deleteUser(inviteData.user.id);
      return new Response(JSON.stringify({ error: rpcError.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      user_id: inviteData.user.id,
      email,
      role,
      status: "invited"
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unexpected error"
    }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});