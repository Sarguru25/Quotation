import mongoose from 'mongoose';

const ActuatorPriceSchema = new mongoose.Schema({
  sr_no: { type: Number, required: true },
  series: { type: String, required: true },
  model: { type: String, required: true },
  torque_nm: { type: mongoose.Schema.Types.Mixed, required: true },
  output_torque_nm: { type: Number },
  price_inr: { type: Number, required: true },
  price_usd: { type: Number, required: true },
  match_status: { type: String },
  drawing_no: { type: String, default: "-" },
  adaptor_price_inr: { type: Number, default: 0 },
  adaptor_price_usd: { type: Number, default: 0 },
  mounting: { type: String, default: "-" },
  drive_type: { type: String, default: "-" },
  air_port_connections: { type: String, default: "-" }
}, { timestamps: true });

export default mongoose.models.ActuatorPrice || mongoose.model('ActuatorPrice', ActuatorPriceSchema);
