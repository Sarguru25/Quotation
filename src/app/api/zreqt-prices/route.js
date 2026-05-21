import dbConnect from "@/lib/db";
import ZreqtPrice from "@/models/ZreqtPrice";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const prices = await ZreqtPrice.find({}).sort({ category: 1, sr_no: 1 });
    return NextResponse.json({ success: true, data: prices });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const price = await ZreqtPrice.create(body);
    return NextResponse.json({ success: true, data: price }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
