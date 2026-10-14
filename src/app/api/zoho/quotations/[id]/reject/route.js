import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { requirePermission } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { rejectQuotation } from "@/lib/zoho/quotations";
import { syncQuotations } from "@/lib/zoho-sync/syncQuotations";
import dbConnect from "@/lib/db";
import Quotation from "@/models/Quotation";
import ActivityLog from "@/models/ActivityLog";

export async function POST(request, context) {
  try {
    await requirePermission(PERMISSIONS.QUOTATION.APPROVE);
    const session = await getServerSession(authOptions);
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "Rejected by reviewer";

    let zohoData = null;
    try {
      zohoData = await rejectQuotation(id, reason);
    } catch (zohoErr) {
      console.warn("[API] Zoho rejectQuotation warning:", zohoErr.message || zohoErr);
    }

    await dbConnect();
    const updated = await Quotation.findOneAndUpdate(
      {
        $or: [
          { zoho_estimate_id: id },
          ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
        ]
      },
      {
        $set: {
          status: "rejected",
          rejectedAt: new Date(),
          rejectedBy: session?.user?.id || null,
          rejectionReason: reason,
          last_modified_time: new Date()
        }
      },
      { new: true }
    );

    // Audit log
    try {
      await ActivityLog.create({
        user: session?.user?.id,
        action: "REJECT_QUOTATION",
        module: "Quotation",
        description: `Quotation ${updated?.estimate_number || id} was rejected by ${session?.user?.name || 'Reviewer'}. Reason: ${reason}`,
        metadata: {
          quotationId: updated?.zoho_estimate_id || id,
          estimate_number: updated?.estimate_number,
          newStatus: "rejected",
          reason
        }
      });
    } catch (logErr) {
      console.error("ActivityLog error:", logErr);
    }

    syncQuotations('incremental').catch(e => console.error("Auto-sync error:", e));

    return NextResponse.json({
      success: true,
      message: "Quotation rejected successfully",
      data: zohoData
    });
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[API] Reject Error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.status || 500 }
    );
  }
}
