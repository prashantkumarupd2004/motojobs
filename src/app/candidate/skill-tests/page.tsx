'use client';
import { useState } from 'react';
import { CheckSquare, Clock, Trophy, ChevronRight, Loader2, CheckCircle, XCircle, BarChart2 } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Test {
  id: string;
  title: string;
  category: string;
  duration: number;
  questions: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  color: string;
}

const TESTS: Test[] = [
  { id: 'service-advisor', title: 'Service Advisor Process', category: 'Service', duration: 20, questions: 15, level: 'Intermediate', color: 'grad-brand' },
  { id: 'engine-diagnostics', title: 'Engine Diagnostics', category: 'Technical', duration: 25, questions: 20, level: 'Advanced', color: 'bg-gradient-to-r from-[#12B37E] to-[#0A8A5F]' },
  { id: 'showroom-sales', title: 'Showroom Sales Process', category: 'Sales', duration: 20, questions: 15, level: 'Beginner', color: 'grad-ignite' },
  { id: 'ev-basics', title: 'EV & Battery Basics', category: 'EV', duration: 25, questions: 15, level: 'Intermediate', color: 'bg-gradient-to-r from-[#4A7FB4] to-[#0C3D68]' },
  { id: 'spare-parts', title: 'Spare Parts & Inventory', category: 'Parts', duration: 20, questions: 15, level: 'Beginner', color: 'bg-gradient-to-r from-[#E8A33D] to-[#C77700]' },
  { id: 'body-shop', title: 'Body Shop & Estimation', category: 'Body Shop', duration: 25, questions: 15, level: 'Intermediate', color: 'bg-gradient-to-r from-[#FF8533] to-[#B84B00]' },
];

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'A customer reports the engine overheating. Which check comes FIRST during reception?',
    options: ['Replace the radiator immediately', 'Check coolant level and look for visible leaks', 'Recommend a full engine overhaul', 'Book the vehicle for a body shop inspection'],
    correct: 1,
    explanation: 'Basic diagnosis always starts with the simplest cause. Coolant level and visible leaks are checked before recommending any major repair or part replacement.'
  },
  {
    id: 2,
    question: 'What is a Job Card used for in a dealership workshop?',
    options: ['Recording employee attendance', 'Recording customer complaints, work to be done and parts used on a vehicle', 'Tracking showroom walk-ins', 'Filing insurance claims only'],
    correct: 1,
    explanation: 'The Job Card is the core service document — it records the customer complaint, the diagnosis, work performed, parts consumed and labour hours for each repair order.'
  },
  {
    id: 3,
    question: 'In service KPIs, what does CSI stand for?',
    options: ['Customer Service Invoice', 'Customer Satisfaction Index', 'Certified Service Inspection', 'Complaint Severity Indicator'],
    correct: 1,
    explanation: 'CSI (Customer Satisfaction Index) measures customer satisfaction after a service visit. Its sales-side counterpart is SSI (Sales Satisfaction Index).'
  },
  {
    id: 4,
    question: 'When working on an electric vehicle, what must be done BEFORE touching any high-voltage component?',
    options: ['Disconnect the 12V battery only', 'Isolate the HV system, wait for capacitor discharge and wear insulated gloves', 'Simply switch off the ignition', 'Drain the coolant'],
    correct: 1,
    explanation: 'HV safety requires full isolation of the high-voltage system, a wait period for capacitors to discharge, and Class-0 insulated gloves. Switching off the ignition alone is not sufficient.'
  },
  {
    id: 5,
    question: 'A customer walks into the showroom. What is the correct first step in the sales process?',
    options: ['Quote the lowest price immediately', 'Greet, understand their requirement and qualify their need', 'Ask them to book a test drive right away', 'Send them directly to the finance desk'],
    correct: 1,
    explanation: 'The standard showroom process is greet → need analysis → product presentation → test drive → negotiation → booking. Price is discussed only after the requirement is understood.'
  },
];

type TestState = 'list' | 'active' | 'result';

export default function SkillTestsPage() {
  const [testState, setTestState] = useState<TestState>('list');
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState<{ score: number; total: number; answers: number[] } | null>(null);

  function startTest(test: Test) {
    setActiveTest(test);
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setShowExplanation(false);
    setTimeLeft(test.duration * 60);
    setTestState('active');
  }

  function handleAnswer(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
    setShowExplanation(true);
  }

  function nextQuestion() {
    const newAnswers = [...answers, selected ?? -1];
    if (currentQ < SAMPLE_QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setShowExplanation(false);
    } else {
      const score = newAnswers.filter((a, i) => a === SAMPLE_QUESTIONS[i].correct).length;
      setResults({ score, total: SAMPLE_QUESTIONS.length, answers: newAnswers });
      setTestState('result');
    }
  }

  const LEVEL_STYLES = {
    Beginner: 'bg-positive-soft text-positive border-positive/25',
    Intermediate: 'bg-caution-soft text-caution border-caution/25',
    Advanced: 'bg-critical-soft text-critical border-critical/25',
  };

  if (testState === 'active' && activeTest) {
    const q = SAMPLE_QUESTIONS[currentQ];
    const progress = ((currentQ) / SAMPLE_QUESTIONS.length) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[22px] font-extrabold text-ink tracking-[-0.03em] truncate">{activeTest.title}</h1>
            <p className="text-[14px] text-ink-muted mt-1">Question {currentQ + 1} of {SAMPLE_QUESTIONS.length}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-caution bg-caution-soft border border-caution/25 px-3.5 py-2.5 rounded-[14px]">
            <Clock className="w-4 h-4" />
            <span className="text-[13.5px] font-bold tabular-nums">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="w-full h-2 bg-line-soft rounded-full overflow-hidden">
          <div className="h-full grad-brand rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>

        <div className="surface sheen p-6 sm:p-8 space-y-6">
          <h2 className="text-ink font-bold text-[18px] leading-[1.55] tracking-[-0.02em]">{q.question}</h2>
          <div className="space-y-3">
            {q.options.map((option, i) => {
              let style = 'border-line bg-white text-ink-soft hover:border-brand-300 hover:bg-brand-50/50 hover:-translate-y-0.5';
              if (selected !== null) {
                if (i === q.correct) style = 'border-positive/40 bg-positive-soft text-positive font-semibold';
                else if (i === selected && i !== q.correct) style = 'border-critical/40 bg-critical-soft text-critical font-semibold';
                else style = 'border-line-soft bg-canvas text-ink-faint';
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null} className={`w-full text-left px-5 py-4 rounded-[14px] border text-[14.5px] shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${style}`}>
                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span> {option}
                </button>
              );
            })}
          </div>
          {showExplanation && (
            <div className="bg-informative-soft border border-brand-100 rounded-[16px] p-5 animate-fade-in">
              <p className="text-[11px] text-brand-600 font-bold uppercase tracking-[0.1em] mb-2">Explanation</p>
              <p className="text-ink-soft text-[14.5px] leading-[1.7]">{q.explanation}</p>
            </div>
          )}
          {selected !== null && (
            <button onClick={nextQuestion} className="sweep press w-full grad-brand text-white font-semibold py-3.5 rounded-[14px] shadow-[0_4px_12px_rgba(15,76,129,0.20)] hover:shadow-[0_8px_22px_rgba(15,76,129,0.30)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
              {currentQ < SAMPLE_QUESTIONS.length - 1 ? 'Next Question' : 'View Results'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (testState === 'result' && results) {
    const percentage = Math.round((results.score / results.total) * 100);
    const passed = percentage >= 60;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="surface-raised sheen text-center py-10 px-6 animate-scale-in">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 ${passed ? 'bg-positive-soft border-2 border-positive/30' : 'bg-critical-soft border-2 border-critical/30'}`}>
            {passed ? <Trophy className="w-11 h-11 text-positive" strokeWidth={1.9} /> : <XCircle className="w-11 h-11 text-critical" strokeWidth={1.9} />}
          </div>
          <h2 className="text-[26px] font-extrabold text-ink tracking-[-0.035em] mb-2">{passed ? 'Test Passed! 🎉' : 'Test Completed'}</h2>
          <p className="text-ink-muted text-[15px] mb-8">{activeTest?.title}</p>
          <div className="flex items-center justify-center gap-10 sm:gap-14">
            <div className="text-center">
              <div className={`text-[38px] font-extrabold tracking-[-0.04em] leading-none ${passed ? 'text-positive' : 'text-critical'}`}>{percentage}%</div>
              <div className="text-ink-faint text-[12px] font-semibold uppercase tracking-[0.1em] mt-2.5">Score</div>
            </div>
            <div className="w-px h-14 bg-line-soft" />
            <div className="text-center">
              <div className="text-[38px] font-extrabold text-ink tracking-[-0.04em] leading-none">{results.score}/{results.total}</div>
              <div className="text-ink-faint text-[12px] font-semibold uppercase tracking-[0.1em] mt-2.5">Correct</div>
            </div>
          </div>
        </div>

        <div className="surface sheen p-6 sm:p-8 space-y-3">
          <h3 className="text-[17px] font-bold text-ink tracking-[-0.025em] mb-4">Answer Review</h3>
          {SAMPLE_QUESTIONS.map((q, i) => {
            const isCorrect = results.answers[i] === q.correct;
            return (
              <div key={q.id} className={`flex items-start gap-3 p-4 rounded-[14px] border ${isCorrect ? 'bg-positive-soft/60 border-positive/20' : 'bg-critical-soft/60 border-critical/20'}`}>
                {isCorrect ? <CheckCircle className="w-5 h-5 text-positive shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-critical shrink-0 mt-0.5" />}
                <div className="min-w-0">
                  <p className="text-[14.5px] text-ink font-semibold leading-[1.6]">{q.question}</p>
                  <p className="text-[13px] text-ink-muted mt-1">Correct: {q.options[q.correct]}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => setTestState('list')} className="sweep press w-full grad-brand text-white font-semibold py-3.5 rounded-[14px] shadow-[0_4px_12px_rgba(15,76,129,0.20)] hover:shadow-[0_8px_22px_rgba(15,76,129,0.30)] hover:-translate-y-0.5 transition-all duration-300">
          Back to Tests
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-[28px] font-extrabold text-ink tracking-[-0.035em]">Skill Assessments</h1>
        <p className="text-ink-muted text-[15px] mt-1.5">Prove your expertise and boost your profile score</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TESTS.map(test => (
          <div key={test.id} className="surface lift overflow-hidden group flex flex-col">
            <div className={`h-2 ${test.color}`} />
            <div className="p-6 space-y-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[16px] font-bold text-ink tracking-[-0.025em] group-hover:text-brand-700 transition-colors duration-300">{test.title}</h3>
                  <p className="text-[12.5px] text-ink-muted mt-1">{test.category}</p>
                </div>
                <span className={`shrink-0 border rounded-full px-2.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] ${LEVEL_STYLES[test.level]}`}>{test.level}</span>
              </div>
              <div className="flex items-center gap-4 text-[13px] text-ink-muted font-medium">
                <div className="flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-ink-faint" />{test.questions} questions</div>
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-ink-faint" />{test.duration} min</div>
              </div>
              <button onClick={() => startTest(test)} className={`sweep press mt-auto w-full ${test.color} text-ink font-semibold py-3 rounded-[14px] text-[14px] shadow-[0_3px_10px_rgba(16,24,40,0.12)] hover:shadow-[0_8px_20px_rgba(16,24,40,0.16)] hover:-translate-y-0.5 transition-all duration-300`}>
                Start Test
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Banner */}
      <div className="surface-raised sheen relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 grid-precision opacity-50 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-[13px] bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5 text-brand-600" strokeWidth={2.1} />
            </div>
            <h3 className="text-[17px] font-bold text-ink tracking-[-0.025em]">Why take skill tests?</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { value: '3x', label: 'More profile views with verified skills' },
              { value: '85%', label: 'Recruiters prefer verified candidates' },
              { value: '+20%', label: 'Profile score boost per test passed' },
            ].map(({ value, label }) => (
              <div key={value} className="text-center p-5 bg-white border border-line-soft rounded-[16px] shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                <div className="text-[28px] font-extrabold text-brand-600 tracking-[-0.035em] leading-none">{value}</div>
                <div className="text-[13px] text-ink-muted mt-2.5 leading-[1.6]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
