import mongoose from 'mongoose';

const VisitSchema = new mongoose.Schema({
  customerId: { type: String, required: true, index: true },
  customerName: { type: String, required: true },
  salesPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  salesPersonName: { type: String },
  visitDate: { type: Date, required: true, index: true },
  visitTime: { type: String },
  visitType: {
    type: String,
    enum: ['Meeting', 'Site Visit', 'Follow-up', 'Support', 'Collection'],
    required: true
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Cancelled'],
    required: true
  },
  reportDetails: { type: String },
  location: {
    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  nextFollowUpDate: { type: Date },
  attachments: { type: Array, default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Visit || mongoose.model('Visit', VisitSchema);
