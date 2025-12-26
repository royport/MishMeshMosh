import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: disputeId } = await params; // ✅ THIS is the missing part

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin permission
    const { data: permission } = await supabase
      .from("platform_permissions")
      .select("permission")
      .eq("user_id", user.id)
      .in("permission", ["admin", "moderator"])
      .single();

    if (!permission) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const { action, notes } = body as { action?: string; notes?: string };

    // Get current dispute
    const { data: dispute, error: fetchError } = await supabase
      .from("disputes")
      .select("*")
      .eq("id", disputeId)
      .single();

    if (fetchError || !dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    switch (action) {
      case "in_review":
        updates.status = "in_review";
        break;

      case "resolve":
        updates.status = "resolved";
        updates.closed_at = new Date().toISOString();
        updates.resolution_json = {
          notes,
          resolved_by: user.email,
          resolved_at: new Date().toISOString(),
        };
        break;

      case "close":
        updates.status = "closed";
        updates.closed_at = new Date().toISOString();
        updates.resolution_json = {
          notes,
          closed_by: user.email,
          closed_at: new Date().toISOString(),
        };
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update dispute
    const { error: updateError } = await supabase
      .from("disputes")
      .update(updates)
      .eq("id", disputeId);

    if (updateError) throw updateError;

    // Log audit
    await supabase.from("audit_logs").insert({
      actor_user_id: user.id,
      action: `dispute_${action}`,
      entity_type: "dispute",
      entity_id: disputeId,
      payload_json: {
        previous_status: dispute.status,
        new_status: updates.status,
        notes,
      },
    });

    // Notify dispute opener
    await supabase.from("notifications").insert({
      user_id: dispute.opened_by,
      kind: "dispute_updated",
      context_type: "dispute",
      context_id: disputeId,
      payload_json: {
        new_status: updates.status,
        notes,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error resolving dispute:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to resolve dispute" },
      { status: 500 }
    );
  }
}
