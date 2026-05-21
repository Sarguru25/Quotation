import dbConnect from "@/lib/db";
import ActuatorPrice from "@/models/ActuatorPrice";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST() {
  try {
    await dbConnect();
    const dataPath = path.join(process.cwd(), "src/data");
    const files = ["ZRA_DA.json", "ZRB_DA.json", "ZRC_DA.json", "ZRD_DA.json"];

    let insertedCount = 0;

    for (const file of files) {
      const series = file.replace("_DA.json", "");
      const filePath = path.join(dataPath, file);

      const fileContent = await fs.readFile(filePath, "utf-8");
      const jsonData = JSON.parse(fileContent);

      const auxPrefix = series; 
      
      let drawingMap = {};
      try {
        const c = await fs.readFile(path.join(dataPath, `${auxPrefix}_Drawing_no.json`), "utf-8");
        if (c.trim()) {
          const d = JSON.parse(c);
          if (d.double_acting) {
            d.double_acting.forEach(item => { drawingMap[item.model] = item.drawing_no; });
          }
        }
      } catch(e) {}

      let adaptorMap = {};
      try {
        const c = await fs.readFile(path.join(dataPath, `${auxPrefix}_Adaptor.json`), "utf-8");
        if (c.trim()) {
          const d = JSON.parse(c);
          d.forEach(item => { adaptorMap[item.adaptor] = item; });
        }
      } catch(e) {}

      let detailsMap = {};
      try {
        const c = await fs.readFile(path.join(dataPath, `${auxPrefix}_other_details.json`), "utf-8");
        if (c.trim()) {
          const d = JSON.parse(c);
          d.forEach(item => { detailsMap[item.model] = item; });
        }
      } catch(e) {}

      const itemsToInsert = jsonData.map((item) => ({
        sr_no: item.sr_no,
        series: file.replace(".json", ""),
        model: item.model,
        torque_nm: item.torque_nm || {},
        output_torque_nm: item.output_torque_nm || null,
        price_inr: item.price_inr,
        price_usd: item.price_usd,
        match_status: item.match_status || "Not Matched",
        drawing_no: drawingMap[item.model] || "-",
        adaptor_price_inr: adaptorMap[item.model]?.price_inr || 0,
        adaptor_price_usd: adaptorMap[item.model]?.price_usd || 0,
        mounting: detailsMap[item.model]?.mounting || "-",
        drive_type: detailsMap[item.model]?.drive_type || "-",
        air_port_connections: detailsMap[item.model]?.air_port_connections || "-"
      }));

      for (const item of itemsToInsert) {
        await ActuatorPrice.findOneAndUpdate(
          { series: item.series, model: item.model },
          { $set: item },
          { upsert: true, new: true }
        );
      }

      insertedCount += itemsToInsert.length;
    }

    return NextResponse.json({ success: true, message: `Successfully seeded ${insertedCount} items.` });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
