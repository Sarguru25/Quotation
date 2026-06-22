import { NextResponse } from 'next/server';
import { getInvoices } from '@/lib/db-queries/getInvoices';
import { requirePermission } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function GET(req) {
  try {
    // Assuming you have PERMISSIONS.INVOICE.VIEW defined. Fallback to auth if not.
    // await requirePermission(PERMISSIONS.INVOICE.VIEW);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const result = await getInvoices({ page, limit, search, status });

    return NextResponse.json(result);
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('[API] GET Invoices Error:', error.message || error);
    return NextResponse.json({ data: [], meta: { total: 0 } }, { status: 500 });
  }
}
