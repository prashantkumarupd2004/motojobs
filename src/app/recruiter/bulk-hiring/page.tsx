'use client';
import { useState } from 'react';
import { Users, Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2, Download, BarChart2, AlertCircle } from 'lucide-react';

interface BulkCandidate {
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

const SAMPLE_DATA: BulkCandidate[] = [
  { name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', role: 'Service Advisor', status: 'pending' },
  { name: 'Priya Patel', email: 'priya@example.com', phone: '8765432109', role: 'Sales Consultant', status: 'pending' },
  { name: 'Amit Kumar', email: 'amit@example.com', role: 'Automobile Technician', status: 'pending' },
  { name: 'Sneha Reddy', email: 'sneha@example.com', phone: '7654321098', role: 'Telecaller / CRE', status: 'pending' },
  { name: 'Vikram Singh', email: 'vikram@example.com', role: 'Spare Parts Executive', status: 'pending' },
];

export default function BulkHiringPage() {
  const [candidates, setCandidates] = useState<BulkCandidate[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [step, setStep] = useState<'upload' | 'review' | 'done'>('upload');

  function loadSampleData() {
    setCandidates(SAMPLE_DATA);
    setStep('review');
  }

  function parseCsv(text: string) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const parsed: BulkCandidate[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => { obj[h] = values[idx] || ''; });
      if (obj.name && obj.email) {
        parsed.push({ name: obj.name, email: obj.email, phone: obj.phone, role: obj.role || 'General', status: 'pending' });
      }
    }
    return parsed;
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      const parsed = parseCsv(text);
      if (parsed.length > 0) { setCandidates(parsed); setStep('review'); }
    };
    reader.readAsText(file);
  }

  async function processAll() {
    setProcessing(true);
    const updated = [...candidates];
    for (let i = 0; i < updated.length; i++) {
      await new Promise(r => setTimeout(r, 300));
      updated[i] = { ...updated[i], status: Math.random() > 0.1 ? 'success' : 'error', error: Math.random() > 0.9 ? 'Email already registered' : undefined };
      setCandidates([...updated]);
    }
    setProcessing(false);
    setProcessed(true);
    setStep('done');
  }

  const successCount = candidates.filter(c => c.status === 'success').length;
  const errorCount = candidates.filter(c => c.status === 'error').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Bulk Hiring</h1>
        <p className="text-ink-muted mt-1">Import and process multiple candidates at once</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {[
          { key: 'upload', label: 'Upload', num: 1 },
          { key: 'review', label: 'Review', num: 2 },
          { key: 'done', label: 'Results', num: 3 },
        ].map(({ key, label, num }, i) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === key ? 'bg-positive text-white' : (step === 'done' && key !== 'done') || (step === 'review' && key === 'upload') ? 'bg-positive-soft text-[#0A7A54] border border-[#BEE7D8]' : 'bg-canvas text-ink-muted'}`}>
              {(step === 'done' && key !== 'done') || (step === 'review' && key === 'upload') ? <CheckCircle className="w-4 h-4" /> : num}
            </div>
            <span className={`text-sm ${step === key ? 'text-ink font-semibold' : 'text-ink-muted'}`}>{label}</span>
            {i < 2 && <div className={`w-16 h-px ${step !== 'upload' && (i === 0 || step === 'done') ? 'bg-positive-soft' : 'bg-canvas'}`} />}
          </div>
        ))}
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <div className="space-y-5">
          <div className="bg-white border border-line rounded-[16px] p-6">
            <h2 className="font-bold text-ink mb-4">Upload Candidate CSV</h2>
            <div className="border-2 border-dashed border-line hover:border-[#BEE7D8] rounded-[16px] p-10 text-center cursor-pointer transition-all group relative">
              <Upload className="w-10 h-10 text-ink-faint group-hover:text-[#0A7A54] mx-auto mb-3 transition-colors" />
              <p className="text-sm text-ink-soft font-medium mb-1">Drop CSV file here or click to upload</p>
              <p className="text-xs text-ink-faint">Required columns: name, email. Optional: phone, role</p>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="bg-white border border-line rounded-[16px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink">CSV Format Guide</h2>
              <button className="flex items-center gap-2 text-sm text-[#0A7A54] hover:text-[#0A7A54] transition-colors">
                <Download className="w-4 h-4" /> Download Template
              </button>
            </div>
            <div className="bg-white border border-line rounded-[16px] p-4 font-mono text-sm">
              <p className="text-[#0A7A54]">name,email,phone,role</p>
              <p className="text-ink-soft">Rahul Sharma,rahul@example.com,9876543210,Service Advisor</p>
              <p className="text-ink-soft">Priya Patel,priya@example.com,,Sales Consultant</p>
            </div>
          </div>

          <div className="bg-brand-50 border border-brand-100 rounded-[16px] p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-brand-600 shrink-0" />
            <p className="text-sm text-brand-700">Don&apos;t have a CSV ready? <button onClick={loadSampleData} className="text-brand-600 hover:text-brand-700 underline font-medium">Load sample data</button> to test the workflow.</p>
          </div>
        </div>
      )}

      {/* Review Step */}
      {step === 'review' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between bg-white border border-line rounded-[16px] p-5">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-[#0A7A54]" />
              <div>
                <p className="font-semibold text-ink">{candidates.length} candidates ready to import</p>
                <p className="text-sm text-ink-muted">Review the list before processing</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep('upload'); setCandidates([]); }} className="px-4 py-2 border border-line text-ink-muted hover:text-ink rounded-[16px] text-sm transition-all">
                Re-upload
              </button>
              <button onClick={processAll} disabled={processing} className="flex items-center gap-2 bg-positive hover:bg-positive disabled:opacity-50 text-ink font-semibold px-5 py-2 rounded-[16px] text-sm transition-all">
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                {processing ? 'Processing...' : 'Process All'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-line rounded-[16px] overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs text-ink-muted font-semibold uppercase tracking-wide border-b border-line">
              <div className="col-span-3">Name</div>
              <div className="col-span-4">Email</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            <div className="divide-y divide-line-soft max-h-96 overflow-y-auto">
              {candidates.map((c, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center">
                  <div className="col-span-3 text-sm text-ink font-medium truncate">{c.name}</div>
                  <div className="col-span-4 text-sm text-ink-muted truncate">{c.email}</div>
                  <div className="col-span-3 text-sm text-ink-muted truncate">{c.role}</div>
                  <div className="col-span-2 flex justify-end">
                    {c.status === 'pending' && <span className="text-xs text-ink-muted">Pending</span>}
                    {c.status === 'success' && <CheckCircle className="w-4 h-4 text-[#0A7A54]" />}
                    {c.status === 'error' && (
                      <div className="flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-[#B32B2B]" />
                        <span className="text-xs text-[#B32B2B] hidden sm:block">{c.error || 'Error'}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Done Step */}
      {step === 'done' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-line rounded-[16px] p-5 text-center">
              <div className="text-3xl font-bold text-ink">{candidates.length}</div>
              <div className="text-sm text-ink-muted mt-1">Total Processed</div>
            </div>
            <div className="bg-positive-soft border border-[#BEE7D8] rounded-[16px] p-5 text-center">
              <div className="text-3xl font-bold text-[#0A7A54]">{successCount}</div>
              <div className="text-sm text-[#0A7A54]/70 mt-1">Successfully Added</div>
            </div>
            <div className="bg-critical-soft border border-[#F3C9C9] rounded-[16px] p-5 text-center">
              <div className="text-3xl font-bold text-[#B32B2B]">{errorCount}</div>
              <div className="text-sm text-[#B32B2B]/70 mt-1">Failed</div>
            </div>
          </div>

          <div className="bg-white border border-line rounded-[16px] overflow-hidden">
            <div className="p-5 border-b border-line">
              <h2 className="font-bold text-ink">Import Results</h2>
            </div>
            <div className="divide-y divide-line-soft max-h-96 overflow-y-auto">
              {candidates.map((c, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {c.status === 'success' ? <CheckCircle className="w-4 h-4 text-[#0A7A54] shrink-0" /> : <XCircle className="w-4 h-4 text-[#B32B2B] shrink-0" />}
                    <div>
                      <p className="text-sm text-ink font-medium">{c.name}</p>
                      <p className="text-xs text-ink-muted">{c.email}</p>
                    </div>
                  </div>
                  {c.error && <span className="text-xs text-[#B32B2B]">{c.error}</span>}
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => { setStep('upload'); setCandidates([]); setProcessed(false); }} className="flex items-center gap-2 bg-positive hover:bg-positive text-ink font-semibold px-5 py-3 rounded-[16px] text-sm transition-all">
            <Upload className="w-4 h-4" /> Import Another Batch
          </button>
        </div>
      )}
    </div>
  );
}
