import React from 'react';
import { Users, Shield, ArrowRight, Sparkles, CheckCircle2, BarChart3, MapPin, Database } from 'lucide-react';

export default function RoleSelectionLanding({ onSelectRole }) {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-6xl mx-auto px-4 py-8">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center space-x-2 bg-brand-terracotta/10 text-brand-terracotta px-4 py-1.5 rounded-full text-xs font-bold border border-brand-terracotta/20 shadow-2xs">
          <Sparkles className="w-4 h-4 text-brand-terracotta" />
          <span>Mahakumbh 2026 Civic Sanitation Response</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight">
          Maha-Track AI
        </h1>
        
        <p className="text-sm sm:text-base text-brand-stone max-w-2xl mx-auto font-medium">
          Select your portal to report sanitation issues as a citizen or manage field dispatches as an event administrator.
        </p>
      </div>

      {/* Role Selection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
        
        {/* Card 1: Citizen / Public Portal */}
        <div 
          onClick={() => onSelectRole('citizen')}
          className="bg-white rounded-3xl p-8 border border-brand-border hover:border-brand-terracotta/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-6 relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center border border-brand-terracotta/20 group-hover:scale-105 transition-transform">
              <Users className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-bold text-brand-terracotta uppercase tracking-wider block">Public Portal</span>
              <h2 className="text-2xl font-bold text-brand-dark group-hover:text-brand-terracotta transition-colors mt-0.5">
                Citizen & Volunteer App
              </h2>
            </div>

            <p className="text-xs text-brand-stone leading-relaxed">
              Report sanitation issues (toilets, water, drains, waste bins) in under 30 seconds. View public resolution statistics transparently.
            </p>

            <ul className="space-y-2 text-xs text-brand-dark font-medium pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                <span>Submit complaints anonymously in &lt; 30 seconds</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                <span>Hinglish & English text support with auto-classification</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                <span>View aggregate public response-time metrics</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-brand-border/60">
            <span className="text-xs font-bold text-brand-dark group-hover:text-brand-terracotta">Enter Citizen Portal</span>
            <div className="w-8 h-8 rounded-full bg-brand-linen group-hover:bg-brand-terracotta group-hover:text-white flex items-center justify-center transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 2: Admin Portal */}
        <div 
          onClick={() => onSelectRole('admin')}
          className="bg-white rounded-3xl p-8 border border-brand-border hover:border-brand-emerald/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-6 relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-emerald-light text-brand-emerald flex items-center justify-center border border-brand-emerald/20 group-hover:scale-105 transition-transform">
              <Shield className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-bold text-brand-emerald uppercase tracking-wider block">Official Control Room</span>
              <h2 className="text-2xl font-bold text-brand-dark group-hover:text-brand-emerald transition-colors mt-0.5">
                Admin Complaint Report System
              </h2>
            </div>

            <p className="text-xs text-brand-stone leading-relaxed">
              Prioritized dispatch queue for government staff and event control rooms. Assign field workers, update task statuses, and inspect maps.
            </p>

            <ul className="space-y-2 text-xs text-brand-dark font-medium pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                <span>Rule-based priority queue ($0 - 100$)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                <span>Assign workers using interactive worker detail cards</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                <span>Interactive Leaflet map & complete audit timeline</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-brand-border/60">
            <span className="text-xs font-bold text-brand-dark group-hover:text-brand-emerald">Enter Admin Control Room</span>
            <div className="w-8 h-8 rounded-full bg-brand-linen group-hover:bg-brand-emerald group-hover:text-white flex items-center justify-center transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
