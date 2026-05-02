import { NextResponse } from "next/server";
import axios from "axios";

const ACCESS_TOKEN = process.env.ZOHO_ACCESS_TOKEN;
const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;

export async function GET() {
  try {
    const res = await axios.get(
      "https://www.zohoapis.in/books/v3/estimates",
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${ACCESS_TOKEN}`,
        },
        params: {
          organization_id: ZOHO_ORGANIZATION_ID,
        },
      }
    );

    console.log("SUCCESS:", res.data);

    return NextResponse.json(res.data.estimates || []);
  } catch (error) {
    console.error("ERROR:", error.response?.data || error.message);

    return NextResponse.json([]);
  }
}