import { NextResponse } from "next/server";
import axios from "axios";
import { getZohoAccessToken } from "@/lib/zoho";

const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;

// GET single item
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const accessToken = await getZohoAccessToken();

    const response = await axios.get(
      `https://www.zohoapis.com/books/v3/items/${id}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
        params: {
          organization_id: ZOHO_ORGANIZATION_ID,
        },
      }
    );

    return NextResponse.json(response.data.item || null);
  } catch (error) {
    console.error("GET ITEM ERROR:", error.response?.data || error.message);
    return NextResponse.json(null, { status: 500 });
  }
}

// UPDATE item
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const accessToken = await getZohoAccessToken();

    const itemPayload = {
      name: body.name,
      rate: Number(body.rate) || 0,
      description: body.description || "",
      sku: body.sku || "",
      product_type: body.product_type || "goods",
      unit: body.unit || "",
      purchase_rate: Number(body.purchase_rate) || 0,
      purchase_description: body.purchase_description || "",
    };

    if (body.tax_id) itemPayload.tax_id = body.tax_id;
    if (body.account_id) itemPayload.account_id = body.account_id;
    if (body.purchase_account_id) itemPayload.purchase_account_id = body.purchase_account_id;

    const response = await axios.put(
      `https://www.zohoapis.com/books/v3/items/${id}`,
      itemPayload,
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
    console.error("UPDATE ITEM ERROR:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, error: error.response?.data || error.message },
      { status: 500 }
    );
  }
}

// DELETE item
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const accessToken = await getZohoAccessToken();

    await axios.delete(
      `https://www.zohoapis.com/books/v3/items/${id}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
        params: {
          organization_id: ZOHO_ORGANIZATION_ID,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE ITEM ERROR:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, error: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
