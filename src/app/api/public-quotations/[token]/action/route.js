import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PublicQuotationLink from "@/models/PublicQuotationLink";
import ActivityLog from "@/models/ActivityLog";
import { getZohoAccessToken } from "@/lib/zoho";

const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;

export async function POST(req, { params }) {
  try {
    const { token } = await params;
    const body = await req.json();
    const { action, reason, message, customerName } = body;

    await dbConnect();

    const link = await PublicQuotationLink.findOne({ publicToken: token });
    if (!link || !link.isActive) return NextResponse.json({ error: "Invalid or disabled link" }, { status: 403 });

    if (action === "accept") {
      link.status = "Accepted";
      link.acceptedAt = new Date();
      await link.save();

      // Trigger Zoho Status Update
      const accessToken = await getZohoAccessToken();
      await fetch(
        `https://www.zohoapis.in/books/v3/estimates/${link.quotationId}/status/accepted?organization_id=${ZOHO_ORGANIZATION_ID}`,
        {
          method: "POST",
          headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
        }
      );

      // Log activity
      await ActivityLog.create({
        action: "QUOTATION_ACCEPTED",
        module: "Quotation",
        description: `Customer accepted quotation via public link.`,
        metadata: { quotationId: link.quotationId, publicToken: token }
      });

      return NextResponse.json({ success: true, link });
    }

    if (action === "reject") {
      link.status = "Rejected";
      link.rejectedAt = new Date();
      link.rejectionReason = reason;
      await link.save();

      const accessToken = await getZohoAccessToken();
      await fetch(
        `https://www.zohoapis.in/books/v3/estimates/${link.quotationId}/status/declined?organization_id=${ZOHO_ORGANIZATION_ID}`,
        {
          method: "POST",
          headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
        }
      );

      await ActivityLog.create({
        action: "QUOTATION_REJECTED",
        module: "Quotation",
        description: `Customer rejected quotation via public link. Reason: ${reason}`,
        metadata: { quotationId: link.quotationId, publicToken: token }
      });

      return NextResponse.json({ success: true, link });
    }

    if (action === "feedback") {
      link.status = "Revision Requested";
      link.feedback.push({
        message,
        customerName: customerName || "Customer",
        timestamp: new Date()
      });
      await link.save();

      await ActivityLog.create({
        action: "QUOTATION_FEEDBACK",
        module: "Quotation",
        description: `Customer left feedback on public link: ${message}`,
        metadata: { quotationId: link.quotationId, publicToken: token }
      });

      return NextResponse.json({ success: true, link });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Public Action Error:", error);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}
