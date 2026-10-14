import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { createQuotation, submitQuotationForApproval } from "@/lib/zoho/quotations";
import { syncQuotations } from "@/lib/zoho-sync/syncQuotations";
import dbConnect from "@/lib/db";
import Quotation from "@/models/Quotation";

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
      subject_content: body.subject,
      notes: body.notes,
      terms: body.terms,
      discount: `${Number(body.discount_percent) || 0}%`,
      discount_type: "entity_level",
      is_discount_before_tax: true,
      adjustment: Number(body.adjustment) || 0,
      line_items,
      custom_fields: []
    };

    if (body.salesperson) {
      quotePayload.salesperson_name = body.salesperson;
    }

    const customFieldsMapping = {
      cf_quotation_creater: "cf_quotation_creater",
      project_name: "cf_project_name",
      offer_status: "cf_offer_status",
      estimated_margin: "cf_estimated_margin",
      epc_customer: "cf_epc_customer",
      project: "cf_project",
      end_user: "cf_end_user",
      market_segment: "cf_market_segment"
    };

    for (const [bodyKey, apiName] of Object.entries(customFieldsMapping)) {
      if (body[bodyKey] !== undefined && body[bodyKey] !== "") {
        quotePayload.custom_fields.push({
          api_name: apiName,
          value: body[bodyKey]
        });
      }
    }

    // 3. Service Layer call
    const data = await createQuotation(quotePayload);
    let finalEstimate = data?.estimate;

    if (body.isSubmit && finalEstimate?.estimate_id) {
      try {
        const submitRes = await submitQuotationForApproval(finalEstimate.estimate_id);
        if (submitRes?.estimate) {
          finalEstimate = submitRes.estimate;
        }
      } catch (err) {
        console.warn("[API] Zoho submitQuotationForApproval notice:", err.message || err);
      }
    }

    // Persist immediately to MongoDB with the authoritative status
    if (finalEstimate?.estimate_id) {
      try {
        await dbConnect();
        const finalStatus = finalEstimate.status
          ? finalEstimate.status.toLowerCase()
          : (body.isSubmit ? "pending_approval" : "draft");

        await Quotation.findOneAndUpdate(
          { zoho_estimate_id: finalEstimate.estimate_id },
          {
            $set: {
              estimate_number: finalEstimate.estimate_number,
              reference_number: finalEstimate.reference_number || body.reference_number || "",
              customer_id: finalEstimate.customer_id,
              customer_name: finalEstimate.customer_name,
              date: finalEstimate.date ? new Date(finalEstimate.date) : null,
              expiry_date: finalEstimate.expiry_date ? new Date(finalEstimate.expiry_date) : null,
              status: finalStatus,
              currency_code: finalEstimate.currency_code,
              sub_total: finalEstimate.sub_total,
              tax_total: finalEstimate.tax_total,
              total: finalEstimate.total,
              salesperson_name: finalEstimate.salesperson_name,
              subject: finalEstimate.subject_content || finalEstimate.subject,
              notes: finalEstimate.notes,
              terms: finalEstimate.terms,
              line_items: finalEstimate.line_items ? finalEstimate.line_items.map(item => ({
                item_id: item.item_id,
                name: item.name,
                quantity: item.quantity,
                rate: item.rate,
                tax_percentage: item.tax_percentage,
                item_total: item.item_total
              })) : [],
              syncedAt: new Date(),
              last_modified_time: finalEstimate.last_modified_time ? new Date(finalEstimate.last_modified_time) : new Date(),
              rawZohoData: finalEstimate
            }
          },
          { upsert: true }
        );
      } catch (dbErr) {
        console.error("[API] Error caching created quotation to DB:", dbErr);
      }
    }

    // 4. Return
    const response = NextResponse.json({
      success: true,
      data: { ...data, estimate: finalEstimate },
    });
    
    syncQuotations('incremental').catch(e => console.error("Auto-sync error:", e));
    
    return response;
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