import mongoose from 'mongoose';

const ActuatorPriceSASchema = new mongoose.Schema({
  series: { type: String, required: true },
  model: { type: String, required: true },
  spring_qty: { type: Number, required: true },
  air_pressure_bar: { type: mongoose.Schema.Types.Mixed, required: true },
  spring_output: { type: mongoose.Schema.Types.Mixed, required: true },
  price_inr: { type: Number, required: true },
  price_usd: { type: Number, required: true },
  drawing_no: { type: String, default: "-" },
  adaptor_price_inr: { type: Number, default: 0 },
  adaptor_price_usd: { type: Number, default: 0 },
  mounting: { type: String, default: "-" },
  drive_type: { type: String, default: "-" },
  air_port_connections: { type: String, default: "-" }
}, { timestamps: true });

export default mongoose.models.ActuatorPriceSA || mongoose.model('ActuatorPriceSA', ActuatorPriceSASchema);
