'use client';
import { apiFetch } from '@/lib/http';
import { useState } from 'react';
import { Wand2, FileText, Users, Search, CheckSquare, Loader2, Copy, Check } from 'lucide-react';
import { EXPERIENCE_LEVELS } from '@/lib/automotive';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  endpoint: string;
  fields: { key: string; label: string; type: 'text' | 'textarea' | 'select'; placeholder?: string; options?: string[] }[];
}

const TOOLS: Tool[] = [
  {
    id: 'jd-generator',
    title: 'JD Generator',
    description: 'Generate a compelling job description in seconds',
    icon: FileText,
    color: 'from-[#FF8533] to-[#B84B00]',
    endpoint: '/api/ai/jd-generator',
    fields: [
      { key: 'title', label: 'Job Title', type: 'text', placeholder: 'e.g. Service Advisor' },
      { key: 'experience', label: 'Experience Level', type: 'select', options: [...EXPERIENCE_LEVELS] },
      { key: 'skills', label: 'Key Skills', type: 'text', placeholder: 'Engine Diagnostics, DMS Software, Customer Handling...' },
    ],
  },
  {
    id: 'candidate-screening',
    title: 'Candidate Screener',
    description: 'Score and rank candidates against job requirements',
    icon: Users,
    color: 'from-[#4A7FB4] to-[#1F5D95]',
    endpoint: '/api/ai/candidate-screening',
    fields: [
      { key: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'Automobile Technician' },
      { key: 'requirements', label: 'Job Requirements', type: 'textarea', placeholder: 'ITI MMV with 3+ years in a Maruti or Hyundai workshop...' },
      { key: 'candidateProfile', label: 'Candidate Profile', type: 'textarea', placeholder: 'Paste candidate resume or profile summary...' },
    ],
  },
  {
    id: 'matching',
    title: 'Job-Candidate Matcher',
    description: 'Find the best candidates for a specific job',
    icon: Search,
    color: 'from-[#12B37E] to-[#0A8A5F]',
    endpoint: '/api/ai/matching',
    fields: [
      { key: 'jobDescription', label: 'Job Description', type: 'textarea', placeholder: 'Paste the full job description...' },
      { key: 'candidateIds', label: 'Candidate IDs', type: 'text', placeholder: 'Comma-separated candidate IDs to evaluate' },
    ],
  },
  {
    id: 'interview-kit',
    title: 'Interview Kit Generator',
    description: 'Generate role-specific interview questions and scoring rubric',
    icon: CheckSquare,
    color: 'from-[#FF8533] to-[#E05D00]',
    endpoint: '/api/ai/interview-kit',
    fields: [
      { key: 'role', label: 'Job Role', type: 'text', placeholder: 'Workshop Manager' },
      { key: 'type', label: 'Interview Type', type: 'select', options: ['behavioral', 'trade', 'safety', 'hr'] },
      { key: 'level', label: 'Difficulty', type: 'select', options: ['beginner', 'intermediate', 'advanced'] },
    ],
  },
];

export default function AIToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tool = TOOLS.find(t => t.id === activeTool);

  function selectTool(id: string) {
    setActiveTool(id);
    setFormData({});
    setResult('');
  }

  async function runTool() {
    if (!tool) return;
    setLoading(true);
    setResult('');
    try {
      const res = await apiFetch(tool.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      const content = data.description || data.content || data.result || data.questions || data.score || JSON.stringify(data, null, 2);
      setResult(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    } catch {
      setResult('Error: Could not connect to AI service. Please check your OpenAI API key.');
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">AI Recruitment Tools</h1>
        <p className="text-ink-muted mt-1">Supercharge your hiring process with GPT-4o powered tools</p>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {TOOLS.map(t => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => selectTool(t.id)}
              className={`p-5 rounded-[16px] text-left border transition-all ${isActive ? 'border-[#BEE7D8] bg-positive-soft ring-1 ring-emerald-500/20' : 'border-line bg-white hover:border-line hover:-translate-y-1'}`}
            >
              <div className={`w-10 h-10 rounded-[16px] bg-gradient-to-br ${t.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-ink mb-1">{t.title}</p>
              <p className="text-xs text-ink-muted">{t.description}</p>
            </button>
          );
        })}
      </div>

      {/* Tool Interface */}
      {tool && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Input Panel */}
          <div className="bg-white border border-line rounded-[16px] p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-[16px] bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
                <tool.icon className="w-5 h-5 text-ink" />
              </div>
              <div>
                <h2 className="font-bold text-ink">{tool.title}</h2>
                <p className="text-xs text-ink-muted">{tool.description}</p>
              </div>
            </div>

            {tool.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm text-ink-soft mb-2">{field.label}</label>
                {field.type === 'text' && (
                  <input
                    value={formData[field.key] || ''}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full bg-canvas border border-line text-ink placeholder-ink-faint rounded-[16px] px-4 py-3 text-sm focus:outline-none focus:border-[#BEE7D8]"
                  />
                )}
                {field.type === 'textarea' && (
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full bg-canvas border border-line text-ink placeholder-ink-faint rounded-[16px] px-4 py-3 text-sm focus:outline-none focus:border-[#BEE7D8] resize-none"
                  />
                )}
                {field.type === 'select' && (
                  <select
                    value={formData[field.key] || ''}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full bg-canvas border border-line text-ink rounded-[16px] px-4 py-3 text-sm focus:outline-none focus:border-[#BEE7D8]"
                  >
                    <option value="">Select...</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
              </div>
            ))}

            <button
              onClick={runTool}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${tool.color} hover:opacity-90 disabled:opacity-50 text-white font-semibold py-3 rounded-[16px] text-sm transition-all`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {loading ? 'Generating...' : `Run ${tool.title}`}
            </button>
          </div>

          {/* Output Panel */}
          <div className="bg-white border border-line rounded-[16px] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink">AI Output</h2>
              {result && (
                <button onClick={copyResult} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink border border-line hover:border-brand-200 px-3 py-1.5 rounded-[16px] transition-all">
                  {copied ? <Check className="w-3.5 h-3.5 text-[#0A7A54]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            <div className="flex-1 bg-white border border-line rounded-[16px] p-4 overflow-y-auto min-h-48">
              {loading ? (
                <div className="flex items-center justify-center h-full gap-3 text-ink-muted">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">AI is working its magic...</span>
                </div>
              ) : result ? (
                <p className="text-ink-soft text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-ink-faint">
                  <Wand2 className="w-10 h-10 mb-3" />
                  <p className="text-sm">Fill in the fields and run the tool to see AI-generated output here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!activeTool && (
        <div className="text-center py-12 bg-white border border-dashed border-line rounded-[16px]">
          <Wand2 className="w-10 h-10 text-ink-faint mx-auto mb-3" />
          <p className="text-ink-muted text-sm">Select a tool above to get started</p>
        </div>
      )}
    </div>
  );
}
