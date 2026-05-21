import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { getQuotations } from "@/lib/zoho/quotations";

export async function GET() {
  try {
    // 1. Authorization
    await requirePermission(PERMISSIONS.QUOTATION.VIEW);

    // 2. Fetch via Service Layer
    const estimates = await getQuotations();

    // 3. Return response
    return NextResponse.json(estimates);
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    console.error("[API] GET Quotes Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}