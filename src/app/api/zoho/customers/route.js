import { NextResponse } from "next/server";
import axios from "axios";
import { getZohoAccessToken } from "@/lib/zoho";

const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;

export async function GET() {
  try {
    const accessToken = await getZohoAccessToken();

    const response = await axios.get(
      "https://www.zohoapis.in/books/v3/contacts",
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
        params: {
          organization_id: ZOHO_ORGANIZATION_ID,
        },
      }
    );

    return NextResponse.json(response.data.contacts || []);
  } catch (error) {
    console.error("GET Customers Error:", error.response?.data || error.message);
    return NextResponse.json([]);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const accessToken = await getZohoAccessToken();

    const customerPayload = {
      contact_name: body.contact_name,
      company_name: body.company_name || body.contact_name,
      email: body.email,
      phone: body.phone,
      billing_address: body.billing_address,
      shipping_address: body.shipping_address,
    };

    const response = await axios.post(
      "https://www.zohoapis.in/books/v3/contacts",
      customerPayload,
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
      data: response.data.contact,
    });
  } catch (error) {
    console.error("POST Customer Error:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, error: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
