import { NextResponse } from "next/server";
import { requirePermission, logActivity } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { convertQuotationToSO } from "@/lib/zoho/salesOrders";
import { getQuotationById } from "@/lib/zoho/quotations";

export async function POST(request, context) {
  try {
    // 1. RBAC Check
    const session = await requirePermission(PERMISSIONS.QUOTATION.CONVERT_SO);
    const { id } = await context.params;

    // Optional: Get quotation details for logging
    const estimate = await getQuotationById(id);

    // 2. Call Service Layer
    const soData = await convertQuotationToSO(id);

    // 3. Log the activity
    await logActivity({
      userId: session.user.id,
      action: "CONVERT_SO",
      module: "QUOTATION",
      description: `Converted quotation ${estimate.estimate_number} to Sales Order ${soData.salesorder.salesorder_number}`,
      metadata: { quotationId: estimate.estimate_id, salesOrderId: soData.salesorder.salesorder_id },
      req: request
    });

    return NextResponse.json({
      success: true,
      message: "Converted to Sales Order successfully",
      salesorder_id: soData.salesorder.salesorder_id,
      data: soData
    });
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[API] Convert to SO Error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.status || 500 }
    );
  }
}
