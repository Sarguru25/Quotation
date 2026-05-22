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
    if (!link || !link.isActive) {
      return new NextResponse("Invalid or disabled link", { status: 403 });
    }

    const accessToken = await getZohoAccessToken();
    const response = await fetch(
      `https://www.zohoapis.in/books/v3/estimates/${link.quotationId}?organization_id=${ZOHO_ORGANIZATION_ID}&accept=pdf`,
      {
        headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
      }
    );

    if (!response.ok) {
      return new NextResponse("Failed to fetch PDF from Zoho", { status: 500 });
    }

    const blob = await response.blob();
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `attachment; filename="Quotation_${link.quotationId}.pdf"`);

    return new NextResponse(blob, { status: 200, headers });
  } catch (error) {
    console.error("PDF Download Error:", error);
    return new NextResponse("Failed to download PDF", { status: 500 });
  }
}
