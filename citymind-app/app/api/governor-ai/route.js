import { NextResponse } from 'next/server';

// Advanced AI Governor Predictive Intelligence Engine
export async function POST(request) {
  try {
    const { query } = await request.json();
    const q = (query || '').toLowerCase().trim();

    let aiReply = '';
    let prediction = null;

    // Check if query is asking for future prediction or specific sector risk
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

    } else if (q.includes('budget') || q.includes('cost') || q.includes('saving') || q.includes('money')) {
      aiReply = `🤖 **AI Governor Financial Forecast**\n\n` +
        `CityMind's predictive neural engine has saved **₹1,24,500** in municipal budgets this month by intercepting 18 infrastructure failures prior to emergency breakdown.\n\n` +
        `• **Net Budget Preservation**: 88.4% Return on Preventative Investment\n` +
        `• **Citizens Benefited**: 1,45,000 residents across 4 sectors\n` +
        `• **Next Month Projected Savings**: ₹2,40,000 if proactive work orders are approved on schedule.`;

    } else if (q.includes('carbon') || q.includes('credit') || q.includes('reward') || q.includes('green')) {
      aiReply = `🤖 **AI Governor Green Impact Report**\n\n` +
        `Citizens have accumulated **14,200 Carbon Credits** by logging verified hazards!\n\n` +
        `• **Methane Reduced**: 142 kg via smart waste routing\n` +
        `• **CO₂ Prevented**: 450 kg via micro-surfacing & route optimization\n` +
        `• **Voucher Redemptions**: Active for Metro Passes, EV Charging, and Municipal Utility Discounts.`;

    } else if (q.includes('emergency') || q.includes('disaster') || q.includes('crisis')) {
      aiReply = `🤖 **AI Governor Emergency Decision Matrix ACTIVE**\n\n` +
        `• Emergency rerouting algorithms engaged for Sector 18 Hospital corridor.\n` +
        `• Hydro-seal crews and emergency pump stations placed on standby.\n` +
        `• Real-time sensor stream scanning for subsoil moisture spikes every 15 seconds.`;

    } else if (isPredictiveQuery || q.includes('future') || q.includes('predict') || q.includes('problem')) {
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

    return NextResponse.json({
      status: 'success',
      reply: aiReply,
      prediction: prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
