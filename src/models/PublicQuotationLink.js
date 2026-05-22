import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  message: { type: String, required: true },
  customerName: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const PublicQuotationLinkSchema = new mongoose.Schema({
  quotationId: {
    type: String,
    required: true,
    index: true
  },
  publicToken: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  },
  viewedAt: {
    type: Date
  },
  viewCount: {
    type: Number,
    default: 0
  },
  acceptedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  feedback: [FeedbackSchema],
  status: {
    type: String,
    enum: ['Generated', 'Viewed', 'Revision Requested', 'Accepted', 'Rejected', 'Expired'],
    default: 'Generated'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, { timestamps: true });

export default mongoose.models.PublicQuotationLink || mongoose.model('PublicQuotationLink', PublicQuotationLinkSchema);
