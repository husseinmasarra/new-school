/**
 * School Portal - Export Utilities for Excel (CSV UTF-8) and PDF Printing
 */

/**
 * Export data array to UTF-8 CSV (Excel Ready with Arabic support)
 * @param {string} filename - e.g. "students-list.csv"
 * @param {Array<string>} headers - Array of header titles
 * @param {Array<Array<any>>} dataRows - Array of row value arrays
 */
export function exportToExcelCSV(filename, headers, dataRows) {
  // UTF-8 BOM prefix for Excel Arabic character support
  const BOM = "\uFEFF";
  
  const headerRow = headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(",");
  const bodyRows = dataRows.map(row => 
    row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const csvContent = BOM + headerRow + "\n" + bodyRows;
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format phone number for WhatsApp Web link
 */
export function formatWhatsAppPhone(phone) {
  if (!phone) return '';
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  // If starts with 0 (Lebanon local 03/70/71/76/81), prepend 961 country code
  if (digits.startsWith('0')) {
    digits = '961' + digits.substring(1);
  }
  return digits;
}

/**
 * Open direct WhatsApp chat with pre-filled message
 */
export function openWhatsAppMessage(phone, messageText) {
  const cleanPhone = formatWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(messageText);
  const waUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
  window.open(waUrl, '_blank');
}
