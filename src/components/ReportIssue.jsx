import React, { useState, useRef } from 'react'
import { Upload, Sparkles, Check, AlertTriangle, RefreshCw, Camera, VideoOff, Info } from 'lucide-react'
import { analyzeIssueImage } from '../services/agents'

// Polynomial roll-hash for fast client-side image fingerprinting
const getStringHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
};

// Image compression helper to resize and export as a low-footprint jpeg base64 string
const compressImage = (file, maxWidth = 500, maxHeight = 500) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions keeping aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export as compressed JPEG base64 (quality: 0.6)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        resolve(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default function ReportIssue({ reports = [], onAddReport, setView, currentUser }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLiveCapture, setIsLiveCapture] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [fileHash, setFileHash] = useState('');
  
  // Form edit states
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSeverity, setEditSeverity] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null);
      setIsLiveCapture(false);
      setIsDuplicate(false);
      
      // Calculate duplicate check hash
      const reader = new FileReader();
      reader.onloadend = () => {
        const hash = getStringHash(reader.result);
        const duplicate = reports.some(rep => rep.imageHash === hash);
        setIsDuplicate(duplicate);
        setFileHash(hash);
      };
      reader.readAsDataURL(file);

      // Calculate compressed base64 preview for session persistence
      try {
        const compressed = await compressImage(file);
        setPreviewUrl(compressed);
      } catch (err) {
        console.error("Compression failed, falling back to blob URL", err);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setAnalysisResult(null);
      setIsLiveCapture(false);
      setIsDuplicate(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        const hash = getStringHash(reader.result);
        const duplicate = reports.some(rep => rep.imageHash === hash);
        setIsDuplicate(duplicate);
        setFileHash(hash);
      };
      reader.readAsDataURL(file);

      try {
        const compressed = await compressImage(file);
        setPreviewUrl(compressed);
      } catch (err) {
        console.error("Compression failed, falling back to blob URL", err);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  // Start Webcam stream
  const startCamera = async () => {
    setIsCameraActive(true);
    setAnalysisResult(null);
    setSelectedFile(null);
    setPreviewUrl('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // prefer back camera on phones
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Webcam access error:', error);
      setIsCameraActive(false);
      alert('Unable to access camera. Please check browser permissions.');
    }
  };

  // Stop Webcam stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  // Capture image frame from stream
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setIsLiveCapture(true);
      setIsDuplicate(false);
      stopCamera();
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const hash = getStringHash(reader.result);
        const duplicate = reports.some(rep => rep.imageHash === hash);
        setIsDuplicate(duplicate);
        setFileHash(hash);
      };
      reader.readAsDataURL(file);

      try {
        const compressed = await compressImage(file);
        setPreviewUrl(compressed);
      } catch (err) {
        console.error("Compression failed, falling back to blob URL", err);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }, 'image/jpeg');
  };

  // Run AI agent analysis & Geolocation
  const runAIAnalysis = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    
    let locationData = null;

    // Trigger browser geolocation check in parallel
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
        });
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Reverse geocoding using OSM free Nominatim service
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const geoData = await geoRes.json();
        
        locationData = {
          latitude: lat,
          longitude: lng,
          address: geoData.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        };
      } catch (e) {
        console.warn('Geolocation extraction failed, using AI fallback.', e);
      }
    }
    
    try {
      const result = await analyzeIssueImage(selectedFile);
      
      // Override mock coordinates with real geolocation if fetched successfully
      if (locationData) {
        result.location = locationData;
      }
      
      setAnalysisResult(result);
      
      // Populate form fields with AI suggestions
      setEditTitle(result.title || '');
      setEditCategory(result.category || 'Roads & Infrastructure');
      setEditSeverity(result.severity || 'Medium');
      setEditDescription(result.description || '');
      setEditAddress(result.location?.address || 'Detected Location');
    } catch (error) {
      console.error('Analysis failed', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit report to global state
  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!analysisResult) return;

    // Final security check for duplicates
    if (isDuplicate || reports.some(rep => rep.imageHash === fileHash)) {
      alert("Submission Blocked: This exact image has already been reported. Duplicate reports are blocked to prevent spam.");
      return;
    }

    const newReport = {
      id: 'rep-' + Date.now(),
      title: editTitle,
      category: editCategory,
      description: editDescription,
      severity: editSeverity,
      status: isLiveCapture ? 'Reported' : 'Pending Verification',
      location: {
        latitude: analysisResult.location.latitude,
        longitude: analysisResult.location.longitude,
        address: editAddress
      },
      aiConfidence: analysisResult.aiConfidence || 90,
      consensusScore: isLiveCapture ? 95 : 60,
      reportedAt: new Date().toISOString(),
      imageUrl: previewUrl,
      votes: 1,
      votedBy: [],
      civicLetter: '',
      isLiveCapture,
      imageHash: fileHash,
      reportedBy: currentUser?.id || 'current-user'
    };

    onAddReport(newReport);
    setView('dashboard');
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setAnalysisResult(null);
    setIsLiveCapture(false);
    setIsDuplicate(false);
    setFileHash('');
    stopCamera();
  };

  return (
    <div className="fade-in-view" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      <header>
        <h1 style={{ fontSize: '28px', marginBottom: '4px', fontWeight: 800 }}>AI-Assisted Issue Reporter</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Take a live photo on-site or upload an image. Gemini will analyze and secure your report.</p>
      </header>

      {/* Main Flow card */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        
        {/* Step 1: Upload or Camera Interface */}
        {!selectedFile && !isCameraActive && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Drag & Drop Area */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              style={{ 
                border: '2px dashed var(--panel-border)', 
                borderRadius: '12px', 
                padding: '50px 20px', 
                textAlign: 'center', 
                cursor: 'pointer',
                background: '#ffffff',
                transition: 'var(--transition-smooth)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'rgba(88, 87, 249, 0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--panel-border)';
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              <div style={{ background: 'rgba(88, 87, 249, 0.1)', color: 'var(--primary)', padding: '14px', borderRadius: '50%' }}>
                <Upload size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', marginBottom: '4px' }}>Drag & Drop incident photo</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Supports JPG, PNG, WebP.</p>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', border: '1px solid var(--panel-border)', padding: '4px 10px', borderRadius: '20px' }}>
                Or browse files
              </span>
            </div>

            {/* OR Splitter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '10px', margin: '10px 0' }}>
              <div style={{ flexGrow: 1, height: '1px', background: 'var(--panel-border)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>OR</span>
              <div style={{ flexGrow: 1, height: '1px', background: 'var(--panel-border)' }} />
            </div>

            {/* Live Camera Button */}
            <button 
              onClick={startCamera}
              className="glow-button"
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            >
              <Camera size={18} />
              Snap Live Photo (Earn +75 Karma)
            </button>
          </div>
        )}

        {/* Live Camera View Finder */}
        {isCameraActive && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '480px', 
              height: '320px', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              border: '1px solid var(--panel-border)',
              background: '#000'
            }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ 
                position: 'absolute', 
                top: '12px', 
                left: '12px',
                background: 'rgba(6,182,212,0.15)',
                color: 'var(--primary)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 700
              }}>
                📷 Live Viewfinder
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '480px' }}>
              <button 
                onClick={stopCamera}
                style={{ 
                  flexGrow: 1, 
                  background: '#ffffff', 
                  color: 'var(--text-main)', 
                  border: '1px solid var(--panel-border)', 
                  borderRadius: '6px', 
                  padding: '12px', 
                  fontSize: '14px', 
                  cursor: 'pointer' 
                }}
              >
                Cancel
              </button>
              <button 
                onClick={capturePhoto}
                className="glow-button"
                style={{ flexGrow: 2, justifyContent: 'center' }}
              >
                <Camera size={16} />
                Capture Scene
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Image Preview & Trigger AI */}
        {selectedFile && !analysisResult && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            
            {/* Visual scan container */}
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '450px', 
              height: '300px', 
              borderRadius: '8px', 
              overflow: 'hidden', 
              background: 'black',
              border: '1px solid var(--panel-border)'
            }}>
              <img 
                src={previewUrl} 
                alt="Upload preview" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />

              {/* Scanning laser line overlay */}
              {isAnalyzing && (
                <div className="scanner-laser" />
              )}
            </div>

            {/* Verification Badge or Duplicate Alert */}
             {isDuplicate ? (
               <div style={{ 
                 display: 'flex', 
                 alignItems: 'center', 
                 gap: '12px', 
                 fontSize: '13px', 
                 background: 'rgba(255, 74, 90, 0.1)', 
                 color: 'var(--severity-critical)',
                 border: '1px solid var(--severity-critical-border)',
                 padding: '12px 16px', 
                 borderRadius: '8px',
                 maxWidth: '450px',
                 lineHeight: '1.4'
               }}>
                 <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                 <div>
                   <strong style={{ display: 'block', marginBottom: '2px', fontSize: '14px' }}>Duplicate Report Blocked</strong>
                   This exact image has already been uploaded for another report. Submitting duplicate issues is prohibited to maintain data integrity.
                 </div>
               </div>
             ) : isLiveCapture ? (
               <div style={{ 
                 display: 'flex', 
                 alignItems: 'center', 
                 gap: '6px', 
                 fontSize: '12px', 
                 background: 'rgba(16, 185, 129, 0.1)', 
                 color: 'var(--severity-resolved)',
                 border: '1px solid ' + ('var(--severity-resolved-border)'),
                 padding: '6px 12px', 
                 borderRadius: '6px' 
               }}>
                 <Check size={14} />
                 <span>Verified Live Capture: Anti-fraud enabled (+25 Karma Bonus eligibility)</span>
               </div>
             ) : (
               <div style={{ 
                 display: 'flex', 
                 alignItems: 'center', 
                 gap: '6px', 
                 fontSize: '12px', 
                 background: 'rgba(249, 115, 22, 0.1)', 
                 color: 'var(--severity-medium)',
                 border: '1px solid ' + ('var(--severity-medium-border)'),
                 padding: '6px 12px', 
                 borderRadius: '6px' 
               }}>
                 <AlertTriangle size={14} />
                 <span>File Upload: Standard verification mode (Duplicate checks pending)</span>
               </div>
             )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '450px' }}>
              <button 
                onClick={resetForm}
                disabled={isAnalyzing}
                style={{ 
                  flexGrow: 1, 
                  background: '#ffffff', 
                  color: 'var(--text-main)', 
                  border: '1px solid var(--panel-border)', 
                  borderRadius: '6px', 
                  padding: '12px', 
                  fontSize: '14px', 
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                Reset Image
              </button>

              <button 
                onClick={runAIAnalysis}
                disabled={isAnalyzing || isDuplicate}
                className="glow-button"
                style={{ 
                  flexGrow: 2, 
                  justifyContent: 'center',
                  opacity: isDuplicate ? 0.5 : 1,
                  cursor: isDuplicate ? 'not-allowed' : 'pointer'
                }}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={16} style={{ animation: 'spin 1.5s linear infinite' }} />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Analyze with Gemini AI
                  </>
                )}
              </button>
            </div>
            
            {/* Loading Spinner Keyframes helper inline */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}} />
          </div>
        )}

        {/* Step 3: Editable Form or Rejection Screen */}
        {analysisResult && (
          analysisResult.isValidIssue === false ? (
            /* AI Rejection Screen */
            <div className="fade-in-view" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255, 74, 90, 0.1)', color: 'var(--severity-critical)', padding: '20px', borderRadius: '50%' }}>
                <AlertTriangle size={36} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>Upload Rejected by AI Guard</h2>
              
              <div style={{ width: '100%', maxWidth: '280px', height: '180px', borderRadius: '8px', overflow: 'hidden', margin: '10px 0', border: '1px solid var(--panel-border)' }}>
                <img src={previewUrl} alt="Rejection preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '500px', lineHeight: '1.6' }}>
                {analysisResult.rejectionReason}
              </p>
              
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--panel-border)', paddingTop: '20px', width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                <button 
                  onClick={resetForm}
                  className="glow-button"
                  style={{ background: '#ffffff', color: 'var(--text-main)', border: '1px solid var(--panel-border)', margin: '0 auto', boxShadow: 'none', animation: 'none' }}
                >
                  Upload Different Image
                </button>
              </div>
            </div>
          ) : (
            /* Success Form View */
            <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Side-by-side: Image metadata review + form inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '28px', flexWrap: 'wrap' }}>
                
                {/* Left Column: Vision verification badge */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ borderRadius: '8px', overflow: 'hidden', height: '220px', background: '#000', border: '1px solid var(--panel-border)' }}>
                    <img src={previewUrl} alt="Report scene" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <div style={{ background: 'rgba(88, 87, 249, 0.08)', border: '1px solid rgba(88, 87, 249, 0.15)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '13px', fontWeight: 700 }}>
                      <Sparkles size={14} />
                      Gemini Vision Verified
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
                        {analysisResult.aiConfidence}%
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>confidence index</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      The AI successfully detected physical patterns corresponding to municipal hazards and suggested baseline metadata.
                    </p>
                  </div>
                </div>

                {/* Right Column: Editable form fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Title */}
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Report Title</label>
                    <input 
                      type="text" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                      style={{ width: '100%', fontSize: '14px' }}
                    />
                  </div>

                  {/* Category & Severity Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        style={{ width: '100%', fontSize: '14px', cursor: 'pointer' }}
                      >
                        <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                        <option value="Sanitation & Waste">Sanitation & Waste</option>
                        <option value="Public Utilities">Public Utilities</option>
                        <option value="Public Safety">Public Safety</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Severity</label>
                      <select
                        value={editSeverity}
                        onChange={(e) => setEditSeverity(e.target.value)}
                        style={{ width: '100%', fontSize: '14px', cursor: 'pointer' }}
                      >
                        <option value="Critical">🚨 Critical Hazard</option>
                        <option value="High">🟠 High Urgency</option>
                        <option value="Medium">🟡 Medium Priority</option>
                        <option value="Low">🔵 Low Attention</option>
                      </select>
                    </div>
                  </div>

                  {/* Location Address */}
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Detected Location / Address</label>
                    <input 
                      type="text" 
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      required
                      style={{ width: '100%', fontSize: '14px' }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Detailed Description</label>
                    <textarea 
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      required
                      rows={3}
                      style={{ width: '100%', fontSize: '14px', resize: 'vertical' }}
                    />
                  </div>

                </div>

              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--panel-border)', paddingTop: '20px', marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={resetForm}
                  style={{ 
                    background: '#ffffff', 
                    color: 'var(--text-main)', 
                    border: '1px solid var(--panel-border)', 
                    borderRadius: '6px', 
                    padding: '10px 20px', 
                    fontSize: '14px', 
                    cursor: 'pointer' 
                  }}
                >
                  Reset Form
                </button>
                
                <button 
                  type="submit"
                  className="glow-button"
                >
                  <Check size={16} />
                  Publish Report ({isLiveCapture ? '+75' : '+40'} Karma)
                </button>
              </div>

            </form>
          )
        )}

      </div>

    </div>
  )
}
