import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { createQuotation } from "@/lib/zoho/quotations";

export async function POST(req) {
  try {
    // 1. Authorization
    await requirePermission(PERMISSIONS.QUOTATION.CREATE);

    // 2. Extract and format data
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

    const quotePayload = {
      customer_id: body.customer_id,
      reference_number: body.reference_number,
      date: body.date,
      expiry_date: body.expiry_date,
      subject: body.subject,
      notes: body.notes,
      terms: body.terms,
      discount: `${Number(body.discount_percent) || 0}%`,
      discount_type: "entity_level",
      is_discount_before_tax: true,
      adjustment: Number(body.adjustment) || 0,
      line_items,
      custom_fields: []
    };

    if (body.cf_quotation_creater) {
      quotePayload.custom_fields.push({
        api_name: "cf_quotation_creater",
        value: body.cf_quotation_creater
      });
    }

    // 3. Service Layer call
    const data = await createQuotation(quotePayload);

    // 4. Return
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }

    console.error("[API] POST Quote Error:", error.message || error);

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create quotation" },
      { status: error.status || 500 }
    );
  }
}