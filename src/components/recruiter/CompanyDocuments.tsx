'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  Clock,
  FileText,
  Loader2,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/http';
import { COMPANY_DOCUMENT_TYPES, MAX_RESUME_BYTES } from '@/lib/automotive';
import { FileUpload } from '@/components/form';

interface CompanyDoc {
  id: string;
  type: string;
  fileUrl: string;
  fileName: string | null;
  status: string;
  adminNotes: string | null;
}

const STATUS_STYLES: Record<string, { label: string; className: string; Icon: typeof Clock }> = {
  PENDING: {
    label: 'Under review',
    className: 'bg-ignite-50 border-ignite-500/20 text-ignite-600',
    Icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-positive-soft border-positive/20 text-positive',
    Icon: BadgeCheck,
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-critical-soft border-critical/20 text-critical',
    Icon: XCircle,
  },
};

export default function CompanyDocuments({ hasCompany }: { hasCompany: boolean }) {
  const [documents, setDocuments] = useState<CompanyDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/recruiter/documents')
      .then((res) => (res.ok ? res.json() : { documents: [] }))
      .then((data) => {
        if (!cancelled) setDocuments(data.documents ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function upload(type: string, file: { url: string; name: string }) {
    setError('');
    setBusy(type);
    try {
      const res = await apiFetch('/api/recruiter/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, fileUrl: file.url, fileName: file.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setDocuments((list) => [
        data.document,
        ...list.filter((d) => d.type !== type),
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy('');
    }
  }

  async function remove(doc: CompanyDoc) {
    setError('');
    setBusy(doc.type);
    try {
      const res = await apiFetch(`/api/recruiter/documents?id=${doc.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Could not remove the document');
      }
      setDocuments((list) => list.filter((d) => d.id !== doc.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not remove the document');
    } finally {
      setBusy('');
    }
  }

  const approved = documents.filter((d) => d.status === 'APPROVED').length;

  return (
    <div className="surface sheen p-6 sm:p-8">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 shrink-0 rounded-[13px] bg-brand-50 border border-brand-100 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
        </div>
        <div className="min-w-0">
          <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em]">
            Verification Documents
          </h2>
          <p className="text-ink-muted text-[14px] leading-[1.65] mt-1.5">
            Upload proof of registration and identity to earn the verified badge.
            Candidates trust verified employers more, and your jobs rank higher.
            Documents are reviewed by our team and never shown publicly.
          </p>
        </div>
      </div>

      {!hasCompany && (
        <div className="flex items-start gap-2.5 bg-ignite-50 border border-ignite-500/20 text-ignite-600 rounded-[14px] px-4 py-3 text-[13.5px] font-medium mt-6">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          Save your company profile first — documents attach to your company record.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="bg-critical-soft border border-critical/20 text-critical rounded-[14px] px-4 py-3 text-sm font-medium mt-6"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-ignite-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {COMPANY_DOCUMENT_TYPES.map(({ id, label }) => {
            const doc = documents.find((d) => d.type === id);
            const status = doc ? STATUS_STYLES[doc.status] : null;

            return (
              <div key={id} className="border border-line rounded-[16px] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="text-[14.5px] font-semibold text-ink">{label}</h3>
                  {status && (
                    <span
                      className={`inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.08em] px-2.5 py-1.5 rounded-full border ${status.className}`}
                    >
                      <status.Icon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  )}
                </div>

                {doc ? (
                  <div className="flex items-center gap-3 bg-canvas border border-line rounded-[14px] px-4 py-3">
                    <div className="w-9 h-9 rounded-[10px] bg-white border border-line flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {doc.fileName || 'Uploaded document'}
                      </p>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12.5px] text-brand-600 hover:text-brand-700 font-medium"
                      >
                        View document
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(doc)}
                      disabled={busy === id}
                      aria-label={`Remove ${label}`}
                      className="w-9 h-9 shrink-0 rounded-[10px] flex items-center justify-center text-ink-faint hover:text-critical hover:bg-critical-soft disabled:opacity-40 transition-all duration-200"
                    >
                      {busy === id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ) : (
                  <FileUpload
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    maxBytes={MAX_RESUME_BYTES}
                    disabled={!hasCompany || busy === id}
                    onChange={(r) => r && upload(id, r)}
                    label="Upload document"
                    hint="PDF, JPG, PNG or WEBP up to 5MB"
                  />
                )}

                {doc?.status === 'REJECTED' && doc.adminNotes && (
                  <p className="text-[13px] text-critical font-medium mt-3">
                    {doc.adminNotes} — please upload a corrected copy.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && approved > 0 && (
        <p className="text-[13px] font-medium text-ink-faint mt-5">
          {approved} of {COMPANY_DOCUMENT_TYPES.length} documents approved. A
          registration proof plus an identity proof earns the verified badge.
        </p>
      )}
    </div>
  );
}
