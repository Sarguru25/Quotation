import mongoose from 'mongoose';

const SalesOrderLineItemSchema = new mongoose.Schema({
  item_id: { type: String },
  name: { type: String },
  description: { type: String },
  quantity: { type: Number },
  rate: { type: Number },
  discount: { type: Number },
  tax_percentage: { type: Number },
  tax_amount: { type: Number },
  item_total: { type: Number }
});

const SalesOrderSchema = new mongoose.Schema({
  zoho_salesorder_id: { type: String, unique: true, index: true },
  salesorder_number: { type: String },
  customer_id: { type: String, index: true },
  customer_name: { type: String },
  date: { type: Date, index: true },
  shipment_date: { type: Date },
  delivery_method: { type: String },
  status: { type: String, index: true },
  currency_code: { type: String },
  exchange_rate: { type: Number },
  sub_total: { type: Number },
  tax_total: { type: Number },
  discount_total: { type: Number },
  adjustment: { type: Number },
  total: { type: Number },
  salesperson_name: { type: String },
  line_items: [SalesOrderLineItemSchema],
  notes: { type: String },
  terms: { type: String },
  created_time: { type: Date, index: true },
  last_modified_time: { type: Date, index: true },
  syncedAt: { type: Date, default: Date.now },
  rawZohoData: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

SalesOrderSchema.index({ salesorder_number: 1 });
SalesOrderSchema.index({ customer_name: 1 });

export default mongoose.models.SalesOrder || mongoose.model('SalesOrder', SalesOrderSchema);
