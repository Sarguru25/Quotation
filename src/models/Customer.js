import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  zoho_customer_id: { type: String, unique: true, index: true },
  customer_name: { type: String },
  company_name: { type: String },
  email: { type: String },
  phone: { type: String },
  mobile: { type: String },
  gst_no: { type: String },
  billing_address: { type: mongoose.Schema.Types.Mixed },
  shipping_address: { type: mongoose.Schema.Types.Mixed },
  contact_persons: { type: Array },
  currency_code: { type: String },
  payment_terms: { type: Number },
  status: { type: String },
  website: { type: String },
  notes: { type: String },
  tags: { type: Array },
  created_time: { type: Date },
  last_modified_time: { type: Date },
  syncedAt: { type: Date, default: Date.now },
  rawZohoData: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
