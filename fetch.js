const axios = require("axios");

// 🔑 Replace these with your values
const ACCESS_TOKEN = "1000.7c8d11b61e0fb154aef894dfa75fac89.b7c967a431be20a7b29de9e03752b152";
const ORGANIZATION_ID = "60070607135";

async function fetchQuotes() {
  try {
    const response = await axios.get(
      `https://www.zohoapis.in/books/v3/estimates?organization_id=${ORGANIZATION_ID}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${ACCESS_TOKEN}`,
        },
      }
    );

    console.log("✅ Quotes Data:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ Error fetching quotes:");
    
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

fetchQuotes();