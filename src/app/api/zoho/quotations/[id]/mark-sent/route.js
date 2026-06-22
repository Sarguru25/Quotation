import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { markQuotationAsSent } from "@/lib/zoho/quotations";
import { syncQuotations } from "@/lib/zoho-sync/syncQuotations";

export async function POST(request, context) {
  try {
    await requirePermission(PERMISSIONS.QUOTATION.EDIT);
    const { id } = await context.params;

    const data = await markQuotationAsSent(id);

    const response = NextResponse.json({
      success: true,
      message: "Marked as sent successfully",
      data
    });
    
    syncQuotations('incremental').catch(e => console.error("Auto-sync error:", e));
    
    return response;
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[API] Mark as Sent Error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.status || 500 }
    );
  }
}
