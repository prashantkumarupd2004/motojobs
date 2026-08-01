'use client';
import { apiFetch } from '@/lib/http';
import { useState, useEffect } from 'react';
import { FileText, Upload, Wand2, Plus, Trash2, Save, Loader2, CheckCircle, Download, User, Briefcase, GraduationCap, Code2 } from 'lucide-react';

interface ResumeSection {
  id: string;
  type: 'experience' | 'education' | 'skill' | 'project';
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  tags?: string[];
}

const TAB_ICONS = { info: User, experience: Briefcase, education: GraduationCap, skills: Code2 };

const FIELD = 'w-full bg-white border border-line rounded-[14px] px-4 py-3 text-sm text-ink placeholder-ink-faint shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] outline-none transition-all duration-300';
const LABEL = 'block text-[13px] font-semibold text-ink-soft mb-2';

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'experience' | 'education' | 'skills'>('info');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState({ name: '', email: '', phone: '', location: '', summary: '' });
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    loadResume();
  }, []);

  async function loadResume() {
    try {
      const res = await apiFetch('/api/candidate/resume');
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          const r = data.data;
          setInfo({ name: r.user?.name || '', email: r.user?.email || '', phone: r.user?.phone || '', location: '', summary: r.summary || '' });
        }
      }
      const profileRes = await apiFetch('/api/candidate/profile');
      if (profileRes.ok) {
        const pd = await profileRes.json();
        if (pd.data) {
          setInfo(prev => ({
            ...prev,
            name: pd.data.user?.name || prev.name,
            email: pd.data.user?.email || prev.email,
            phone: pd.data.user?.phone || prev.phone,
            location: pd.data.location || prev.location,
            summary: pd.data.summary || prev.summary,
          }));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAIGenerate() {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const res = await apiFetch('/api/ai/resume-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, currentInfo: info }),
      });
      const data = await res.json();
      setAiResult(data.content || data.result || 'AI generated content will appear here.');
    } catch {
      setAiResult('Failed to generate. Please check your OpenAI API key and try again.');
    } finally {
      setGenerating(false);
    }
  }

  function addSection(type: ResumeSection['type']) {
    setSections(prev => [...prev, {
      id: crypto.randomUUID(),
      type,
      title: '',
      subtitle: '',
      date: '',
      description: '',
      tags: [],
    }]);
  }

  function updateSection(id: string, updates: Partial<ResumeSection>) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }

  function removeSection(id: string) {
    setSections(prev => prev.filter(s => s.id !== id));
  }

  function addSkill() {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await apiFetch('/api/candidate/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: info.summary, sections, skills }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { key: 'info', label: 'Personal Info' },
    { key: 'experience', label: 'Experience' },
    { key: 'education', label: 'Education' },
    { key: 'skills', label: 'Skills & AI' },
  ] as const;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-extrabold text-ink tracking-[-0.035em]">Resume Builder</h1>
          <p className="text-ink-muted text-[15px] mt-1.5">Build a professional resume with AI assistance</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {saved && <div className="flex items-center gap-2 bg-positive-soft border border-positive/20 text-positive text-[13px] font-semibold px-3.5 py-2 rounded-full animate-scale-in"><CheckCircle className="w-4 h-4" />Saved!</div>}
          <button onClick={handleSave} disabled={saving} className="sweep press flex items-center gap-2 grad-brand disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-[14px] text-sm shadow-[0_4px_12px_rgba(15,76,129,0.20)] hover:shadow-[0_8px_22px_rgba(15,76,129,0.30)] hover:-translate-y-0.5 transition-all duration-300">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Resume
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 surface p-1.5 overflow-x-auto scroll-slim">
        {tabs.map(({ key, label }) => {
          const Icon = TAB_ICONS[key];
          return (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[13px] text-[13.5px] font-semibold whitespace-nowrap transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${activeTab === key ? 'grad-brand text-white shadow-[0_3px_10px_rgba(15,76,129,0.22)]' : 'text-ink-muted hover:text-brand-700 hover:bg-canvas'}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:block">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Personal Info Tab */}
      {activeTab === 'info' && (
        <div className="surface sheen p-6 sm:p-8 space-y-5 animate-fade-up">
          <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em]">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { key: 'name', label: 'Full Name', placeholder: 'John Doe' },
              { key: 'email', label: 'Email', placeholder: 'john@example.com' },
              { key: 'phone', label: 'Phone', placeholder: '+91 9876543210' },
              { key: 'location', label: 'Location', placeholder: 'Mumbai, India' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className={LABEL}>{label}</label>
                <input
                  value={info[key as keyof typeof info]}
                  onChange={e => setInfo({ ...info, [key]: e.target.value })}
                  placeholder={placeholder}
                  className={FIELD}
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className={LABEL}>Professional Summary</label>
              <textarea
                value={info.summary}
                onChange={e => setInfo({ ...info, summary: e.target.value })}
                rows={4}
                placeholder="Experienced developer with..."
                className={`${FIELD} resize-none leading-[1.7]`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Experience Tab */}
      {activeTab === 'experience' && (
        <div className="space-y-5 animate-fade-up">
          {sections.filter(s => s.type === 'experience').map(section => (
            <div key={section.id} className="surface sheen p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[15px] font-bold text-ink tracking-[-0.02em]">Experience Entry</h3>
                <button onClick={() => removeSection(section.id)} className="text-ink-faint hover:text-critical hover:bg-critical-soft p-2 rounded-[10px] transition-all duration-200 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={LABEL}>Job Title</label>
                  <input value={section.title} onChange={e => updateSection(section.id, { title: e.target.value })} placeholder="Senior Developer" className={FIELD} />
                </div>
                <div>
                  <label className={LABEL}>Company Name</label>
                  <input value={section.subtitle || ''} onChange={e => updateSection(section.id, { subtitle: e.target.value })} placeholder="Google Inc." className={FIELD} />
                </div>
                <div>
                  <label className={LABEL}>Duration</label>
                  <input value={section.date || ''} onChange={e => updateSection(section.id, { date: e.target.value })} placeholder="Jan 2022 – Present" className={FIELD} />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL}>Description</label>
                  <textarea value={section.description || ''} onChange={e => updateSection(section.id, { description: e.target.value })} rows={3} placeholder="Describe your responsibilities and achievements..." className={`${FIELD} resize-none leading-[1.7]`} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => addSection('experience')} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-line hover:border-brand-300 hover:bg-brand-50/50 text-ink-muted hover:text-brand-700 text-[14px] font-semibold rounded-[20px] py-5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]">
            <Plus className="w-5 h-5" /> Add Experience
          </button>
        </div>
      )}

      {/* Education Tab */}
      {activeTab === 'education' && (
        <div className="space-y-5 animate-fade-up">
          {sections.filter(s => s.type === 'education').map(section => (
            <div key={section.id} className="surface sheen p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[15px] font-bold text-ink tracking-[-0.02em]">Education Entry</h3>
                <button onClick={() => removeSection(section.id)} className="text-ink-faint hover:text-critical hover:bg-critical-soft p-2 rounded-[10px] transition-all duration-200 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={LABEL}>Degree / Course</label>
                  <input value={section.title} onChange={e => updateSection(section.id, { title: e.target.value })} placeholder="B.Tech Computer Science" className={FIELD} />
                </div>
                <div>
                  <label className={LABEL}>Institution</label>
                  <input value={section.subtitle || ''} onChange={e => updateSection(section.id, { subtitle: e.target.value })} placeholder="IIT Bombay" className={FIELD} />
                </div>
                <div>
                  <label className={LABEL}>Year</label>
                  <input value={section.date || ''} onChange={e => updateSection(section.id, { date: e.target.value })} placeholder="2018 – 2022" className={FIELD} />
                </div>
                <div>
                  <label className={LABEL}>CGPA / Percentage</label>
                  <input value={section.description || ''} onChange={e => updateSection(section.id, { description: e.target.value })} placeholder="8.5 / 10" className={FIELD} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => addSection('education')} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-line hover:border-brand-300 hover:bg-brand-50/50 text-ink-muted hover:text-brand-700 text-[14px] font-semibold rounded-[20px] py-5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]">
            <Plus className="w-5 h-5" /> Add Education
          </button>
        </div>
      )}

      {/* Skills & AI Tab */}
      {activeTab === 'skills' && (
        <div className="space-y-6 animate-fade-up">
          {/* Skills */}
          <div className="surface sheen p-6 sm:p-8">
            <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em] mb-5">Technical Skills</h2>
            <div className="flex gap-2.5 mb-5">
              <input
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="e.g. React, Node.js, Python..."
                className={`flex-1 min-w-0 ${FIELD}`}
              />
              <button onClick={addSkill} className="press shrink-0 grad-brand text-white px-4 py-3 rounded-[14px] shadow-[0_4px_12px_rgba(15,76,129,0.20)] hover:shadow-[0_8px_22px_rgba(15,76,129,0.30)] hover:-translate-y-0.5 transition-all duration-300">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill} className="flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-700 text-[13px] font-semibold px-3.5 py-1.5 rounded-full">
                  {skill}
                  <button onClick={() => setSkills(prev => prev.filter(s => s !== skill))} className="text-brand-400 hover:text-critical transition-colors duration-200 text-[15px] leading-none">×</button>
                </span>
              ))}
              {skills.length === 0 && <p className="text-ink-faint text-[14px]">No skills added yet. Type above and press Enter.</p>}
            </div>
          </div>

          {/* AI Resume Generator */}
          <div className="surface sheen p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-[13px] grad-ignite flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(255,107,0,0.22)]">
                <Wand2 className="w-5 h-5 text-white" strokeWidth={2.1} />
              </div>
              <div className="min-w-0">
                <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em]">AI Resume Writer</h2>
                <p className="text-[13px] text-ink-muted mt-0.5">Let AI craft your professional summary and descriptions</p>
              </div>
            </div>
            <div className="space-y-4">
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                rows={3}
                placeholder="Describe your background and target role... e.g. 'I am a frontend developer with 3 years experience in React. Write a compelling professional summary for a senior role at a fintech startup.'"
                className={`${FIELD} resize-none leading-[1.7]`}
              />
              <button
                onClick={handleAIGenerate}
                disabled={generating || !aiPrompt.trim()}
                className="sweep press flex items-center gap-2 grad-ignite disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-[14px] text-sm shadow-[0_4px_12px_rgba(255,107,0,0.22)] hover:shadow-[0_8px_22px_rgba(255,107,0,0.30)] hover:-translate-y-0.5 transition-all duration-300"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {generating ? 'Generating...' : 'Generate with AI'}
              </button>
              {aiResult && (
                <div className="bg-canvas border border-line rounded-[16px] p-5 animate-fade-in">
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <p className="text-[11px] text-ink-faint font-bold uppercase tracking-[0.1em]">AI Generated Content</p>
                    <button onClick={() => setInfo({ ...info, summary: aiResult })} className="text-[12.5px] font-semibold text-brand-600 hover:text-brand-700 transition-colors duration-200 shrink-0">Use as Summary</button>
                  </div>
                  <p className="text-ink-soft text-[14.5px] leading-[1.7] whitespace-pre-wrap">{aiResult}</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Resume */}
          <div className="surface sheen p-6 sm:p-8">
            <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em] mb-4">Upload Existing Resume</h2>
            <div className="bg-canvas border-2 border-dashed border-line hover:border-brand-300 rounded-[16px] p-10 text-center cursor-pointer transition-all duration-300 group">
              <Upload className="w-10 h-10 text-ink-faint group-hover:text-brand-600 mx-auto mb-4 transition-colors duration-300" strokeWidth={1.8} />
              <p className="text-[14.5px] text-ink font-semibold">Drop your resume here or click to browse</p>
              <p className="text-[12.5px] text-ink-faint mt-1.5">PDF, DOC, DOCX up to 5MB</p>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
