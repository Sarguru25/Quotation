import dbConnect from "@/lib/db";
import AccessoryPrice from "@/models/AccessoryPrice";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST() {
  try {
    await dbConnect();
    const filePath = path.join(process.cwd(), "src/data/accessories.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const jsonData = JSON.parse(fileContent);

    let insertedCount = 0;
    
    // accessories.json is just a flat array
    for (const item of jsonData) {
      await AccessoryPrice.findOneAndUpdate(
        { model: item.model, description: item.description },
        { 
          $set: {
            model: item.model,
            description: item.description,
            specification: item.specification || {},
            price_inr: item.price_inr,
            price_usd: item.price_usd
          }
        },
        { upsert: true, new: true }
      );
      insertedCount++;
    }

    return NextResponse.json({ success: true, message: `Successfully seeded ${insertedCount} accessory items.` });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
