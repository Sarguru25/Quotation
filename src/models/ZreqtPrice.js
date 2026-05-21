import mongoose from 'mongoose';

const ZreqtPriceSchema = new mongoose.Schema({
  category: { type: String, required: true },
  sr_no: { type: Number, required: true },
  model: { type: String, required: true },
  torque_nm: { type: Number, required: true },
  switching_time: { type: String },
  list_price_inr: { type: Number, required: true },
  list_price_usd: { type: Number, required: true },
  voltage: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.models.ZreqtPrice || mongoose.model('ZreqtPrice', ZreqtPriceSchema);
