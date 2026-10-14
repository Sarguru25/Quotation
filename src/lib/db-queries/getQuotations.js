import dbConnect from '../db';
import Quotation from '../../models/Quotation';

export async function getQuotations(options = {}) {
  await dbConnect();
  
  const {
    page = 1,
    limit = 50,
    search = '',
    status,
    customer_id,
    sortField = 'estimate_number',
    sortOrder = 'desc' // sequential quote numbers descending, matching Zoho Books
  } = options;
  
  const query = {};
  
  if (search) {
    query.$or = [
      { estimate_number: { $regex: search, $options: 'i' } },
      { customer_name: { $regex: search, $options: 'i' } },
      { reference_number: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status && status !== 'all') query.status = status.toLowerCase();
  if (customer_id) query.customer_id = customer_id;
  
  const skip = (page - 1) * limit;
  const direction = sortOrder === 'asc' ? 1 : -1;
  const sort = sortField === 'estimate_number'
    ? { estimate_number: direction }
    : { [sortField]: direction, estimate_number: -1 };
  
  const [data, total] = await Promise.all([
    Quotation.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Quotation.countDocuments(query)
  ]);
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
}

export async function getQuotationById(id) {
  await dbConnect();
  // Assume zoho_estimate_id by default, fallback to objectId
  let quotation = await Quotation.findOne({ zoho_estimate_id: id }).lean();
  if (!quotation && id.match(/^[0-9a-fA-F]{24}$/)) {
    quotation = await Quotation.findById(id).lean();
  }
  return quotation;
}
