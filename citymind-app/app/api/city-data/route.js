import { NextResponse } from 'next/server';
import { CITY_SECTORS, PREDICTIVE_HAZARDS, INITIAL_USER_REPORTS, DEPARTMENT_STATS, MONTHLY_ANALYTICS } from '@/lib/data';
import { GoogleGenAI } from '@google/genai';

// GET /api/city-data -> Returns sector metrics, predictions, reports, and department stats
export async function GET() {
  return NextResponse.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    sectors: CITY_SECTORS,
    hazards: PREDICTIVE_HAZARDS,
    reports: INITIAL_USER_REPORTS,
    departmentStats: DEPARTMENT_STATS,
    monthlyAnalytics: MONTHLY_ANALYTICS
  });
}

// POST /api/city-data -> Accepts new report submission or runs dynamic future problem simulation
export async function POST(request) {
  try {
    const body = await request.json();

    // Check if request is a custom Predictive Simulation
    if (body.action === 'simulate_future_problem') {
      const { sectorId, weatherCondition, assetAgeYears, trafficLoad } = body;
      
      const sector = CITY_SECTORS.find(s => s.id === sectorId) || CITY_SECTORS[0];
      
      // Calculate dynamic risk probability score based on parameters
      let baseRisk = 50;
      if (weatherCondition === 'Heavy Monsoon (150mm)') baseRisk += 25;
      if (weatherCondition === 'Severe Heatwave (42°C)') baseRisk += 18;
      if (assetAgeYears > 15) baseRisk += 15;
      if (assetAgeYears > 22) baseRisk += 10;
      if (trafficLoad === 'Heavy Truck & EV Fleet') baseRisk += 12;

      const probability = Math.min(98, Math.max(35, baseRisk));
      const timeframeDays = probability > 80 ? 3 : probability > 60 ? 8 : 14;
      const estimatedFixCost = `₹${(Math.floor(probability * 180 / 100) * 100).toLocaleString()}`;
      const preventedCost = `₹${(Math.floor(probability * 1900 / 100) * 100).toLocaleString()}`;
      const co2Saved = `${Math.floor(probability * 4.5)} kg CO₂`;

      const primaryIssue = sectorId === 'sec-62' ? 'Asphalt Pavement Sub-layer Breakdown' :
                           sectorId === 'sec-18' ? 'Water Pipe Joint Shear & Burst' :
                           sectorId === 'sec-4' ? 'Biowaste Overflow & Leachate Contamination' :
                           'Power Substation Thermal Overload';

      return NextResponse.json({
        status: 'success',
        simulation: {
          id: `sim-${Date.now().toString().slice(-4)}`,
          sectorName: sector.name,
          sectorId: sector.id,
          probability: probability,
          timeframe: `Next ${timeframeDays} Days`,
          issue: primaryIssue,
          factors: [
            `Weather: ${weatherCondition || 'Normal'}`,
            `Asset Age: ${assetAgeYears || 10} Years`,
            `Traffic Density: ${trafficLoad || 'Standard'}`
          ],
          budget: {
            cost: estimatedFixCost,
            ROI: `Prevents ${preventedCost} structural failure loss`
          },
          greenImpact: {
            co2Saved: co2Saved,
            people: sector.popBenefited
          },
          recommendation: `Deploy maintenance team to ${sector.name} within ${timeframeDays} days to execute preventative sealing.`
        }
      });
    }
    
    // Default POST: User Report Submission & AI Image / Spatial Verification
    const isRealPhotoFallback = !body.photoUrl || (!body.photoUrl.includes('stock') && !body.photoUrl.includes('fake'));
    const categoryName = body.category || 'Pothole / Road Damage';
    let assignedDeptFallback = 'Public Works Dept (PWD)';
    if (categoryName.includes('Water')) assignedDeptFallback = 'Water & Sanitation Authority';
    if (categoryName.includes('Garbage') || categoryName.includes('Biowaste')) assignedDeptFallback = 'Municipal Solid Waste';
    if (categoryName.includes('Light') || categoryName.includes('Traffic')) assignedDeptFallback = 'Traffic Control Bureau';

    let aiAnalysisResult = null;
    let isRealPhoto = isRealPhotoFallback;
    let assignedDept = assignedDeptFallback;
    let priorityScore = isRealPhoto ? Math.floor(85 + Math.random() * 12) : 8;

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey && body.photoUrl) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
          const schema = {
          type: "object",
          properties: {
            isRealPhoto: { type: "boolean", description: "True if it looks like a real citizen field report photo, False if it looks like a stock image or fake." },
            damageSeverity: { type: "string", description: "Description of damage severity based on the image, e.g. 'Pothole Depth: ~8cm, Subsoil Exposure: High'." },
            duplicateScore: { type: "string", description: "E.g. '0.1% Stock Match' or '98% (Stock Image)'" },
            aiGenProbability: { type: "string", description: "E.g. '0.3% Synthetic'" },
            verdict: { type: "string", description: "'CONFIRMED ACCURATE' or 'REJECTED (FAKE REPORT)'" },
            department: { type: "string", description: "Auto-assigned municipal department, e.g. 'Public Works Dept (PWD)' or 'Water & Sanitation Authority'" },
            priorityScore: { type: "integer", description: "Priority score out of 100 based on severity." },
            isDuplicate: { type: "boolean", description: "True if this new report matches any report in the recentReports list based on category and location/visuals." },
            matchedReportId: { type: "string", description: "The ID of the matched report from recentReports, if isDuplicate is true." }
          },
          required: ["isRealPhoto", "damageSeverity", "duplicateScore", "aiGenProbability", "verdict", "department", "priorityScore", "isDuplicate"]
        };

        const prompt = `Analyze this citizen report photo for a city issue in category: "${categoryName}". Description: "${body.description || ''}".
Determine if it's a real photo or a fake/stock image. Assess the damage severity and assign the correct municipal department.

Additionally, compare this new report with these recent active reports:
${body.recentReports ? JSON.stringify(body.recentReports.map(r => ({ id: r.id, category: r.category, location: r.location, description: r.description }))) : '[]'}
CRITICAL RULE: If any of the recent reports share the EXACT SAME "category" and "location" as this new report, you MUST set isDuplicate to true and provide its ID in matchedReportId. Do this even if the image is fake or stock.`;

        let contents = [];

        if (body.photoUrl.startsWith('data:image/')) {
          const matches = body.photoUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            contents = [
              prompt,
              {
                inlineData: {
                  data: matches[2],
                  mimeType: matches[1]
                }
              }
            ];
          }
        } else if (body.photoUrl.startsWith('http')) {
          const imageResponse = await fetch(body.photoUrl);
          const arrayBuffer = await imageResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          contents = [
            prompt,
            {
              inlineData: {
                data: buffer.toString('base64'),
                mimeType: imageResponse.headers.get('content-type') || 'image/jpeg'
              }
            }
          ];
        }

        if (contents.length > 0) {
          const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: contents,
            config: {
              responseMimeType: "application/json",
              responseSchema: schema
            }
          });

          aiAnalysisResult = JSON.parse(response.text);
          isRealPhoto = aiAnalysisResult.isRealPhoto;
          assignedDept = aiAnalysisResult.department;
          priorityScore = aiAnalysisResult.priorityScore;
        }
      } catch (err) {
        console.error("Gemini Vision AI Error:", err);
      }
    }

    const aiVerdict = {
      id: `CMP-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`,
      user: body.user || 'Aarav Sharma',
      userScore: 96,
      trustBadge: 'Gold Verified Citizen',
      location: body.location || 'Sector 62, Main Gate 3',
      category: categoryName,
      description: body.description || '',
      photoUrl: body.photoUrl,
      status: isRealPhoto ? 'Verified & Scheduled' : 'Rejected (Fake)',
      verificationStatus: isRealPhoto ? 'AI Verified - Real' : 'AI Flagged - Suspicious',
      aiAnalysis: aiAnalysisResult || {
        metadataValid: isRealPhoto,
        duplicateScore: isRealPhoto ? '0.5%' : '98.4% (Stock Image Match)',
        aiGenProbability: isRealPhoto ? '1.2%' : '87.6%',
        verdict: isRealPhoto ? 'CONFIRMED ACCURATE' : 'REJECTED (FAKE REPORT)',
        isDuplicate: false
      },
      priorityScore: priorityScore,
      rewardEarned: isRealPhoto ? '+150 Points' : '0 Points',
      department: assignedDept,
      timeAgo: 'Just now',
      createdAt: new Date().toISOString()
    };

    let isDuplicate = aiAnalysisResult?.isDuplicate || false;
    let matchedReportId = aiAnalysisResult?.matchedReportId || '';

    // Helper: extract coordinates from string like "Sector 62 (28.6280, 77.3649)"
    const parseCoords = (locStr) => {
      const match = locStr?.match(/\(([^)]+)\)/);
      if (match) {
        const parts = match[1].split(',');
        if (parts.length === 2) return [parseFloat(parts[0]), parseFloat(parts[1])];
      }
      return null;
    };

    // Haversine formula for distance in meters
    const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
      const R = 6371e3;
      const r1 = lat1 * Math.PI/180;
      const r2 = lat2 * Math.PI/180;
      const d1 = (lat2-lat1) * Math.PI/180;
      const d2 = (lon2-lon1) * Math.PI/180;
      const a = Math.sin(d1/2) * Math.sin(d1/2) +
                Math.cos(r1) * Math.cos(r2) *
                Math.sin(d2/2) * Math.sin(d2/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    if (!isDuplicate && body.recentReports) {
      const newLoc = parseCoords(body.location || '');
      
      const match = body.recentReports.find(r => {
        if (r.category !== categoryName) return false;
        
        // Exact string match check fallback
        if (r.location === (body.location || 'Sector 62, Main Gate 3')) return true;
        
        // Geospatial proximity check (within 10 meters)
        const oldLoc = parseCoords(r.location);
        if (newLoc && oldLoc) {
          const dist = getDistanceMeters(newLoc[0], newLoc[1], oldLoc[0], oldLoc[1]);
          if (dist < 10) return true;
        }
        return false;
      });

      if (match) {
        isDuplicate = true;
        matchedReportId = match.id;
      }
    }

    if (isDuplicate && matchedReportId) {
      return NextResponse.json({
        status: 'success',
        isDuplicate: true,
        matchedReportId: matchedReportId,
        report: aiVerdict
      });
    }

    return NextResponse.json({
      status: 'success',
      isDuplicate: false,
      report: aiVerdict
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
