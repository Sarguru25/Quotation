import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  total: { type: Number, required: true }
});

const QuotationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  items: [ItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  notes: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Approved'],
    default: 'Draft'
  },
  zohoQuoteId: {
    type: String,
    default: null
  }
}, { timestamps: true });

export default mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema);
