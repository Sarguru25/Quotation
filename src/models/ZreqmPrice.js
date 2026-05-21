import mongoose from 'mongoose';

const ZreqmPriceSchema = new mongoose.Schema({
  category: { type: String, required: true },
  sr_no: { type: Number, required: true },
  model: { type: String, required: true },
  torque_nm: { type: Number, required: true },
  list_price_inr: { type: Number, required: true },
  list_price_usd: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.ZreqmPrice || mongoose.model('ZreqmPrice', ZreqmPriceSchema);
