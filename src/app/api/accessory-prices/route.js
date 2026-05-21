import dbConnect from "@/lib/db";
import AccessoryPrice from "@/models/AccessoryPrice";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const prices = await AccessoryPrice.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: prices });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const price = await AccessoryPrice.create(body);
    return NextResponse.json({ success: true, data: price }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
