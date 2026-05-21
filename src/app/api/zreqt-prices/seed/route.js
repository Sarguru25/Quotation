import dbConnect from "@/lib/db";
import ZreqtPrice from "@/models/ZreqtPrice";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST() {
  try {
    await dbConnect();
    const filePath = path.join(process.cwd(), "src/data/ZREQT.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const jsonData = JSON.parse(fileContent);

    let insertedCount = 0;
    
    for (const [category, items] of Object.entries(jsonData)) {
      for (const item of items) {
        await ZreqtPrice.findOneAndUpdate(
          { category, model: item.model },
          { 
            $set: {
              category,
              sr_no: item.sr_no,
              model: item.model,
              torque_nm: item.torque_nm,
              switching_time: item.switching_time || "-",
              list_price_inr: item.list_price_inr,
              list_price_usd: item.list_price_usd,
              voltage: item.voltage || []
            }
          },
          { upsert: true, new: true }
        );
        insertedCount++;
      }
    }

    return NextResponse.json({ success: true, message: `Successfully seeded ${insertedCount} ZREQT items.` });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
