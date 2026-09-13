import React, { useState } from 'react';
import { Shield, Users, BarChart3, FileText, CheckCircle2, AlertTriangle, LogIn, LogOut, ArrowLeft, LayoutGrid } from 'lucide-react';

export default function Navbar({ activePortal, setActivePortal, citizenTab, setCitizenTab, adminTab, setAdminTab, onOpenDecisions, staffUser, setStaffUser }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("admin@nashikkumbh.gov.in");
  const [loginPass, setLoginPass] = useState("admin123");
  const [loginErr, setLoginErr] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail && loginPass) {
      setStaffUser({ email: loginEmail, role: "admin" });
      setShowLoginModal(false);
      setLoginErr("");
    } else {
      setLoginErr("Please enter credentials");
    }
  };

  const handleLogout = () => {
    setStaffUser(null);
  };

  return (
    <header className="bg-white border-b border-brand-border sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Back to Landing */}
          <div className="flex items-center space-x-3">
            {activePortal !== 'landing' && (
              <button
                onClick={() => setActivePortal('landing')}
                className="p-1.5 rounded-lg border border-brand-border bg-brand-linen hover:bg-white text-brand-stone hover:text-brand-dark transition-all"
                title="Return to Main Landing Page"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="w-9 h-9 rounded-xl bg-brand-terracotta/10 border border-brand-terracotta/20 flex items-center justify-center text-brand-terracotta font-bold text-lg shadow-2xs">
              M
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-brand-dark">Maha-Track AI</span>
                <span className="bg-brand-amber/15 text-brand-amber text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-amber/30 uppercase">
                  {activePortal === 'admin' ? 'Admin Portal' : activePortal === 'citizen' ? 'Citizen App' : 'Nashik Kumbh 2027'}
                </span>
              </div>
              <p className="text-[11px] text-brand-stone font-medium hidden sm:block">Civic Sanitation Response & Transparency System</p>
            </div>
          </div>

          {/* Clean Portal-Specific Navigation Tabs */}
          {activePortal === 'citizen' && (
            <nav className="flex items-center space-x-1 bg-brand-muted p-1 rounded-xl border border-brand-border">
              <button
                onClick={() => setCitizenTab('report')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  citizenTab === 'report'
                    ? 'bg-white text-brand-dark shadow-xs border border-brand-border'
                    : 'text-brand-stone hover:text-brand-dark'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-brand-terracotta" />
                <span>Submit Complaint</span>
              </button>

              <button
                onClick={() => setCitizenTab('transparency')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  citizenTab === 'transparency'
                    ? 'bg-white text-brand-dark shadow-xs border border-brand-border'
                    : 'text-brand-stone hover:text-brand-dark'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-brand-amber" />
                <span>Public Transparency Stats</span>
              </button>
            </nav>
          )}

          {activePortal === 'admin' && (
            <nav className="flex items-center space-x-1 bg-brand-muted p-1 rounded-xl border border-brand-border">
              <button
                onClick={() => setAdminTab('queue')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  adminTab === 'queue'
                    ? 'bg-white text-brand-dark shadow-xs border border-brand-border'
                    : 'text-brand-stone hover:text-brand-dark'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Admin Queue</span>
              </button>

              <button
                onClick={() => setAdminTab('transparency')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  adminTab === 'transparency'
                    ? 'bg-white text-brand-dark shadow-xs border border-brand-border'
                    : 'text-brand-stone hover:text-brand-dark'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-brand-amber" />
                <span>Public Analytics</span>
              </button>
            </nav>
          )}

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenDecisions}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-brand-border bg-white hover:bg-brand-muted text-brand-dark transition-all"
              title="View Architectural Decision Log (DECISIONS.md)"
            >
              <FileText className="w-3.5 h-3.5 text-brand-terracotta" />
              <span className="hidden md:inline font-mono">DECISIONS.md</span>
            </button>

            {activePortal === 'admin' && (
              staffUser ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-brand-emerald bg-brand-emerald-light px-2.5 py-1 rounded-lg border border-brand-emerald/20 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-brand-emerald" />
                    <span className="hidden lg:inline">{staffUser.email}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg border border-brand-border bg-white text-brand-stone hover:text-brand-dark hover:bg-brand-muted"
                    title="Logout Staff Session"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-emerald text-white hover:bg-emerald-800 transition-all shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </button>
              )
            )}
          </div>

        </div>
      </div>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-brand-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-brand-emerald" />
                <h3 className="font-bold text-brand-dark text-base">Admin Control Room Login</h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-brand-stone hover:text-brand-dark text-sm"
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-brand-stone mb-4">
              Sign in to manage complaints, assign workers, and update resolution lifecycle.
            </p>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Admin Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Password</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                  required
                />
              </div>

              {loginErr && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                  {loginErr}
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-brand-border text-brand-stone hover:bg-brand-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand-emerald text-white hover:bg-emerald-800 transition-all shadow-xs"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
