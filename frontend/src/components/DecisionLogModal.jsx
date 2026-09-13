import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, ShieldAlert, Cpu, Palette, Database, Clock } from 'lucide-react';

export default function DecisionLogModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-brand-border animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-brand-border flex items-center justify-between bg-brand-linen rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-brand-terracotta/10 text-brand-terracotta rounded-xl border border-brand-terracotta/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-brand-dark text-lg">System Decision Log (`DECISIONS.md`)</h2>
              <p className="text-xs text-brand-stone">Technical trade-offs, priority logic, and explicit architectural choices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-brand-stone hover:text-brand-dark rounded-lg hover:bg-brand-border text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body - Decisions List */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-brand-dark">
          
          {/* Decision 1 */}
          <div className="bg-brand-linen/50 rounded-xl p-4 border border-brand-border space-y-2">
            <div className="flex items-center space-x-2 text-brand-terracotta font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <span>1. Rule-Based Priority Scoring Formula (Not ML)</span>
            </div>
            <p className="text-brand-dark">
              <strong>Decided:</strong> Use a transparent weighted rule formula ($0 - 100$) combining Category Severity (40%), Time Pending (30%), and Local Zone Cluster Density (30%).
            </p>
            <p className="text-brand-stone italic">
              <strong>Why:</strong> Machine learning for priority scoring was explicitly rejected. There is insufficient historical ground-truth priority data. A transparent formula is auditable and defensible to event judges and administrators.
            </p>
          </div>

          {/* Decision 2 */}
          <div className="bg-brand-linen/50 rounded-xl p-4 border border-brand-border space-y-2">
            <div className="flex items-center space-x-2 text-brand-emerald font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>2. Hinglish Classifier (TF-IDF + Logistic Regression)</span>
            </div>
            <p className="text-brand-dark">
              <strong>Decided:</strong> `scikit-learn` `TfidfVectorizer` + `LogisticRegression` pipeline trained on a realistic dataset of Hinglish & English complaints across 5 sanitation categories.
            </p>
            <p className="text-brand-stone italic">
              <strong>Why:</strong> Real public complaints during events like Mahakumbh are typed in conversational mixed Hindi-English. Light TF-IDF classifies in &lt;5ms with zero GPU required.
            </p>
          </div>

          {/* Decision 3 */}
          <div className="bg-brand-linen/50 rounded-xl p-4 border border-brand-border space-y-2">
            <div className="flex items-center space-x-2 text-brand-amber font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>3. Synthetic Data Column (`is_synthetic = true`)</span>
            </div>
            <p className="text-brand-dark">
              <strong>Decided:</strong> Add `is_synthetic` as a real database boolean column on `complaints` and `workers` tables, defaulting to `true` for baseline seed data.
            </p>
            <p className="text-brand-stone italic">
              <strong>Why:</strong> No public live Mahakumbh complaint API exists. Flagging synthetic data directly in the database allows the public dashboard to honestly disclose demo data lineage.
            </p>
          </div>

          {/* Decision 4 */}
          <div className="bg-brand-linen/50 rounded-xl p-4 border border-brand-border space-y-2">
            <div className="flex items-center space-x-2 text-brand-dark font-bold text-sm">
              <Palette className="w-4 h-4" />
              <span>4. Aesthetic & Light Design System (No Blue, No Gradients)</span>
            </div>
            <p className="text-brand-dark">
              <strong>Decided:</strong> Warm light aesthetic palette (`Warm Linen #FAF9F5`, `Slate Charcoal #1F2923`, `Terracotta #C85A32`, `Emerald #2D6A4F`, `Amber #D97706`).
            </p>
            <p className="text-brand-stone italic">
              <strong>Why:</strong> Avoid generic blue tech gradients. Earth-toned civic theme provides a realistic, professional government interface suitable for field and administrative deployment.
            </p>
          </div>

          {/* Decision 5 */}
          <div className="bg-brand-linen/50 rounded-xl p-4 border border-brand-border space-y-2">
            <div className="flex items-center space-x-2 text-brand-emerald font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>5. Event Audit Logging (`complaint_events`)</span>
            </div>
            <p className="text-brand-dark">
              <strong>Decided:</strong> Immutable event log table storing timestamps whenever complaints are created, classified, assigned, or resolved.
            </p>
            <p className="text-brand-stone italic">
              <strong>Why:</strong> The Public Transparency Dashboard relies on mean-time-to-resolution (MTTR) metrics. Real event timestamps guarantee that response times derive directly from operational actions.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-brand-border bg-brand-linen flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-dark text-white font-bold text-xs rounded-xl hover:bg-black transition-all shadow-xs"
          >
            Close Decision Log
          </button>
        </div>

      </div>
    </div>
  );
}

function Sparkles(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
