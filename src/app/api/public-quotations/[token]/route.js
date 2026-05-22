import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PublicQuotationLink from "@/models/PublicQuotationLink";
import { getZohoAccessToken } from "@/lib/zoho";

const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;

export async function GET(req, { params }) {
  try {
    const { token } = await params;
    await dbConnect();

    const link = await PublicQuotationLink.findOne({ publicToken: token });

    if (!link) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    if (!link.isActive) {
      return NextResponse.json({ error: "This quotation link has been disabled" }, { status: 403 });
    }

    if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
      link.status = 'Expired';
      await link.save();
      return NextResponse.json({ error: "This quotation link has expired", isExpired: true, link }, { status: 403 });
    }

    // Fetch from Zoho
    const accessToken = await getZohoAccessToken();
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/estimates/${link.quotationId}?organization_id=${ZOHO_ORGANIZATION_ID}`,
      {
        headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
        cache: "no-store",
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch from Zoho");

    const quote = data.estimate;

    // Update views asynchronously
    const ipAddress = req.headers.get('x-forwarded-for') || req.ip || 'Unknown';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    if (link.status === 'Generated') {
      link.status = 'Viewed';
    }
    link.viewedAt = new Date();
    link.viewCount += 1;
    link.ipAddress = ipAddress;
    link.userAgent = userAgent;
    await link.save();

    return NextResponse.json({ success: true, quote, link });
  } catch (error) {
    console.error("Public Quotation Error:", error);
    return NextResponse.json({ error: "Failed to fetch quotation details" }, { status: 500 });
  }
}
