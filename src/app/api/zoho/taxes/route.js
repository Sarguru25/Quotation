import { NextResponse } from "next/server";
import { getTaxes } from "@/lib/zoho/taxes";

export async function GET() {
  try {
    // Taxes are generally public for authenticated users creating quotes
    // But you can add requirePermission if you want strict RBAC
    const taxes = await getTaxes();
    return NextResponse.json(taxes);
  } catch (error) {
    console.error("[API] GET Taxes Error:", error.message || error);
    return NextResponse.json([]);
  }
}