import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// Built-in automotive skill assessments. IDs match TESTS in src/app/candidate/skill-tests/page.tsx
const ASSESSMENTS = [
  {
    id: "service-advisor",
    title: "Service Advisor Process",
    category: "Service",
    description: "Job cards, service KPIs and customer handling at the service reception",
    duration: 20,
    passingScore: 70,
    questions: [
      { id: "q1", question: "What is recorded on a Job Card?", options: ["Employee attendance", "Customer complaint, work to be done and parts used", "Showroom walk-in count", "Only the final invoice amount"], correctAnswer: 1, explanation: "The Job Card is the core workshop document capturing the customer complaint, diagnosis, work performed, parts consumed and labour hours." },
      { id: "q2", question: "In service operations, what does CSI measure?", options: ["Cost of Service Inventory", "Customer Satisfaction Index", "Certified Service Inspection", "Claim Settlement Interval"], correctAnswer: 1, explanation: "CSI (Customer Satisfaction Index) measures post-service customer satisfaction. SSI is its sales-side equivalent." },
      { id: "q3", question: "What is a PSF call?", options: ["Pre-Service Fitment check", "Post Service Follow-up call to the customer", "Parts Supply Forecast", "Paint Shop Finishing"], correctAnswer: 1, explanation: "A PSF (Post Service Follow-up) call is made a few days after delivery to confirm the customer is satisfied and the complaint is resolved." },
      { id: "q4", question: "A customer refuses a recommended repair. What should you do?", options: ["Carry out the repair anyway", "Record the refusal on the job card and explain the risk", "Refuse to deliver the vehicle", "Increase the labour charge"], correctAnswer: 1, explanation: "Always document the customer's refusal on the job card after explaining the safety or cost risk. This protects both the customer and the workshop." },
      { id: "q5", question: "What does 'first-time-right' mean in a workshop?", options: ["The first customer of the day is served first", "The complaint is fully resolved in a single visit", "New vehicles get priority", "The first estimate given is final"], correctAnswer: 1, explanation: "First-time-right measures the share of vehicles whose complaint is fully fixed in one visit, without a repeat repair." },
    ],
  },
  {
    id: "engine-diagnostics",
    title: "Engine Diagnostics",
    category: "Technical",
    description: "Fault finding, emission systems and diagnostic tools",
    duration: 25,
    passingScore: 70,
    questions: [
      { id: "q1", question: "A customer reports engine overheating. What do you check FIRST?", options: ["Replace the radiator", "Coolant level and visible leaks", "Recommend an engine overhaul", "Change the engine oil"], correctAnswer: 1, explanation: "Diagnosis always starts with the simplest and most common cause — coolant level and leaks — before recommending major work." },
      { id: "q2", question: "What does an OBD scanner read from the vehicle?", options: ["Tyre tread depth", "Diagnostic Trouble Codes stored by the ECU", "Paint thickness", "Wheel alignment angles"], correctAnswer: 1, explanation: "An OBD scanner reads Diagnostic Trouble Codes (DTCs) and live sensor data from the Engine Control Unit." },
      { id: "q3", question: "Which component was added on BS6 diesel vehicles to reduce NOx?", options: ["Turbocharger", "SCR system using AdBlue (DEF)", "Alternator", "Catalytic converter only"], correctAnswer: 1, explanation: "BS6 diesels use Selective Catalytic Reduction with AdBlue to convert NOx into nitrogen and water. DPF handles particulates." },
      { id: "q4", question: "Engine cranks but does not start. Which is NOT a likely cause?", options: ["No fuel supply", "Faulty spark or glow plugs", "Worn brake pads", "Failed crankshaft position sensor"], correctAnswer: 2, explanation: "Brake pads have no role in starting. Starting faults come down to fuel, spark/compression or a sensor failure." },
      { id: "q5", question: "What is the purpose of a DPF?", options: ["Increase engine power", "Trap particulate matter from diesel exhaust", "Filter engine oil", "Cool the turbocharger"], correctAnswer: 1, explanation: "The Diesel Particulate Filter traps soot from the exhaust and periodically burns it off during regeneration." },
    ],
  },
  {
    id: "showroom-sales",
    title: "Showroom Sales Process",
    category: "Sales",
    description: "Walk-in handling, test drives, finance and delivery",
    duration: 20,
    passingScore: 70,
    questions: [
      { id: "q1", question: "What is the correct first step when a customer walks into the showroom?", options: ["Quote the lowest price", "Greet and understand their requirement", "Send them to the finance desk", "Ask for a booking amount"], correctAnswer: 1, explanation: "The standard process is greet → need analysis → product presentation → test drive → negotiation → booking. Price comes after understanding the requirement." },
      { id: "q2", question: "What does PDI stand for?", options: ["Pre-Delivery Inspection", "Post Delivery Invoice", "Personal Driving Instruction", "Parts Delivery Index"], correctAnswer: 0, explanation: "Pre-Delivery Inspection is the mandatory check of a vehicle before handing it over to the customer." },
      { id: "q3", question: "What is walk-in-to-booking conversion?", options: ["Time taken to deliver a car", "Share of showroom visitors who place a booking", "Number of test drives per day", "Cost per enquiry"], correctAnswer: 1, explanation: "It measures how many showroom walk-ins convert into confirmed bookings — a core sales consultant KPI." },
      { id: "q4", question: "During a test drive, what should the sales consultant do?", options: ["Let the customer drive alone", "Accompany the customer and explain features relevant to their need", "Play loud music", "Discuss only the price"], correctAnswer: 1, explanation: "The consultant accompanies the customer, follows a planned route, and highlights features that match the need identified earlier." },
      { id: "q5", question: "Which document is mandatory for vehicle registration?", options: ["Only the invoice", "Form 20 with invoice, insurance and Form 21/22", "Only the insurance policy", "Only a driving licence"], correctAnswer: 1, explanation: "Registration requires Form 20 along with the sale invoice, Form 21 (sale certificate), Form 22 (roadworthiness) and valid insurance." },
    ],
  },
  {
    id: "ev-basics",
    title: "EV & Battery Basics",
    category: "EV",
    description: "High-voltage safety, battery systems and EV servicing",
    duration: 25,
    passingScore: 70,
    questions: [
      { id: "q1", question: "Before working on a high-voltage EV component you must:", options: ["Switch off the ignition only", "Isolate the HV system, wait for capacitor discharge and wear insulated gloves", "Disconnect the 12V battery only", "Drain the coolant"], correctAnswer: 1, explanation: "HV safety requires full isolation, the specified capacitor discharge wait, zero-voltage verification and Class-0 insulated gloves." },
      { id: "q2", question: "What does BMS stand for in an electric vehicle?", options: ["Brake Modulation System", "Battery Management System", "Body Maintenance Schedule", "Basic Motor Setup"], correctAnswer: 1, explanation: "The Battery Management System monitors cell voltage, temperature and state of charge, and protects the pack from over-charge and over-discharge." },
      { id: "q3", question: "Which colour cabling normally identifies high-voltage circuits in an EV?", options: ["Green", "Orange", "Blue", "Black"], correctAnswer: 1, explanation: "Orange is the industry standard colour for high-voltage cabling and connectors, warning technicians not to handle them unprotected." },
      { id: "q4", question: "Compared to a petrol car, EV periodic service typically involves:", options: ["More frequent oil changes", "No engine oil or filter changes, but battery and brake checks", "Identical servicing", "Only tyre rotation"], correctAnswer: 1, explanation: "EVs have no engine oil, spark plugs or exhaust. Servicing focuses on battery health, coolant for thermal management, brakes and software updates." },
      { id: "q5", question: "What is regenerative braking?", options: ["A backup mechanical brake", "Recovering kinetic energy back into the battery while slowing down", "Braking using the parking brake", "Automatic emergency braking"], correctAnswer: 1, explanation: "Regenerative braking runs the motor as a generator during deceleration, converting kinetic energy back into stored charge and reducing brake pad wear." },
    ],
  },
  {
    id: "spare-parts",
    title: "Spare Parts & Inventory",
    category: "Parts",
    description: "Part identification, stock control and warranty",
    duration: 20,
    passingScore: 70,
    questions: [
      { id: "q1", question: "What is 'parts fill rate'?", options: ["Speed of filling fuel", "Share of parts demand met from available stock", "Number of parts sold per day", "Warehouse floor area used"], correctAnswer: 1, explanation: "Parts fill rate measures how often a requested part is available in stock, avoiding a customer wait or a lost sale." },
      { id: "q2", question: "Why is the VIN important when ordering a spare part?", options: ["It shows the vehicle colour only", "It identifies the exact variant and build, ensuring the correct part number", "It is the insurance number", "It is needed only for registration"], correctAnswer: 1, explanation: "The VIN identifies the precise model, variant and production batch, so the correct part number is ordered — critical where mid-year changes exist." },
      { id: "q3", question: "Which parts should be stocked in the highest quantity?", options: ["Rarely used body panels", "Fast-moving consumables like filters, brake pads and wipers", "Engine assemblies", "Discontinued model parts"], correctAnswer: 1, explanation: "Fast-moving consumables have predictable, high demand. Slow-moving and expensive assemblies are ordered against a specific job." },
      { id: "q4", question: "What is a genuine part versus an aftermarket part?", options: ["No difference", "A genuine part is OEM-approved with warranty backing; aftermarket is third-party", "Aftermarket parts are always better", "Genuine parts are always cheaper"], correctAnswer: 1, explanation: "Genuine parts are supplied or approved by the OEM and carry warranty. Aftermarket parts are third-party and may not preserve vehicle warranty." },
      { id: "q5", question: "For a warranty claim, the replaced defective part must usually be:", options: ["Thrown away immediately", "Retained and returned to the OEM for inspection", "Sold as scrap", "Given to the customer"], correctAnswer: 1, explanation: "OEMs require the failed part to be tagged, retained and returned for inspection before the warranty claim is settled." },
    ],
  },
  {
    id: "body-shop",
    title: "Body Shop & Estimation",
    category: "Body Shop",
    description: "Denting, painting, insurance claims and estimation",
    duration: 25,
    passingScore: 70,
    questions: [
      { id: "q1", question: "In an insurance claim, what is 'depreciation' on parts?", options: ["The workshop's discount", "A deduction for the age and wear of the replaced part", "The insurer's profit", "The labour charge"], correctAnswer: 1, explanation: "Insurers deduct depreciation on plastic, rubber and metal parts based on the vehicle's age, unless a zero-depreciation cover applies." },
      { id: "q2", question: "What is the correct order in body repair?", options: ["Paint, then denting, then primer", "Denting, primer/putty, sanding, painting, polishing", "Polishing, painting, denting", "Painting, sanding, denting"], correctAnswer: 1, explanation: "Panel straightening comes first, then filler and primer, sanding to level, painting in the booth, and finally polishing." },
      { id: "q3", question: "Why is a spray booth used for painting?", options: ["To save paint cost only", "To provide a dust-free, temperature-controlled and ventilated environment", "It is only for storage", "To speed up denting"], correctAnswer: 1, explanation: "A booth keeps dust out, controls temperature and airflow for even curing, and safely extracts paint fumes." },
      { id: "q4", question: "What does a surveyor do in an accident repair case?", options: ["Repairs the vehicle", "Assesses the damage on behalf of the insurer and approves the estimate", "Drives the vehicle for delivery", "Sells the insurance policy"], correctAnswer: 1, explanation: "The insurance surveyor inspects the damage, verifies it matches the reported incident, and approves which items the insurer will pay for." },
      { id: "q5", question: "When is a panel replaced rather than repaired?", options: ["Always replace", "When repair cost and time exceed replacement, or structural integrity is compromised", "Never replace", "Only if the customer asks"], correctAnswer: 1, explanation: "Replacement is chosen when the damage is severe enough that repair would cost more, take longer, or fail to restore structural strength." },
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    // Get candidate's completed assessments if logged in
    let completedIds: string[] = [];
    if (user && user.role === "CANDIDATE") {
      const candidate = await prisma.candidate.findUnique({ where: { userId: user.userId } });
      if (candidate) {
        const results = await prisma.assessmentResult.findMany({
          where: { candidateId: candidate.id },
          select: { assessmentId: true },
        });
        completedIds = results.map((r: any) => r.assessmentId);
      }
    }

    const filtered = category
      ? ASSESSMENTS.filter((a) => a.category === category)
      : ASSESSMENTS;

    return NextResponse.json({
      assessments: filtered.map((a) => ({
        ...a,
        questions: a.questions.map((q) => ({ ...q, correctAnswer: undefined })), // Hide answers
        isCompleted: completedIds.includes(a.id),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({ where: { userId: user.userId } });
    if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { assessmentId, answers } = await req.json();

    const assessment = ASSESSMENTS.find((a) => a.id === assessmentId);
    if (!assessment) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

    // Calculate score
    let correct = 0;
    const gradedAnswers = assessment.questions.map((q, idx) => {
      const isCorrect = answers[idx] === q.correctAnswer;
      if (isCorrect) correct++;
      return { questionId: q.id, userAnswer: answers[idx], isCorrect, explanation: q.explanation };
    });

    const score = Math.round((correct / assessment.questions.length) * 100);
    const isPassed = score >= assessment.passingScore;

    // Save result
    const existingResult = await prisma.assessmentResult.findFirst({
      where: { candidateId: candidate.id, assessmentId },
    });

    if (existingResult) {
      await prisma.assessmentResult.update({
        where: { id: existingResult.id },
        data: { score, isPassed, answers: JSON.stringify(gradedAnswers) },
      });
    } else {
      await prisma.assessmentResult.create({
        data: {
          candidateId: candidate.id,
          assessmentId,
          score,
          isPassed,
          answers: JSON.stringify(gradedAnswers),
        },
      });
    }

    return NextResponse.json({ score, isPassed, gradedAnswers, assessment });
  } catch (error) {
    console.error("Assessment error:", error);
    return NextResponse.json({ error: "Failed to submit assessment" }, { status: 500 });
  }
}
