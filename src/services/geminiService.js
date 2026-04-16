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

function buildSystemPrompt(crowdData) {
  const crowdSummary = crowdData
    ? Object.entries(crowdData)
        .map(([key, val]) => `  - ${val.name}: ${val.level?.toUpperCase() || 'UNKNOWN'}`)
        .join('\n')
    : '  - Data unavailable (using estimates)';

  return `You are StadiumAI — a helpful AI assistant for visitors at Narendra Modi Stadium (Sardar Patel Stadium), Motera, Ahmedabad. The stadium has a capacity of 132,000 and is the world's largest cricket stadium.

STADIUM LAYOUT:
- Gates: Gate 1 (North Main), Gate 2 (Northeast/Club House), Gate 3 (Southeast), Gate 4 (South), Gate 5 (Southwest), Gate 6 (Northwest/VIP)
- Seating Blocks: A (North Premium), B (NE Upper), C (Club House), D (East Lower), E (SE), F (South), G (South General), H (West)
- Food Stalls: Chai & Snacks Corner (N), Gujarati Bites (NE), Fast Food Hub (E), South Zone Canteen (S), West Refreshment Bar (W), VIP Lounge Café (NW), NE Stall, Ice Cream & Desserts
- Washrooms: Near each gate (NW, NE, SE, South, SW, VIP)
- First Aid: Center of the stadium
- Security Control Room: Near Gate 1
- Lost & Found: Gate 1 Information Desk

REAL-TIME CROWD LEVELS (as of now):
${crowdSummary}

YOUR BEHAVIOR:
1. Give SHORT, ACTIONABLE answers (2-4 sentences max)
2. Always recommend the LEAST CROWDED option when relevant
3. Be friendly and reassuring
4. For emergencies, immediately provide help point info and emergency numbers
5. Mention specific gate/stall/block names
6. If asked in Hindi, respond in Hindi
7. Emergency contacts: Medical = 1077, Security = 100, Police = 112

Always prioritize visitor safety and convenience.`;
}

// Intelligent mock responses for demo mode
const MOCK_QA = [
  {
    keywords: ['gate', 'enter', 'entry', 'which gate', 'come in'],
    response: '🚪 Based on current crowd levels, **Gate 5 (Southwest)** has the lowest crowd — ideal for quick entry! If you\'re in Block A or B, use **Gate 1 (North)**. Avoid Gate 2 which is currently busy. Tip: Metro to Motera Station gets you closest to Gate 1.',
  },
  {
    keywords: ['seat', 'block', 'where is my', 'my seat', 'seating'],
    response: '🎫 Your seating block determines your gate: Blocks A-B → Gate 1 or 6, Blocks C-D → Gate 2, Block E → Gate 3, Blocks F-G → Gate 4, Block H → Gate 5. Check your ticket for the block letter and row number. Show your ticket QR at entry!',
  },
  {
    keywords: ['washroom', 'toilet', 'restroom', 'bathroom', 'loo'],
    response: '🚻 Nearest washrooms are located right behind each gate entry. The **North Zone washroom** (near Gate 1) is currently less crowded. **Pro tip:** Washrooms near VIP Gate 6 are premium facilities and often less busy. Follow the blue signs inside!',
  },
  {
    keywords: ['food', 'eat', 'hungry', 'stall', 'canteen', 'snack', 'drink'],
    response: '🍕 **Best options right now:**\n- **West Refreshment Bar** (Gate 5 area) — Low crowd, fresh juices & snacks\n- **Chai & Snacks Corner** (Gate 1) — Masala Chai ₹20, Samosa ₹15\n- **Gujarati Bites** (Gate 2) — Dhokla & Fafda!\nAvoid South Zone Canteen — it\'s busy. Enjoy your food! 🙂',
  },
  {
    keywords: ['crowd', 'crowded', 'busy', 'rush', 'less crowd', 'avoid'],
    response: '📊 **Current crowd snapshot:**\n- 🟢 Gate 5 (SW) — LOW crowd\n- 🟢 Gate 6 (NW) — LOW crowd\n- 🟡 Gate 1 (N) — MEDIUM crowd\n- 🔴 Gate 2 (NE) — HIGH crowd\n\nFor least crowds: Head to the **West or Southwest zone**. Avoid Gate 2 and 3 currently.',
  },
  {
    keywords: ['parking', 'park', 'car'],
    response: '🚗 Parking zones: P1 (North, near Gate 1), P2 (East, near Gate 2-3), P4 (South, near Gate 4), P5 (West, near Gate 5). **P5 West Parking** has more space currently. Tip: Use Metro or BRTS to avoid parking hassle — Motera Metro Station is just 500m from Gate 1!',
  },
  {
    keywords: ['metro', 'bus', 'transport', 'how to reach', 'how do i get'],
    response: '🚇 Best ways to reach the stadium:\n- **Metro:** Aqua Line → Motera Station → 500m walk/auto to Gate 1\n- **BRTS:** Chandkheda Bus Stop → 500m walk\n- **Auto/Cab:** Drop-off at designated zones near each gate\n- **Avoid:** Driving yourself on match day — heavy traffic!',
  },
  {
    keywords: ['lost', 'help', 'emergency', 'missing', 'danger'],
    response: '🆘 **EMERGENCY CONTACTS:**\n- 🏥 Medical Emergency: **1077** (on-site First Aid Center)\n- 👮 Security: **100** (Control Room near Gate 1)\n- 🔍 Lost & Found: Gate 1 Information Desk\n- 🚨 Police: **112**\n\nPlease go to the nearest stadium staff member (yellow vest) for immediate help!',
  },
  {
    keywords: ['medical', 'doctor', 'ambulance', 'faint', 'injured', 'hurt'],
    response: '🏥 **Medical Emergency:** Call **1077** immediately. The main First Aid Center is at the stadium center — follow the red cross signs. Stadium medical staff in orange vests are stationed near all gates. Do NOT move an injured person — call for help and stay with them.',
  },
];

function getMockResponse(message) {
  const lowerMsg = message.toLowerCase();
  for (const qa of MOCK_QA) {
    if (qa.keywords.some(kw => lowerMsg.includes(kw))) {
      return qa.response;
    }
  }
  return `👋 Thanks for your question! I'm StadiumAI, your companion at Narendra Modi Stadium. I can help you with:\n\n- 🚪 **Gate entry** — which gate to use\n- 🎫 **Your seat** — finding your block\n- 🍕 **Food stalls** — nearest options & menus\n- 🚻 **Washrooms** — closest to you\n- 📊 **Crowd levels** — where it's least busy\n- 🚗 **Parking & transport** — getting here & back\n- 🆘 **Emergency help** — medical, security, lost & found\n\nTry asking me something specific! 😊`;
}

export async function sendMessage(message, chatHistory, crowdData) {
  // Demo mode: use intelligent mock responses
  if (!hasGemini) {
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600)); // simulate latency
    return getMockResponse(message);
  }

  try {
    const systemPrompt = buildSystemPrompt(crowdData);
    const fullHistory = chatHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am StadiumAI, ready to assist visitors at Narendra Modi Stadium with navigation, crowd updates, food stalls, and emergency help.' }] },
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
