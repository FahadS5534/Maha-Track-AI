import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import RoleSelectionLanding from './components/RoleSelectionLanding';
import SyntheticDataBanner from './components/SyntheticDataBanner';
import CitizenReportForm from './components/CitizenReportForm';
import StaffDashboard from './components/StaffDashboard';
import TransparencyDashboard from './components/TransparencyDashboard';
import DecisionLogModal from './components/DecisionLogModal';

export default function App() {
  const [activePortal, setActivePortal] = useState('landing'); // landing | citizen | admin
  const [citizenTab, setCitizenTab] = useState('report'); // report | transparency
  const [adminTab, setAdminTab] = useState('queue'); // queue | transparency

  const [zones, setZones] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [staffUser, setStaffUser] = useState({ email: "admin@mahakumbh.gov.in", role: "admin" });
  const [isDecisionsOpen, setIsDecisionsOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [zonesRes, workersRes, summaryRes] = await Promise.all([
        axios.get('/api/zones'),
        axios.get('/api/workers'),
        axios.get('/api/stats/summary')
      ]);
      setZones(zonesRes.data);
      setWorkers(workersRes.data);
      setSummaryStats(summaryRes.data);
    } catch (err) {
      console.error("Error connecting to backend API:", err);
    }
  };

  const handleSelectRole = (role) => {
    setActivePortal(role);
    if (role === 'citizen') {
      setCitizenTab('report');
    } else if (role === 'admin') {
      setAdminTab('queue');
    }
  };

  const handleComplaintSubmitted = () => {
    fetchInitialData();
  };

  return (
    <div className="min-h-screen bg-brand-linen flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        citizenTab={citizenTab}
        setCitizenTab={setCitizenTab}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        onOpenDecisions={() => setIsDecisionsOpen(true)}
        staffUser={staffUser}
        setStaffUser={setStaffUser}
      />

      {/* Synthetic Data Transparency Notice */}
      <SyntheticDataBanner
        syntheticPercentage={summaryStats ? summaryStats.synthetic_percentage : 100}
        classifierMetrics={summaryStats ? summaryStats.classifier_metrics : null}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePortal === 'landing' && (
          <RoleSelectionLanding onSelectRole={handleSelectRole} />
        )}

        {activePortal === 'citizen' && (
          citizenTab === 'report' ? (
            <CitizenReportForm
              zones={zones}
              onComplaintSubmitted={handleComplaintSubmitted}
            />
          ) : (
            <TransparencyDashboard
              syntheticPercentage={summaryStats ? summaryStats.synthetic_percentage : 100}
              classifierMetrics={summaryStats ? summaryStats.classifier_metrics : null}
            />
          )
        )}

        {activePortal === 'admin' && (
          adminTab === 'queue' ? (
            <StaffDashboard
              zones={zones}
              workers={workers}
              staffUser={staffUser}
            />
          ) : (
            <TransparencyDashboard
              syntheticPercentage={summaryStats ? summaryStats.synthetic_percentage : 100}
              classifierMetrics={summaryStats ? summaryStats.classifier_metrics : null}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-brand-border py-4 px-4 text-center text-xs text-brand-stone mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Maha-Track AI © 2026 — Civic Sanitation Response & Transparency System</span>
          <div className="flex items-center space-x-3 text-[11px]">
            <button onClick={() => setIsDecisionsOpen(true)} className="hover:underline text-brand-dark font-mono font-semibold">
              DECISIONS.md
            </button>
            <span>•</span>
            <span>FastAPI + scikit-learn + React + Leaflet</span>
          </div>
        </div>
      </footer>

      {/* Decision Log Modal */}
      <DecisionLogModal
        isOpen={isDecisionsOpen}
        onClose={() => setIsDecisionsOpen(false)}
      />

    </div>
  );
}
