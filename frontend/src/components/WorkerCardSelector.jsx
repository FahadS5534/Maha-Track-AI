import React from 'react';
import { User, Phone, MapPin, CheckCircle2, Shield, Briefcase } from 'lucide-react';

export default function WorkerCardSelector({ workers, selectedWorkerId, onSelectWorker, targetZone }) {
  // Sort workers so that workers from the targetZone appear first
  const sortedWorkers = [...workers].sort((a, b) => {
    if (a.zone === targetZone && b.zone !== targetZone) return -1;
    if (a.zone !== targetZone && b.zone === targetZone) return 1;
    return 0;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-brand-dark">Select Field Worker</label>
        <span className="text-[11px] text-brand-stone">Showing {workers.length} registered workers</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
        {sortedWorkers.map(w => {
          const isSelected = selectedWorkerId === w.id;
          const isZoneMatch = w.zone === targetZone;

          return (
            <div
              key={w.id}
              onClick={() => onSelectWorker(w.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-brand-emerald-light/30 border-brand-emerald ring-2 ring-brand-emerald/30 shadow-xs'
                  : 'bg-white border-brand-border hover:border-brand-stone/40'
              }`}
            >
              {/* Header: Name & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-brand-linen text-brand-dark flex items-center justify-center font-bold text-xs border border-brand-border">
                    {w.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-dark text-xs">{w.name}</h4>
                    <span className="text-[10px] text-brand-stone block">{w.department || "Sanitation Dept"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {isZoneMatch && (
                    <span className="text-[9px] bg-brand-terracotta/10 text-brand-terracotta px-1.5 py-0.5 rounded font-bold border border-brand-terracotta/20">
                      Zone Match
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    w.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {w.status}
                  </span>
                </div>
              </div>

              {/* Details: Contact & Active Tasks */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-brand-border/60">
                <div className="flex items-center space-x-1 text-brand-stone">
                  <Phone className="w-3 h-3 text-brand-terracotta flex-shrink-0" />
                  <span className="font-mono text-[10px] text-brand-dark">{w.phone || "+91 98765 43210"}</span>
                </div>

                <div className="flex items-center space-x-1 text-brand-stone">
                  <Briefcase className="w-3 h-3 text-brand-emerald flex-shrink-0" />
                  <span className="font-bold text-brand-dark text-[10px]">
                    {w.active_tasks_count || 0} active {w.active_tasks_count === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
              </div>

              {/* Zone Tag */}
              <div className="flex items-center space-x-1 text-[10px] text-brand-stone">
                <MapPin className="w-3 h-3 text-brand-stone" />
                <span className="truncate">{w.zone}</span>
              </div>

              {/* Checkmark overlay if selected */}
              {isSelected && (
                <div className="absolute top-2 right-2 text-brand-emerald">
                  <CheckCircle2 className="w-4 h-4 fill-brand-emerald text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
