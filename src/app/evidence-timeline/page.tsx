'use client';

import { useState, useCallback } from 'react';
import { Plus, Star, ChevronDown, ChevronUp, GripVertical, Calendar, Trash2 } from 'lucide-react';
import { MOCK_TIMELINE, EVENT_CATEGORIES, type MockTimelineEvent } from '@/lib/widget-mock-data';
import { getLawNumbers } from '@/lib/legal-numbers';
import {
  AppShell, SectionCard, StatusPill, EmptyState,
  FormField, GlassInput, GlassSelect, GlassTextarea, GlassButton,
  UploadDropzone, EscalateToAiLine, ToastProvider, toast,
} from '@/components/widgets';
import { Modal } from '@/components/widgets/ConfirmDialog';

const ESCALATION = getLawNumbers(['law-888', 'law-888-649']);

export default function EvidenceTimelinePage() {
  const [events, setEvents] = useState<MockTimelineEvent[]>(MOCK_TIMELINE);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: '', time: '', title: '', notes: '', category: 'document' as MockTimelineEvent['category'], fileName: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  const sorted = [...events].sort((a, b) => {
    const da = new Date(`${a.date}T${a.time}`);
    const db = new Date(`${b.date}T${b.time}`);
    return da.getTime() - db.getTime();
  });

  const handleAdd = () => {
    if (!form.date || !form.title) {
      toast('Date and title are required', 'error');
      return;
    }
    const evt: MockTimelineEvent = {
      id: `evt-${Date.now()}`,
      date: form.date,
      time: form.time || '00:00',
      title: form.title,
      notes: form.notes,
      category: form.category,
      isKeyEvidence: false,
      fileName: files[0]?.name || form.fileName || undefined,
    };
    setEvents(prev => [...prev, evt]);
    setForm({ date: '', time: '', title: '', notes: '', category: 'document', fileName: '' });
    setFiles([]);
    setShowForm(false);
    toast('Event added');
  };

  const toggleKey = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, isKeyEvidence: !e.isKeyEvidence } : e));
  };

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    toast('Event removed');
  };

  const categoryColor = (cat: string) =>
    EVENT_CATEGORIES.find(c => c.value === cat)?.color || 'var(--text-muted)';

  const moveEvent = useCallback((id: string, direction: 'up' | 'down') => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === id);
      if (idx < 0) return prev;
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  return (
    <ToastProvider>
      <AppShell title="Evidence Drop" subtitle="Save the proof before it disappears." escalationNumbers={ESCALATION}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusPill status={`${events.length} Events`} variant="blue" />
              <StatusPill status={`${events.filter(e => e.isKeyEvidence).length} Key`} variant="gold" />
            </div>
            <GlassButton onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus size={14} /> Add Event
            </GlassButton>
          </div>

          {sorted.length === 0 ? (
            <EmptyState
              icon={<Calendar size={40} />}
              title="No Events Yet"
              description="Add your first timeline event to get started"
              action={
                <GlassButton onClick={() => setShowForm(true)}>
                  <span className="flex items-center gap-2"><Plus size={14} /> Add Event</span>
                </GlassButton>
              }
            />
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: 'rgba(201,168,76,0.15)' }} />
              <div className="space-y-3">
                {sorted.map((evt) => (
                  <div key={evt.id} className="relative pl-14 widget-enter">
                    <div className="absolute left-4 top-5 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: categoryColor(evt.category),
                        background: evt.isKeyEvidence ? categoryColor(evt.category) : 'var(--midnight)',
                      }}>
                      {evt.isKeyEvidence && <Star size={8} fill="var(--midnight)" color="var(--midnight)" />}
                    </div>
                    <SectionCard className="glass-panel-hover cursor-pointer">
                      <div onClick={() => setExpandedId(expandedId === evt.id ? null : evt.id)}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                                {evt.date} · {evt.time}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{ background: `${categoryColor(evt.category)}22`, color: categoryColor(evt.category) }}>
                                {EVENT_CATEGORIES.find(c => c.value === evt.category)?.label}
                              </span>
                              {evt.isKeyEvidence && <StatusPill status="KEY" variant="gold" />}
                            </div>
                            <h4 className="font-serif text-base" style={{ color: 'var(--text-primary)' }}>{evt.title}</h4>
                          </div>
                          {expandedId === evt.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                      {expandedId === evt.id && (
                        <div className="mt-4 pt-4 border-t space-y-3 widget-enter" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{evt.notes}</p>
                          {evt.fileName && (
                            <div className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                              📎 {evt.fileName}
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            <button onClick={(e) => { e.stopPropagation(); toggleKey(evt.id); }}
                              className="glass-button-outline px-3 py-1 text-xs flex items-center gap-1">
                              <Star size={10} /> {evt.isKeyEvidence ? 'Unmark Key' : 'Mark as Key'}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); moveEvent(evt.id, 'up'); }}
                              className="glass-button-outline px-2 py-1 text-xs" title="Move up">
                              <GripVertical size={10} /> ↑
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); moveEvent(evt.id, 'down'); }}
                              className="glass-button-outline px-2 py-1 text-xs" title="Move down">
                              <GripVertical size={10} /> ↓
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); removeEvent(evt.id); }}
                              className="glass-button-outline px-2 py-1 text-xs" title="Remove"
                              style={{ borderColor: 'rgba(248,113,113,0.3)', color: '#f87171' }}>
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      )}
                    </SectionCard>
                  </div>
                ))}
              </div>
            </div>
          )}

          <EscalateToAiLine escalationNumbers={ESCALATION} />
        </div>

        <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Timeline Event">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="DATE">
                <GlassInput type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </FormField>
              <FormField label="TIME">
                <GlassInput type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
              </FormField>
            </div>
            <FormField label="TITLE">
              <GlassInput value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Event title" />
            </FormField>
            <FormField label="CATEGORY">
              <GlassSelect value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as MockTimelineEvent['category'] }))}>
                {EVENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </GlassSelect>
            </FormField>
            <FormField label="NOTES">
              <GlassTextarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Details..." />
            </FormField>
            <FormField label="FILE ATTACHMENT">
              <UploadDropzone onFiles={setFiles} maxFiles={1} />
            </FormField>
            <GlassButton onClick={handleAdd} className="w-full">Add Event</GlassButton>
          </div>
        </Modal>
      </AppShell>
    </ToastProvider>
  );
}
