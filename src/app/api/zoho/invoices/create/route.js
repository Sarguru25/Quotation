import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { createInvoice } from "@/lib/zoho/invoices";
import { syncInvoices } from "@/lib/zoho-sync/syncInvoices";

export async function POST(req) {
  try {
    // await requirePermission(PERMISSIONS.INVOICE.CREATE);

    const body = await req.json();

    const line_items = body.line_items.map((item) => {
      const payloadItem = {
        name: item.name,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      };
      if (item.item_id) payloadItem.item_id = item.item_id;
      if (item.description) payloadItem.description = item.description;
      if (item.tax_id) payloadItem.tax_id = item.tax_id;
      return payloadItem;
    });

    const invoicePayload = {
      customer_id: body.customer_id,
      reference_number: body.reference_number,
      date: body.date,
      due_date: body.due_date,
      notes: body.notes,
      terms: body.terms,
      line_items,
      is_discount_before_tax: true,
      discount_type: "entity_level",
      discount: Number(body.discount) || 0,
      adjustment: Number(body.adjustment) || 0,
      custom_fields: []
    };

    const data = await createInvoice(invoicePayload);

    const response = NextResponse.json({
      success: true,
      data,
    });
    
    syncInvoices('incremental').catch(e => console.error("Auto-sync error:", e));
    
    return response;
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    console.error("[API] POST Invoice Error:", error.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create invoice" },
      { status: error.status || 500 }
    );
  }
}
