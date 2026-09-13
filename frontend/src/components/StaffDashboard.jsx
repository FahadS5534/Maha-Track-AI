import React, { useState, useEffect } from 'react';
import { Shield, Filter, AlertTriangle, Clock, CheckCircle2, UserPlus, MapPin, ChevronRight, Eye, RefreshCw, Sparkles, FileCheck, Layers } from 'lucide-react';
import axios from 'axios';
import IncidentMap from './IncidentMap';
import WorkerCardSelector from './WorkerCardSelector';

export default function StaffDashboard({ zones, workers, staffUser }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedZone, setSelectedZone] = useState("all");
  const [minPriority, setMinPriority] = useState(0);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, [selectedStatus, selectedZone, minPriority]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let url = `/api/complaints?priority_min=${minPriority}`;
      if (selectedStatus !== "all") url += `&status=${selectedStatus}`;
      if (selectedZone !== "all") url += `&zone=${encodeURIComponent(selectedZone)}`;

      const res = await axios.get(url);
      setComplaints(res.data);
    } catch (err) {
      console.error("Error fetching admin queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWorker = async () => {
    if (!selectedComplaint || !selectedWorkerId) return;
    setIsAssigning(true);
    try {
      await axios.patch(`/api/complaints/${selectedComplaint.id}/assign`, {
        worker_id: selectedWorkerId
      });
      setShowAssignModal(false);
      fetchComplaints();
      const updated = await axios.get(`/api/complaints/${selectedComplaint.id}`);
      setSelectedComplaint(updated.data);
    } catch (err) {
      console.error("Error assigning worker:", err);
      alert("Failed to assign worker.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      await axios.patch(`/api/complaints/${complaintId}/status`, { status: newStatus });
      fetchComplaints();
      if (selectedComplaint && selectedComplaint.id === complaintId) {
        const updated = await axios.get(`/api/complaints/${complaintId}`);
        setSelectedComplaint(updated.data);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    const zoneWorkers = workers.filter(w => w.zone === complaint.zone);
    if (zoneWorkers.length > 0) {
      setSelectedWorkerId(zoneWorkers[0].id);
    } else if (workers.length > 0) {
      setSelectedWorkerId(workers[0].id);
    }
    setShowAssignModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner / Title */}
      <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-brand-emerald" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-brand-dark tracking-tight">
                Admin Complaint Management System
              </h2>
              <span className="bg-brand-emerald-light text-brand-emerald text-xs font-bold px-2.5 py-0.5 rounded-full border border-brand-emerald/20">
                {complaints.length} Active Complaints
              </span>
            </div>
            <p className="text-xs text-brand-stone mt-1">
              Official dispatch control room: Rule-based Priority Queue ($0 - 100$) + Field Worker Assignment + Map Tracking
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMap(!showMap)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showMap ? 'bg-brand-emerald text-white border-brand-emerald' : 'bg-white text-brand-dark border-brand-border hover:bg-brand-muted'
              }`}
            >
              {showMap ? "Hide Map View" : "Show Map View"}
            </button>
            <button
              onClick={fetchComplaints}
              className="p-1.5 rounded-xl border border-brand-border bg-white text-brand-stone hover:text-brand-dark hover:bg-brand-muted"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-brand-border/60">
          <div>
            <label className="block text-[11px] font-bold text-brand-stone uppercase mb-1">Status Filter</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-brand-border bg-brand-linen/40 focus:outline-none focus:ring-1 focus:ring-brand-emerald font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported (Pending Action)</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-brand-stone uppercase mb-1">Zone / Sector</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-brand-border bg-brand-linen/40 focus:outline-none focus:ring-1 focus:ring-brand-emerald font-medium"
            >
              <option value="all">All Zones / Sectors</option>
              {zones && zones.map(z => (
                <option key={z.id} value={z.name}>{z.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-brand-stone uppercase mb-1">Min Priority Score ({minPriority}+)</label>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minPriority}
              onChange={(e) => setMinPriority(Number(e.target.value))}
              className="w-full accent-brand-terracotta cursor-pointer mt-1"
            />
          </div>
        </div>
      </div>

      {/* Leaflet Map View */}
      {showMap && (
        <IncidentMap
          complaints={complaints}
          selectedComplaint={selectedComplaint}
          onSelectComplaint={(c) => setSelectedComplaint(c)}
        />
      )}

      {/* Main Queue & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Queue List */}
        <div className={`space-y-3 ${selectedComplaint ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          {loading ? (
            <div className="bg-white rounded-2xl p-8 text-center text-xs text-brand-stone border border-brand-border">
              Loading admin complaint queue...
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-xs text-brand-stone border border-brand-border space-y-2">
              <CheckCircle2 className="w-8 h-8 text-brand-emerald mx-auto" />
              <p className="font-semibold text-brand-dark">No complaints match the selected filter criteria.</p>
            </div>
          ) : (
            complaints.map(c => {
              const isHigh = c.priority_score >= 75;
              const isMed = c.priority_score >= 45 && c.priority_score < 75;
              const isSelected = selectedComplaint && selectedComplaint.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
                    isSelected ? 'border-brand-emerald ring-2 ring-brand-emerald/20 shadow-md' : 'border-brand-border hover:border-brand-stone/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          isHigh ? 'bg-red-100 text-red-800 border border-red-200' :
                          isMed ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          Score: {c.priority_score}
                        </span>

                        <span className="text-[11px] font-semibold text-brand-stone uppercase bg-brand-muted px-2 py-0.5 rounded-md border border-brand-border">
                          {c.zone}
                        </span>

                        <span className="text-[11px] font-medium text-brand-dark bg-brand-linen px-2 py-0.5 rounded-md border border-brand-border">
                          {c.department}
                        </span>

                        {c.duplicate_count > 1 && (
                          <span className="text-[10px] text-brand-terracotta font-bold bg-brand-terracotta/10 px-2 py-0.5 rounded-md border border-brand-terracotta/20 flex items-center space-x-1">
                            <Layers className="w-3 h-3 text-brand-terracotta" />
                            <span>{c.duplicate_count} Reports</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-brand-dark line-clamp-2">
                        "{c.raw_text}"
                      </p>

                      <div className="flex items-center space-x-4 text-[11px] text-brand-stone pt-1">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-brand-stone" />
                          <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                        
                        {c.assigned_worker && (
                          <span className="text-brand-emerald font-medium">
                            Worker: <strong>{c.assigned_worker.name}</strong> ({c.assigned_worker.phone})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${
                        c.status === 'resolved' ? 'bg-brand-emerald-light text-brand-emerald border border-brand-emerald/30' :
                        c.status === 'in_progress' ? 'bg-brand-amber-light text-brand-amber border border-brand-amber/30' :
                        c.status === 'assigned' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        'bg-stone-100 text-stone-700 border border-stone-300'
                      }`}>
                        {c.status}
                      </span>

                      {c.status === 'reported' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openAssignModal(c); }}
                          className="px-2.5 py-1 rounded-lg bg-brand-emerald hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center space-x-1 shadow-2xs"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Assign</span>
                        </button>
                      )}

                      {c.status === 'assigned' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(c.id, 'in_progress'); }}
                          className="px-2 py-1 rounded-lg bg-brand-amber text-white text-[11px] font-bold hover:bg-amber-700"
                        >
                          Start Progress
                        </button>
                      )}

                      {c.status === 'in_progress' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(c.id, 'resolved'); }}
                          className="px-2 py-1 rounded-lg bg-brand-emerald text-white text-[11px] font-bold hover:bg-emerald-800 flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Incident Detail & Event Audit Timeline */}
        {selectedComplaint && (
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-4 self-start sticky top-20">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <span className="text-[10px] font-bold text-brand-stone uppercase tracking-wider block">Admin Incident Inspection</span>
                <h3 className="font-bold text-brand-dark text-sm">ID: {selectedComplaint.id.substring(0, 13)}...</h3>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="text-brand-stone hover:text-brand-dark text-xs p-1">✕</button>
            </div>

            <div className="bg-brand-linen p-3 rounded-xl border border-brand-border space-y-2 text-xs">
              <p className="font-semibold text-brand-dark">"{selectedComplaint.raw_text}"</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div><span className="text-brand-stone">Category:</span> <strong className="capitalize">{selectedComplaint.category.replace('_', ' ')}</strong></div>
                <div><span className="text-brand-stone">Dept:</span> <strong>{selectedComplaint.department}</strong></div>
                <div><span className="text-brand-stone">Zone:</span> <strong>{selectedComplaint.zone}</strong></div>
                <div><span className="text-brand-stone">Priority Score:</span> <strong className="text-brand-terracotta">{selectedComplaint.priority_score} / 100</strong></div>
              </div>
            </div>

            {/* Worker Assignment Card */}
            <div className="border border-brand-border rounded-xl p-3 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-dark">Assigned Worker</span>
                <button
                  onClick={() => openAssignModal(selectedComplaint)}
                  className="text-[11px] text-brand-emerald font-bold hover:underline"
                >
                  {selectedComplaint.assigned_worker ? "Re-assign Worker" : "+ Assign Worker"}
                </button>
              </div>

              {selectedComplaint.assigned_worker ? (
                <div className="text-xs bg-brand-emerald-light/50 p-2.5 rounded-xl border border-brand-emerald/20 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-brand-dark">{selectedComplaint.assigned_worker.name}</span>
                    <span className="text-brand-stone block text-[10px]">{selectedComplaint.assigned_worker.phone} • {selectedComplaint.assigned_worker.zone}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-brand-emerald bg-white px-2 py-0.5 rounded border border-brand-emerald/30 uppercase">
                    {selectedComplaint.assigned_worker.status}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-brand-stone italic">No worker assigned yet.</p>
              )}
            </div>

            {/* Event Timeline */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-dark flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-brand-terracotta" />
                <span>Audit Timeline</span>
              </span>

              <div className="space-y-2 border-l-2 border-brand-border pl-3 ml-2 text-xs">
                {selectedComplaint.events && selectedComplaint.events.length > 0 ? (
                  selectedComplaint.events.map(ev => (
                    <div key={ev.id} className="relative space-y-0.5">
                      <div className="w-2 h-2 rounded-full bg-brand-terracotta absolute -left-[17px] top-1.5 border border-white"></div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-brand-dark uppercase tracking-wider">{ev.event_type}</span>
                        <span className="text-brand-stone">{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[11px] text-brand-stone">{ev.details}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-brand-stone italic">No events recorded yet.</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              {selectedComplaint.status !== 'resolved' && (
                <button
                  onClick={() => handleUpdateStatus(selectedComplaint.id, 'resolved')}
                  className="w-full py-2 bg-brand-emerald hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-2xs"
                >
                  Mark Incident Resolved
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Assign Worker Modal with WorkerCardSelector */}
      {showAssignModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-brand-border space-y-4">
            <div className="flex justify-between items-center border-b border-brand-border pb-3">
              <div>
                <h3 className="font-bold text-brand-dark text-base">Assign Field Worker</h3>
                <span className="text-xs text-brand-stone">Select field staff for Ticket #{selectedComplaint.id.substring(0, 8)}</span>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-brand-stone hover:text-brand-dark font-bold text-sm">✕</button>
            </div>

            <div className="text-xs bg-brand-linen p-3 rounded-xl border border-brand-border space-y-1">
              <span className="text-brand-stone block">Complaint Text:</span>
              <p className="font-semibold text-brand-dark">"{selectedComplaint.raw_text}"</p>
              <div className="flex justify-between text-[11px] pt-1">
                <span>Target Zone: <strong>{selectedComplaint.zone}</strong></span>
                <span>Category: <strong className="capitalize">{selectedComplaint.category.replace('_', ' ')}</strong></span>
              </div>
            </div>

            {/* Worker Detail Cards Component */}
            <WorkerCardSelector
              workers={workers}
              selectedWorkerId={selectedWorkerId}
              onSelectWorker={(id) => setSelectedWorkerId(id)}
              targetZone={selectedComplaint.zone}
            />

            <div className="flex justify-end space-x-2 pt-2 border-t border-brand-border">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-brand-border text-brand-stone hover:bg-brand-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignWorker}
                disabled={isAssigning || !selectedWorkerId}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-brand-emerald text-white hover:bg-emerald-800 transition-all shadow-2xs disabled:opacity-50"
              >
                {isAssigning ? "Assigning..." : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
