import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { getItems } from "@/lib/zoho/items";

export async function GET() {
  try {
    await requirePermission(PERMISSIONS.PRODUCT.VIEW);
    
    const items = await getItems();
    return NextResponse.json(items);
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[API] GET Items Error:", error.message || error);
    return NextResponse.json([]);
  }
}
