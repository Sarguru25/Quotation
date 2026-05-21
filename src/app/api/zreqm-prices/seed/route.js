import dbConnect from "@/lib/db";
import ZreqmPrice from "@/models/ZreqmPrice";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST() {
  try {
    await dbConnect();
    const filePath = path.join(process.cwd(), "src/data/ZREQM.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const jsonData = JSON.parse(fileContent);

    let insertedCount = 0;
    
    // jsonData is an object with categories as keys
    for (const [category, items] of Object.entries(jsonData)) {
      for (const item of items) {
        await ZreqmPrice.findOneAndUpdate(
          { category, model: item.model },
          { 
            $set: {
              category,
              sr_no: item.sr_no,
              model: item.model,
              torque_nm: item.torque_nm,
              list_price_inr: item.list_price_inr,
              list_price_usd: item.list_price_usd
            }
          },
          { upsert: true, new: true }
        );
        insertedCount++;
      }
    }

    return NextResponse.json({ success: true, message: `Successfully seeded ${insertedCount} ZREQM items.` });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
