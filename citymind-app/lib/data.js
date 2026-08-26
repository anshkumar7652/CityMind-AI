export const CITY_SECTORS = [
  {
    id: "sec-62",
    name: "Sector 62 (Tech Corridor)",
    healthScore: 77,
    status: "moderate",
    metrics: { roadQuality: 80, cleanliness: 95, airQuality: 72, traffic: 60, waterLeakage: 88, noise: 65, waterPressure: "4.2 Bar", gridLoad: "78%" },
    coordinates: [28.6280, 77.3649],
    polygonCoords: [
      [28.6380, 77.3549],
      [28.6380, 77.3749],
      [28.6180, 77.3749],
      [28.6180, 77.3549]
    ],
    predictedRisk: "High Pothole Risk (85% within 14 days)",
    popBenefited: "42,000 residents"
  },
  {
    id: "sec-18",
    name: "Sector 18 (Commercial Hub)",
    healthScore: 62,
    status: "high-risk",
    metrics: { roadQuality: 54, cleanliness: 68, airQuality: 58, traffic: 42, waterLeakage: 70, noise: 45, waterPressure: "6.2 Bar (High)", gridLoad: "92% (Critical)" },
    coordinates: [28.5708, 77.3261],
    polygonCoords: [
      [28.5808, 77.3161],
      [28.5808, 77.3361],
      [28.5608, 77.3361],
      [28.5608, 77.3161]
    ],
    predictedRisk: "Water Main Burst & Flash Flood (82%)",
    popBenefited: "78,000 daily commuters"
  },
  {
    id: "cyber-hub",
    name: "Cyber City Plaza",
    healthScore: 91,
    status: "healthy",
    metrics: { roadQuality: 92, cleanliness: 96, airQuality: 88, traffic: 84, waterLeakage: 95, noise: 82, waterPressure: "3.8 Bar", gridLoad: "64%" },
    coordinates: [28.4950, 77.0895],
    polygonCoords: [
      [28.5050, 77.0795],
      [28.5050, 77.0995],
      [28.4850, 77.0995],
      [28.4850, 77.0795]
    ],
    predictedRisk: "Low Risk (Scheduled Green Audits)",
    popBenefited: "95,000 tech workforce"
  },
  {
    id: "sec-4",
    name: "Sector 4 (Residential East)",
    healthScore: 68,
    status: "moderate",
    metrics: { roadQuality: 70, cleanliness: 65, airQuality: 69, traffic: 75, waterLeakage: 52, noise: 78, waterPressure: "3.2 Bar", gridLoad: "81%" },
    coordinates: [28.5912, 77.3190],
    polygonCoords: [
      [28.6012, 77.3090],
      [28.6012, 77.3290],
      [28.5812, 77.3290],
      [28.5812, 77.3090]
    ],
    predictedRisk: "Garbage Overflow & Disease Risk (74%)",
    popBenefited: "31,000 families"
  }
];

export const PREDICTIVE_HAZARDS = [
  {
    id: "pred-101",
    sector: "Sector 62 - Expressway Link",
    issue: "Road Structure Deterioration (Pothole Formation)",
    probability: 85,
    timeframe: "Next 12-14 Days",
    department: "Public Works Department (PWD)",
    factors: ["Rainfall: 120mm forecasted", "Traffic: 45,000 heavy vehicles/day", "Road Age: 12 Years"],
    budget: { cost: "₹4,200", workers: 3, time: "2 Hours", ROI: "Prevents ₹45,000 major asphalt damage" },
    greenImpact: { methane: "0 kg", co2Saved: "140 kg", radius: "2.5 km", people: "4,300" },
    recommendation: "Deploy micro-surfacing repair crew before heavy storm on Friday."
  },
  {
    id: "pred-102",
    sector: "Sector 18 - Hospital Road Junction",
    issue: "Water Main Burst & Structural Subsidence",
    probability: 82,
    timeframe: "Next 48 Hours",
    department: "Water & Sanitation Authority",
    factors: ["Pressure Spike: 6.2 Bar", "Pipe Age: 18 Years", "Subsoil Moisture: +40%"],
    budget: { cost: "₹18,500", workers: 6, time: "5 Hours", ROI: "Prevents Emergency Hospital Route Closure" },
    greenImpact: { methane: "N/A", waterSaved: "125,000 Liters", radius: "4.0 km", people: "18,500" },
    recommendation: "Isolate Valve #4B and dispatch emergency hydro-seal unit immediately."
  },
  {
    id: "pred-103",
    sector: "Sector 4 - Central Market Drain",
    issue: "Biowaste Overflow & Vector Disease Risk",
    probability: 74,
    timeframe: "Next 5 Days",
    department: "Municipal Solid Waste Management",
    factors: ["Dumpster Saturation: 92%", "Ambient Temp: 34°C", "Prev Complaints: 4 in 7 days"],
    budget: { cost: "₹3,100", workers: 2, time: "1.5 Hours", ROI: "Avoids Public Health Vector Outbreak" },
    greenImpact: { methane: "48 kg Methane reduced", co2Saved: "310 kg", radius: "1.8 km", people: "6,100" },
    recommendation: "Schedule automated EV compactor truck and sanitization spray unit."
  }
];

export const INITIAL_USER_REPORTS = [
  {
    id: "CMP-9041",
    user: "Aarav Sharma",
    userScore: 96,
    trustBadge: "Gold Verified Citizen",
    location: "Sector 62, Main Gate 3 (28.6280, 77.3649)",
    category: "Pothole / Road Damage",
    photoUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
    status: "In Progress",
    verificationStatus: "AI Verified - Real",
    aiAnalysis: { metadataValid: true, duplicateScore: "0.2%", aiGenProbability: "1.1%", verdict: "CONFIRMED ACCURATE" },
    priorityScore: 92,
    rewardEarned: "+150 Points",
    department: "Public Works Department (PWD)",
    timeAgo: "12 mins ago"
  },
  {
    id: "CMP-9042",
    user: "Priya Patel",
    userScore: 88,
    trustBadge: "Silver Citizen",
    location: "Sector 18, Commercial Block B (28.5708, 77.3261)",
    category: "Water Main Leak",
    photoUrl: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80",
    status: "Verified & Scheduled",
    verificationStatus: "AI Verified - Real",
    aiAnalysis: { metadataValid: true, duplicateScore: "0.8%", aiGenProbability: "0.5%", verdict: "CONFIRMED ACCURATE" },
    priorityScore: 88,
    rewardEarned: "+200 Points",
    department: "Water & Sanitation Authority",
    timeAgo: "45 mins ago"
  },
  {
    id: "CMP-9043",
    user: "Dev_Bot99 (Flagged Account)",
    userScore: 24,
    trustBadge: "Low Credibility User",
    location: "Cyber City Tunnel",
    category: "Structural Damage",
    photoUrl: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80",
    status: "Rejected (Fake)",
    verificationStatus: "AI Flagged - Suspicious",
    aiAnalysis: { metadataValid: false, duplicateScore: "98.4% (Stock Image Match)", aiGenProbability: "87.6%", verdict: "REJECTED (FAKE REPORT)" },
    priorityScore: 8,
    rewardEarned: "0 Points",
    department: "Infrastructure Safety",
    timeAgo: "1 hr ago"
  }
];

export const DEPARTMENT_STATS = [
  { name: "Public Works Dept (PWD)", total: 142, resolved: 128, pending: 14, efficiency: "90.1%" },
  { name: "Water & Sanitation", total: 98, resolved: 89, pending: 9, efficiency: "90.8%" },
  { name: "Solid Waste Management", total: 215, resolved: 202, pending: 13, efficiency: "93.9%" },
  { name: "Traffic Control Bureau", total: 76, resolved: 72, pending: 4, efficiency: "94.7%" }
];

export const MONTHLY_ANALYTICS = [
  { month: "Jan", complaints: 340, resolved: 310, avgResolutionHours: 4.2 },
  { month: "Feb", complaints: 410, resolved: 385, avgResolutionHours: 3.8 },
  { month: "Mar", complaints: 290, resolved: 280, avgResolutionHours: 3.1 },
  { month: "Apr", complaints: 520, resolved: 498, avgResolutionHours: 2.7 }
];

export const COMMUNITY_CHALLENGES = [
  {
    id: "chal-1",
    title: "Green Citizen Sprint",
    desc: "Submit 5 AI-Verified issues in your neighborhood",
    progress: 3,
    total: 5,
    reward: "Green Citizen Gold Badge + 250 Carbon Credits",
    icon: "award"
  },
  {
    id: "chal-2",
    title: "Urban Reforestation Patrol",
    desc: "Locate and log dry tree plantation spots",
    progress: 8,
    total: 10,
    reward: "500 Carbon Credits (Redeemable at Metro Pass)",
    icon: "tree-pine"
  }
];

export const GOVERNOR_BRIEFS = [
  "☀️ Morning City Briefing: Sector 18 exhibits 82% flood probability due to upcoming heavy rainfall. Recommending proactive drain desilting before 18:00 hrs.",
  "🌱 Sustainability Alert: Garbage compaction in Sector 4 saved an estimated 48kg methane emission today!",
  "🛡️ Trust Protocol: Fake Complaint Detection System blocked 14 manipulated submissions in the last 24 hours, preserving ₹85,000 in municipal resources."
];
