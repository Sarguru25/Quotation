import axios from "axios";

const CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ORG_ID = process.env.ZOHO_ORGANIZATION_ID;

// 🔁 Get access token automatically
async function getAccessToken() {
  const res = await axios.post(
    "https://accounts.zoho.in/oauth/v2/token",
    null,
    {
      params: {
        refresh_token: REFRESH_TOKEN,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
      },
    }
  );

  return res.data.access_token;
}

// 📥 Fetch quotations (estimates)
export async function fetchZohoQuotations() {
  try {
    const accessToken = await getAccessToken();

    const res = await axios.get(
      `https://www.zohoapis.in/books/v3/estimates`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
        params: {
          organization_id: ORG_ID,
        },
      }
    );

    return res.data.estimates || [];
  } catch (error) {
    console.error("Zoho Fetch Error:", error.response?.data || error.message);
    return [];
  }
}