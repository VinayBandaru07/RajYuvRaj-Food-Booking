import { utils, writeFile } from 'xlsx';
import { format } from 'date-fns';

export const exportOrders = (orders: any[], date: Date) => {
  // Transform orders data for Excel
  const worksheetData = orders.map(order => ({
    'Order ID': order.id,
    'Customer Name': order.customerName,
    'Phone': order.customerPhone,
    'Seat Number': order.seatNumber,
    'Total Amount': order.total,
    'Status': order.status,
    'Payment ID': order.paymentId,
    'Created At': new Date(order.createdAt).toLocaleString(),
    'Completed At': order.completedAt ? new Date(order.completedAt).toLocaleString() : '',
    'Items': order.items.map((item: any) => 
      `${item.name} (${item.quantity}x ₹${item.price})`
    ).join(', ')
  }));

  // Create worksheet
  const worksheet = utils.json_to_sheet(worksheetData);

  // Create workbook
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Orders');

  // Generate filename with date
  const fileName = `orders_${format(date, 'yyyy-MM-dd')}.xlsx`;

  // Save file
  writeFile(workbook, fileName);
};