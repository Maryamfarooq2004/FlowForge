import React, { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../../components/shared/Logo';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/classNames';
import {
  Bell, HelpCircle, CloudUpload, FileSpreadsheet, FileText, Trash2, Sparkles,
  Check, X, ImageOff,
} from 'lucide-react';

import { useAuthStore } from '../../store/authStore';
import { useProject } from '../../hooks/useProjects';
import { useDocuments, useUploadDocuments, useDeleteDocument, useMergeDocuments } from '../../hooks/useDocuments';
import type { DocumentDTO } from '../../types/document.types';

type Cat = 'roles' | 'fields' | 'rules';

const uniqCI = (arr: string[]): string[] => {
  const seen = new Map<string, string>();
  for (const raw of arr) {
    const v = (raw ?? '').trim();
    if (!v) continue;
    const k = v.toLowerCase();
    if (!seen.has(k)) seen.set(k, v);
  }
  return [...seen.values()];
};

const statusBadge = (d: DocumentDTO) => {
  if (d.status === 'failed') return { text: 'FAILED', cls: 'bg-red-50 text-red-600' };
  if (d.status === 'merged') return { text: 'MERGED', cls: 'bg-teal-50 text-teal-700' };
  return { text: 'ANALYZED', cls: 'bg-green-50 text-green-700' };
};

const DocumentExtractionPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const { data: project } = useProject(projectId);

  const { data: documents = [], isLoading } = useDocuments(projectId);
  const upload = useUploadDocuments(projectId);
  const del = useDeleteDocument(projectId);
  const merge = useMergeDocuments(projectId);

  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const parsed = documents.filter((d) => d.status !== 'failed');
  const selected = documents.find((d) => d.id === selectedId) ?? parsed[0];

  const aggregated = useMemo(
    () => ({
      fields: uniqCI(parsed.flatMap((d) => d.detected?.fields ?? [])),
      roles: uniqCI(parsed.flatMap((d) => d.detected?.roles ?? [])),
      rules: uniqCI(parsed.flatMap((d) => d.detected?.rules ?? [])),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [documents]
  );

  const key = (cat: Cat, v: string) => cat + '::' + v.toLowerCase();
  const isOn = (cat: Cat, v: string) => !excluded.has(key(cat, v));
  const toggle = (cat: Cat, v: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      const k = key(cat, v);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  const chosen = (cat: Cat) => aggregated[cat].filter((v) => isOn(cat, v));
  const totalChosen = chosen('fields').length + chosen('roles').length + chosen('rules').length;

  const onFiles = (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (files.length) upload.mutate(files);
    if (fileRef.current) fileRef.current.value = '';
  };

  const doMerge = () => {
    if (!projectId) return;
    merge.mutate(
      { roles: chosen('roles'), fields: chosen('fields'), rules: chosen('rules') },
      { onSuccess: () => navigate(`/project/${projectId}/intake/review`) }
    );
  };

  const renderChips = (label: string, cat: Cat) => {
    const items = aggregated[cat];
    if (!items.length) return null;
    return (
      <div className="mb-5">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          {label} ({chosen(cat).length}/{items.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {items.map((v) => {
            const on = isOn(cat, v);
            return (
              <button
                key={v}
                onClick={() => toggle(cat, v)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  on
                    ? 'bg-teal-50 border-teal-300 text-[#0F766E]'
                    : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                )}
              >
                {on ? <Check size={12} /> : <X size={12} />}
                {v}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <nav className="h-14 bg-[#134E4A] flex items-center justify-between px-6 shrink-0 z-50 sticky top-0">
        <div className="flex items-center space-x-6">
          <Logo size="sm" variant="light" useSecondary={true} />
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-white/50">Project: {project?.name || 'My Organization'}</span>
            <span className="text-white/30">&gt;</span>
            <span className="text-white">Documents</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/hub/notifications')} className="text-white/70 hover:text-white">
            <Bell size={20} />
          </button>
          <button onClick={() => navigate('/hub/support')} className="text-white/70 hover:text-white">
            <HelpCircle size={20} />
          </button>
          <Avatar name={user?.fullName || 'User'} size="sm" className="bg-[#34D399] text-[#134E4A]" />
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 pb-28">
        <div className="max-w-[1400px] mx-auto space-y-8">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 font-poppins leading-tight mb-2">
              Upload Existing Documents (Optional)
            </h1>
            <p className="text-slate-500 font-inter">
              Upload Excel registers, CSV exports, or process PDFs you already use — we extract the columns and detect
              candidate fields, roles, and rules. Confirm what you want and merge it into your intake.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: upload + file list */}
            <div className="w-full lg:w-[40%] space-y-6">
              <h2 className="font-semibold text-slate-800 text-lg">Upload Files</h2>

              <input
                ref={fileRef}
                type="file"
                multiple
                accept=".xlsx,.xls,.csv,.pdf"
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onFiles(e.dataTransfer.files);
                }}
                className="border-2 border-dashed border-teal-400 rounded-2xl p-10 text-center bg-teal-50/30 cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all group"
              >
                <div className="w-16 h-16 mx-auto bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CloudUpload size={32} />
                </div>
                <p className="text-[#0F766E] font-medium mb-1">
                  {upload.isPending ? 'Analyzing…' : 'Drag & drop or '}
                  {!upload.isPending && <span className="underline decoration-teal-300">Browse Files</span>}
                </p>
                <p className="text-xs text-slate-400">Excel (.xlsx/.xls), CSV, or PDF · up to 5 files</p>
              </div>

              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 flex items-start gap-2.5 text-xs text-slate-500">
                <ImageOff size={16} className="text-slate-400 shrink-0 mt-0.5" />
                Image / diagram OCR (scanned forms, flowcharts) is coming soon — for now, use searchable PDFs or spreadsheets.
              </div>

              <div className="space-y-3">
                {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
                {!isLoading && documents.length === 0 && (
                  <p className="text-sm text-slate-400">No documents uploaded yet.</p>
                )}
                {documents.map((d) => {
                  const badge = statusBadge(d);
                  const Icon = d.type === 'pdf' ? FileText : FileSpreadsheet;
                  const active = selected?.id === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedId(d.id)}
                      className={cn(
                        'bg-white rounded-xl border px-4 py-3 flex items-center justify-between shadow-sm cursor-pointer transition-colors',
                        active ? 'border-teal-400 ring-1 ring-teal-200' : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', d.type === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600')}>
                          <Icon size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{d.originalName}</p>
                          <p className="text-xs text-slate-400">{Math.max(1, Math.round(d.size / 1024))} KB</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 shrink-0">
                        <div className={cn('px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider', badge.cls)}>{badge.text}</div>
                        <button
                          onClick={(e) => { e.stopPropagation(); del.mutate(d.id); }}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: extraction review */}
            <div className="w-full lg:w-[60%] space-y-6">
              <h2 className="font-semibold text-slate-800 text-lg">Extraction Review</h2>

              {!selected ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                  Upload a document to see its extracted structure here.
                </div>
              ) : (
                <>
                  {/* Preview of the selected document */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
                        {selected.originalName} (preview)
                      </span>
                    </div>
                    {selected.error ? (
                      <div className="p-6 text-sm text-red-600">Could not parse this file: {selected.error}</div>
                    ) : selected.type === 'pdf' ? (
                      <div className="p-6 text-sm text-slate-600 whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {selected.extraction?.snippet || '(no extractable text — is this a scanned PDF?)'}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        {(() => {
                          const sheet = selected.extraction?.sheets?.[0];
                          if (!sheet || sheet.columns.length === 0)
                            return <div className="p-6 text-sm text-slate-400">No tabular data found.</div>;
                          return (
                            <table className="w-full text-sm text-left">
                              <thead className="bg-white text-slate-500 border-b border-slate-100">
                                <tr>{sheet.columns.map((c) => <th key={c} className="px-6 py-3 font-medium whitespace-nowrap">{c}</th>)}</tr>
                              </thead>
                              <tbody className="text-slate-700 divide-y divide-slate-50">
                                {sheet.sampleRows.slice(0, 4).map((row, i) => (
                                  <tr key={i} className={i % 2 ? 'bg-slate-50/50' : ''}>
                                    {sheet.columns.map((c) => <td key={c} className="px-6 py-3 whitespace-nowrap">{String(row[c] ?? '')}</td>)}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Detected items to confirm */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={16} className="text-[#0F766E]" />
                      <h3 className="font-semibold text-slate-800 text-sm">Detected across your documents — pick what to keep</h3>
                    </div>
                    {aggregated.fields.length + aggregated.roles.length + aggregated.rules.length === 0 ? (
                      <p className="text-sm text-slate-400">Nothing detected yet. Excel/CSV column headers become candidate fields.</p>
                    ) : (
                      <>
                        {renderChips('Fields (from columns)', 'fields')}
                        {renderChips('Roles', 'roles')}
                        {renderChips('Rules', 'rules')}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="w-full bg-white border-t border-slate-200 px-8 py-4 sticky bottom-0 z-40">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(`/project/${projectId}/intake/review`)}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Skip / Back to Review
          </button>
          <Button
            onClick={doMerge}
            disabled={totalChosen === 0 || merge.isPending}
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white font-bold flex items-center gap-2 shadow-lg shadow-teal-900/10"
          >
            <span>{merge.isPending ? 'Merging…' : `Merge ${totalChosen} item${totalChosen === 1 ? '' : 's'} into Intake`}</span>
            <Sparkles size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentExtractionPage;
