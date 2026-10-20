import { Order, Transaction } from './types';

function escapeCsvCell(cell: unknown): string {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportTransactionsToCsv(transactions: Transaction[], filename = 'GlowBook_Transactions.csv'): void {
  const headers = ['Date', 'Type', 'Category', 'Amount (INR)', 'Notes', 'Linked Booking ID'];
  const rows = transactions.map(tx => [
    escapeCsvCell(tx.date),
    escapeCsvCell(tx.type.toUpperCase()),
    escapeCsvCell(tx.category),
    escapeCsvCell(tx.amount),
    escapeCsvCell(tx.note || ''),
    escapeCsvCell(tx.order_id || 'Direct'),
  ]);

  const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportOrdersToCsv(orders: Order[], filename = 'GlowBook_Appointments.csv'): void {
  const headers = [
    'Customer Name',
    'Phone Number',
    'Service Type',
    'Appointment Date',
    'Appointment Time',
    'Total Price (INR)',
    'Advance Paid (INR)',
    'Remaining Balance (INR)',
    'Status',
    'Notes',
  ];

  const rows = orders.map(ord => [
    escapeCsvCell(ord.customer_name),
    escapeCsvCell(ord.phone_number || ''),
    escapeCsvCell(ord.service_type),
    escapeCsvCell(ord.appointment_date),
    escapeCsvCell(ord.appointment_time || ''),
    escapeCsvCell(ord.total_price),
    escapeCsvCell(ord.advance_amount),
    escapeCsvCell(ord.remaining_balance),
    escapeCsvCell(ord.status),
    escapeCsvCell(ord.notes || ''),
  ]);

  const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
