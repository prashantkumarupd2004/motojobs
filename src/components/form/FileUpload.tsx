'use client';

import { useRef, useState } from 'react';
import { FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { apiFetch } from '@/lib/http';

interface FileUploadProps {
  /** Comma-separated accept attribute, e.g. ".pdf,.doc,.docx" */
  accept: string;
  maxBytes: number;
  value?: string;
  fileName?: string;
  onChange: (result: { url: string; name: string } | null) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(0)}MB`
    : `${Math.round(bytes / 1024)}KB`;
}

export default function FileUpload({
  accept,
  maxBytes,
  value,
  fileName,
  onChange,
  label = 'Upload a file',
  hint,
  disabled,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const upload = async (file: File) => {
    setError('');
    if (file.size > maxBytes) {
      setError(`File is too large. Maximum size is ${formatBytes(maxBytes)}.`);
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await apiFetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange({ url: data.url, name: data.name });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div className="flex items-center gap-3 bg-white border border-line rounded-[14px] px-4 py-3">
        <div className="w-9 h-9 rounded-[10px] bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
          <FileText className="w-4.5 h-4.5 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">{fileName || 'Uploaded file'}</p>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12.5px] text-brand-600 hover:text-brand-700 font-medium"
          >
            View file
          </a>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={disabled}
          aria-label="Remove file"
          className="text-ink-faint hover:text-critical transition-colors shrink-0"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) upload(file);
        }}
        className={`w-full flex flex-col items-center justify-center gap-2 border border-dashed rounded-[16px] px-4 py-7 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
          dragging
            ? 'border-brand-600 bg-brand-50'
            : error
              ? 'border-critical bg-critical-soft'
              : 'border-line bg-canvas hover:border-brand-600 hover:bg-brand-50/40'
        }`}
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
        ) : (
          <Upload className="w-6 h-6 text-ink-faint" />
        )}
        <span className="text-sm font-semibold text-ink">
          {uploading ? 'Uploading…' : label}
        </span>
        {hint && <span className="text-[12.5px] text-ink-faint">{hint}</span>}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = '';
        }}
      />

      {error && (
        <p className="mt-2 text-[13px] font-medium text-critical" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
