// src/app/api/zoho/quotes/create/route.js

import { NextResponse } from "next/server";
import axios from "axios";
import { getZohoAccessToken } from "@/lib/zoho";

const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;

export async function POST(req) {
  try {
    const body = await req.json();
    const accessToken = await getZohoAccessToken();

    const line_items = body.line_items.map((item) => ({
      name: item.name,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
    }));

    const quotePayload = {
      customer_id: body.customer_id,
      reference_number: body.reference_number,
      date: body.date,
      expiry_date: body.expiry_date,
      subject: body.subject,
      notes: body.notes,
      terms: body.terms,
      line_items,
    };

    const quoteResponse = await axios.post(
      `https://www.zohoapis.in/books/v3/estimates`,
      quotePayload,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
        params: {
          organization_id: ZOHO_ORGANIZATION_ID,
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: quoteResponse.data,
    });
  } catch (error) {
    console.log("CREATE QUOTE ERROR:", error.response?.data || error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}