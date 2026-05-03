import { fetchZohoQuotations } from "@/lib/zoho";
import dbConnect from "@/lib/db";
import Quotation from "@/models/Quotation";

export async function GET() {
  try {
    await dbConnect();

    const quotes = await fetchZohoQuotations();

    for (const q of quotes) {
      await Quotation.updateOne(
        { zohoId: q.estimate_id },
        {
          zohoId: q.estimate_id,
          customerName: q.customer_name,
          status: q.status,
          totalAmount: q.total,
          lastSyncedAt: new Date(),
        },
        { upsert: true }
      );
    }

    return Response.json({
      success: true,
      count: quotes.length,
    });
  } catch (error) {
    console.error("Sync Error:", error);
    return Response.json({ error: "Sync failed" }, { status: 500 });
  }
}