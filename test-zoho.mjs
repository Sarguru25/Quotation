import { getQuotations } from './src/lib/zoho/quotations.js';

async function run() {
  const quotes = await getQuotations({ limit: 1 });
  if (quotes && quotes.length > 0) {
    console.log(JSON.stringify(quotes[0].custom_fields, null, 2));
  } else {
    console.log("No quotes found.");
  }
}

run().catch(console.error);
