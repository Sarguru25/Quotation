import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Visit from '@/models/Visit';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    const query = {};
    if (customerId) {
      query.customerId = customerId;
    }
    
    // Support sorting and pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const visits = await Visit.find(query)
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
    const total = await Visit.countDocuments(query);
      
    return NextResponse.json({ visits, total, page, limit });
  } catch (error) {
    console.error('Visits GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const visit = await Visit.create(data);
    
    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error('Visits POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
