import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine 
} from 'recharts';
import { 
  Briefcase, Activity, ShieldAlert, Cpu, BarChart3, TrendingUp, Layers, 
  TrendingDown, DollarSign, Sliders, Truck, Users, CheckCircle2, AlertTriangle, 
  ChevronRight, RefreshCw, Info, Filter, ArrowUpRight, ArrowDownRight, Zap, Play, Target, CheckCircle
} from 'lucide-react';

// 1. Cross-Functional Money Flow P&L Data
const PL_QUARTERLY_DATA = {
  Q1: { adSpend: 1.2, revenue: 8.5, cogs: 3.2, opex: 2.1, netProfit: 2.0 },
  Q2: { adSpend: 1.5, revenue: 10.2, cogs: 3.8, opex: 2.4, netProfit: 2.5 },
  Q3: { adSpend: 1.8, revenue: 12.0, cogs: 4.5, opex: 2.8, netProfit: 2.9 },
  Q4: { adSpend: 2.2, revenue: 14.8, cogs: 5.4, opex: 3.2, netProfit: 4.0 },
  All: { adSpend: 6.7, revenue: 45.5, cogs: 16.9, opex: 10.5, netProfit: 11.4 }
};

// 2. Variance Analysis Breakdown Data
const VARIANCE_WATERFALL_DATA = [
  { name: 'Prior Target', value: 40.0, fill: '#64748b', type: 'base' },
  { name: 'Price Expansion', value: +2.8, fill: '#10b981', type: 'pos' },
  { name: 'Volume Growth', value: +4.2, fill: '#06b6d4', type: 'pos' },
  { name: 'Mix Shift (Pro)', value: -1.5, fill: '#f43f5e', type: 'neg' },
  { name: 'COGS Inflation', value: -0.8, fill: '#ec4899', type: 'neg' },
  { name: 'Ad Efficiency', value: +0.8, fill: '#8b5cf6', type: 'pos' },
  { name: 'Actual Revenue', value: 45.5, fill: '#3b82f6', type: 'total' }
];

// 3. Demand Prediction Dataset (12 Months)
const BASE_DEMAND_FORECAST = [
  { month: 'Jan', actual: 3.2, forecast: 3.2, upper95: 3.5, upper80: 3.35, lower80: 3.05, lower95: 2.9 },
  { month: 'Feb', actual: 3.4, forecast: 3.4, upper95: 3.7, upper80: 3.55, lower80: 3.25, lower95: 3.1 },
  { month: 'Mar', actual: 3.8, forecast: 3.75, upper95: 4.1, upper80: 3.9, lower80: 3.6, lower95: 3.4 },
  { month: 'Apr', actual: 4.1, forecast: 4.05, upper95: 4.4, upper80: 4.2, lower80: 3.9, lower95: 3.7 },
  { month: 'May', actual: 4.5, forecast: 4.4, upper95: 4.8, upper80: 4.6, lower80: 4.2, lower95: 4.0 },
  { month: 'Jun', actual: null, forecast: 4.8, upper95: 5.3, upper80: 5.0, lower80: 4.6, lower95: 4.3 },
  { month: 'Jul', actual: null, forecast: 5.2, upper95: 5.8, upper80: 5.5, lower80: 4.9, lower95: 4.6 },
  { month: 'Aug', actual: null, forecast: 5.6, upper95: 6.3, upper80: 5.9, lower80: 5.3, lower95: 4.9 },
  { month: 'Sep', actual: null, forecast: 5.4, upper95: 6.1, upper80: 5.7, lower80: 5.1, lower95: 4.7 },
  { month: 'Oct', actual: null, forecast: 5.9, upper95: 6.7, upper80: 6.2, lower80: 5.6, lower95: 5.1 },
  { month: 'Nov', actual: null, forecast: 6.8, upper95: 7.7, upper80: 7.2, lower80: 6.4, lower95: 5.9 },
  { month: 'Dec', actual: null, forecast: 7.5, upper95: 8.5, upper80: 8.0, lower80: 7.0, lower95: 6.5 }
];

// 4. Customer Risk Pie Chart & Accounts
const CHURN_PIE_DATA = [
  { name: 'Low Risk (<15%)', value: 68, color: '#10b981' },
  { name: 'Medium Risk (15-40%)', value: 20, color: '#f59e0b' },
  { name: 'High Risk (40-75%)', value: 8, color: '#f97316' },
  { name: 'Critical Churn (>75%)', value: 4, color: '#ef4444' }
];

const HIGH_RISK_ACCOUNTS = [
  { id: 'ACC-8921', name: 'Acme Global Corp', arr: '₹420,000', risk: 84, trigger: 'NPS dropped from 9 to 4; Zero logins in 30 days', healthScore: 'D-' },
  { id: 'ACC-4412', name: 'Apex Logistics Inc', arr: '₹290,000', risk: 76, trigger: '3 unresolved high-priority support tickets', healthScore: 'F' },
  { id: 'ACC-3109', name: 'Nexus Financials', arr: '₹185,000', risk: 68, trigger: 'Sponsor executive departed company', healthScore: 'C-' },
  { id: 'ACC-9042', name: 'Starlight Tech Solutions', arr: '₹150,000', risk: 62, trigger: 'Seat utilization down 42% YoY', healthScore: 'D' }
];

// 5. Data Governance Audit Table
const DATA_GOVERNANCE_AUDIT = [
  { pipeline: 'ERP Revenue Pipeline', source: 'SAP S/4HANA', freshness: '< 5 mins ago', completeness: '99.98%', status: 'PASSED', anomaly: 'None' },
  { pipeline: 'Digital Marketing ROAS', source: 'Google/Meta APIs', freshness: '15 mins ago', completeness: '98.50%', status: 'WARNING', anomaly: 'Meta API throttling delayed 3% rows' },
  { pipeline: 'Inventory & Logistics', source: 'Oracle SCM', freshness: '< 1 min ago', completeness: '100.0%', status: 'PASSED', anomaly: 'None' },
  { pipeline: 'Customer Telemetry', source: 'Segment / Mixpanel', freshness: '< 1 min ago', completeness: '99.40%', status: 'PASSED', anomaly: 'None' },
  { pipeline: 'Financial Ledger', source: 'Workday Financials', freshness: '1 hour ago', completeness: '100.0%', status: 'PASSED', anomaly: 'None' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('executive');

  // --- State for Action Resolutions (Interactivity) ---
  const [resolvedActions, setResolvedActions] = useState({
    dec1: false,
    dec2: false,
    dec3: false
  });

  const handleActionExecution = (decisionId) => {
    setResolvedActions(prev => ({ ...prev, [decisionId]: true }));
  };

  // --- State for Demand Prediction ---
  const [scenario, setScenario] = useState('expected');

  const adjustedForecastData = useMemo(() => {
    let multiplier = 1.0;
    if (scenario === 'high') multiplier = 1.15;
    if (scenario === 'low') multiplier = 0.85;

    return BASE_DEMAND_FORECAST.map(item => ({
      ...item,
      forecast: +(item.forecast * multiplier).toFixed(2),
      upper95: +(item.upper95 * multiplier).toFixed(2),
      upper80: +(item.upper80 * multiplier).toFixed(2),
      lower80: +(item.lower80 * multiplier).toFixed(2),
      lower95: +(item.lower95 * multiplier).toFixed(2)
    }));
  }, [scenario]);

  // --- State for P&L Quarter Filter ---
  const [selectedQuarter, setSelectedQuarter] = useState('All');

  // --- State for Marketing Simulator ---
  const [adSpend, setAdSpend] = useState({
    google: 120, // ₹k
    meta: 95,
    amazon: 80,
    influencer: 45
  });

  const marketingMetrics = useMemo(() => {
    const { google, meta, amazon, influencer } = adSpend;
    const googleRev = Math.log(google + 1) * 65;
    const metaRev = Math.log(meta + 1) * 58;
    const amazonRev = Math.log(amazon + 1) * 72;
    const influencerRev = Math.log(influencer + 1) * 42;

    const totalSpend = google + meta + amazon + influencer;
    const totalRev = googleRev + metaRev + amazonRev + influencerRev;
    const blendedROAS = totalSpend > 0 ? (totalRev / totalSpend).toFixed(2) : '0.00';
    const incrementalProfit = (totalRev * 0.45 - totalSpend).toFixed(1);

    return {
      totalSpend,
      totalRev: totalRev.toFixed(1),
      blendedROAS,
      incrementalProfit,
      channels: [
        { name: 'Google Search', spend: google, revenue: googleRev.toFixed(1), roas: (googleRev / google).toFixed(2) },
        { name: 'Meta Ads', spend: meta, revenue: metaRev.toFixed(1), roas: (metaRev / meta).toFixed(2) },
        { name: 'Amazon Ads', spend: amazon, revenue: amazonRev.toFixed(1), roas: (amazonRev / amazon).toFixed(2) },
        { name: 'Influencers', spend: influencer, revenue: influencerRev.toFixed(1), roas: (influencerRev / influencer).toFixed(2) }
      ]
    };
  }, [adSpend]);

  // --- State for Supply Chain Simulator ---
  const [safetyBufferDays, setSafetyBufferDays] = useState(14);
  const [leadTimeDays, setLeadTimeDays] = useState(21);

  const supplyMetrics = useMemo(() => {
    const avgDailyDemand = 850; 
    const leadTimeDemand = avgDailyDemand * leadTimeDays;
    const safetyStock = avgDailyDemand * safetyBufferDays;
    const reorderPoint = leadTimeDemand + safetyStock;

    let stockoutRisk = 'VERY LOW (<1%)';
    let riskColor = 'text-emerald-400';
    if (safetyBufferDays < 5) {
      stockoutRisk = 'CRITICAL (38%)';
      riskColor = 'text-rose-500';
    } else if (safetyBufferDays < 10) {
      stockoutRisk = 'MODERATE (14%)';
      riskColor = 'text-amber-400';
    }

    return { avgDailyDemand, leadTimeDemand, safetyStock, reorderPoint, stockoutRisk, riskColor };
  }, [safetyBufferDays, leadTimeDays]);

  // Dynamic calculation of pending actions based on resolution state
  const pendingActionsCount = 3 - Object.values(resolvedActions).filter(Boolean).length;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between z-20">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 shadow-lg shadow-cyan-500/20 shrink-0">
              <Cpu className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-wider text-slate-100 leading-tight">
                ENTERPRISE RESOURCE<br/>INTELLIGENCE
              </h1>
              <p className="text-[10px] font-semibold text-cyan-400 tracking-wider mt-0.5">DECISION ENGINE</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {[
              { id: 'executive', label: 'Executive Decisions', icon: ShieldAlert, badge: pendingActionsCount > 0 ? `${pendingActionsCount} Action` : null },
              { id: 'variance', label: 'Root Cause & Variance', icon: BarChart3 },
              { id: 'moneyflow', label: 'Cross-Functional P&L', icon: DollarSign },
              { id: 'demand', label: 'Demand Prediction', icon: TrendingUp },
              { id: 'marketing', label: 'Marketing Simulator', icon: Sliders },
              { id: 'supply', label: 'Supply Chain & ROP', icon: Truck },
              { id: 'customer', label: 'Customer Risk & Churn', icon: Users, badge: 'High Risk' },
              { id: 'governance', label: 'Governance & Quality', icon: CheckCircle2 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-xs transition-all duration-200 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/10 to-transparent text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/5' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      tab.id === 'executive' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Display Canvas */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur-md border-b border-slate-800/80 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 tracking-wide capitalize">
                {activeTab.replace(/([A-Z])/g, ' $1')} Command Hub
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-semibold">Q3 Projected Net</p>
                <p className="text-xs font-bold text-emerald-400">₹11.4M (+18%)</p>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </header>

        {/* Tab Content Router Area */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">

          {/* 1. EXECUTIVE DECISIONS TAB */}
          {activeTab === 'executive' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Executive Decision Cards</h3>
                  <p className="text-xs text-slate-400">Prioritized tactical & strategic interventions generated by predictive telemetry</p>
                </div>
                {pendingActionsCount > 0 ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    {pendingActionsCount} Action{pendingActionsCount > 1 ? 's' : ''} Pending Board Approval
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> All Actions Executed
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                
                {/* Decision Card 1: High Priority (Meta -> Amazon) */}
                {!resolvedActions.dec1 ? (
                  <div className="group relative rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 p-6 border border-rose-500/30 shadow-xl shadow-rose-950/10 hover:border-rose-500/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40">HIGH PRIORITY</span>
                        <h4 className="text-base font-bold text-slate-100">Reallocate Meta Ad Spend to Amazon Ads</h4>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">ID: DEC-2026-081</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-cyan-400" /> Observation</p>
                        <p className="text-slate-200">Meta CAC surged by +28% YoY while Amazon Search Conversion hit 18.4% peak.</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Evidence</p>
                        <p className="text-slate-200">Blended ROAS on Meta dropped from 3.2x to 1.8x over the last 30 days.</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Expected Impact</p>
                        <p className="text-emerald-400 font-semibold">+₹420,000 Net Incremental Rev/month with zero budget increase.</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Risk & Trade-offs</p>
                        <p className="text-amber-300">Top-of-funnel brand reach on social media will decline by ~12%.</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                      <div className="text-xs text-slate-400">
                        Recommended Action: <span className="text-slate-200 font-semibold">Shift ₹35k/mo from Meta to Amazon Sponsored Products</span>
                      </div>
                      <button 
                        onClick={() => handleActionExecution('dec1')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold text-xs shadow-lg shadow-rose-500/20 hover:opacity-90 transition-opacity">
                        Execute Recommendation <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-emerald-950/30 p-6 border border-emerald-500/40 shadow-lg transition-all flex flex-col space-y-4">
                    <div className="flex items-center gap-3 border-b border-emerald-900/50 pb-3">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                      <h4 className="text-base font-bold text-emerald-100">Budget Successfully Reallocated</h4>
                    </div>
                    <div className="text-sm text-slate-300 space-y-2">
                      <p><strong className="text-slate-100">Triggering Problem:</strong> Meta Ad efficiency was bleeding capital; CAC had surged 28% reducing overall ROAS to critically low levels (1.8x).</p>
                      <p><strong className="text-slate-100">Action Taken:</strong> Automated API transfer of ₹35k monthly budget from Meta Ads Manager directly to Amazon Sponsored Products targeting high-conversion keywords.</p>
                      <p><strong className="text-slate-100">Result:</strong> Marketing pipelines updated. The projected net revenue pipeline has increased by <span className="text-emerald-400 font-bold">₹420,000/month</span>.</p>
                    </div>
                  </div>
                )}

                {/* Decision Card 2: Medium Priority (Supply Chain) */}
                {!resolvedActions.dec2 ? (
                  <div className="group relative rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 p-6 border border-amber-500/30 shadow-xl shadow-amber-950/10 hover:border-amber-500/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40">MEDIUM PRIORITY</span>
                        <h4 className="text-base font-bold text-slate-100">Adjust Component Safety Buffer for Q4 Demand Surge</h4>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">ID: DEC-2026-082</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-cyan-400" /> Observation</p>
                        <p className="text-slate-200">Supplier lead times extended from 14 to 21 days due to port congestion.</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Evidence</p>
                        <p className="text-slate-200">Stockout probability for Flagship Unit X rises to 38% in November.</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Expected Impact</p>
                        <p className="text-emerald-400 font-semibold">Prevents potential ₹1.2M unfulfilled sales loss in peak holiday season.</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Risk & Trade-offs</p>
                        <p className="text-amber-300">Ties up ₹180,000 in working capital for inventory holding costs.</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                      <div className="text-xs text-slate-400">
                        Recommended Action: <span className="text-slate-200 font-semibold">Increase Safety Stock Days from 14 to 21 Days immediately</span>
                      </div>
                      <button 
                        onClick={() => handleActionExecution('dec2')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:opacity-90 transition-opacity">
                        Adjust ROP Level <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-emerald-950/30 p-6 border border-emerald-500/40 shadow-lg transition-all flex flex-col space-y-4">
                    <div className="flex items-center gap-3 border-b border-emerald-900/50 pb-3">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                      <h4 className="text-base font-bold text-emerald-100">Supply Parameters Adjusted</h4>
                    </div>
                    <div className="text-sm text-slate-300 space-y-2">
                      <p><strong className="text-slate-100">Triggering Problem:</strong> Unpredictable port congestion increased supplier lead times by 7 days, resulting in a 38% chance of Q4 stockouts and ₹1.2M in missed sales.</p>
                      <p><strong className="text-slate-100">Action Taken:</strong> Overwrote ERP Safety Stock parameters from 14 to 21 days for Flagship Unit X.</p>
                      <p><strong className="text-slate-100">Result:</strong> Reorder point successfully raised. Supply chain risk reduced to &lt;1%. ERP procurement requests have been dispatched to cover the ₹180k working capital gap.</p>
                    </div>
                  </div>
                )}

                {/* Decision Card 3: Monitor (Customer Churn) */}
                {!resolvedActions.dec3 ? (
                  <div className="group relative rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 p-6 border border-cyan-500/30 shadow-xl shadow-cyan-950/10 hover:border-cyan-500/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">MONITOR</span>
                        <h4 className="text-base font-bold text-slate-100">Enterprise Account Churn Risk Alert (Acme Corp)</h4>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">ID: DEC-2026-083</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-cyan-400" /> Observation</p>
                        <p className="text-slate-200">Acme Global (₹420k ARR) product engagement scores fell by 45%.</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Evidence</p>
                        <p className="text-slate-200">Zero admin user logins recorded in the past 30 days.</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Expected Impact</p>
                        <p className="text-emerald-400 font-semibold">Saves ₹420,000 ARR by proactive executive intervention.</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400 font-medium mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Risk & Trade-offs</p>
                        <p className="text-amber-300">Requires dedicated executive sponsor time & custom engineering patch.</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                      <div className="text-xs text-slate-400">
                        Recommended Action: <span className="text-slate-200 font-semibold">Assign VP of Customer Success for On-Site Business Review</span>
                      </div>
                      <button 
                        onClick={() => handleActionExecution('dec3')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 transition-all">
                        Assign CS Team <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-emerald-950/30 p-6 border border-emerald-500/40 shadow-lg transition-all flex flex-col space-y-4">
                    <div className="flex items-center gap-3 border-b border-emerald-900/50 pb-3">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                      <h4 className="text-base font-bold text-emerald-100">CS Team Successfully Assigned</h4>
                    </div>
                    <div className="text-sm text-slate-300 space-y-2">
                      <p><strong className="text-slate-100">Triggering Problem:</strong> A high-value Enterprise account (Acme Corp, ₹420k ARR) showed critical red flags: zero admin logins over 30 days and a 45% drop in general engagement.</p>
                      <p><strong className="text-slate-100">Action Taken:</strong> CRM triggered an automatic task assignment to the VP of Customer Success scheduling an emergency On-Site Business Review.</p>
                      <p><strong className="text-slate-100">Result:</strong> VP CS calendar booked. Technical support engineers have been preemptively briefed on Acme Corp's recent ticket history to prepare a custom retention patch.</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 2. ROOT CAUSE VARIANCE TAB */}
          {activeTab === 'variance' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">Root Cause Variance Analysis</h3>
                    <p className="text-xs text-slate-400">Deconstructing revenue deviations from baseline target (₹40.0M baseline vs ₹45.5M actual)</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    +₹5.5M Positive Net Variance (+13.7%)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs leading-relaxed text-cyan-200 space-y-2">
                  <p className="font-semibold text-cyan-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" /> Plain-English Executive Summary:
                  </p>
                  <p>
                    Quarterly outperformance was primarily propelled by strong <strong className="text-white">Volume Growth (+₹4.2M)</strong> following the Enterprise Tier product launch, alongside strategic <strong className="text-white">Price Expansion (+₹2.8M)</strong>. However, a negative <strong className="text-white">Mix Shift (-₹1.5M)</strong> occurred as customer adoption tilted toward discounted annual multi-seat licenses, offsetting raw gross margins.
                  </p>
                </div>

                <div className="h-80 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={VARIANCE_WATERFALL_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="M" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                        itemStyle={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '14px' }} // Highly visible color added
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        formatter={(val) => [`₹${val}M`, 'Financial Impact']}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {VARIANCE_WATERFALL_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* 3. CROSS-FUNCTIONAL P&L TAB */}
          {activeTab === 'moneyflow' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Cross-Functional P&L Money Flow</h3>
                  <p className="text-xs text-slate-400">Tracking capital conversion from initial marketing expenditure to bottom-line net profit</p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                  {['All', 'Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setSelectedQuarter(q)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedQuarter === q 
                          ? 'bg-cyan-500 text-slate-950 shadow-md' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { label: 'Ad Spend', key: 'adSpend', color: 'text-purple-400', border: 'border-purple-500/30' },
                  { label: 'Gross Revenue', key: 'revenue', color: 'text-cyan-400', border: 'border-cyan-500/30' },
                  { label: 'COGS', key: 'cogs', color: 'text-rose-400', border: 'border-rose-500/30' },
                  { label: 'Opex', key: 'opex', color: 'text-amber-400', border: 'border-amber-500/30' },
                  { label: 'Net Profit', key: 'netProfit', color: 'text-emerald-400', border: 'border-emerald-500/30' }
                ].map((item) => (
                  <div key={item.key} className={`p-5 rounded-2xl bg-slate-900/80 border ${item.border} space-y-2`}>
                    <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                    <p className={`text-2xl font-black ${item.color}`}>
                      ₹{PL_QUARTERLY_DATA[selectedQuarter][item.key]}M
                    </p>
                    <p className="text-[10px] text-slate-500">Filtered: {selectedQuarter}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-200">Financial Conversion Efficiency</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[PL_QUARTERLY_DATA[selectedQuarter]]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="name" tick={false} />
                      <YAxis stroke="#94a3b8" unit="M" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} formatter={(val) => [`₹${val}M`]} />
                      <Legend />
                      <Bar dataKey="adSpend" name="Ad Spend" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="revenue" name="Revenue" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cogs" name="COGS" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="opex" name="Opex" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="netProfit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* 4. DEMAND PREDICTION TAB (Beautified) */}
          {activeTab === 'demand' && (
            <div className="space-y-6">
              <div 
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700/50 shadow-[0_0_40px_-10px_rgba(6,182,212,0.15)] space-y-6"
                style={{ backdropFilter: 'blur(12px)' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                      Demand Forecast & Confidence Bands
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">12-Month Predictive Horizon • Model MAPE Accuracy: <span className="text-emerald-400 font-bold">4.8%</span></p>
                  </div>

                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-700/60 shadow-inner">
                    {[
                      { id: 'expected', label: 'Expected Case' },
                      { id: 'high', label: 'High Demand (+15%)' },
                      { id: 'low', label: 'Low Demand (-15%)' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setScenario(s.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                          scenario === s.id 
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-[22rem] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={adjustedForecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="color95" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="color80" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                      <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} tick={{dy: 10, fill: '#64748b'}} />
                      <YAxis stroke="#94a3b8" unit="M" axisLine={false} tickLine={false} tick={{dx: -10, fill: '#64748b'}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderColor: '#334155', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} 
                        formatter={(val) => [`₹${val}M`]}
                        itemStyle={{ fontWeight: 600 }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Area type="monotone" dataKey="upper95" stroke="none" fill="url(#color95)" name="95% Confidence Band" />
                      <Area type="monotone" dataKey="upper80" stroke="none" fill="url(#color80)" name="80% Confidence Band" />
                      <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} name="Actual Historical" dot={{ r: 5, strokeWidth: 2, fill: '#0f172a' }} activeDot={{r: 7}} />
                      <Line type="monotone" dataKey="forecast" stroke="#38bdf8" strokeWidth={3} strokeDasharray="5 5" name="Predicted Demand" dot={{ r: 0 }} activeDot={{r: 6}} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* 5. MARKETING SIMULATOR TAB */}
          {activeTab === 'marketing' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-cyan-400" /> Channel Allocations
                  </h3>
                  <p className="text-xs text-slate-400">Simulate spend shifts with logarithmic yield curves</p>
                </div>

                {[
                  { key: 'google', label: 'Google Search Ads', color: 'accent-cyan-500' },
                  { key: 'meta', label: 'Meta (FB/Insta)', color: 'accent-purple-500' },
                  { key: 'amazon', label: 'Amazon Ads', color: 'accent-amber-500' },
                  { key: 'influencer', label: 'Influencer Marketing', color: 'accent-pink-500' }
                ].map((channel) => (
                  <div key={channel.key} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{channel.label}</span>
                      <span className="text-cyan-400">₹{adSpend[channel.key]}k / mo</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="300" 
                      step="5"
                      value={adSpend[channel.key]}
                      onChange={(e) => setAdSpend({ ...adSpend, [channel.key]: Number(e.target.value) })}
                      className={`w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer ${channel.color}`}
                    />
                  </div>
                ))}
              </div>

              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
                <h3 className="text-lg font-bold text-slate-100">Simulated ROAS & Revenue Outputs</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-xs text-slate-400">Total Ad Spend</p>
                    <p className="text-xl font-bold text-slate-100">₹{marketingMetrics.totalSpend}k</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-xs text-slate-400">Projected Revenue</p>
                    <p className="text-xl font-bold text-cyan-400">₹{marketingMetrics.totalRev}k</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-xs text-slate-400">Blended ROAS</p>
                    <p className="text-xl font-bold text-emerald-400">{marketingMetrics.blendedROAS}x</p>
                  </div>
                </div>

                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketingMetrics.channels}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} formatter={(val) => [`₹${val}k`]} />
                      <Legend />
                      <Bar dataKey="spend" name="Spend (₹k)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="revenue" name="Predicted Rev (₹k)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* 6. SUPPLY CHAIN TAB */}
          {activeTab === 'supply' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-400" /> Buffer Parameters
                  </h3>
                  <p className="text-xs text-slate-400">Adjust parameters to recalculate Reorder Point (ROP)</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Safety Buffer Days</span>
                      <span className="text-amber-400">{safetyBufferDays} Days</span>
                    </div>
                    <input 
                      type="range" 
                      min="2" 
                      max="45" 
                      value={safetyBufferDays}
                      onChange={(e) => setSafetyBufferDays(Number(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-800 accent-amber-500 appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Supplier Lead Time</span>
                      <span className="text-cyan-400">{leadTimeDays} Days</span>
                    </div>
                    <input 
                      type="range" 
                      min="7" 
                      max="60" 
                      value={leadTimeDays}
                      onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-800 accent-cyan-500 appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
                <h3 className="text-lg font-bold text-slate-100">Calculated Stockout & ROP Telemetry</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-xs text-slate-400">Safety Stock Buffer</p>
                    <p className="text-xl font-bold text-amber-400">{supplyMetrics.safetyStock.toLocaleString()} units</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-xs text-slate-400">Calculated ROP Trigger</p>
                    <p className="text-xl font-bold text-cyan-400">{supplyMetrics.reorderPoint.toLocaleString()} units</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-xs text-slate-400">Stockout Risk Level</p>
                    <p className={`text-xl font-bold ${supplyMetrics.riskColor}`}>{supplyMetrics.stockoutRisk}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-2">
                  <p className="text-slate-300 font-semibold">Formula Breakdown:</p>
                  <p className="text-slate-400 font-mono">
                    ROP = (Avg Daily Demand × Lead Time) + Safety Stock
                  </p>
                  <p className="text-slate-400 font-mono">
                    = (850 units/day × {leadTimeDays} days) + {supplyMetrics.safetyStock.toLocaleString()} units = <span className="text-cyan-400 font-bold">{supplyMetrics.reorderPoint.toLocaleString()} units</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 7. CUSTOMER RISK TAB */}
          {activeTab === 'customer' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-lg font-bold text-slate-100">Account Health Segmentation</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={CHURN_PIE_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {CHURN_PIE_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {CHURN_PIE_DATA.map(item => (
                      <div key={item.name} className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                          {item.name}
                        </span>
                        <span className="font-bold text-slate-200">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-lg font-bold text-slate-100 flex items-center justify-between">
                    <span>High-Risk VIP Accounts At Risk</span>
                    <span className="text-xs text-rose-400 font-normal">Total ARR At Risk: ₹1,045,000</span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Account</th>
                          <th className="p-3">ARR</th>
                          <th className="p-3">Risk %</th>
                          <th className="p-3">Trigger Reason</th>
                          <th className="p-3">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {HIGH_RISK_ACCOUNTS.map((acc) => (
                          <tr key={acc.id} className="hover:bg-slate-800/30">
                            <td className="p-3 font-semibold text-slate-100">{acc.name}</td>
                            <td className="p-3 text-cyan-400 font-bold">{acc.arr}</td>
                            <td className="p-3 font-bold text-rose-400">{acc.risk}%</td>
                            <td className="p-3 text-slate-400 max-w-xs">{acc.trigger}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                {acc.healthScore}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. GOVERNANCE TAB */}
          {activeTab === 'governance' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">Data Governance & Pipeline Telemetry</h3>
                    <p className="text-xs text-slate-400">Automated lineage check and quality audits across upstream enterprise data sources</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    All Systems Operational
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Data Pipeline</th>
                        <th className="p-3">Source System</th>
                        <th className="p-3">Freshness</th>
                        <th className="p-3">Completeness</th>
                        <th className="p-3">Audit Status</th>
                        <th className="p-3">Detected Anomaly</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {DATA_GOVERNANCE_AUDIT.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-3 font-semibold text-slate-100">{row.pipeline}</td>
                          <td className="p-3 text-slate-400">{row.source}</td>
                          <td className="p-3 text-cyan-400">{row.freshness}</td>
                          <td className="p-3 text-emerald-400 font-bold">{row.completeness}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              row.status === 'PASSED' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{row.anomaly}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}