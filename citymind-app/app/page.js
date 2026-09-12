import Link from 'next/link';

export const metadata = {
  title: "CityMind AI — Sustainable Smart City Intelligence & Digital Twin",
  description: "Predictive municipal intelligence, real-time digital twin simulations, and citizen-governed ecological intelligence for future-ready sustainable cities.",
};

export default function LandingPage() {
  const marqueeItems = [
    "Real-Time Digital Twin",
    "Predictive Drainage & Flood Simulation",
    "Community Carbon Credits",
    "AI Governor Neural Reasoning",
    "Autonomous Sensor Telemetry",
    "Citizen Civic Action",
    "Biophilic Urban Resilience",
    "Zero-Emission Municipal Operations"
  ];

  return (
    <div className="editorial-wrapper">

      {/* 1. EDITORIAL NAVIGATION BAR */}
      <nav className="editorial-nav" aria-label="Main Navigation">
        <Link href="/" className="nav-brand">
          <span className="brand-dot" aria-hidden="true"></span>
          <span className="brand-name">CityMind</span>
          <span className="brand-tag">AI 2.0</span>
        </Link>

        <ul className="nav-menu">
          <li><a href="#capabilities" className="nav-link">Capabilities</a></li>
          <li><a href="#showcase" className="nav-link">District 62</a></li>
          <li><a href="#methodology" className="nav-link">Methodology</a></li>
          <li><a href="#perspectives" className="nav-link">Perspectives</a></li>
        </ul>

        <Link href="/dashboard" className="nav-cta-btn">
          Launch Console
          <span aria-hidden="true">→</span>
        </Link>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="editorial-hero">
        <div className="hero-header-row">
          <div className="hero-badge-pill">
            <span className="hero-badge-dot"></span>
            Autonomous Civic Intelligence 2.0
          </div>

          <h1 className="hero-main-title">
            Cities that think.<br />
            <em>Before tomorrow arrives.</em>
          </h1>

          <div className="hero-split-sub">
            <p className="hero-subtext">
              CityMind transforms municipal governance through predictive digital twins,
              automated infrastructure hazard forecasting, and citizen-powered ecological intelligence.
            </p>

            <div className="hero-actions">
              <Link href="/dashboard" className="btn-editorial-dark">
                Launch Live Console
                <span aria-hidden="true">→</span>
              </Link>
              <a href="#showcase" className="btn-editorial-outline">
                Explore District 62 Model
              </a>
            </div>
          </div>
        </div>

        {/* Hero Architectural Visual */}
        <div className="hero-banner-image">
          <img
            src="/images/hero-city.jpg"
            alt="Editorial aerial view of a sustainable biophilic smart city with solar arrays and digital sensor network"
            loading="eager"
          />
          <div className="hero-image-overlay-badge">
            <span className="brand-dot" style={{ width: '8px', height: '8px' }}></span>
            <div>
              <strong>DISTRICT 62 — ACTIVE BIOPHILIC TWIN</strong>
              <span>94.2% Grid Efficiency • 14,800 Edge Sensors Streaming</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. MARQUEE TICKER */}
      <section className="editorial-marquee" aria-label="Feature Highlights">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <div key={idx} className="marquee-item">
              <span>{item}</span>
              <span className="marquee-separator" aria-hidden="true">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SERVICES / CAPABILITIES SECTION */}
      <section id="capabilities" className="editorial-section">
        <div className="services-header-row">
          <div>
            <span className="section-label">01 / Core Capabilities</span>
            <h2 className="section-title">Engineered for resilient, autonomous urban ecosystems.</h2>
          </div>
          <p className="section-subtitle">
            Three interconnected layers of artificial intelligence working in continuous harmony across municipal hardware, predictive analytics, and civic participation.
          </p>
        </div>

        <div className="services-grid">
          {/* Card 1 */}
          <article className="service-card">
            <div className="service-card-media">
              <img
                src="/images/service-digital-twin.jpg"
                alt="3D isometric architectural digital twin simulation with energy flows and tree canopy density"
                loading="lazy"
              />
              <span className="service-card-tag">Realtime 3D</span>
            </div>
            <div className="service-card-body">
              <h3 className="service-card-title">Digital Twin & Spatial Neural Sim</h3>
              <p className="service-card-desc">
                Continuous 3D district modeling with sub-meter spatial precision, tracking energy vectors, heat island distribution, and tree canopy health across every municipal sector.
              </p>
              <Link href="/dashboard" className="service-card-link">
                Explore Twin Map <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>

          {/* Card 2 */}
          <article className="service-card">
            <div className="service-card-media">
              <img
                src="/images/service-predictive.jpg"
                alt="Minimalist environmental telemetry sensor post in lush park setting"
                loading="lazy"
              />
              <span className="service-card-tag">Early Warning</span>
            </div>
            <div className="service-card-body">
              <h3 className="service-card-title">Predictive Infrastructure Shield</h3>
              <p className="service-card-desc">
                Machine learning algorithms detect water pipe pressure surges, structural pavement fissures, and storm drainage choke points up to 48 hours before physical failure.
              </p>
              <Link href="/dashboard" className="service-card-link">
                View Risk Simulator <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>

          {/* Card 3 */}
          <article className="service-card">
            <div className="service-card-media">
              <img
                src="/images/service-citizen.jpg"
                alt="Citizens gathered in a modern urban pocket garden collaborating on civic initiatives"
                loading="lazy"
              />
              <span className="service-card-tag">Civic Synergy</span>
            </div>
            <div className="service-card-body">
              <h3 className="service-card-title">Citizen Intelligence & Eco Rewards</h3>
              <p className="service-card-desc">
                Empowers residents with verified geotagged hazard reporting, community micro-challenges, and redeemable municipal carbon credits directly exchangeable for transit and local goods.
              </p>
              <Link href="/dashboard" className="service-card-link">
                Join Citizen Portal <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* 5. FEATURED CASE STUDY SHOWCASE */}
      <section id="showcase" className="editorial-section" style={{ paddingTop: 0 }}>
        <div className="showcase-container">
          <div className="showcase-media">
            <img
              src="/images/project-smart-district.jpg"
              alt="Night architectural view of District 62 revitalization with warm promenade lighting and sustainable architecture"
              loading="lazy"
            />
          </div>

          <div className="showcase-content">
            <span className="section-label">Case Study / District 62</span>
            <h2 className="section-title" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)' }}>
              From high-risk flood sector to carbon-neutral civic promenade.
            </h2>
            <p className="section-subtitle" style={{ fontSize: '1rem', marginBottom: '24px' }}>
              When severe monsoon weather threatened District 62’s subterranean storm grid,
              CityMind deployed continuous acoustic telemetry and predictive hydraulic simulation.
              By forecasting drainage choke points 36 hours ahead, municipal teams rerouted pressure,
              preventing over 18 major sewer overflows and saving tens of thousands in emergency repairs.
            </p>

            <Link href="/dashboard" className="service-card-link" style={{ marginBottom: '8px' }}>
              Inspect District 62 Live Telemetry in Console <span aria-hidden="true">→</span>
            </Link>

            <div className="showcase-stats-row">
              <div className="showcase-stat-box">
                <strong>$124.5K</strong>
                <span>Emergency Repair Costs Averted</span>
              </div>
              <div className="showcase-stat-box">
                <strong>450 T</strong>
                <span>CO₂ Emissions Mitigated</span>
              </div>
              <div className="showcase-stat-box">
                <strong>48 Hrs</strong>
                <span>Average Hazard Pre-warning Window</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PROCESS / METHODOLOGY (01-04) */}
      <section id="methodology" className="editorial-section">
        <span className="section-label">02 / Methodology</span>
        <h2 className="section-title">How autonomous municipal intelligence comes to life.</h2>
        <p className="section-subtitle">
          A transparent, closed-loop orchestration pipeline connecting real-world edge hardware with generative reasoning and citizen ground-truth.
        </p>

        <div className="process-grid">
          <div className="process-step-card">
            <span className="process-num">01</span>
            <h3 className="process-title">Telemetry Ingestion</h3>
            <p className="process-desc">
              Over 14,800 edge IoT hydrologic, acoustic, air quality, and traffic nodes continuously stream granular telemetry into low-latency municipal aggregators.
            </p>
          </div>

          <div className="process-step-card">
            <span className="process-num">02</span>
            <h3 className="process-title">Neural Calibration</h3>
            <p className="process-desc">
              Predictive neural networks calibrate against historical climate records and spatial topology, forecasting systemic infrastructure strain before it occurs.
            </p>
          </div>

          <div className="process-step-card">
            <span className="process-num">03</span>
            <h3 className="process-title">Autonomous Dispatch</h3>
            <p className="process-desc">
              The AI City Governor generates pre-emptive maintenance tickets and automatically alerts civil engineers with recommended mitigation pathways.
            </p>
          </div>

          <div className="process-step-card">
            <span className="process-num">04</span>
            <h3 className="process-title">Citizen Verification</h3>
            <p className="process-desc">
              Local residents verify completed restorations via on-device GPS photo logs, earning verified carbon credits and civic merchant vouchers.
            </p>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIAL QUOTE SECTION */}
      <section id="perspectives" className="editorial-quote-section">
        <div className="quote-inner">
          <div className="quote-mark" aria-hidden="true">“</div>
          <blockquote className="quote-text">
            “CityMind has turned municipal governance from reactive crisis firefighting into calm, predictive orchestration. We stopped treating symptoms and started healing the city’s living fabric.”
          </blockquote>
          <cite style={{ fontStyle: 'normal' }}>
            <div className="quote-author">Dr. Elena Rostova</div>
            <div className="quote-role">Director of Urban Resilience & Digital Infrastructure, District 62</div>
          </cite>
        </div>
      </section>

      {/* 8. DARK FOREST CALL-TO-ACTION BANNER */}
      <section className="editorial-cta-section">
        <div className="cta-banner-card">
          <div className="cta-banner-inner">
            <h2 className="cta-banner-title">
              Ready to experience the future of autonomous civic planning?
            </h2>
            <p className="cta-banner-desc">
              Step inside the live CityMind console to interact with the real-time digital twin map,
              run predictive storm simulations, inspect active citizen reports, and query the AI Governor.
            </p>

            <div className="cta-banner-actions">
              <Link href="/dashboard" className="btn-cream-action">
                Launch CityMind Console
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/dashboard" className="btn-dark-outline">
                Explore Citizen Rewards
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. EDITORIAL FOOTER */}
      <footer className="editorial-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand-col">
              <div className="footer-brand-title">CityMind AI</div>
              <p className="footer-brand-desc">
                Urban intelligence for living cities. Transforming municipal infrastructure and civic governance through predictive digital twins and community collaboration.
              </p>
              <div className="status-badge">
                <span className="status-dot"></span>
                <span>All municipal sensor nodes online (99.98%)</span>
              </div>
            </div>

            <div>
              <h4 className="footer-col-title">Platform</h4>
              <ul className="footer-links-list">
                <li><Link href="/dashboard">Digital Twin Map</Link></li>
                <li><Link href="/dashboard">Predictive Risk Engine</Link></li>
                <li><Link href="/dashboard">Citizen Action Portal</Link></li>
                <li><Link href="/dashboard">AI City Governor</Link></li>
                <li><Link href="/dashboard">Carbon Credit Ledger</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-col-title">Ecosystem</h4>
              <ul className="footer-links-list">
                <li><a href="#showcase">District 62 Pilot</a></li>
                <li><a href="#capabilities">Sensor Telemetry Specs</a></li>
                <li><a href="#methodology">Predictive Algorithms</a></li>
                <li><a href="#capabilities">Civic Merchant Network</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-col-title">Governance</h4>
              <ul className="footer-links-list">
                <li><a href="#methodology">Data Privacy Standards</a></li>
                <li><a href="#methodology">Transparent AI Briefs</a></li>
                <li><a href="#capabilities">Municipal Ethics Charter</a></li>
                <li><Link href="/dashboard">Incident Escalation</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>© 2026 CityMind AI. Developed for Sustainable Urban Governance.</div>
            <div>Built with Next.js 16, Leaflet & Gemini AI</div>
          </div>
        </div>
      </footer>

    </div>
  );
}
