/**
 * Timeline Component
 * แสดงเส้นเวลาการจัดส่งพัสดุแบบทีละขั้นตอน
 * Design: Premium Minimalist Logistics
 */

import type { TimelineEvent } from '@/types/timeline';
import { CheckCircle2, Circle, Clock, MapPin, Sparkles, Package, Truck, Home } from 'lucide-react';
import ImagePopup from '@/components/ImagePopup';

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export default function Timeline({ events, className = '' }: TimelineProps) {
  const isDelivered = events.some((event) => event.title.includes('ส่งถึงแล้ว'));

  const getStatusIcon = (status: TimelineEvent['status'], title: string) => {
    const isMainStep = title.includes('สร้างรายการ') || title.includes('ส่งถึงแล้ว') || title.includes('รับพัสดุเรียบร้อย');

    switch (status) {
      case 'completed':
        return (
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        );
      case 'current':
        return (
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 shadow-lg shadow-sky-200 animate-pulse">
            <div className="absolute inset-0 rounded-full bg-sky-400 animate-ping opacity-25"></div>
            {title.includes('ส่งต่อ') ? (
              <Truck className="w-3.5 h-3.5 text-white" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-white fill-current" />
            )}
          </div>
        );
      case 'pending':
        return (
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 border-slate-200">
            <Circle className="w-3 h-3 text-slate-300" />
          </div>
        );
      default:
        return <Circle className="w-6 h-6 text-gray-300" />;
    }
  };

  const getCardStyle = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-white border-slate-100 hover:border-emerald-200 transition-all duration-300';
      case 'current':
        return 'bg-white border-sky-200 shadow-md shadow-sky-50 ring-1 ring-sky-50';
      case 'pending':
        return 'bg-slate-50/50 border-slate-100 opacity-75';
      default:
        return 'bg-white border-slate-100';
    }
  };

  const getLineStyle = (status: TimelineEvent['status'], nextStatus?: TimelineEvent['status']) => {
    if (status === 'completed' && nextStatus === 'completed') return 'bg-emerald-400';
    if (status === 'completed' && nextStatus === 'current') return 'bg-gradient-to-b from-emerald-400 to-sky-400';
    if (status === 'current') return 'bg-gradient-to-b from-sky-400 to-slate-200';
    return 'bg-slate-200';
  };

  return (
    <div className={`relative px-1 ${className}`}>
      {/* Header Summary */}
      <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${isDelivered ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'}`}>
          {isDelivered ? <Home className="w-6 h-6" /> : <Truck className="w-6 h-6 animate-bounce" />}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 text-base leading-tight">
            {isDelivered ? 'พัสดุจัดส่งถึงที่หมายแล้ว' : 'พัสดุกำลังเดินทางไปยังปลายทาง'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDelivered ? 'การเดินทางสิ้นสุดลง ขอบคุณที่ใช้บริการ' : 'พัสดุของคุณกำลังได้รับการดูแลอย่างดี'}
          </p>
        </div>
        <div className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold ${isDelivered ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
          }`}>
          {isDelivered ? 'Delivered' : 'On The Way'}
        </div>
      </div>

      <div className="relative space-y-0">
        {/* Main Continuous Vertical Line */}
        <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-slate-100 rounded-full" />

        {events.map((event, index) => {
          const nextEvent = events[index + 1];
          return (
            <div
              key={event.id}
              className="flex gap-6 pb-8 relative group"
            >
              {/* Dynamic Line Connector */}
              {index < events.length - 1 && (
                <div className={`absolute left-[11px] top-6 w-[2px] bottom-0 z-0 transition-colors duration-500 ${getLineStyle(event.status, nextEvent?.status)}`} />
              )}

              {/* Status Icon Container */}
              <div className="relative z-10 flex-shrink-0 pt-0.5">
                {getStatusIcon(event.status, event.title)}
              </div>

              {/* Event Card */}
              <div className={`flex-1 p-5 rounded-2xl border transition-all duration-300 ${getCardStyle(event.status)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-bold text-base leading-tight ${event.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>
                        {event.title}
                      </h4>
                      {event.status === 'current' && (
                        <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-ping" />
                      )}
                    </div>
                    {event.description && (
                      <p className={`text-sm mt-1.5 leading-relaxed ${event.status === 'pending' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {event.description}
                      </p>
                    )}
                  </div>
                  {event.status === 'current' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-100 uppercase tracking-tight">
                      <Sparkles className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>

                {/* Metadata Row */}
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <time className="font-medium tracking-tight">{event.timestamp || '-'}</time>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span className="font-medium tracking-tight text-slate-500">{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Proof Image */}
                {event.imageUrl && (
                  <div className="mt-5 p-1 bg-slate-50 rounded-xl inline-block border border-slate-100 overflow-hidden group/img">
                    <div className="relative">
                      <ImagePopup url={event.imageUrl} />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
