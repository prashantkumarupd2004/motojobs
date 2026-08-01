import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export default openai;

/**
 * Injected as a system message on every call. Without it the model defaults to
 * software-industry assumptions — reading "technical" as programming, quoting
 * IT salaries, and expecting university degrees instead of ITI/diploma trades.
 */
const AUTOMOTIVE_CONTEXT = `You are a hiring specialist for Motojobs.in, an India-focused job platform serving ONLY the automobile sector: car and two-wheeler dealerships, authorised service centres, multi-brand workshops, body shops, OEMs, auto component manufacturers, fleet operators and EV companies.

Ground every answer in Indian auto retail reality:
- Typical roles: Sales Consultant, Service Advisor, Automobile Technician, Diesel Mechanic, Auto Electrician, Denter, Body Shop Painter, Spare Parts Executive, Workshop Manager, Showroom Manager, Telecaller/CRE, EV Technician, Used Car Evaluator.
- Qualifications are ITI trades (Motor Mechanic Vehicle, Diesel Mechanic, Auto Electrician), Diploma in Automobile/Mechanical Engineering, B.E./B.Tech Mechanical, and OEM technician certifications (L1-L4). A valid LMV/MCWG driving licence is often mandatory. Do NOT assume a university degree.
- "Software" here means DMS/DBM (Dealer Management System), Tally, CRM tools and the Vahan/Sarathi portals — never programming languages or frameworks.
- "Technical skill" means mechanical, electrical, diagnostic or EV-battery competence — engine diagnostics, wheel alignment, BS6 emission norms, denting and painting, HV battery safety — NOT software engineering.
- Use sector KPIs: repair order (RO) count, labour hour productivity, service load per bay, first-time-right, CSI/SSI scores, PSF follow-up calls, walk-in-to-booking conversion, per-vehicle revenue, parts fill rate, warranty claim accuracy.
- Salaries are annual INR and modest compared to IT: technician roughly 1.5-3 LPA, Service Advisor 2.4-4.5 LPA, Sales Consultant 1.8-3.6 LPA, Workshop Manager 6-11 LPA. Never quote IT-sector figures.

Never suggest programming languages, frameworks, IT tools or software-engineering practices.`;

async function completeJSON(prompt: string, maxTokens: number) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: AUTOMOTIVE_CONTEXT },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    max_tokens: maxTokens,
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

// AI Resume Builder
export async function generateResumeContent(data: {
  name: string;
  email: string;
  phone: string;
  experience: Array<{ title: string; company: string; duration: string; description: string }>;
  education: Array<{ degree: string; institution: string; year: string }>;
  skills: string[];
  targetRole: string;
}) {
  const prompt = `Create a professional automobile-sector resume for the following person targeting a ${data.targetRole} role.

Personal Info:
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}

Work Experience:
${data.experience.map(exp => `- ${exp.title} at ${exp.company} (${exp.duration}): ${exp.description}`).join('\n')}

Education:
${data.education.map(edu => `- ${edu.degree} from ${edu.institution} (${edu.year})`).join('\n')}

Skills: ${data.skills.join(', ')}

Generate a professional summary, improve the bullet points for each job using action verbs and auto-sector metrics (RO count, CSI score, conversion rate, bay productivity, parts fill rate), and organize skills by category. Mention vehicle brands and OEM certifications where relevant. Return as JSON with fields: summary, experience (array with improvedBullets), skillCategories (object with category:skills[]).`;

  return completeJSON(prompt, 2000);
}

// AI Job Description Generator
export async function generateJobDescription(data: {
  title: string;
  company: string;
  industry: string;
  experience: string;
  skills: string[];
  responsibilities: string;
}) {
  const prompt = `Generate a professional, compelling job description for an automobile-sector role:

Job Title: ${data.title}
Employer: ${data.company}
Employer Type: ${data.industry}
Experience Required: ${data.experience}
Key Skills: ${data.skills.join(', ')}
Core Responsibilities: ${data.responsibilities}

Requirements must reflect ITI/diploma trades and OEM certifications rather than degrees where appropriate. Benefits should be realistic for Indian auto retail (performance incentives, PF and ESI, uniform, tool kit, OEM training, overtime).

Return JSON with: description (overview paragraph), responsibilities (array of 8-10 bullet points), requirements (array of 6-8 bullet points), niceToHave (array of 3-4 items), benefits (array of 5-6 items).`;

  return completeJSON(prompt, 1500);
}

// AI Candidate Screening
export async function screenCandidate(data: {
  jobTitle: string;
  jobRequirements: string;
  jobSkills: string[];
  candidateProfile: {
    experience: number;
    skills: string[];
    education: string;
    summary: string;
  };
}) {
  const prompt = `Evaluate this candidate for the automobile-sector position and provide a screening score.

Job: ${data.jobTitle}
Requirements: ${data.jobRequirements}
Required Skills: ${data.jobSkills.join(', ')}

Candidate Profile:
- Experience: ${data.candidateProfile.experience} years
- Skills: ${data.candidateProfile.skills.join(', ')}
- Education: ${data.candidateProfile.education}
- Summary: ${data.candidateProfile.summary}

Weigh hands-on trade experience, vehicle brands worked on, and relevant ITI/diploma/OEM certification at least as heavily as formal education.

Return JSON with: score (0-100), matchedSkills (array), missingSkills (array), strengths (array of 3), concerns (array), recommendation (string: "Strong Match", "Good Match", "Partial Match", or "Not a Match"), summary (2-3 sentences).`;

  return completeJSON(prompt, 800);
}

// AI Matching Engine
export async function matchCandidateToJobs(data: {
  candidateProfile: {
    skills: string[];
    experience: number;
    education: string;
    targetRoles: string[];
  };
  jobs: Array<{ id: string; title: string; skills: string[]; experience: string }>;
}) {
  const prompt = `Match this automobile-sector candidate to the most suitable jobs and rank them.

Candidate:
- Skills: ${data.candidateProfile.skills.join(', ')}
- Experience: ${data.candidateProfile.experience} years
- Education: ${data.candidateProfile.education}
- Target Roles: ${data.candidateProfile.targetRoles.join(', ')}

Jobs:
${data.jobs.map((j, i) => `${i + 1}. ${j.title} (Skills: ${j.skills.join(', ')}, Experience: ${j.experience})`).join('\n')}

Consider whether the trade transfers — for example a two-wheeler mechanic moving to four-wheeler service, or a petrol technician moving to EV, needs retraining.

Return JSON with: matches (array of {jobIndex, score 0-100, reasons array}).`;

  return completeJSON(prompt, 800);
}

// AI Interview Kit Generator
export async function generateInterviewKit(data: {
  jobTitle: string;
  skills: string[];
  experience: string;
  industry: string;
}) {
  const prompt = `Create a comprehensive interview kit for hiring a ${data.jobTitle} at an automobile business.

Required Skills: ${data.skills.join(', ')}
Experience Level: ${data.experience}
Employer Type: ${data.industry}

hardSkillQuestions must be hands-on mechanical, electrical, diagnostic, EV or process questions that a workshop manager or showroom manager would actually ask on the floor — never software questions.
safetyQuestions must cover workshop safety, lifting and jacking, high-voltage EV safety and PPE.

Return JSON with: hardSkillQuestions (array of 8 objects with question, expectedAnswer, difficulty), behavioralQuestions (array of 5 Q&A objects), situationalQuestions (array of 4 Q&A covering angry customers, repeat repairs and delivery delays), safetyQuestions (array of 3 Q&A objects), evaluationCriteria (array of 6 criteria with name and weight%), redFlags (array of 5 warning signs to watch for).`;

  return completeJSON(prompt, 2500);
}

// AI Career Assistant Chat
export async function careerAssistantChat(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  userContext: { role?: string; skills?: string[]; experience?: number }
) {
  const systemPrompt = `${AUTOMOTIVE_CONTEXT}

You are the Motojobs.in AI Career Assistant, a helpful career counsellor for automobile-sector professionals.
You help candidates with:
- Finding the right auto-sector role for their trade and city
- Improving their resume for dealership and workshop hiring
- Preparing for service, sales and workshop interviews
- Career paths within a dealership (Technician to Floor Supervisor to Workshop Manager, Sales Consultant to Showroom Manager)
- Salary and incentive expectations at realistic Indian auto retail levels
- Upskilling — OEM certifications, EV and diagnostics training

User context: ${JSON.stringify(userContext)}

Be encouraging, specific, and actionable. Keep responses concise but valuable.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    max_tokens: 600,
  });

  return response.choices[0].message.content || "I apologize, I couldn't process your request. Please try again.";
}
