import React from 'react';
import { AlertCircle, Info, Database } from 'lucide-react';

export default function SyntheticDataBanner({ syntheticPercentage, classifierMetrics }) {
  return (
    <div className="bg-brand-amber-light/60 border-b border-brand-amber/30 py-2.5 px-4 text-brand-dark">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-brand-amber/20 rounded-md text-brand-amber flex-shrink-0">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-brand-dark">Synthetic Demo Dataset Mode: </span>
            <span className="text-brand-dark/90">
              {syntheticPercentage ? `${syntheticPercentage}% of records are synthetic demo data.` : 'All baseline demo records tagged with is_synthetic=true.'}
            </span>
            <span className="hidden md:inline text-brand-stone ml-1">
              (Motivated by sanitation research for Nashik Simhastha Kumbh Mela 2027 along Godavari River banks).
            </span>
          </div>
        </div>

        {classifierMetrics && (
          <div className="flex items-center space-x-3 text-xs bg-white/80 px-2.5 py-1 rounded-lg border border-brand-amber/30">
            <span className="font-semibold text-brand-dark">ML Classifier (TF-IDF):</span>
            <span className="text-brand-emerald font-bold">Acc: {(classifierMetrics.accuracy * 100).toFixed(1)}%</span>
            <span className="text-brand-terracotta font-bold">Macro F1: {(classifierMetrics.f1_score * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
