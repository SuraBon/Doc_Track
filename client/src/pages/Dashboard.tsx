/**
 * Dashboard Page
 * ภาพรวมการจัดส่ง
 * Design: Minimalist Logistics
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useParcelStore } from '@/hooks/useParcelStore';
import StatusBadge from '@/components/StatusBadge';
import { RefreshCw } from 'lucide-react';
import type { Parcel } from '@/types/parcel';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Timeline from '@/components/Timeline';
import TrackingMap from '@/components/TrackingMap';
import { parseParcelTimeline } from '@/lib/timeline';

interface DashboardProps {
  isConfigured: boolean;
}

function parseCreatedAt(value: string | undefined): Date | null {
  if (!value) return null;
  // Expected from GAS: "yyyy-MM-dd HH:mm:ss"
  const normalized = value.replace(' ', 'T');
  const dt = new Date(normalized);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toCsvValue(value: unknown) {
  const s = value == null ? '' : String(value);
  const escaped = s.replaceAll('"', '""');
  return `"${escaped}"`;
}

export default function Dashboard({ isConfigured }: DashboardProps) {
  const { parcels, summary, loading, loadParcels, loadSummary } = useParcelStore();
  const [filteredParcels, setFilteredParcels] = useState<Parcel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const handleRowClick = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setIsTimelineOpen(true);
  };

  useEffect(() => {
    if (isConfigured) {
      loadParcels();

      const interval = setInterval(() => {
        loadParcels();
      }, 180000); // 3 minutes

      return () => clearInterval(interval);
    }
  }, [isConfigured, loadParcels]);

  useEffect(() => {
    let filtered = parcels;

    if (statusFilter !== 'ทั้งหมด') {
      filtered = filtered.filter((p) => p['สถานะ'] === statusFilter);
    }

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p['TrackingID'].toLowerCase().includes(query) ||
          p['ผู้ส่ง'].toLowerCase().includes(query) ||
          p['ผู้รับ'].toLowerCase().includes(query)
      );
    }

    const start = exportStartDate ? new Date(`${exportStartDate}T00:00:00`) : null;
    const end = exportEndDate ? new Date(`${exportEndDate}T23:59:59.999`) : null;
    
    if (start || end) {
      filtered = filtered.filter((p) => {
        const createdAt = parseCreatedAt(p['วันที่สร้าง']);
        if (!createdAt) return false;
        if (start && createdAt < start) return false;
        if (end && createdAt > end) return false;
        return true;
      });
    }

    setFilteredParcels(filtered);
  }, [parcels, statusFilter, searchTerm, exportStartDate, exportEndDate]);

  const handleRefresh = async () => {
    await loadParcels();
    await loadSummary();
  };

  const handleExport = () => {
    const start = exportStartDate ? new Date(`${exportStartDate}T00:00:00`) : null;
    const end = exportEndDate ? new Date(`${exportEndDate}T23:59:59.999`) : null;

    if (start && Number.isNaN(start.getTime())) {
      toast.error('วันที่เริ่มต้นไม่ถูกต้อง');
      return;
    }
    if (end && Number.isNaN(end.getTime())) {
      toast.error('วันที่สิ้นสุดไม่ถูกต้อง');
      return;
    }
    if (start && end && start > end) {
      toast.error('ช่วงวันที่ไม่ถูกต้อง (เริ่มต้นต้องไม่มากกว่าสิ้นสุด)');
      return;
    }

    const rows = filteredParcels;
    if (rows.length === 0) {
      toast.error('ไม่มีข้อมูลให้ Export');
      return;
    }

    const headers: Array<keyof Parcel> = [
      'TrackingID',
      'วันที่สร้าง',
      'ผู้ส่ง',
      'สาขาผู้ส่ง',
      'ผู้รับ',
      'สาขาผู้รับ',
      'ประเภทเอกสาร',
      'รายละเอียด',
      'หมายเหตุ',
      'สถานะ',
      'วันที่รับ',
      'รูปยืนยัน',
    ];

    const csvLines: string[] = [];
    csvLines.push(headers.map((h) => toCsvValue(h)).join(','));
    for (const p of rows) {
      csvLines.push(headers.map((h) => toCsvValue(p[h])).join(','));
    }

    // UTF-8 BOM for Excel/Thai
    const csv = `\uFEFF${csvLines.join('\n')}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const safeStart = exportStartDate || 'all';
    const safeEnd = exportEndDate || 'all';
    const filename = `messenger-tracker_export_${safeStart}_to_${safeEnd}.csv`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Export แล้ว ${rows.length} รายการ`);
  };
  const selectedTimelineEvents = selectedParcel ? parseParcelTimeline(selectedParcel) : [];

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>ยังไม่ได้ตั้งค่า</CardTitle>
            <CardDescription>กรุณาตั้งค่า Environment Variables ก่อนใช้งาน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>ต้องมีค่า:</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <code className="text-xs">VITE_GAS_URL</code>
                </li>
                <li>
                  <code className="text-xs">VITE_GAS_API_KEY</code>
                </li>
              </ul>
              <div className="pt-2">
                ตั้งในไฟล์ <code className="text-xs">.env</code> (ตอน dev) หรือใน Vercel (ตอน deploy)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">ภาพรวมการจัดส่ง</h1>
          <p className="text-sm text-muted-foreground mt-1">ติดตามสถานะเอกสาร/พัสดุแบบ real-time</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
              aria-label="export-start-date"
            />
            <Input
              type="date"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
              aria-label="export-end-date"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="default" size="sm" className="gap-2 flex-1 md:flex-none">
              Export
            </Button>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2 flex-1 md:flex-none">
              <RefreshCw className="w-4 h-4" />
              รีเฟรช
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{summary.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">รอจัดส่ง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{summary.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">กำลังจัดส่ง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{summary.transit}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ส่งถึงแล้ว</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{summary.delivered}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <Input
          placeholder="ค้นหา Tracking ID, ผู้ส่ง, ผู้รับ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
            <SelectItem value="รอจัดส่ง">รอจัดส่ง</SelectItem>
            <SelectItem value="กำลังจัดส่ง">กำลังจัดส่ง</SelectItem>
            <SelectItem value="ส่งถึงแล้ว">ส่งถึงแล้ว</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการพัสดุ</CardTitle>
          <CardDescription>{filteredParcels.length} รายการ</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">⏳ กำลังโหลด...</div>
          ) : filteredParcels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">ไม่มีข้อมูล</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Tracking ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">วันที่สร้าง</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">ผู้ส่ง</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">ผู้รับ</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">ประเภท</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParcels.map((parcel) => (
                    <tr
                      key={parcel.TrackingID}
                      className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(parcel)}
                    >
                      <td className="py-3 px-4">
                        <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                          {parcel.TrackingID}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{parcel['วันที่สร้าง']}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{parcel['ผู้ส่ง']}</div>
                        <div className="text-xs text-muted-foreground">{parcel['สาขาผู้ส่ง']}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{parcel['ผู้รับ']}</div>
                        <div className="text-xs text-muted-foreground">{parcel['สาขาผู้รับ']}</div>
                      </td>
                      <td className="py-3 px-4 text-sm">{parcel['ประเภทเอกสาร']}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={parcel['สถานะ']} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Dialog */}
      <Dialog open={isTimelineOpen} onOpenChange={setIsTimelineOpen}>
        <DialogContent className="w-[95vw] max-w-xl max-h-[85vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle>ประวัติการเดินทางของพัสดุ</DialogTitle>
            <DialogDescription>
              Tracking ID: {selectedParcel?.TrackingID}
            </DialogDescription>
          </DialogHeader>
          {selectedParcel && (
            <div className="mt-4">
              <Timeline events={selectedTimelineEvents} />
              <TrackingMap events={selectedTimelineEvents} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
