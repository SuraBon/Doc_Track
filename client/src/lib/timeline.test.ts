import { describe, expect, it } from 'vitest';
import { parseParcelTimeline } from './timeline';
import type { Parcel } from '@/types/parcel';

function createParcel(overrides: Partial<Parcel> = {}): Parcel {
  return {
    TrackingID: 'TRK1',
    'วันที่สร้าง': '1 มกราคม 2569',
    'ผู้ส่ง': 'A',
    'สาขาผู้ส่ง': 'ศูนย์ใหญ่บางนา',
    'ผู้รับ': 'B',
    'สาขาผู้รับ': 'มีนบุรี',
    'ประเภทเอกสาร': 'เอกสาร',
    'สถานะ': 'กำลังจัดส่ง',
    ...overrides,
  };
}

describe('parseParcelTimeline', () => {
  it('adds forwarding and current transit step', () => {
    const parcel = createParcel({
      'หมายเหตุ': '[ส่งต่อโดย: พนักงาน1 จากสาขา: ศูนย์ใหญ่บางนา ไปสาขา: มหาชัย เมื่อ: 1 มกราคม 2569]',
    });
    const events = parseParcelTimeline(parcel);
    expect(events.map((e) => e.title)).toEqual(['รับพัสดุเข้าระบบ', 'ส่งต่อพัสดุ', 'กำลังจัดส่ง']);
  });

  it('parses delivered proxy event', () => {
    const parcel = createParcel({
      'สถานะ': 'ส่งถึงแล้ว',
      'หมายเหตุ': '[รับแทนโดย: สมชาย เมื่อ: 1 มกราคม 2569 รูปภาพ: https://example.com/p.jpg]',
    });
    const events = parseParcelTimeline(parcel);
    expect(events[events.length - 1].description).toContain('สมชาย');
    expect(events[events.length - 1].imageUrl).toContain('https://example.com/p.jpg');
  });
});
