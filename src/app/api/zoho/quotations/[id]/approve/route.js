import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { approveQuotation } from "@/lib/zoho/quotations";
import { syncQuotations } from "@/lib/zoho-sync/syncQuotations";
import dbConnect from "@/lib/db";
import Quotation from "@/models/Quotation";

export async function POST(request, context) {
  try {
    await requirePermission(PERMISSIONS.QUOTATION.APPROVE);
    const { id } = await context.params;

    let zohoData = null;
    try {
      zohoData = await approveQuotation(id);
    } catch (zohoErr) {
      console.warn("[API] Zoho approveQuotation warning:", zohoErr.message || zohoErr);
    }

    await dbConnect();
    await Quotation.findOneAndUpdate(
      {
        $or: [
          { zoho_estimate_id: id },
          ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
        ]
      },
      {
        $set: {
          status: "approved",
          last_modified_time: new Date()
        }
      }
    );

    syncQuotations('incremental').catch(e => console.error("Auto-sync error:", e));

    return NextResponse.json({
      success: true,
      message: "Approved successfully",
      data: zohoData
    });
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[API] Approve Error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.status || 500 }
    );
  }
}
