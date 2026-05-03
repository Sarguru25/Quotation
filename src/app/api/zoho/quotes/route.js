import { NextResponse } from "next/server";
import axios from "axios";
import { getZohoAccessToken } from "@/lib/zoho";

const ZOHO_ORGANIZATION_ID = process.env.ZOHO_ORGANIZATION_ID;

export async function GET() {
  try {
    // generate fresh access token
    const accessToken = await getZohoAccessToken();

    console.log("ACCESS TOKEN:", accessToken);

    const response = await axios.get(
      "https://www.zohoapis.in/books/v3/estimates",
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
        params: {
          organization_id: ZOHO_ORGANIZATION_ID,
        },
      }
    );

    console.log("ZOHO DATA:", response.data);

    return NextResponse.json(
      response.data.estimates || []
    );
  } catch (error) {
    console.log(
      "QUOTE ERROR:",
      error.response?.data || error.message
    );

    return NextResponse.json([]);
  }
}