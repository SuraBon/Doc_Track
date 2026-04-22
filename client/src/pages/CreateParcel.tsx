/**
 * Create Parcel Page
 * สร้างรายการพัสดุใหม่
 * Design: Minimalist Logistics
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useParcelStore } from '@/hooks/useParcelStore';
import { getBranches } from '@/lib/parcelService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Plus, CheckCircle2 } from 'lucide-react';

const DOC_TYPES = ['เอกสาร', 'พัสดุ'];
const OTHER_BRANCH_VALUE = '__OTHER_BRANCH__';

export default function CreateParcel() {
  const { createParcel, error } = useParcelStore();
  const branches = getBranches();

  const [formData, setFormData] = useState({
    senderName: '',
    senderBranch: '',
    receiverName: '',
    receiverBranch: '',
    docType: '',
    description: '',
    note: '',
  });

  const [customSenderBranch, setCustomSenderBranch] = useState('');
  const [customReceiverBranch, setCustomReceiverBranch] = useState('');

  const [createdTrackingId, setCreatedTrackingId] = useState<string | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalSenderBranch = formData.senderBranch === OTHER_BRANCH_VALUE ? customSenderBranch.trim() : formData.senderBranch.trim();
    const finalReceiverBranch = formData.receiverBranch === OTHER_BRANCH_VALUE ? customReceiverBranch.trim() : formData.receiverBranch.trim();

    if (!formData.senderName || !finalSenderBranch || !formData.receiverName || !finalReceiverBranch || !formData.docType) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบ');
      return;
    }

    setIsLoading(true);
    try {
      const trackingId = await createParcel(
        formData.senderName,
        finalSenderBranch,
        formData.receiverName,
        finalReceiverBranch,
        formData.docType,
        formData.description,
        formData.note
      );

      if (trackingId) {
        setCreatedTrackingId(trackingId);
        setIsResultOpen(true);
        toast.success(`สร้างรายการสำเร็จ! ID: ${trackingId}`);
        setFormData({
          senderName: '',
          senderBranch: '',
          receiverName: '',
          receiverBranch: '',
          docType: '',
          description: '',
          note: '',
        });
        setCustomSenderBranch('');
        setCustomReceiverBranch('');
      } else {
        toast.error(error || 'ไม่สามารถสร้างรายการได้');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTrackingId = () => {
    if (createdTrackingId) {
      navigator.clipboard.writeText(createdTrackingId);
      toast.success(`คัดลอกแล้ว: ${createdTrackingId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">สร้างรายการพัสดุใหม่</h1>
        <p className="text-sm text-muted-foreground mt-1">กรอกข้อมูลรายละเอียดของพัสดุที่ต้องการจัดส่ง</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลพัสดุ</CardTitle>
              <CardDescription>กรอกข้อมูลผู้ส่ง ผู้รับ และรายละเอียดพัสดุ</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sender Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">ข้อมูลผู้ส่ง</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        ชื่อผู้ส่ง <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="senderName"
                        value={formData.senderName}
                        onChange={handleInputChange}
                        placeholder="เช่น บริษัท ABC"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        สาขาผู้ส่ง <span className="text-red-500">*</span>
                      </label>
                      <Select 
                        value={formData.senderBranch} 
                        onValueChange={(value) => {
                          handleSelectChange('senderBranch', value);
                          if (value !== OTHER_BRANCH_VALUE) setCustomSenderBranch('');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสาขา" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                          <SelectItem value={OTHER_BRANCH_VALUE}>อื่นๆ (ระบุเอง)</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.senderBranch === OTHER_BRANCH_VALUE && (
                        <div className="mt-2">
                          <Input
                            value={customSenderBranch}
                            onChange={(e) => setCustomSenderBranch(e.target.value)}
                            placeholder="ระบุสาขาผู้ส่ง"
                            required
                          />
                          <p className="text-[11px] text-amber-600 mt-1">* สาขาที่ระบุเองนี้จะไม่แสดงพิกัดบนแผนที่ติดตามพัสดุ</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Receiver Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">ข้อมูลผู้รับ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        ชื่อผู้รับ <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="receiverName"
                        value={formData.receiverName}
                        onChange={handleInputChange}
                        placeholder="เช่น บริษัท XYZ"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        สาขาผู้รับ <span className="text-red-500">*</span>
                      </label>
                      <Select 
                        value={formData.receiverBranch} 
                        onValueChange={(value) => {
                          handleSelectChange('receiverBranch', value);
                          if (value !== OTHER_BRANCH_VALUE) setCustomReceiverBranch('');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสาขา" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                          <SelectItem value={OTHER_BRANCH_VALUE}>อื่นๆ (ระบุเอง)</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.receiverBranch === OTHER_BRANCH_VALUE && (
                        <div className="mt-2">
                          <Input
                            value={customReceiverBranch}
                            onChange={(e) => setCustomReceiverBranch(e.target.value)}
                            placeholder="ระบุสาขาผู้รับ"
                            required
                          />
                          <p className="text-[11px] text-amber-600 mt-1">* สาขาที่ระบุเองนี้จะไม่แสดงพิกัดบนแผนที่ติดตามพัสดุ</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    ประเภทเอกสาร/พัสดุ <span className="text-red-500">*</span>
                  </label>
                  <Select value={formData.docType} onValueChange={(value) => handleSelectChange('docType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOC_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">รายละเอียด</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="เช่น 1 ชิ้น, 1 กล่อง, 1 ซอง"
                    rows={3}
                  />
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">หมายเหตุ</label>
                  <Textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="เช่น ห้ามเปิด, เอกสารสำคัญ , ห้ามโยน"
                    rows={2}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isLoading} className="gap-2 flex-1">
                    <Plus className="w-4 h-4" />
                    {isLoading ? 'กำลังสร้าง...' : 'สร้างรายการ'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

      {/* Result Dialog */}
      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              สร้างรายการสำเร็จ!
            </DialogTitle>
            <DialogDescription>
              บันทึกหรือแชร์ Tracking ID นี้เพื่อติดตามสถานะการจัดส่ง
            </DialogDescription>
          </DialogHeader>
          {createdTrackingId && (
            <>
              <div className="flex flex-col items-center justify-center space-y-4 py-4">
                <div className="bg-muted p-4 rounded-lg border border-border w-full text-center">
                  <code className="text-2xl font-mono font-bold text-primary">{createdTrackingId}</code>
                </div>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${createdTrackingId}`} 
                  alt="QR Code" 
                  className="w-[150px] h-[150px] border border-border p-2 rounded-lg bg-white"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button onClick={handleCopyTrackingId} variant="outline" className="flex-1 gap-2">
                  <Copy className="w-4 h-4" />
                  คัดลอก ID
                </Button>
                <Button onClick={() => {
                  const printWindow = window.open('', '', 'width=400,height=500');
                  if (printWindow) {
                    printWindow.document.write(`
                      <div style="text-align:center;font-family:sans-serif;padding:20px;">
                        <h2>DocTrack Parcel</h2>
                        <h1 style="font-size: 24px; margin-bottom: 10px;">${createdTrackingId}</h1>
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${createdTrackingId}" alt="QR Code" style="margin: 20px 0; width: 150px; height: 150px;" />
                        <p style="color: #666;">Date: ${new Date().toLocaleDateString()}</p>
                        <button onclick="window.print()" style="padding:10px 20px;margin-top:20px; cursor: pointer; background: #000; color: #fff; border: none; border-radius: 4px;">Print</button>
                      </div>
                    `);
                    printWindow.document.close();
                  }
                }} variant="default" className="flex-1 gap-2">
                  🖨️ พิมพ์ใบปะหน้า
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
