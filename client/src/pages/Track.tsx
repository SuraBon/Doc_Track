/**
 * Track Page
 * ติดตามสถานะพัสดุ
 * Design: Minimalist Logistics
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/StatusBadge';
import Timeline from '@/components/Timeline';
import ImagePopup from '@/components/ImagePopup';
import { toast } from 'sonner';
import { Search, Calendar } from 'lucide-react';
import type { Parcel } from '@/types/parcel';
import { getParcel, searchParcels } from '@/lib/parcelService';
import { parseParcelTimeline } from '@/lib/timeline';
import TrackingMap from '@/components/TrackingMap';

export default function Track() {
  const [trackingId, setTrackingId] = useState('');
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [searchResults, setSearchResults] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingId.trim()) {
      toast.error('กรุณากรอก Tracking ID');
      return;
    }

    setIsLoading(true);
    try {
      // Try exact ID match first
      const response = await getParcel(trackingId.trim());
      if (response.success && response.parcel) {
        setParcel(response.parcel);
        setSearchResults([]);
        toast.success('พบข้อมูลพัสดุ');
      } else {
        // Try searching by name/ID
        const results = await searchParcels(trackingId.trim());
        if (results && results.length > 0) {
          if (results.length === 1) {
            setParcel(results[0]);
            setSearchResults([]);
            toast.success(`พบข้อมูลพัสดุของ ${results[0]['ผู้รับ']}`);
          } else {
            setSearchResults(results);
            setParcel(null);
            toast.success(`พบข้อมูลพัสดุ ${results.length} รายการ`);
          }
        } else {
          setParcel(null);
          setSearchResults([]);
          toast.error('ไม่พบข้อมูลพัสดุ');
        }
      }
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setParcel(null);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate real timeline data from the parcel
  const timelineEvents = parcel ? parseParcelTimeline(parcel) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">ติดตามพัสดุ</h1>
        <p className="text-sm text-muted-foreground mt-1">ค้นหา Tracking ID เพื่อดูสถานะการจัดส่ง</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหา Tracking ID</CardTitle>
          <CardDescription>กรอก Tracking ID หรือค้นหาด้วยชื่อผู้ส่ง/ผู้รับ</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="เช่น TRK20260420001"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading} className="gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4" />
              {isLoading ? 'กำลังค้นหา...' : 'ค้นหา'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Results List */}
      {searchResults.length > 0 && !parcel && (
        <Card>
          <CardHeader>
            <CardTitle>ผลการค้นหา ({searchResults.length} รายการ)</CardTitle>
            <CardDescription>คลิกที่รายการเพื่อดูรายละเอียด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.map((p) => (
                <div 
                  key={p.TrackingID} 
                  className="p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in slide-in-from-bottom-2"
                  onClick={() => {
                    setParcel(p);
                    setSearchResults([]);
                  }}
                >
                  <div>
                    <code className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded mb-2 inline-block">
                      {p.TrackingID}
                    </code>
                    <p className="text-sm text-foreground font-medium mt-1">ผู้ส่ง: {p['ผู้ส่ง']} → ผู้รับ: {p['ผู้รับ']}</p>
                    <p className="text-xs text-muted-foreground mt-1">อัปเดตล่าสุด: {p['วันที่สร้าง']}</p>
                  </div>
                  <StatusBadge status={p['สถานะ']} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {parcel && (
        <div className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลพัสดุ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Tracking ID</h3>
                  <code className="text-lg font-mono font-bold text-primary">{parcel.TrackingID}</code>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">สถานะ</h3>
                  <StatusBadge status={parcel['สถานะ']} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">วันที่สร้าง</h3>
                  <p className="text-foreground">{parcel['วันที่สร้าง']}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">ประเภท</h3>
                  <p className="text-foreground">{parcel['ประเภทเอกสาร']}</p>
                </div>
              </div>

              {/* Sender & Receiver */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">ผู้ส่ง</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">ชื่อ</p>
                      <p className="text-foreground font-medium">{parcel['ผู้ส่ง']}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">สาขา</p>
                      <p className="text-foreground">{parcel['สาขาผู้ส่ง']}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">ผู้รับ</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">ชื่อ</p>
                      <p className="text-foreground font-medium">{parcel['ผู้รับ']}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">สาขา</p>
                      <p className="text-foreground">{parcel['สาขาผู้รับ']}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Note */}
              {(parcel['รายละเอียด'] || parcel['หมายเหตุ']) && (
                <div className="pt-4 border-t border-border space-y-4">
                  {parcel['รายละเอียด'] && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">รายละเอียด</p>
                      <p className="text-foreground">{parcel['รายละเอียด']}</p>
                    </div>
                  )}
                  {parcel['หมายเหตุ'] && parcel['หมายเหตุ'].replace(/\[.*?\]/g, '').trim() && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">หมายเหตุ</p>
                      <p className="text-foreground whitespace-pre-wrap">{parcel['หมายเหตุ'].replace(/\[.*?\]/g, '').trim()}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Photo */}
              {parcel['รูปยืนยัน'] && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-3">📷 หลักฐานการส่ง</p>
                  <ImagePopup url={parcel['รูปยืนยัน']} className="w-full sm:w-auto" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Card */}
          {timelineEvents && timelineEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  เส้นเวลาการจัดส่ง
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline events={timelineEvents} />
                <TrackingMap events={timelineEvents} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!parcel && searchResults.length === 0 && trackingId && !isLoading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <p className="text-center text-amber-800">ไม่พบข้อมูล หรือ Tracking ID นี้</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
