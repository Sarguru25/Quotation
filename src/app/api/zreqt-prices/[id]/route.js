import dbConnect from "@/lib/db";
import ZreqtPrice from "@/models/ZreqtPrice";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const price = await ZreqtPrice.findByIdAndUpdate(id, body, { returnDocument: 'after' });
    if (!price) return NextResponse.json({ success: false, error: "Price not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: price });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const deletedPrice = await ZreqtPrice.findByIdAndDelete(id);
    if (!deletedPrice) return NextResponse.json({ success: false, error: "Price not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
