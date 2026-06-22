import dbConnect from '../db';
import Invoice from '../../models/Invoice';

export async function getInvoices(options = {}) {
  await dbConnect();

  const { 
    page = 1, 
    limit = 20, 
    search = '', 
    status = '',
    sortBy = 'created_time',
    sortOrder = 'desc'
  } = options;

  const query = {};

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { invoice_number: searchRegex },
      { customer_name: searchRegex }
    ];
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Invoice.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    Invoice.countDocuments(query)
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
