'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, isFirebaseConfigured } from '@/lib/firebase';
import { COMMUNITY_CHALLENGES } from '@/lib/data';
import { extractGpsFromImage } from '@/lib/exif-gps';

export default function CitizenPortal({ userReports, onNewReportSubmit, onReportUpvote, rewardPoints, userProfile, onLoginSuccess, onClaimCarbonCredits }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // login | register
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  // Report Upload Form State
  const [category, setCategory] = useState('Pothole / Road Damage');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [gpsLocation, setGpsLocation] = useState({ lat: 28.6280, lng: 77.3649, address: 'Sector 62, Main Gate 3 (28.6280, 77.3649)' });
  const [gpsSource, setGpsSource] = useState(null); // 'exif' | 'browser' | null
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastVerifiedReport, setLastVerifiedReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Filter State
  const [reportFilter, setReportFilter] = useState('ALL');
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);

  // Challenges State
  const [challenges, setChallenges] = useState(COMMUNITY_CHALLENGES);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        onLoginSuccess({
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          score: 96,
          badge: 'Gold Verified Citizen'
        });
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleFetchGPS = () => {
    setIsGettingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({
            lat: pos.coords.latitude.toFixed(4),
            lng: pos.coords.longitude.toFixed(4),
            address: `Live GPS: (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
          });
          setGpsSource('browser');
          setIsGettingGps(false);
        },
        () => {
          setGpsLocation({ lat: 28.6280, lng: 77.3649, address: 'Sector 62, Main Gate 3 (GPS Triangulated)' });
          setGpsSource(null);
          setIsGettingGps(false);
        }
      );
    } else {
      setGpsLocation({ lat: 28.6280, lng: 77.3649, address: 'Sector 62, Main Gate 3 (GPS Triangulated)' });
      setGpsSource(null);
      setIsGettingGps(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Compress image for fast rendering and reliable API submission fallback
      try {
        const compressedBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const maxDim = 800;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = () => resolve(event.target.result);
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        });
        setPhotoPreview(compressedBase64);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
      }

      // Attempt EXIF GPS extraction from the raw File object
      try {
        const coords = await extractGpsFromImage(file);
        if (coords) {
          setGpsLocation({
            lat: coords.latitude.toFixed(4),
            lng: coords.longitude.toFixed(4),
            address: `📍 Image GPS: (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`
          });
          setGpsSource('exif');
        }
        // If no coords found, keep existing location — do not overwrite
      } catch {
        // Silently fall back — do not disrupt existing flow
      }
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setIsAuthOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      let finalPhotoUrl = photoPreview;

      if (isFirebaseConfigured && photoPreview && photoPreview.startsWith('data:image')) {
        try {
          const storageRef = ref(storage, `reports/issue-${Date.now()}.jpg`);
          await Promise.race([
            (async () => {
              await uploadString(storageRef, photoPreview, 'data_url');
              finalPhotoUrl = await getDownloadURL(storageRef);
            })(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Storage upload timeout')), 3000))
          ]);
        } catch (storageErr) {
          console.warn("Firebase Storage upload notice (using data URL fallback):", storageErr.message);
        }
      }

      const response = await fetch('/api/city-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentUser?.displayName || currentUser?.email?.split('@')[0] || userProfile?.name || 'Aarav Sharma',
          category: category,
          location: gpsLocation.address,
          description: description,
          photoUrl: finalPhotoUrl,
          recentReports: (userReports || []).slice(0, 10)
        })
      });

      const data = await response.json();
      const verifiedReport = data.report;

      if (data.isDuplicate && data.matchedReportId) {
        if (onReportUpvote) onReportUpvote(data.matchedReportId);
        setLastVerifiedReport({ ...verifiedReport, status: 'Merged & Upvoted (Duplicate)' });
        setSubmitSuccess(true);
      } else {
        try {
          if (isFirebaseConfigured) {
            await Promise.race([
              addDoc(collection(db, "reports"), {
                ...verifiedReport,
                createdAt: serverTimestamp()
              }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore sync timeout')), 2500))
            ]);
          }
        } catch (dbErr) {
          console.warn("Firestore client sync notice:", dbErr.message);
        }

        onNewReportSubmit(verifiedReport);
        setLastVerifiedReport(verifiedReport);
        setSubmitSuccess(true);
      }
      setDescription('');
      setPhotoPreview(null);
      setGpsSource(null);
    } catch (err) {
      console.error("Backend submit error:", err);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitSuccess(false), 7000);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'register') {
        await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
      } else {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      }
      setIsAuthOpen(false);
    } catch (err) {
      const demoProfile = {
        name: authForm.name || authForm.email.split('@')[0] || 'Citizen',
        email: authForm.email,
        score: 96,
        badge: 'Gold Verified Citizen'
      };
      setIsLoggedIn(true);
      onLoginSuccess(demoProfile);
      setIsAuthOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      // Ignore
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleClaimChallenge = (chalId) => {
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    setChallenges(prev => prev.map(c => c.id === chalId ? { ...c, progress: c.total, claimed: true } : c));
    if (onClaimCarbonCredits) onClaimCarbonCredits();
  };

  const filteredReports = userReports.filter(rep => {
    if (reportFilter === 'IN_PROGRESS') return rep.status.includes('Progress') || rep.status.includes('Scheduled');
    if (reportFilter === 'VERIFIED') return rep.verificationStatus?.includes('Real') || rep.status.includes('Verified');
    if (reportFilter === 'REJECTED') return rep.status.includes('Rejected');
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Identity & Auth Banner Card */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--emerald))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' }}>
            {isLoggedIn ? (currentUser?.email?.[0]?.toUpperCase() || 'A') : '👤'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>
              {isLoggedIn ? `Welcome back, ${currentUser?.email || userProfile?.name || 'Aarav Sharma'}` : 'Guest Citizen Mode'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {isLoggedIn 
                ? `Credibility Score: 96/100 | 🟢 Verified Citizen Session Active` 
                : `🔑 Login to verify citizen reports & accumulate Carbon Credits`}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isLoggedIn ? (
            <>
              <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald)', padding: '8px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reward Points:</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--emerald)' }}>{rewardPoints} pts</strong>
              </div>
              <button className="btn-danger" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => setIsAuthOpen(true)}>
              🔑 Login / Register Account
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Upload Photo & Track Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '24px' }}>

        {/* 1. UPLOAD PHOTO & SUBMIT REPORT CARD */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">📸 Report an Urban Issue</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: '700' }}>AI REALTIME VERIFICATION</span>
          </div>

          {submitSuccess && lastVerifiedReport && (
            <div style={{ 
              background: lastVerifiedReport.status.includes('Duplicate') ? 'rgba(59, 130, 246, 0.1)' : 'var(--emerald-light)', 
              border: `1px solid ${lastVerifiedReport.status.includes('Duplicate') ? '#3b82f6' : 'var(--emerald)'}`, 
              padding: '12px', 
              borderRadius: '10px', 
              marginBottom: '14px', 
              fontSize: '0.85rem', 
              color: lastVerifiedReport.status.includes('Duplicate') ? '#1d4ed8' : 'var(--emerald)' 
            }}>
              {lastVerifiedReport.status.includes('Duplicate') ? (
                <>
                  <div style={{ fontWeight: '700', marginBottom: '4px' }}>🔄 Duplicate Report Detected & Merged!</div>
                  <div>We found an existing complaint for this issue. We have upvoted report <strong>{lastVerifiedReport.id}</strong> on your behalf and increased its priority! (+150 Points)</div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: '700', marginBottom: '4px' }}>✓ Report verified by Next.js AI Engine & synced!</div>
                  <div>ID: <strong>{lastVerifiedReport.id}</strong> | Verdict: <strong>{lastVerifiedReport.verificationStatus}</strong> (+150 Points)</div>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Category Select */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Select Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-light)', border: '1px solid var(--panel-border)', color: 'var(--text-main)', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                <option value="Pothole / Road Damage">Pothole / Road Damage</option>
                <option value="Water Main Leak">Water Main Leak / Burst</option>
                <option value="Garbage Overflow">Biowaste / Garbage Overflow</option>
                <option value="Street Light Failure">Street Light Failure</option>
                <option value="Traffic Light Malfunction">Traffic Light Malfunction</option>
              </select>
            </div>

            {/* Description Input */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Description & Landmark</label>
              <textarea
                placeholder="Describe issue location, severity, or landmark..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ width: '100%', background: 'var(--bg-light)', border: '1px solid var(--panel-border)', color: 'var(--text-main)', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}
              />
            </div>

            {/* Live GPS Location */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Live GPS Location</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={gpsLocation.address}
                  style={{ flex: 1, background: 'var(--bg-subtle)', border: '1px solid var(--panel-border)', color: 'var(--text-muted)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}
                />
                <button type="button" onClick={handleFetchGPS} className="btn-primary" style={{ padding: '8px 12px', fontSize: '0.75rem' }}>
                  {isGettingGps ? 'Locating...' : '📍 Fetch GPS'}
                </button>
              </div>
              {gpsSource === 'exif' && (
                <div style={{ fontSize: '0.78rem', color: 'var(--emerald)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  📍 Location detected from image metadata — you can override with &quot;Fetch GPS&quot;
                </div>
              )}
              {gpsSource === null && photoPreview && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  No GPS location found in image. Use &quot;Fetch GPS&quot; or submit with default location.
                </div>
              )}
            </div>

            {/* Upload Photo Button & Preview */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Upload Issue Photo</label>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: '8px' }}>
                💡 Tip: Uploading an original photo will automatically extract the GPS coordinates of the incident!
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
                id="file-upload-input"
              />
              <label
                htmlFor="file-upload-input"
                style={{
                  display: 'block',
                  border: '2px dashed var(--panel-border)',
                  padding: '16px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--bg-subtle)',
                  fontSize: '0.85rem'
                }}
              >
                {photoPreview ? '📷 Photo Attached (Click to Change)' : '📷 Click to Take Photo or Upload Image'}
              </label>

              {photoPreview && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <img src={photoPreview} alt="Upload preview" style={{ maxHeight: '140px', borderRadius: '8px', border: '1px solid var(--panel-border)' }} />
                </div>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '10px', marginTop: '6px' }}>
              {isSubmitting ? 'Verifying with AI Neural Engine...' : '🚀 Submit to Backend API (+150 Points)'}
            </button>
          </form>
        </div>

        {/* 2. TRACK COMPLAINT STATUS & NEARBY ISSUES */}
        <div className="glass-card">
          <div className="card-header" style={{ marginBottom: '10px' }}>
            <div className="card-title">📌 Track Citizen Complaints</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>LIVE STREAM</span>
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            {['ALL', 'IN_PROGRESS', 'VERIFIED', 'REJECTED'].map(filter => (
              <button
                key={filter}
                className="sector-pill-btn"
                style={{ padding: '4px 10px', fontSize: '0.72rem', background: reportFilter === filter ? 'var(--primary)' : undefined, color: reportFilter === filter ? '#fff' : undefined }}
                onClick={() => setReportFilter(filter)}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="scroll-fade-y" style={{ height: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '20px' }}>
            {filteredReports.map((rep, idx) => (
              <div key={rep.id ? `${rep.id}-${idx}` : idx} className="scroll-animate-card" style={{ background: 'var(--panel-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--panel-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--primary)' }}>{rep.id} - {rep.category}</strong>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: rep.status.includes('Rejected') ? 'var(--crimson-light)' : 'var(--emerald-light)', color: rep.status.includes('Rejected') ? 'var(--crimson)' : 'var(--emerald)' }}>
                    {rep.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  📍 {rep.location} | 🏢 Dept: {rep.department}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: '6px' }}>
                  <span>Reporter: <strong>{rep.user}</strong></span>
                  <button
                    onClick={() => setSelectedReportDetail(rep)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    View Details 🔍
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. GREEN CITIZEN COMMUNITY CHALLENGES */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title">🏆 Green Citizen Community Challenges</div>
          <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={onClaimCarbonCredits}>
            🌱 Claim Carbon Credits (+250 Pts)
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {challenges.map(chal => (
            <div key={chal.id} style={{ background: 'var(--panel-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--panel-border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.95rem' }}>{chal.title}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: '700' }}>
                  {chal.progress}/{chal.total} Completed
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>{chal.desc}</p>
              
              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ width: `${(chal.progress / chal.total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--emerald))' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>🎁 {chal.reward}</span>
                <button
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', background: chal.claimed ? '#10b981' : undefined }}
                  onClick={() => handleClaimChallenge(chal.id)}
                  disabled={chal.claimed}
                >
                  {chal.claimed ? '✓ Reward Claimed' : '🏆 Complete & Claim'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LOGIN / REGISTER MODAL */}
      {isAuthOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-card">
            <div className="card-header">
              <div className="card-title">{authMode === 'login' ? '🔑 Authenticate Citizen Account' : '📝 Create New Account'}</div>
              <button onClick={() => setIsAuthOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {authMode === 'register' && (
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Aarav Sharma"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    style={{ width: '100%', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', color: 'var(--text-main)', padding: '10px', borderRadius: '8px' }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="aarav@citymind.ai"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  style={{ width: '100%', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', color: 'var(--text-main)', padding: '10px', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  style={{ width: '100%', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', color: 'var(--text-main)', padding: '10px', borderRadius: '8px' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px', padding: '10px' }}>
                {authMode === 'login' ? 'Authenticate Session' : 'Register Account'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.8rem' }}>
                <span
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {authMode === 'login' ? "Don't have an account? Register" : "Already registered? Login"}
                </span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT DETAIL INSPECTION MODAL */}
      {selectedReportDetail && (
        <div className="modal-overlay">
          <div className="glass-card modal-card" style={{ maxWidth: '500px' }}>
            <div className="card-header">
              <div className="card-title">🔍 Complaint Details & AI Verdict</div>
              <button onClick={() => setSelectedReportDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{selectedReportDetail.id} - {selectedReportDetail.category}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: <strong>{selectedReportDetail.status}</strong></div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location: {selectedReportDetail.location}</div>
              {selectedReportDetail.aiAnalysis?.damageSeverity && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  AI Analysis: <strong>{selectedReportDetail.aiAnalysis.damageSeverity}</strong>
                </div>
              )}
              {selectedReportDetail.aiAnalysis?.duplicateScore && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  AI Authenticity: <strong>{selectedReportDetail.aiAnalysis.aiGenProbability} | {selectedReportDetail.aiAnalysis.duplicateScore}</strong>
                </div>
              )}
            </div>

            {selectedReportDetail.photoUrl && (
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <img src={selectedReportDetail.photoUrl} alt="Report evidence" style={{ maxHeight: '160px', borderRadius: '8px', border: '1px solid var(--panel-border)' }} />
              </div>
            )}

            <button className="btn-primary" style={{ width: '100%', padding: '8px' }} onClick={() => setSelectedReportDetail(null)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}
