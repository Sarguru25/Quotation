import { NextResponse } from 'next/server';
import { getQuotations } from '@/lib/zoho/quotations';
import Quotation from '@/models/Quotation';
import dbConnect from '@/lib/db';

export async function GET(req) {
  try {
    await dbConnect();
    // find the one with ZIQ26270108
    const q = await Quotation.findOne({ estimate_number: 'ZIQ26270108' }).lean();
    if (!q) {
      return NextResponse.json({ error: "not found" });
    }
    const { getQuotationById } = require('@/lib/zoho/quotations');
    const estimate = await getQuotationById(q.zoho_estimate_id);
    return NextResponse.json({ dbQuote: q, zohoEstimate: estimate });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
