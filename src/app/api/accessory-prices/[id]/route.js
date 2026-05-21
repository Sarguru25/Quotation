import dbConnect from "@/lib/db";
import AccessoryPrice from "@/models/AccessoryPrice";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await req.json();
    const price = await AccessoryPrice.findByIdAndUpdate(id, body, { new: true });
    if (!price) return NextResponse.json({ success: false, error: "Price not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: price });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const deletedPrice = await AccessoryPrice.findByIdAndDelete(id);
    if (!deletedPrice) return NextResponse.json({ success: false, error: "Price not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
