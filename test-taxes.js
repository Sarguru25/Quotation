import dbConnect from './src/lib/db.js';
import Tax from './src/models/Tax.js';

async function run() {
  await dbConnect();
  const allTaxes = await Tax.find({}).lean();
  console.log("Total taxes:", allTaxes.length);
  const activeTaxes = await Tax.find({ status: 'active' }).lean();
  console.log("Active taxes:", activeTaxes.length);
  process.exit(0);
}
run();
