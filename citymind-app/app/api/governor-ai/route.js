import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are the CityMind AI Governor, an advanced municipal predictive intelligence agent overseeing smart city operations.
Your job is to analyze queries regarding municipal infrastructure, citizen reports, environmental hazards, risk forecasts, and budget allocations across city sectors:
1. Sector 62 (Tech Corridor) - Primary hazards: Potholes, road sub-layer damage.
2. Sector 18 (Commercial Hub) - Primary hazards: Water main pressure surges, flooding, subsoil moisture.
3. Sector 4 (Residential East) - Primary hazards: Biowaste saturation, garbage overflow, disease vectors.
4. Cyber City Plaza - Primary hazards: Transformer thermal overload, electricity grid strain.

Always respond in a professional, authoritative municipal tone using rich Markdown (bullet points, bold text).
If the query asks for future risk predictions, sector alerts, or hazard forecasts, populate the prediction object with realistic ROI and dispatch action labels. If no specific prediction is required, leave prediction as null.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description: "Authoritative municipal analysis formatted in rich Markdown with bullet points."
    },
    prediction: {
      type: "object",
      description: "Work order prediction object if query asks for predictions/hazards/risks, else null.",
      properties: {
        id: { type: "string", description: "Unique ID e.g. pred-105" },
        sector: { type: "string", description: "Sector name e.g. Sector 62 (Tech Corridor)" },
        issue: { type: "string", description: "Hazard summary" },
        probability: { type: "integer", description: "Risk percentage 0-100" },
        timeframe: { type: "string", description: "Timeframe e.g. 48 Hours" },
        cost: { type: "string", description: "Proactive cost in INR e.g. ₹4,200" },
        saved: { type: "string", description: "Emergency savings in INR e.g. ₹45,000" },
        co2: { type: "string", description: "Carbon saved e.g. 140 kg CO₂" },
        actionLabel: { type: "string", description: "Action button text starting with ⚡" }
      },
      required: ["id", "sector", "issue", "probability", "timeframe", "cost", "saved", "actionLabel"]
    }
  },
  required: ["reply"]
};

// Fallback Rule Engine if API Key is not set or network fails
function getRuleBasedFallback(query) {
  const q = (query || '').toLowerCase().trim();
  let aiReply = '';
  let prediction = null;

  const isPredictiveQuery = q.includes('predict') || q.includes('future') || q.includes('forecast') || 
                            q.includes('next week') || q.includes('upcoming') || q.includes('risk') ||
                            q.includes('problem') || q.includes('issue') || q.includes('hazard') ||
                            q.includes('happen') || q.includes('warning');

  if (q.includes('sector 62') || (q.includes('pothole') && isPredictiveQuery) || q.includes('road')) {
    aiReply = `🤖 **AI Governor Predictive Alert — Sector 62 (Tech Corridor)**\n\n` +
      `• **Predicted Hazard**: Structural Sub-layer Deterioration & Pothole Formation\n` +
      `• **Failure Probability**: **85% Risk** within **12–14 Days**\n` +
      `• **Root Factors**: Heavy monsoon forecast (120mm), 45,000 heavy vehicles/day, 12-year asphalt lifespan\n` +
      `• **Proactive ROI**: Preventative fix cost ₹4,200 vs Disaster Asphalt Repair cost ₹45,000\n` +
      `• **Directive**: Deploy micro-surfacing repair crew before Friday storm to protect 42,000 daily commuters.`;

    prediction = {
      id: 'pred-101',
      sector: 'Sector 62 (Tech Corridor)',
      issue: 'Road Sub-layer Deterioration & Potholes',
      probability: 85,
      timeframe: '12–14 Days',
      cost: '₹4,200',
      saved: '₹45,000',
      co2: '140 kg',
      actionLabel: '⚡ Dispatch Micro-Surfacing Crew to Sector 62'
    };
  } else if (q.includes('sector 18') || q.includes('rain') || q.includes('flood') || q.includes('water') || q.includes('burst')) {
    aiReply = `🤖 **AI Governor Predictive Alert — Sector 18 (Commercial Hub)**\n\n` +
      `• **Predicted Hazard**: Water Main Pressure Surge & Flash Subsidence at Hospital Junction\n` +
      `• **Failure Probability**: **82% Risk** within **48 Hours**\n` +
      `• **Root Factors**: Subsoil moisture +40%, Pipe pressure 6.2 Bar, 18-year ductile iron fatigue\n` +
      `• **Proactive ROI**: Emergency isolation cost ₹18,500 vs Road & Corridor Flooding loss ₹1,80,000\n` +
      `• **Directive**: Isolate Valve #4B and dispatch hydro-seal team immediately to preserve hospital corridor access.`;

    prediction = {
      id: 'pred-102',
      sector: 'Sector 18 (Commercial Hub)',
      issue: 'Water Main Surge & Flash Subsidence',
      probability: 82,
      timeframe: '48 Hours',
      cost: '₹18,500',
      saved: '₹1,80,000',
      co2: 'N/A (125,000L Water Saved)',
      actionLabel: '⚡ Isolate Valve #4B & Dispatch Emergency Unit'
    };
  } else if (q.includes('sector 4') || q.includes('garbage') || q.includes('waste') || q.includes('methane') || q.includes('dumpster')) {
    aiReply = `🤖 **AI Governor Predictive Alert — Sector 4 (Residential East)**\n\n` +
      `• **Predicted Hazard**: Biowaste Saturation & Disease Vector Outbreak\n` +
      `• **Failure Probability**: **74% Risk** within **5 Days**\n` +
      `• **Root Factors**: Central Market dumpster saturation at 92%, ambient temp 34°C, 4 complaints logged\n` +
      `• **Proactive ROI**: Automated compaction cost ₹3,100 vs Municipal Health Vector Spraying ₹32,000\n` +
      `• **Directive**: Reroute EV compactor truck #09 and initiate sanitization fogging by 16:00 hrs.`;

    prediction = {
      id: 'pred-103',
      sector: 'Sector 4 (Residential East)',
      issue: 'Biowaste Saturation & Vector Risk',
      probability: 74,
      timeframe: '5 Days',
      cost: '₹3,100',
      saved: '₹32,000',
      co2: '310 kg CO₂ (48 kg Methane)',
      actionLabel: '⚡ Reroute EV Compactor Truck to Sector 4'
    };
  } else if (q.includes('cyber city') || q.includes('power') || q.includes('electricity') || q.includes('grid') || q.includes('transformer')) {
    aiReply = `🤖 **AI Governor Predictive Alert — Cyber City Plaza**\n\n` +
      `• **Predicted Hazard**: Transformer Thermal Overload & Power Grid Strain\n` +
      `• **Failure Probability**: **68% Risk** within **3 Days**\n` +
      `• **Root Factors**: Peak HVAC summer load, Substation B load factor 94%, heatwave forecast 41°C\n` +
      `• **Proactive ROI**: Coolant flush & load shifting cost ₹8,500 vs IT Corridor Outage ₹3,500,000\n` +
      `• **Directive**: Engage auxiliary solar battery bank and shift commercial chiller cycles to off-peak hours.`;

    prediction = {
      id: 'pred-104',
      sector: 'Cyber City Plaza',
      issue: 'Transformer Thermal Overload & Substation Strain',
      probability: 68,
      timeframe: '3 Days',
      cost: '₹8,500',
      saved: '₹3,500,000',
      co2: '520 kg CO₂',
      actionLabel: '⚡ Engage Solar Battery Bank & Off-Peak Load Shifting'
    };
  } else if (isPredictiveQuery) {
    aiReply = `🤖 **AI Governor Multi-Sector Future Risk Analysis**\n\n` +
      `Integrated real-time weather models, asset stress metrics, and complaint patterns across all sectors:\n\n` +
      `1. **Sector 62 (High)**: 85% Road Failure Risk (12-14 Days) — Est. Cost ₹4,200\n` +
      `2. **Sector 18 (Critical)**: 82% Water Surge Risk (48 Hours) — Est. Cost ₹18,500\n` +
      `3. **Sector 4 (Moderate)**: 74% Biowaste Overflow Risk (5 Days) — Est. Cost ₹3,100\n` +
      `4. **Cyber City (Watch)**: 68% Transformer Overload Risk (3 Days) — Est. Cost ₹8,500\n\n` +
      `*Click any prediction button below to dispatch immediate preventative maintenance.*`;

    prediction = {
      id: 'pred-101',
      sector: 'Sector 62 (Tech Corridor)',
      issue: 'Multi-Sector Risk Warning (Sector 62 & 18 Priority)',
      probability: 85,
      timeframe: 'Immediate 48h - 14 Days',
      cost: '₹22,700 Total',
      saved: '₹2,25,000 Total',
      co2: '450 kg',
      actionLabel: '⚡ Approve All High-Priority Proactive Work Orders'
    };
  } else {
    aiReply = `🤖 **AI Governor Neural Engine Response**\n\n` +
      `Processed query: "${query}".\n` +
      `Spatial neural models cross-referenced against 4 city sectors. Overall urban health score stands at **74.5/100**.\n\n` +
      `You can ask me to **"Predict future problems"**, check **"Sector 62 risks"**, forecast **"Sector 18 flood emergency"**, or calculate **"Proactive budget savings"**.`;
  }

  return { reply: aiReply, prediction };
}

export async function POST(request) {
  try {
    const { query } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      const fallback = getRuleBasedFallback(query);
      return NextResponse.json({
        status: 'success',
        source: 'rule-engine-fallback',
        reply: fallback.reply,
        prediction: fallback.prediction,
        timestamp: new Date().toISOString()
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA
        }
      });

      const parsed = JSON.parse(response.text);

      return NextResponse.json({
        status: 'success',
        source: 'gemini-2.5-flash',
        reply: parsed.reply,
        prediction: parsed.prediction || null,
        timestamp: new Date().toISOString()
      });

    } catch (apiErr) {
      console.warn("Gemini API call failed, using fallback:", apiErr.message);
      const fallback = getRuleBasedFallback(query);
      return NextResponse.json({
        status: 'success',
        source: 'rule-engine-fallback',
        reply: fallback.reply,
        prediction: fallback.prediction,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
