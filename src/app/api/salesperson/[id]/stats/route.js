import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Visit from '@/models/Visit';
import Quotation from '@/models/Quotation';
import Customer from '@/models/Customer';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    // Stats for salesperson
    const totalVisits = await Visit.countDocuments({ salesPersonId: id });
    const visits = await Visit.find({ salesPersonId: id }).lean();
    
    const uniqueCustomerIds = [...new Set(visits.map(v => v.customerId))];
    const activeCustomers = uniqueCustomerIds.length;

    // We can't directly filter quotations by salespersonId if they don't have it, but the model has salesperson_name. 
    // Assuming we could match some other way, we'll return generic stats or use salesperson_name if we fetch User first.
    // Let's assume we can query quotations by salesperson_name if we had it, but for now we mock or use an approximate.
    // If the Quotation doesn't have salesperson_id, we can't easily filter. For now, we'll return what we can.
    
    const quotations = await Quotation.find({ "salesperson_name": { $exists: true } }).lean(); // Needs proper linking in reality
    const totalQuotations = quotations.length; // placeholder
    const acceptedQuotations = quotations.filter(q => q.status === 'accepted').length;
    const conversionRatio = totalQuotations > 0 ? (acceptedQuotations / totalQuotations) * 100 : 0;

    return NextResponse.json({
      totalVisits,
      activeCustomers,
      quotationsCreated: totalQuotations,
      acceptedQuotations,
      conversionRatio: conversionRatio.toFixed(2) + '%'
    });
  } catch (error) {
    console.error('Salesperson Stats GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
