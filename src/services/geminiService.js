// Gemini AI Service for StadiumAI Companion
// Falls back to intelligent mock responses if API key is not configured

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const hasGemini = API_KEY && API_KEY !== 'your_gemini_api_key_here';

let genAI = null;
let model = null;

if (hasGemini) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

function buildSystemPrompt(crowdData, userData) {
  const crowdSummary = crowdData
    ? Object.entries(crowdData)
        .filter(([key]) => key !== 'volunteers')
        .map(([key, val]) => `  - ${val.name}: ${val.level?.toUpperCase() || 'UNKNOWN'} (Prediction: ${val.prediction?.toUpperCase() || 'UNKNOWN'})`)
        .join('\n')
    : '  - Data unavailable (using estimates)';

  const volContext = (crowdData && crowdData.volunteers && crowdData.volunteers.length > 0)
    ? `\nAVAILABLE VOLUNTEERS:\n${crowdData.volunteers.map(v => `  - ${v.name} (Status: ${v.status}, Task: ${v.assignedTask || 'None'})`).join('\n')}`
    : '';

  const userContext = userData 
    ? `\nUSER CONTEXT:\n- Name: ${userData.name || 'Visitor'}\n- Block: ${userData.block || 'Unknown'}\n- Recommended Gate: ${userData.gate || 'Unknown'}\n*Personalize your reasoning using this location data if relevant.*`
    : '';

  return `You are StadiumAI — an AI assistant for SenseCrowd AI at Narendra Modi Stadium.
The stadium has a capacity of 132,000. Priority is user safety and real-time efficiency.

STADIUM LAYOUT:
- Gates: Gate 1 (North Main), Gate 2 (Northeast), Gate 3 (Southeast), Gate 4 (South), Gate 5 (Southwest), Gate 6 (Northwest/VIP)
- Blocks: A (North Premium), B (NE Upper), C (Club House), D (East Lower), E (SE), F (South), G (South General), H (West)
- Food Stalls: Chai & Snacks Corner (N), Gujarati Bites (NE), Fast Food Hub (E), South Zone Canteen (S), West Refreshment Bar (W), VIP Lounge Café (NW)
- Washrooms: Near each gate (NW, NE, SE, South, SW, VIP)
- Contacts: Medical = 1077, Security = 100, Police = 112

REAL-TIME CROWD LEVELS:
${crowdSummary}
${volContext}
${userContext}

RESPONSE STYLE RULES:
1. Be concise and practical (no long paragraphs).
2. Always give a decision, not just information.
3. Prioritize user safety and convenience (1. LOW crowd, 2. Closest distance).
4. If a location is highly crowded, proactively mention if a volunteer is nearby or suggest asking an available volunteer for help.
5. For emergencies, give immediate actionable steps, contact numbers, and mention any available standby volunteers.
6. NO vague answers, NO "I think" or "maybe".

MANDATORY RESPONSE FORMAT:
You MUST respond strictly in the following format for EVERY query:

Recommendation: [Best action for the user]

Reason: [Why this is recommended based on crowd + distance + context]

Prediction: [Expected crowd trend in next 10 minutes]

Confidence: [Give a percentage between 70–95%]
`;
}

// Intelligent mock responses for demo mode following strict format
const MOCK_QA = [
  {
    keywords: ['exit now', 'best exit', 'leave'],
    response: 'Recommendation: Exit via Gate 5 (Southwest).\n\nReason: Gate 5 currently has LOW crowd, while other gates like Gate 2 and Gate 4 are highly congested with outgoing traffic.\n\nPrediction: Expected to remain LOW for the next 10 minutes as crowd surge moves East.\n\nConfidence: 94%',
  },
  {
    keywords: ['gate', 'enter', 'entry', 'which gate', 'come in'],
    response: 'Recommendation: Use Gate 5 (Southwest).\n\nReason: It currently has LOW crowd and is less congested compared to Gate 2, ensuring faster entry. If you are seated in Block A or B, Gate 1 is also acceptable.\n\nPrediction: Crowd at Gate 5 is expected to remain LOW for the next 10 minutes.\n\nConfidence: 91%',
  },
  {
    keywords: ['seat', 'block', 'where is my', 'my seat', 'seating'],
    response: 'Recommendation: Check your ticket for Block letter, then proceed to the nearest open gate.\n\nReason: Block A-B maps to Gate 1, C-D to Gate 2, E to Gate 3, F-G to Gate 4, H to Gate 5. Using your designated gate minimizes walking distance inside.\n\nPrediction: Inner concourse crowd expected to surge briefly as match starts.\n\nConfidence: 95%',
  },
  {
    keywords: ['washroom', 'toilet', 'restroom', 'bathroom', 'loo'],
    response: 'Recommendation: Use the washrooms near VIP Gate 6 or Gate 5.\n\nReason: These facilities currently show LOW usage. Avoid the North Zone washroom near Gate 1 which is temporarily experiencing HIGH traffic.\n\nPrediction: Priority washrooms will remain accessible with LOW wait times.\n\nConfidence: 89%',
  },
  {
    keywords: ['food', 'eat', 'hungry', 'stall', 'canteen', 'snack', 'drink'],
    response: 'Recommendation: Visit West Refreshment Bar near Gate 5.\n\nReason: Shortest queue recorded right now with fresh supplies available. Avoid South Zone Canteen due to HIGH wait times.\n\nPrediction: Medium congestion expected in West Zone during the next over break.\n\nConfidence: 92%',
  },
  {
    keywords: ['crowd', 'crowded', 'busy', 'rush', 'less crowd', 'avoid'],
    response: 'Recommendation: Head towards the West or Southwest zones (Gate 5 / Gate 6).\n\nReason: Real-time sensors indicate LOW crowds in these areas. Gate 2 (Northeast) is currently experiencing HIGH congestion and should be avoided.\n\nPrediction: Gate 2 will remain HIGH, Gate 5 will remain LOW.\n\nConfidence: 93%',
  },
  {
    keywords: ['parking', 'park', 'car'],
    response: 'Recommendation: Park at P5 (West Parking) near Gate 5.\n\nReason: Sensor data shows maximum available slots in P5. P2 (East) is currently full.\n\nPrediction: P5 will reach MEDIUM capacity in 15 minutes.\n\nConfidence: 88%',
  },
  {
    keywords: ['metro', 'bus', 'transport', 'how to reach', 'how do i get'],
    response: 'Recommendation: Take the Aqua Line Metro to Motera Station.\n\nReason: The walking path from the metro to Gate 1 is currently showing LOW pedestrian traffic, making it the fastest transport option over driving.\n\nPrediction: Pedestrian route will remain clear for the next 10 minutes.\n\nConfidence: 95%',
  },
  {
    keywords: ['medical', 'doctor', 'ambulance', 'faint', 'injured', 'hurt', 'lost', 'help', 'emergency', 'missing', 'danger'],
    response: 'Recommendation: Call 1077 or approach staff in orange/yellow vests immediately.\n\nReason: First Aid Center is located at the center field, and medical staff are stationed at all gates. Do not move an injured person.\n\nPrediction: Emergency response team can reach any gate within 3 minutes.\n\nConfidence: 100%',
  },
];

function getMockResponse(message) {
  const lowerMsg = message.toLowerCase();
  for (const qa of MOCK_QA) {
    if (qa.keywords.some(kw => lowerMsg.includes(kw))) {
      return qa.response;
    }
  }
  return `Recommendation: Please ask a specific question regarding navigation, crowd levels, or facilities.\n\nReason: I am currently optimized to provide actionable intelligence on gates, food stalls, washrooms, and emergency help based on real-time stadium data.\n\nPrediction: State remains stable.\n\nConfidence: 99%`;
}

export async function sendMessage(message, chatHistory, crowdData, userData = null) {
  // Demo mode: use intelligent mock responses
  if (!hasGemini) {
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600)); // simulate latency
    return getMockResponse(message);
  }

  try {
    const systemPrompt = buildSystemPrompt(crowdData, userData);
    const fullHistory = chatHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Recommendation: Systems initialized.\n\nReason: I have loaded stadium layouts, real-time crowd density, and alert procedures to assist visitors effectively.\n\nPrediction: Prepared for queries.\n\nConfidence: 100%' }] },
        ...fullHistory,
      ],
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return getMockResponse(message);
  }
}

export async function getSmartSuggestions(crowdData) {
  if (!hasGemini) {
    const entries = Object.values(crowdData);
    const lowCrowdGates = entries.filter(e => e.type === 'gate' && e.level === 'low');
    const lowCrowdFood = entries.filter(e => e.type === 'food' && e.level === 'low');

    return {
      leastCrowdedGate: lowCrowdGates.length > 0
        ? `${lowCrowdGates[0].name} — Open with short queue, estimated wait < 3 mins`
        : 'Gate 5 (Southwest) — Generally less busy',
      bestFoodStall: lowCrowdFood.length > 0
        ? `${lowCrowdFood[0].name} — Fresh food, minimal wait time`
        : 'West Refreshment Bar — Juices & snacks, quick service',
      fastestRoute: 'Use Gate 1 (North) for Block A/B. Gate 5 for Block H. Show ticket QR for fastest scan.',
    };
  }

  try {
    const systemPrompt = buildSystemPrompt(crowdData);
    const prompt = `${systemPrompt}\n\nBased on crowd data, give 3 VERY SHORT (1 sentence each) smart suggestions as JSON: {"leastCrowdedGate": "...", "bestFoodStall": "...", "fastestRoute": "..."}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('No JSON in response');
  } catch (e) {
    return {
      leastCrowdedGate: 'Gate 5 (Southwest) — Low crowd detected',
      bestFoodStall: 'West Refreshment Bar — Short queue right now',
      fastestRoute: 'Enter via your ticket\'s gate for fastest access',
    };
  }
}

export async function getEmergencyInstructions(type, crowdData) {
  const prompts = {
    lost: 'A visitor is lost inside the stadium. Give immediate, step-by-step instructions (3 steps max) and nearest help point.',
    medical: 'A visitor needs medical help urgently. Give immediate first aid steps and emergency contact numbers.',
    security: 'A visitor needs security assistance. Give steps and security contact information.',
  };

  if (!hasGemini) {
    const responses = {
      lost: '📍 **Stay calm and stay where you are.**\n1. Look for a stadium staff member in a **yellow vest** nearby\n2. Go to the nearest **Information Desk** (Gate 1) or any entry gate\n3. Call Lost & Found: Ask any staff or go to Gate 1 desk\n\n🔍 Lost & Found is at Gate 1 — always open during events.',
      medical: '🏥 **Stay with the person. Call 1077 immediately.**\n1. Do NOT move the injured person\n2. Wave to nearest staff (orange vest) for help\n3. Medical team will reach you within 3 minutes\n\n🚑 First Aid: center field. Emergency: **1077**',
      security: '👮 **Security Control Room: 100**\n1. Stay calm and move away from the threat if safe\n2. Alert nearest staff (yellow vest) immediately\n3. Security team is stationed at all gates and can respond in 2 minutes\n\n📞 Emergency: **100 (Security)** | **112 (Police)**',
    };
    return responses[type] || responses.security;
  }

  try {
    const result = await model.generateContent(
      buildSystemPrompt(crowdData) + '\n\n' + prompts[type]
    );
    return result.response.text();
  } catch {
    return '🆘 Please find the nearest stadium staff member (yellow vest) immediately. Emergency contacts: Medical 1077, Security 100, Police 112.';
  }
}

// Admin: AI-powered crowd redistribution analysis
const MOCK_OPTIMIZATION = {
  overallStatus: 'moderate',
  urgentActions: [
    'Redirect incoming visitors from Gate 2 to Gate 5 — Gate 2 approaching capacity',
    'Open additional counter at South Zone Canteen to reduce food queue',
    'Station 2 staff at Gate 3 (SE) to guide Gate 2 overflow',
  ],
  gateRecommendations: [
    { gate: 'Gate 2', action: 'redirect', reason: 'HIGH crowd — approaching capacity limit' },
    { gate: 'Gate 5', action: 'open', reason: 'LOW occupancy — can absorb 2× current load' },
    { gate: 'Gate 1', action: 'monitor', reason: 'MEDIUM load — within normal range' },
    { gate: 'Gate 6', action: 'monitor', reason: 'VIP gate — maintain controlled flow' },
  ],
  estimatedRelief: '8–12 minutes for redistribution to take effect',
};

export async function optimizeCrowdDistribution(crowdData) {
  const highZones   = Object.values(crowdData).filter(d => d.level === 'high').map(d => d.name);
  const medZones    = Object.values(crowdData).filter(d => d.level === 'medium').map(d => d.name);
  const lowZones    = Object.values(crowdData).filter(d => d.level === 'low').map(d => d.name);

  if (!hasGemini) {
    // Personalise mock with real data
    const result = { ...MOCK_OPTIMIZATION };
    if (highZones.length === 0) result.overallStatus = 'normal';
    else if (highZones.length > 3) result.overallStatus = 'critical';
    result.urgentActions = highZones.length > 0
      ? [`Redirect crowd from ${highZones[0]} — currently HIGH`, ...MOCK_OPTIMIZATION.urgentActions.slice(1)]
      : ['Crowd levels are within acceptable limits — no immediate action required'];
    return result;
  }

  const prompt = `
${buildSystemPrompt(crowdData)}

As stadium operations AI, analyze the current crowd situation and respond ONLY with valid JSON (no markdown):
{
  "overallStatus": "normal|moderate|critical",
  "urgentActions": ["action1", "action2", "action3"],
  "gateRecommendations": [
    {"gate": "Gate X", "action": "open|redirect|close|monitor", "reason": "..."}
  ],
  "estimatedRelief": "X minutes for relief"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text   = result.response.text();
    const match  = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('No JSON');
  } catch {
    return MOCK_OPTIMIZATION;
  }
}
