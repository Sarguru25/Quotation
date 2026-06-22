import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { updateSalesOrder, deleteSalesOrder, getSalesOrder } from "@/lib/zoho/salesOrders";
import { syncSalesOrders } from "@/lib/zoho-sync/syncSalesOrders";

export async function GET(req, context) {
  try {
    // await requirePermission(PERMISSIONS.SALES_ORDER.VIEW);
    const { id } = await context.params;
    
    const so = await getSalesOrder(id);
    return NextResponse.json(so);
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[API] GET Sales Order Error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch sales order" },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(req, context) {
  try {
    // await requirePermission(PERMISSIONS.SALES_ORDER.EDIT);
    const { id } = await context.params;
    const body = await req.json();

    const line_items = body.line_items.map((item) => {
      const payloadItem = {
        name: item.name,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      };
      if (item.line_item_id) payloadItem.line_item_id = item.line_item_id;
      if (item.item_id) payloadItem.item_id = item.item_id;
      if (item.description) payloadItem.description = item.description;
      if (item.tax_id) payloadItem.tax_id = item.tax_id;
      return payloadItem;
    });

    const soPayload = {
      customer_id: body.customer_id,
      reference_number: body.reference_number,
      date: body.date,
      shipment_date: body.shipment_date,
      notes: body.notes,
      terms: body.terms,
      line_items,
      is_discount_before_tax: true,
      discount_type: "entity_level",
      discount: Number(body.discount) || 0,
      adjustment: Number(body.adjustment) || 0,
      custom_fields: []
    };

    const data = await updateSalesOrder(id, soPayload);

    const response = NextResponse.json({
      success: true,
      data,
    });
    
    syncSalesOrders('incremental').catch(e => console.error("Auto-sync error:", e));
    
    return response;
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    console.error("[API] PUT Sales Order Error:", error.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update sales order" },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    // await requirePermission(PERMISSIONS.SALES_ORDER.DELETE);
    const { id } = await context.params;
    
    const data = await deleteSalesOrder(id);
    
    const response = NextResponse.json({
      success: true,
      data,
    });
    
    syncSalesOrders('incremental').catch(e => console.error("Auto-sync error:", e));
    
    return response;
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    console.error("[API] DELETE Sales Order Error:", error.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete sales order" },
      { status: error.status || 500 }
    );
  }
}
