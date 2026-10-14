import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { requirePermission } from "@/lib/rbac/auth";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { updateQuotation, deleteQuotation, getQuotationById, submitQuotationForApproval, markQuotationAsDraft } from "@/lib/zoho/quotations";
import { syncQuotations } from "@/lib/zoho-sync/syncQuotations";
import dbConnect from "@/lib/db";
import Quotation from "@/models/Quotation";
import ActivityLog from "@/models/ActivityLog";

export async function GET(req, context) {
  try {
    // await requirePermission(PERMISSIONS.QUOTATION.VIEW);
    const { id } = await context.params;
    
    const estimate = await getQuotationById(id);
    return NextResponse.json(estimate);
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    console.error("[API] GET Quote Error:", error.message || error);
    return NextResponse.json(
      { error: "Failed to fetch quotation" },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(req, context) {
  try {
    await requirePermission(PERMISSIONS.QUOTATION.EDIT);
    const session = await getServerSession(authOptions);
    const { id } = await context.params;
    const body = await req.json();

    await dbConnect();
    const existingQuote = await Quotation.findOne({
      $or: [
        { zoho_estimate_id: id },
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
      ]
    }).lean();

    const line_items = body.line_items.map((item) => {
      const payloadItem = {
        name: item.name,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      };
      if (item.item_id) payloadItem.item_id = item.item_id;
      if (item.line_item_id) payloadItem.line_item_id = item.line_item_id;
      if (item.description) payloadItem.description = item.description;
      if (item.tax_id) payloadItem.tax_id = item.tax_id;
      return payloadItem;
    });

    const quotePayload = {
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

    const data = await updateQuotation(id, quotePayload);

    let finalStatus = 'draft';

    if (body.isSubmit) {
      // 1. Employee selected "Update and Submit for Approval"
      try {
        const submitRes = await submitQuotationForApproval(id);
        if (submitRes?.estimate?.status) {
          finalStatus = submitRes.estimate.status.toLowerCase();
        } else {
          finalStatus = 'pending_approval';
        }
      } catch (err) {
        console.warn("[API] Zoho submitQuotationForApproval notice:", err.message || err);
        finalStatus = 'pending_approval';
      }

      // Log audit trail for submit
      try {
        await ActivityLog.create({
          user: session?.user?.id,
          action: 'SUBMIT_FOR_APPROVAL',
          module: 'Quotation',
          description: `Quotation ${existingQuote?.estimate_number || id} was updated and submitted for approval by ${session?.user?.name || 'User'}.`,
          metadata: {
            quotationId: existingQuote?.zoho_estimate_id || id,
            estimate_number: existingQuote?.estimate_number,
            previousStatus: existingQuote?.status,
            newStatus: 'pending_approval'
          }
        });
      } catch (logErr) {
        console.error("ActivityLog error:", logErr);
      }
    } else {
      // 2. Employee selected "Save as Draft"
      try {
        await markQuotationAsDraft(id);
        finalStatus = 'draft';
      } catch (err) {
        console.warn("[API] Zoho markQuotationAsDraft notice:", err.message || err);
        finalStatus = 'draft';
      }

      // Log audit trail for saving as draft
      try {
        await ActivityLog.create({
          user: session?.user?.id,
          action: 'SAVE_AS_DRAFT',
          module: 'Quotation',
          description: `Quotation ${existingQuote?.estimate_number || id} was edited and saved as Draft by ${session?.user?.name || 'User'}. Previous approval was reset.`,
          metadata: {
            quotationId: existingQuote?.zoho_estimate_id || id,
            estimate_number: existingQuote?.estimate_number,
            previousStatus: existingQuote?.status,
            newStatus: 'draft'
          }
        });
      } catch (logErr) {
        console.error("ActivityLog error:", logErr);
      }
    }

    // Persist new status, reference number, and audit to MongoDB
    await Quotation.findOneAndUpdate(
      {
        $or: [
          { zoho_estimate_id: id },
          ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
        ]
      },
      {
        $set: {
          reference_number: body.reference_number || data?.estimate?.reference_number || '',
          status: finalStatus,
          rejectedAt: null,
          rejectedBy: null,
          rejectionReason: null,
          last_modified_time: new Date()
        }
      }
    );

    const response = NextResponse.json({
      success: true,
      data,
      status: finalStatus,
    });
    
    syncQuotations('incremental').catch(e => console.error("Auto-sync error:", e));
    
    return response;
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    console.error("[API] PUT Quote Error:", error.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update quotation" },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    await requirePermission(PERMISSIONS.QUOTATION.DELETE);
    const { id } = await context.params;
    
    const data = await deleteQuotation(id);
    
    const response = NextResponse.json({
      success: true,
      data,
    });
    
    syncQuotations('incremental').catch(e => console.error("Auto-sync error:", e));
    
    return response;
  } catch (error) {
    if (error.message?.includes("Forbidden") || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    console.error("[API] DELETE Quote Error:", error.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete quotation" },
      { status: error.status || 500 }
    );
  }
}