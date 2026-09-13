import React, { useState, useEffect } from 'react';
import { Send, MapPin, Camera, Sparkles, CheckCircle2, Clock, Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function CitizenReportForm({ zones, onComplaintSubmitted }) {
  const [rawText, setRawText] = useState("");
  const [selectedZone, setSelectedZone] = useState("Sector 1 (Sangam Ghat)");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classification, setClassification] = useState(null);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [locationCoords, setLocationCoords] = useState({ lat: 25.4320, lng: 81.8885 });
  const [isClassifying, setIsClassifying] = useState(false);

  // Quick sample Hinglish complaint templates for 30s reporting
  const QUICK_TEMPLATES = [
    "Sector 1 Sangam Ghat mein toilet overflow ho raha hai gandi badboo hai",
    "Sector 5 tap water stopped no drinking water near food stalls",
    "Sector 2 Shastri Bridge side open drain choked with garbage",
    "Sector 3 Parade Ground main dustbin completely full plastic waste everywhere",
    "Sector 4 Arail Ghat handwash station tap is broken spraying water"
  ];

  // Auto-classify when rawText changes (debounced)
  useEffect(() => {
    if (rawText.trim().length >= 8) {
      const timer = setTimeout(() => {
        handleClassifyText(rawText);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setClassification(null);
    }
  }, [rawText]);

  const handleClassifyText = async (text) => {
    setIsClassifying(true);
    try {
      const res = await axios.post('/api/classify', { raw_text: text });
      setClassification(res.data);
    } catch (err) {
      console.error("Classification error:", err);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleZoneChange = (zoneName) => {
    setSelectedZone(zoneName);
    const z = zones.find(item => item.name === zoneName);
    if (z) {
      setLocationCoords({ lat: z.lat, lng: z.lng });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rawText.trim() || rawText.length < 3) return;

    setIsSubmitting(true);
    try {
      const payload = {
        raw_text: rawText,
        zone: selectedZone,
        photo_url: photoPreview,
        lat: locationCoords.lat,
        lng: locationCoords.lng
      };

      const res = await axios.post('/api/complaints', payload);
      setSubmittedResult(res.data);
      if (onComplaintSubmitted) onComplaintSubmitted(res.data);
    } catch (err) {
      console.error("Error submitting complaint:", err);
      alert("Failed to submit report. Please check backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setRawText("");
    setPhotoPreview(null);
    setClassification(null);
    setSubmittedResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-brand-terracotta/10 text-brand-terracotta px-3 py-1 rounded-full text-xs font-bold border border-brand-terracotta/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rapid Citizen Sanitation Reporting (&lt; 30 Seconds)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
          Report a Sanitation Issue
        </h1>
        <p className="text-xs sm:text-sm text-brand-stone mt-2 max-w-lg mx-auto">
          Notice overflowing toilets, dry taps, blocked drains, or uncollected garbage? Type in Hindi, Hinglish, or English.
        </p>
      </div>

      {submittedResult ? (
        /* Submission Success Card */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-emerald/30 shadow-lg text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-brand-emerald-light rounded-full flex items-center justify-center mx-auto border border-brand-emerald/20 text-brand-emerald">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-brand-dark">Sanitation Report Registered!</h3>
            <p className="text-xs text-brand-stone mt-1">Ticket ID: <span className="font-mono font-semibold text-brand-dark">{submittedResult.id}</span></p>
          </div>

          <div className="bg-brand-linen rounded-xl p-4 border border-brand-border text-left grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-brand-stone block">Assigned Dept</span>
              <span className="font-bold text-brand-dark">{submittedResult.department}</span>
            </div>
            <div>
              <span className="text-brand-stone block">Detected Category</span>
              <span className="font-bold text-brand-terracotta capitalize">{submittedResult.category.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-brand-stone block">Priority Score</span>
              <span className="font-bold text-brand-amber text-sm">{submittedResult.priority_score} / 100</span>
            </div>
            <div>
              <span className="text-brand-stone block">Status</span>
              <span className="font-bold text-brand-emerald bg-brand-emerald-light px-2 py-0.5 rounded-md border border-brand-emerald/20 inline-block mt-0.5 uppercase tracking-wider text-[10px]">
                {submittedResult.status}
              </span>
            </div>
          </div>

          <p className="text-xs text-brand-stone italic">
            This issue has been placed directly into the Government Staff Queue and assigned a priority score based on severity and local density.
          </p>

          <button
            onClick={handleResetForm}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-brand-dark text-white hover:bg-black transition-all flex items-center justify-center space-x-2 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Report Another Issue</span>
          </button>
        </div>
      ) : (
        /* Active Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-border shadow-xs space-y-6">
          
          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-brand-stone mb-2">
              Quick One-Tap Examples (Hinglish Supported):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRawText(tmpl)}
                  className="text-[11px] bg-brand-muted hover:bg-brand-terracotta/10 hover:text-brand-terracotta text-brand-dark px-2.5 py-1 rounded-lg border border-brand-border transition-all text-left"
                >
                  "{tmpl.substring(0, 38)}..."
                </button>
              ))}
            </div>
          </div>

          {/* Raw Text Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="complaintText" className="text-xs font-bold text-brand-dark">Describe the Issue *</label>
              {isClassifying && (
                <span className="text-[11px] text-brand-amber font-medium flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>Auto-classifying...</span>
                </span>
              )}
            </div>
            <textarea
              id="complaintText"
              rows={3}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g. Sector 12 mein toilet bahut kharab hai overflow ho raha hai..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-terracotta bg-brand-linen/30 font-sans"
              required
            />
          </div>

          {/* Classifier Real-Time Preview Badge */}
          {classification && (
            <div className="bg-brand-emerald-light/60 border border-brand-emerald/30 p-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-150">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brand-emerald" />
                <div>
                  <span className="font-semibold text-brand-dark">Auto-Classifier Result: </span>
                  <span className="font-bold text-brand-emerald capitalize">{classification.category.replace('_', ' ')}</span>
                  <span className="text-brand-stone text-[11px] ml-1">({classification.department})</span>
                </div>
              </div>
              <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded-md border border-brand-emerald/20 text-brand-emerald font-semibold">
                {(classification.confidence * 100).toFixed(0)}% Match
              </span>
            </div>
          )}

          {/* Zone Location Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1.5">Select Sector / Zone *</label>
              <div className="relative">
                <select
                  value={selectedZone}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-terracotta bg-white appearance-none pr-8 font-medium"
                >
                  {zones && zones.length > 0 ? (
                    zones.map(z => (
                      <option key={z.id} value={z.name}>{z.name} ({z.sector_code})</option>
                    ))
                  ) : (
                    <option value="Sector 1 (Sangam Ghat)">Sector 1 (Sangam Ghat)</option>
                  )}
                </select>
                <MapPin className="w-4 h-4 text-brand-terracotta absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* GPS Pin Simulator */}
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1.5">GPS Coordinates</label>
              <div className="flex items-center justify-between px-3 py-2 text-xs bg-brand-linen rounded-xl border border-brand-border">
                <span className="font-mono text-[11px] text-brand-stone">
                  {locationCoords.lat.toFixed(4)}° N, {locationCoords.lng.toFixed(4)}° E
                </span>
                <span className="text-[10px] bg-brand-emerald-light text-brand-emerald px-1.5 py-0.5 rounded font-semibold border border-brand-emerald/20">
                  GPS Active
                </span>
              </div>
            </div>
          </div>

          {/* Photo Upload (Optional) */}
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1.5">Attach Photo Evidence (Optional)</label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border border-brand-border bg-brand-muted hover:bg-brand-border cursor-pointer text-brand-dark transition-all">
                <Camera className="w-4 h-4 text-brand-terracotta" />
                <span>{photoPreview ? "Change Photo" : "Upload / Take Photo"}</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>

              {photoPreview && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-brand-border shadow-xs">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute top-0 right-0 bg-red-600 text-white w-4 h-4 text-[10px] flex items-center justify-center font-bold"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !rawText.trim()}
            className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-brand-terracotta hover:bg-brand-terracotta-hover text-white transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting Report...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Sanitation Complaint</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-brand-stone text-center">
            Anonymous citizen reporting • No account required • Instant priority assignment
          </p>
        </form>
      )}

    </div>
  );
}
