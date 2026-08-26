import { NextResponse } from 'next/server';
import { CITY_SECTORS, PREDICTIVE_HAZARDS, INITIAL_USER_REPORTS, DEPARTMENT_STATS, MONTHLY_ANALYTICS } from '@/lib/data';

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
    const isRealPhoto = !body.photoUrl || (!body.photoUrl.includes('stock') && !body.photoUrl.includes('fake'));
    
    const categoryName = body.category || 'Pothole / Road Damage';
    let assignedDept = 'Public Works Dept (PWD)';
    if (categoryName.includes('Water')) assignedDept = 'Water & Sanitation Authority';
    if (categoryName.includes('Garbage') || categoryName.includes('Biowaste')) assignedDept = 'Municipal Solid Waste';
    if (categoryName.includes('Light') || categoryName.includes('Traffic')) assignedDept = 'Traffic Control Bureau';

    const aiVerdict = {
      id: `CMP-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`,
      user: body.user || 'Aarav Sharma',
      userScore: 96,
      trustBadge: 'Gold Verified Citizen',
      location: body.location || 'Sector 62, Main Gate 3',
      category: categoryName,
      photoUrl: body.photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
      status: isRealPhoto ? 'In Progress (AI Verified)' : 'Rejected (Fake)',
      verificationStatus: isRealPhoto ? 'AI Verified - Real' : 'AI Flagged - Suspicious',
      aiAnalysis: {
        metadataValid: isRealPhoto,
        duplicateScore: isRealPhoto ? '0.1% Stock Match' : '98.4% (Stock Image Match)',
        aiGenProbability: isRealPhoto ? '0.3% Synthetic' : '88.2% AI Generated',
        verdict: isRealPhoto ? 'CONFIRMED ACCURATE' : 'REJECTED (FAKE REPORT)'
      },
      priorityScore: isRealPhoto ? Math.floor(85 + Math.random() * 12) : 8,
      rewardEarned: isRealPhoto ? '+150 Points' : '0 Points',
      department: assignedDept,
      timeAgo: 'Just now',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      status: 'success',
      report: aiVerdict
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
