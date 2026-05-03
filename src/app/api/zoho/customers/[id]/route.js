import { NextResponse } from "next/server";
import axios from "axios";
import { getZohoAccessToken } from "@/lib/zoho";

const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;

export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const accessToken = await getZohoAccessToken();

    const response = await axios.get(
      `https://www.zohoapis.in/books/v3/contacts/${id}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
        params: {
          organization_id: ZOHO_ORGANIZATION_ID,
        },
      }
    );

    return NextResponse.json(response.data.contact);
  } catch (error) {
    console.error("GET Customer Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

export async function PUT(req, context) {
  try {
    const { id } = await context.params;
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

    const response = await axios.put(
      `https://www.zohoapis.in/books/v3/contacts/${id}`,
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
    console.error("PUT Customer Error:", error.response?.data || error.message);
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
      `https://www.zohoapis.in/books/v3/contacts/${id}`,
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
    console.error("DELETE Customer Error:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, error: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
