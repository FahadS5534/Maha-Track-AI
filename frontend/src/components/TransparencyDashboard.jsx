import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Database, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import axios from 'axios';

export default function TransparencyDashboard({ syntheticPercentage, classifierMetrics }) {
  const [stats, setStats] = useState(null);
  const [responseTimes, setResponseTimes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, responseTimesRes] = await Promise.all([
        axios.get('/api/stats/summary'),
        axios.get('/api/stats/response-times')
      ]);
      setStats(summaryRes.data);
      setResponseTimes(responseTimesRes.data);
    } catch (err) {
      console.error("Error fetching public transparency metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const DEPT_COLORS = {
    "Sanitation Dept": "#C85A32",
    "Water Supply Dept": "#D97706",
    "Drainage & Sewage Dept": "#1F2923",
    "Solid Waste Management": "#2D6A4F",
    "Public Health Dept": "#8B5CF6"
  };

  const CATEGORY_COLORS = ["#C85A32", "#D97706", "#2D6A4F", "#1F2923", "#991B1B"];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-xs text-brand-stone">
        Loading public resolution stats & zone analytics...
      </div>
    );
  }

  const categoryChartData = stats && stats.by_category
    ? Object.entries(stats.by_category).map(([cat, count]) => ({
        name: cat.replace('_', ' ').toUpperCase(),
        value: count
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Pitch Narrative */}
      <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-brand-amber" />
              <h1 className="text-2xl font-extrabold text-brand-dark tracking-tight">
                Public Sanitation Transparency Portal
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-brand-stone mt-1 max-w-2xl">
              Real-time aggregate performance tracking across Nashik & Trimbakeshwar Kumbh Mela 2027 zones.
              <strong className="text-brand-dark ml-1">Citizens Report → Government Acts → Performance is Measurable.</strong>
            </p>
          </div>

          <div className="bg-brand-linen px-3 py-2 rounded-xl border border-brand-border text-right">
            <span className="text-[11px] font-bold text-brand-stone block uppercase">Data Protection Notice</span>
            <span className="text-xs text-brand-emerald font-semibold flex items-center space-x-1 justify-end">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Individual Complainant Data Exposed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Mean Time To Resolution */}
        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-stone uppercase tracking-wider">Avg Resolution Time</span>
            <div className="p-2 bg-brand-amber-light rounded-xl text-brand-amber">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-brand-dark">
            {responseTimes ? `${responseTimes.overall_avg_resolution_hours} hrs` : '--'}
          </div>
          <p className="text-[11px] text-brand-stone">Mean Time To Resolution (MTTR) across all departments</p>
        </div>

        {/* Total Resolved */}
        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-stone uppercase tracking-wider">Total Resolved</span>
            <div className="p-2 bg-brand-emerald-light rounded-xl text-brand-emerald">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-brand-emerald">
            {stats ? stats.total_resolved : 0}
          </div>
          <p className="text-[11px] text-brand-stone">
            {stats ? `${((stats.total_resolved / stats.total_reported) * 100).toFixed(1)}% of total complaints` : ''}
          </p>
        </div>

        {/* Pending / In Progress */}
        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-stone uppercase tracking-wider">Active In Progress</span>
            <div className="p-2 bg-brand-terracotta/10 rounded-xl text-brand-terracotta">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-brand-terracotta">
            {stats ? (stats.total_in_progress + stats.total_assigned + (stats.total_reported - stats.total_resolved - stats.total_in_progress - stats.total_assigned)) : 0}
          </div>
          <p className="text-[11px] text-brand-stone">Dispatched workers on location</p>
        </div>

        {/* Synthetic Data Ratio Indicator */}
        <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-stone uppercase tracking-wider">Data Lineage</span>
            <div className="p-2 bg-brand-muted rounded-xl text-brand-dark">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-brand-dark">
            {stats ? `${stats.synthetic_percentage}%` : '100%'}
          </div>
          <p className="text-[11px] text-brand-stone font-medium text-brand-amber">
            Tagged as synthetic demo seed data
          </p>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Avg Resolution Time by Department */}
        <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-brand-dark text-base">Resolution Time by Department</h3>
              <p className="text-xs text-brand-stone">Average hours elapsed from report creation to resolution mark</p>
            </div>
            <span className="text-xs font-mono bg-brand-linen px-2 py-1 rounded border border-brand-border text-brand-stone">Hours</span>
          </div>

          <div className="h-64 w-full">
            {responseTimes && responseTimes.by_department ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={responseTimes.by_department} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#78716C' }} />
                  <YAxis dataKey="department" type="category" tick={{ fontSize: 10, fill: '#1F2923' }} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', borderColor: '#E7E5E4', fontSize: '12px' }}
                    formatter={(value) => [`${value} hours`, 'Avg Resolution Time']}
                  />
                  <Bar dataKey="avg_resolution_hours" radius={[0, 6, 6, 0]}>
                    {responseTimes.by_department.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEPT_COLORS[entry.department] || "#C85A32"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-brand-stone">No department stats available</div>
            )}
          </div>
        </div>

        {/* Chart 2: Category Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-brand-dark text-base">Sanitation Complaint Category Breakdown</h3>
              <p className="text-xs text-brand-stone">Distribution across detected sanitation issue types</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', borderColor: '#E7E5E4', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-brand-stone">No category data available</div>
            )}
          </div>
        </div>

      </div>

      {/* Zone Performance Leaderboard Table */}
      <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-brand-dark text-base">Sector & Zone Performance Index</h3>
            <p className="text-xs text-brand-stone">Aggregate resolution statistics across all 16 Nashik & Trimbakeshwar sectors</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-brand-border bg-brand-linen/60 text-brand-stone font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Zone / Sector</th>
                <th className="py-2.5 px-3">Total Reported</th>
                <th className="py-2.5 px-3">Resolved</th>
                <th className="py-2.5 px-3">Resolution Rate</th>
                <th className="py-2.5 px-3">Avg Resolution Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {responseTimes && responseTimes.by_zone && responseTimes.by_zone.map(z => {
                const rate = z.total_complaints > 0 ? ((z.resolved_complaints / z.total_complaints) * 100).toFixed(0) : 0;
                return (
                  <tr key={z.zone} className="hover:bg-brand-muted/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-brand-dark">{z.zone}</td>
                    <td className="py-2.5 px-3 font-mono">{z.total_complaints}</td>
                    <td className="py-2.5 px-3 font-mono text-brand-emerald font-bold">{z.resolved_complaints}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-brand-border h-1.5 rounded-full overflow-hidden">
                          <div className="bg-brand-emerald h-full rounded-full" style={{ width: `${rate}%` }}></div>
                        </div>
                        <span className="font-mono text-[11px] font-bold">{rate}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-brand-dark">
                      {z.avg_resolution_hours > 0 ? `${z.avg_resolution_hours} hrs` : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
