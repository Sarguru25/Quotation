import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { getQuotations as getQuotationsFromDB } from "@/lib/db-queries/getQuotations";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortField = searchParams.get('sortField') || 'estimate_number';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 1. Authorization
    await requirePermission(PERMISSIONS.QUOTATION.VIEW);

    // 2. Fetch via Service Layer
    const result = await getQuotationsFromDB({ page, limit, search, status, sortField, sortOrder });

    // 3. Return response
    return NextResponse.json(result);
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    console.error("[API] GET Quotes Error:", error);
    return NextResponse.json({ data: [], meta: { total: 0 } }, { status: 500 });
  }
}