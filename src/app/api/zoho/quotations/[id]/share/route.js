import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import PublicQuotationLink from "@/models/PublicQuotationLink";
import crypto from "crypto";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const link = await PublicQuotationLink.findOne({ quotationId: id });
    return NextResponse.json({ link });
  } catch (error) {
    console.error("Error fetching share link:", error);
    return NextResponse.json({ error: "Failed to fetch share link" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    let link = await PublicQuotationLink.findOne({ quotationId: id });

    // Generate 16 char random secure token
    const publicToken = crypto.randomBytes(8).toString('hex');

    if (link) {
      // Update existing
      link.publicToken = publicToken;
      link.isActive = body.isActive ?? true;
      if (body.expiresInDays) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + parseInt(body.expiresInDays));
        link.expiresAt = expiry;
      }
      await link.save();
    } else {
      // Create new
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + (body.expiresInDays ? parseInt(body.expiresInDays) : 30));

      link = await PublicQuotationLink.create({
        quotationId: id,
        publicToken,
        expiresAt: expiry,
        isActive: body.isActive ?? true
      });
    }

    return NextResponse.json({ success: true, link });
  } catch (error) {
    console.error("Error generating share link:", error);
    return NextResponse.json({ error: "Failed to generate share link" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    const link = await PublicQuotationLink.findOneAndUpdate(
      { quotationId: id },
      { isActive: body.isActive },
      { new: true }
    );

    return NextResponse.json({ success: true, link });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update link status" }, { status: 500 });
  }
}