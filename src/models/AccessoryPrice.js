import mongoose from 'mongoose';

const AccessoryPriceSchema = new mongoose.Schema({
  model: { type: String, required: true },
  description: { type: String, required: true },
  specification: { type: mongoose.Schema.Types.Mixed },
  price_inr: { type: Number, required: true },
  price_usd: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.AccessoryPrice || mongoose.model('AccessoryPrice', AccessoryPriceSchema);
