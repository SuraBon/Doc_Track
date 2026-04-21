/**
 * Timeline Component
 * แสดงเส้นเวลาการจัดส่งพัสดุแบบทีละขั้นตอน
 * Design: Minimalist Logistics
 */

import type { TimelineEvent } from '@/types/timeline';
import { CheckCircle2, Circle, Clock, MapPin, Sparkles } from 'lucide-react';
import ImagePopup from '@/components/ImagePopup';

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export default function Timeline({ events, className = '' }: TimelineProps) {
  const isDelivered = events.some((event) => event.title.includes('ส่งถึงแล้ว'));

  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />;
      case 'current':
        return <Circle className="w-6 h-6 text-blue-600 flex-shrink-0 animate-pulse" />;
      case 'pending':
        return <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />;
      default:
        return <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />;
    }
  };

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50/90 border-emerald-200';
      case 'current':
        return 'bg-sky-50/90 border-sky-200';
      case 'pending':
        return 'bg-slate-50 border-slate-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getLineColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-300';
      case 'current':
        return 'bg-sky-300';
      case 'pending':
        return 'bg-slate-200';
      default:
        return 'bg-slate-200';
    }
  };

  return (
    <div className={`space-y-0 ${className}`}>
      <div className="mb-5 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-foreground">
            {isDelivered ? 'จัดส่งสำเร็จ' : 'อยู่ระหว่างดำเนินการจัดส่ง'}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              isDelivered ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
            }`}
          >
            {isDelivered ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </div>

      {events.map((event, index) => (
        <div
          key={event.id}
          className="flex gap-4 pb-6 relative animate-in fade-in slide-in-from-bottom-1 duration-500"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          {/* Vertical Line */}
          {index < events.length - 1 && (
            <div className={`absolute left-3 top-10 w-0.5 h-12 ${getLineColor(event.status)}`} />
          )}

          {/* Icon */}
          <div className="relative z-10 pt-0.5">
            {getStatusIcon(event.status)}
          </div>

          {/* Content */}
          <div className={`flex-1 p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow ${getStatusColor(event.status)}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground text-base leading-tight">{event.title}</h4>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{event.description}</p>
                )}
              </div>
              {event.status === 'current' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-sky-200 text-sky-900 text-xs font-semibold whitespace-nowrap">
                  <Sparkles className="w-3 h-3" />
                  ปัจจุบัน
                </span>
              )}
            </div>

            {/* Metadata */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2.5 py-1 border border-border">
                <Clock className="w-3 h-3" />
                <time className="font-mono">{event.timestamp || '-'}</time>
              </span>
              {event.location && (
                <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2.5 py-1 border border-border">
                  <MapPin className="w-3 h-3 text-pink-500" />
                  {event.location}
                </span>
              )}
            </div>

            {/* Image */}
            {event.imageUrl && (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">รูปภาพหลักฐาน:</p>
                <ImagePopup url={event.imageUrl} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
