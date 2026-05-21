import dbConnect from "@/lib/db";
import ActuatorPriceSA from "@/models/ActuatorPriceSA";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST() {
  try {
    await dbConnect();
    const dataPath = path.join(process.cwd(), "src/data");
    const files = ["ZRA_SA.json", "ZRB_SA.json", "ZRC_SA.json", "ZRD_SA.json"];

    let insertedCount = 0;

    for (const file of files) {
      const series = file.replace("_SA.json", "");
      const filePath = path.join(dataPath, file);

      const fileContent = await fs.readFile(filePath, "utf-8");
      const jsonData = JSON.parse(fileContent);

      const auxPrefix = series; 
      
      let drawingMap = {};
      try {
        const c = await fs.readFile(path.join(dataPath, `${auxPrefix}_Drawing_no.json`), "utf-8");
        if (c.trim()) {
          const d = JSON.parse(c);
          if (d.single_acting) {
            d.single_acting.forEach(item => { drawingMap[item.model] = item.drawing_no; });
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

      const itemsToInsert = jsonData.map((item) => {
        const baseModelForLookup = item.model.replace("SA", "DA");

        return {
          series: file.replace(".json", ""),
          model: item.model,
          spring_qty: item.spring_qty,
          air_pressure_bar: item.air_pressure_bar || {},
          spring_output: item.spring_output || {},
          price_inr: item.price_inr,
          price_usd: item.price_usd,
          drawing_no: drawingMap[item.model] || "-",
          adaptor_price_inr: adaptorMap[baseModelForLookup]?.price_inr || 0,
          adaptor_price_usd: adaptorMap[baseModelForLookup]?.price_usd || 0,
          mounting: detailsMap[baseModelForLookup]?.mounting || "-",
          drive_type: detailsMap[baseModelForLookup]?.drive_type || "-",
          air_port_connections: detailsMap[baseModelForLookup]?.air_port_connections || "-"
        };
      });

      for (const item of itemsToInsert) {
        await ActuatorPriceSA.findOneAndUpdate(
          { series: item.series, model: item.model, spring_qty: item.spring_qty },
          { $set: item },
          { upsert: true, new: true }
        );
      }

      insertedCount += itemsToInsert.length;
    }

    return NextResponse.json({ success: true, message: `Successfully seeded ${insertedCount} SA items.` });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
