import { NextResponse } from "next/server";
import axios from "axios";
import { getZohoAccessToken } from "@/lib/zoho";

const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;

export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const accessToken = await getZohoAccessToken();

    const response = await axios.get(
      `https://www.zohoapis.in/books/v3/estimates/${id}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
        params: {
          organization_id: ZOHO_ORGANIZATION_ID,
        },
      }
    );

    return NextResponse.json(response.data.estimate);
  } catch (error) {
    console.error("GET Quote Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to fetch quotation" },
      { status: 500 }
    );
  }
}

export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const accessToken = await getZohoAccessToken();

    const line_items = body.line_items.map((item) => ({
      ...(item.item_id ? { item_id: item.item_id } : {}),
      ...(item.line_item_id ? { line_item_id: item.line_item_id } : {}),
      name: item.name,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
    }));

    const quotePayload = {
      reference_number: body.reference_number,
      date: body.date,
      expiry_date: body.expiry_date,
      subject: body.subject,
      notes: body.notes,
      terms: body.terms,
      line_items,
      // If customer_name is modified, might need to handle customer_id but for simplicity passing what is editable
    };

    const response = await axios.put(
      `https://www.zohoapis.in/books/v3/estimates/${id}`,
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
      data: response.data,
    });
  } catch (error) {
    console.error("PUT Quote Error:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, error: error.response?.data || error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    const { id } = await context.params;
    const accessToken = await getZohoAccessToken();

    const response = await axios.delete(
      `https://www.zohoapis.in/books/v3/estimates/${id}`,
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
      data: response.data,
    });
  } catch (error) {
    console.error("DELETE Quote Error:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, error: error.response?.data || error.message },
      { status: 500 }
    );
  }
}