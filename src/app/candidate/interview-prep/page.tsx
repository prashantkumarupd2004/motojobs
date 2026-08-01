'use client';
import { apiFetch } from '@/lib/http';
import { useState } from 'react';
import { Target, ChevronRight, Loader2, Mic, BookOpen, Wrench, Users, BarChart2, MessageSquare, CheckCircle, Star } from 'lucide-react';

interface PrepCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  type: string;
}

const CATEGORIES: PrepCategory[] = [
  { id: 'behavioral', title: 'Behavioural Questions', description: 'STAR method & customer handling', icon: Users, color: 'from-[#4A7FB4] to-[#1F5D95]', type: 'behavioral' },
  { id: 'technical', title: 'Trade & Technical', description: 'Diagnostics, service process & EV', icon: Wrench, color: 'from-[#12B37E] to-[#0A8A5F]', type: 'technical' },
  { id: 'hr', title: 'HR Interview', description: 'Salary, incentives & CTC discussion', icon: BarChart2, color: 'from-[#FF8533] to-[#E05D00]', type: 'hr' },
  { id: 'industry', title: 'Auto Industry', description: 'Sector trends, EV shift & OEM norms', icon: BookOpen, color: 'from-[#FF8533] to-[#B84B00]', type: 'industry' },
];

interface Question {
  question: string;
  tips: string[];
  sampleAnswer: string;
}

const SAMPLE_QUESTIONS: Record<string, Question[]> = {
  behavioral: [
    {
      question: 'Tell me about yourself.',
      tips: ['Keep it under 2 minutes', 'Mention your trade, brands worked on and years of experience', 'End with why you want this role'],
      sampleAnswer: 'Start with your current role, mention 1-2 measurable achievements, then connect to this opening. E.g., "I\'m a Service Advisor with 4 years at a Maruti Suzuki Arena workshop, handling around 12 repair orders a day. I improved our CSI score from 78 to 89 by tightening the PSF follow-up process..."'
    },
    {
      question: 'Tell me about a difficult customer you handled.',
      tips: ['Use STAR: Situation, Task, Action, Result', 'Show you stayed calm and took ownership', 'Quantify the outcome where you can'],
      sampleAnswer: 'Situation: A customer\'s vehicle came back twice for the same AC complaint. Task: Retain the customer and close the issue. Action: I personally road-tested it with the technician, found a faulty condenser fan relay the earlier job had missed, arranged the part the same day and gave a free wash. Result: Vehicle delivered that evening, customer gave us a 5-star CSI rating and still services with us.'
    },
    {
      question: 'Why do you want to leave your current job?',
      tips: ['Stay positive', 'Focus on growth — bigger workshop, more bays, new brand', 'Never badmouth your employer or dealer principal'],
      sampleAnswer: 'I\'ve learned a lot at my current dealership, but it\'s a 6-bay workshop and I\'ve reached the ceiling there. I want to move to a larger setup where I can handle higher RO volumes and grow towards a Workshop Manager role.'
    },
  ],
  technical: [
    {
      question: 'A customer complains of poor mileage. How do you diagnose it?',
      tips: ['Start with the cheapest and most common causes', 'Mention that you would verify the complaint first', 'Show a structured approach, not guesswork'],
      sampleAnswer: 'First I verify the actual mileage and driving pattern — many complaints are usage-related. Then I check tyre pressure, air filter, spark plugs and clutch slippage. Next, an OBD scan for stored fault codes, then fuel injector condition and O2 sensor readings. Only after that would I suspect anything major.'
    },
    {
      question: 'What safety steps do you follow before working on an EV?',
      tips: ['HV safety is a red-flag topic — never sound casual', 'Mention PPE and isolation explicitly', 'Reference OEM procedure'],
      sampleAnswer: 'I follow the OEM shutdown procedure: switch off, remove the service disconnect plug, wait the specified capacitor discharge time (usually 5-10 minutes), verify zero voltage with an insulated multimeter, and wear Class-0 insulated gloves with a face shield. I also cordon off the bay and never work on HV alone.'
    },
    {
      question: 'What are the BS6 emission norms and how did they change servicing?',
      tips: ['Show you keep up with regulation', 'Mention specific hardware changes', 'Link it to day-to-day workshop work'],
      sampleAnswer: 'BS6 brought tighter NOx and particulate limits. Practically it added DPF and SCR/AdBlue systems on diesels, OBD-II monitoring, and stricter fuel quality requirements. In the workshop it means DPF regeneration cycles, AdBlue top-ups, and far more reliance on the scanner for emission-related faults.'
    },
  ],
  hr: [
    {
      question: 'What are your salary expectations?',
      tips: ['Research the band for your role and city', 'Give a range, and clarify fixed vs incentive', 'Ask about the incentive structure'],
      sampleAnswer: 'For a Service Advisor role with my 4 years of experience, I\'m looking at ₹3.5-4.5 lakh per annum fixed. I\'m flexible on the split if there\'s a strong incentive component — could you tell me how the incentive scheme works here?'
    },
    {
      question: 'Where do you see yourself in 5 years?',
      tips: ['Show a realistic dealership career path', 'Mention certifications you want to complete', 'Align with the employer\'s growth'],
      sampleAnswer: 'In 5 years I\'d like to be a Workshop Manager — running a full bay team, owning the CSI and labour productivity numbers. I plan to complete my OEM L3/L4 technician certifications along the way and take on floor supervision responsibility first.'
    },
  ],
  industry: [
    {
      question: 'What trends are shaping the automobile industry right now?',
      tips: ['Mention EV transition, connected vehicles and used-car growth', 'Tie the trend to the role you are applying for', 'Show you follow the sector'],
      sampleAnswer: 'The biggest shift is EV adoption — which changes the service model entirely, since EVs need fewer periodic services but far more electrical and battery diagnostics skill. Alongside that: connected-car telematics driving predictive service, strong growth in organised pre-owned sales, and dealerships depending more on service and spares revenue as new-car margins stay thin.'
    },
  ],
};

export default function InterviewPrepPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [generatingQuestion, setGeneratingQuestion] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [practiceMode, setPracticeMode] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gettingFeedback, setGettingFeedback] = useState(false);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  async function generateQuestion() {
    if (!jobRole.trim()) return;
    setGeneratingQuestion(true);
    setAiQuestion('');
    setAiAnswer('');
    try {
      const res = await apiFetch('/api/ai/interview-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: jobRole, type: activeCategory || 'general' }),
      });
      const data = await res.json();
      setAiQuestion(data.question || 'Tell me about your experience with this role.');
      setAiAnswer(data.sampleAnswer || '');
    } catch {
      setAiQuestion('What are your key strengths for this role?');
      setAiAnswer('Focus on your trade skills, brands you have worked on, and how you handle customers...');
    } finally {
      setGeneratingQuestion(false);
    }
  }

  async function getFeedback() {
    if (!userAnswer.trim() || !aiQuestion) return;
    setGettingFeedback(true);
    try {
      const res = await apiFetch('/api/ai/career-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Please evaluate my interview answer for this question: "${aiQuestion}"\n\nMy answer: "${userAnswer}"\n\nProvide constructive feedback on clarity, completeness, structure, and what I could improve.`,
          history: [],
        }),
      });
      const data = await res.json();
      setFeedback(data.content || 'Good answer! Consider adding more specific examples and quantifiable results.');
    } catch {
      setFeedback('Good attempt! Structure your answer using the STAR method for more impact.');
    } finally {
      setGettingFeedback(false);
    }
  }

  const questions = activeCategory ? (SAMPLE_QUESTIONS[activeCategory] || []) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Interview Preparation</h1>
        <p className="text-ink-muted mt-1">Practice makes perfect — prepare for your next interview with AI</p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(isActive ? null : cat.id); setExpandedQ(null); }}
              className={`p-4 rounded-[16px] text-left border transition-all ${isActive ? 'border-brand-100 bg-brand-50' : 'border-line bg-white hover:border-line'}`}
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-ink">{cat.title}</p>
              <p className="text-xs text-ink-muted mt-1">{cat.description}</p>
            </button>
          );
        })}
      </div>

      {/* Sample Questions */}
      {questions.length > 0 && (
        <div className="bg-white border border-line rounded-[16px] overflow-hidden">
          <div className="p-5 border-b border-line">
            <h2 className="font-bold text-ink">Common Questions</h2>
          </div>
          <div className="divide-y divide-line-soft">
            {questions.map((q, i) => (
              <div key={i} className="p-5">
                <button
                  onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                  className="flex items-center justify-between w-full text-left gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-xs text-brand-600 font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium text-ink">{q.question}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-ink-muted transition-transform shrink-0 ${expandedQ === i ? 'rotate-90' : ''}`} />
                </button>
                {expandedQ === i && (
                  <div className="mt-4 ml-9 space-y-4 animate-fade-in">
                    <div className="bg-brand-50 border border-brand-100 rounded-[16px] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-brand-600" />
                        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">Pro Tips</span>
                      </div>
                      <ul className="space-y-1">
                        {q.tips.map((tip, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-ink-soft">
                            <CheckCircle className="w-4 h-4 text-[#0A7A54] shrink-0 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white border border-line rounded-[16px] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-ink-muted" />
                        <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide">Sample Answer</span>
                      </div>
                      <p className="text-sm text-ink-soft leading-relaxed">{q.sampleAnswer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Practice Mode */}
      <div className="bg-white border border-line rounded-[16px] p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[16px] bg-gradient-to-br from-[#FF8533] to-[#B84B00] flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-ink">AI Mock Interview</h2>
            <p className="text-xs text-ink-muted">Get AI-generated questions and instant feedback on your answers</p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            value={jobRole}
            onChange={e => setJobRole(e.target.value)}
            placeholder="Enter target job role (e.g. Service Advisor, EV Technician)"
            className="flex-1 bg-canvas border border-line text-ink placeholder-ink-faint rounded-[16px] px-4 py-3 text-sm focus:outline-none focus:border-brand-300"
          />
          <button
            onClick={generateQuestion}
            disabled={generatingQuestion || !jobRole.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-[#1F5D95] to-[#0F4C81] hover:from-[#25689f] hover:to-[#12558f] disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-[16px] text-sm transition-all"
          >
            {generatingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
            Generate
          </button>
        </div>

        {aiQuestion && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-brand-50 border border-brand-100 rounded-[16px] p-4">
              <p className="text-xs text-brand-600 font-semibold uppercase tracking-wide mb-2">Interview Question</p>
              <p className="text-ink font-medium">{aiQuestion}</p>
            </div>

            <div>
              <label className="block text-sm text-ink-soft mb-2">Your Answer</label>
              <textarea
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                rows={5}
                placeholder="Type your answer here... Think out loud, structure using STAR method..."
                className="w-full bg-canvas border border-line text-ink placeholder-ink-faint rounded-[16px] px-4 py-3 text-sm focus:outline-none focus:border-brand-300 resize-none"
              />
              <button
                onClick={getFeedback}
                disabled={gettingFeedback || !userAnswer.trim()}
                className="mt-3 flex items-center gap-2 bg-positive hover:bg-positive disabled:opacity-50 text-ink font-semibold px-5 py-2.5 rounded-[16px] text-sm transition-all"
              >
                {gettingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Get AI Feedback
              </button>
            </div>

            {feedback && (
              <div className="bg-positive-soft border border-[#BEE7D8] rounded-[16px] p-4 animate-fade-in">
                <p className="text-xs text-[#0A7A54] font-semibold uppercase tracking-wide mb-2">AI Feedback</p>
                <p className="text-ink-soft text-sm leading-relaxed">{feedback}</p>
              </div>
            )}

            {aiAnswer && (
              <div className="bg-white border border-line rounded-[16px] p-4">
                <p className="text-xs text-ink-muted font-semibold uppercase tracking-wide mb-2">Sample Strong Answer</p>
                <p className="text-ink-soft text-sm leading-relaxed">{aiAnswer}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
