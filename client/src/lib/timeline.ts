import type { Parcel } from '@/types/parcel';
import type { TimelineEvent } from '@/types/timeline';

export function parseParcelTimeline(parcel: Parcel): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  let currentId = 1;

  events.push({
    id: String(currentId++),
    status: parcel['สถานะ'] === 'รอจัดส่ง' ? 'current' : 'completed',
    title: 'รับพัสดุเข้าระบบ',
    description: `ผู้ส่ง: ${parcel['ผู้ส่ง']} -> ผู้รับ: ${parcel['ผู้รับ']}`,
    timestamp: parcel['วันที่สร้าง'],
    location: parcel['สาขาผู้ส่ง'],
  });

  const note = parcel['หมายเหตุ'] || '';
  const forwardRegex = /\[ส่งต่อโดย:\s*(.*?)\s*จากสาขา:\s*(.*?)\s*ไปสาขา:\s*(.*?)\s*เมื่อ:\s*(.*?)(?:\s*รูปภาพ:\s*(.*?))?\]/g;
  let match;
  const forwardEvents: TimelineEvent[] = [];
  while ((match = forwardRegex.exec(note)) !== null) {
    forwardEvents.push({
      id: String(currentId++),
      status: 'completed',
      title: 'ส่งต่อพัสดุ',
      description: `ส่งต่อโดย: ${match[1]} ไปยังสาขา: ${match[3]}`,
      timestamp: match[4],
      location: match[2],
      imageUrl: match[5] || undefined,
    });
  }

  if (parcel['สถานะ'] !== 'ส่งถึงแล้ว' && parcel['รูปยืนยัน'] && forwardEvents.length > 0) {
    forwardEvents[forwardEvents.length - 1].imageUrl = parcel['รูปยืนยัน'];
  }
  events.push(...forwardEvents);

  if (parcel['สถานะ'] === 'ส่งถึงแล้ว') {
    const proxyRegex = /\[รับแทนโดย:\s*(.*?)\s*เมื่อ:\s*(.*?)(?:\s*รูปภาพ:\s*(.*?))?\]/;
    const proxyMatch = proxyRegex.exec(note);

    let desc = 'ส่งถึงผู้รับเรียบร้อย';
    let time = parcel['วันที่รับ'] || '';
    if (proxyMatch) {
      desc = `รับแทนโดย: ${proxyMatch[1]}`;
      time = proxyMatch[2];
    }

    const normalRegex = /\[รับพัสดุเรียบร้อย เมื่อ:\s*(.*?)(?:\s*รูปภาพ:\s*(.*?))?\]/;
    const normalMatch = normalRegex.exec(note);
    if (!proxyMatch && normalMatch) {
      time = normalMatch[1];
    }

    let deliveryImageUrl = parcel['รูปยืนยัน'] || undefined;
    if (proxyMatch && proxyMatch[3]) deliveryImageUrl = proxyMatch[3];
    if (normalMatch && normalMatch[2]) deliveryImageUrl = normalMatch[2];

    events.push({
      id: String(currentId++),
      status: 'completed',
      title: 'พัสดุส่งถึงแล้ว',
      description: desc,
      timestamp: time,
      location: parcel['สาขาผู้รับ'],
      imageUrl: deliveryImageUrl,
    });
  } else if (parcel['สถานะ'] === 'กำลังจัดส่ง') {
    events.push({
      id: String(currentId++),
      status: 'current',
      title: 'กำลังจัดส่ง',
      description: 'พัสดุอยู่ระหว่างการเดินทาง',
      timestamp: '',
      location: '',
    });
  }

  return events;
}
