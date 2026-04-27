/**
 * Date Utilities for Thai Language
 */

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/**
 * Format date string to Thai long format: 27 เมษายน 2569
 * @param dateStr ISO date string or date-time string
 * @returns Formatted Thai date string
 */
export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '-';
  
  try {
    // Handle format "YYYY-MM-DD HH:mm:ss" or ISO
    const cleanDateStr = dateStr.replace(' ', 'T');
    const date = new Date(cleanDateStr);
    
    if (isNaN(date.getTime())) return dateStr;

    const day = date.getDate();
    const month = THAI_MONTHS[date.getMonth()];
    const year = date.getFullYear() + 543; // Convert to Buddhist Era

    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Format date-time to Thai format with time
 */
export function formatThaiDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  
  try {
    const cleanDateStr = dateStr.replace(' ', 'T');
    const date = new Date(cleanDateStr);
    
    if (isNaN(date.getTime())) return dateStr;

    const datePart = formatThaiDate(dateStr);
    const timePart = date.toTimeString().split(' ')[0].substring(0, 5); // HH:mm

    return `${datePart} ${timePart}`;
  } catch (e) {
    return dateStr;
  }
}
