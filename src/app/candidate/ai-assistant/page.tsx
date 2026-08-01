'use client';
import { apiFetch } from '@/lib/http';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Wand2, Trash2, Briefcase, FileText, Target, TrendingUp } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: Briefcase, text: 'What jobs match my profile?', label: 'Job Match' },
  { icon: FileText, text: 'Review my resume and give feedback', label: 'Resume Review' },
  { icon: Target, text: 'How to negotiate a higher salary?', label: 'Salary Tips' },
  { icon: TrendingUp, text: 'What skills should I learn for career growth?', label: 'Skill Gap' },
];

const WELCOME = `Hello! I'm your AI Career Assistant powered by GPT-4o. I can help you with:

• **Job search strategies** — Finding the right opportunities
• **Resume optimization** — Making your resume stand out  
• **Interview preparation** — Mastering common & technical questions
• **Career planning** — Charting your growth path
• **Salary negotiation** — Getting what you deserve

What would you like to work on today?`;

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: WELCOME, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = text || input.trim();
    if (!content || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/ai/career-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content || data.message || 'I apologize, I could not process your request. Please check the OpenAI API key configuration.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([{ id: '1', role: 'assistant', content: WELCOME, timestamp: new Date() }]);
  }

  function formatContent(content: string) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^• /gm, '▸ ')
      .split('\n')
      .map((line, i) => `<span key="${i}">${line}</span>`)
      .join('<br />');
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[16px] bg-gradient-to-br from-[#FF8533] to-[#B84B00] flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">AI Career Assistant</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-ink-muted">Online · GPT-4o</span>
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="flex items-center gap-2 text-ink-muted hover:text-ink border border-line hover:border-line px-3 py-2 rounded-[16px] text-sm transition-all">
          <Trash2 className="w-4 h-4" /> Clear
        </button>
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 shrink-0">
          {QUICK_PROMPTS.map(({ icon: Icon, text, label }) => (
            <button key={label} onClick={() => sendMessage(text)} className="flex flex-col items-center gap-2 p-3 bg-white border border-line hover:border-brand-100 hover:bg-canvas rounded-[16px] text-center transition-all group">
              <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                <Icon className="w-4 h-4 text-brand-600" />
              </div>
              <span className="text-xs text-ink-soft font-medium">{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-[#FF8533] to-[#B84B00]'
                : 'bg-gradient-to-br from-brand-500 to-blue-600'
            }`}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-ink" /> : <User className="w-4 h-4 text-ink" />}
            </div>
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-[20px] text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-white border border-line text-ink rounded-tl-sm'
                  : 'bg-brand-600 text-white rounded-tr-sm'
              }`}>
                <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
              </div>
              <span className="text-xs text-ink-faint px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF8533] to-[#B84B00] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-line px-4 py-3 rounded-[20px] rounded-tl-sm flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 bg-ink-faint rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 bg-white border border-line rounded-[20px] p-3 flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me about career advice, resume tips, interview prep..."
          rows={1}
          className="flex-1 bg-transparent text-ink placeholder-ink-faint text-sm resize-none focus:outline-none max-h-32 leading-relaxed"
          style={{ minHeight: '24px' }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-9 h-9 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-[16px] flex items-center justify-center transition-all shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 text-ink animate-spin" /> : <Send className="w-4 h-4 text-ink" />}
        </button>
      </div>
    </div>
  );
}
