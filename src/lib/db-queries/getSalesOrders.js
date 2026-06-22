import dbConnect from '../db';
import SalesOrder from '../../models/SalesOrder';

export async function getSalesOrders(options = {}) {
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
      { salesorder_number: searchRegex },
      { customer_name: searchRegex }
    ];
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    SalesOrder.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    SalesOrder.countDocuments(query)
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
