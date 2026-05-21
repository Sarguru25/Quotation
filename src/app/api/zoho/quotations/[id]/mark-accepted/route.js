import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { markQuotationAsAccepted } from "@/lib/zoho/quotations";

export async function POST(request, context) {
  try {
    await requirePermission(PERMISSIONS.QUOTATION.APPROVE);
    const { id } = await context.params;

    const data = await markQuotationAsAccepted(id);

    return NextResponse.json({
      success: true,
      message: "Marked as accepted successfully",
      data
    });
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[API] Mark as Accepted Error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.status || 500 }
    );
  }
}
