import os
import sys
import subprocess
import json

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT_DIR, "data")
SRC_DIR = os.path.join(ROOT_DIR, "src")
UI_DIR = os.path.join(ROOT_DIR, "dashboard-ui")
UI_SRC_DIR = os.path.join(UI_DIR, "src")

# 1. CREATE DIRECTORY STRUCTURE
def create_directory_structure():
    print("\n [1/5] Ensuring all project directories exist...")
    for directory in [DATA_DIR, SRC_DIR, UI_DIR, UI_SRC_DIR]:
        os.makedirs(directory, exist_ok=True)
        print(f"  ✓ Verified: {directory}")

# 2. GENERATE FASTAPI BACKEND (server.py)
def create_backend_files():
    print("\n [2/5] Generating FastAPI backend server (server.py)...")
    server_code = '''from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import pandas as pd
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join("data", "enterprise_intelligence.db")
if not os.path.exists(DB_PATH):
    DB_PATH = "enterprise_intelligence.db"

@app.get("/api/dashboard-data")
def get_dashboard_data():
    conn = sqlite3.connect(DB_PATH)
    try:
        df = pd.read_sql_query("SELECT * FROM vw_daily_sales_performance", conn)
    except Exception:
        try:
            df = pd.read_sql_query("SELECT * FROM fact_daily_sales", conn)
        except Exception:
            return []
    conn.close()

    df['sale_date'] = pd.to_datetime(df['sale_date']).dt.strftime('%Y-%m-%d')
    df['day_name'] = pd.to_datetime(df['sale_date']).dt.day_name()
    return df.to_dict(orient="records")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
'''
    with open(os.path.join(ROOT_DIR, "server.py"), "w", encoding="utf-8") as f:
        f.write(server_code)

# 3. GENERATE REACT FRONTEND CODE
def create_react_files():
    print("\n [3/5] Generating React project files & components...")

    package_json = {
        "name": "dashboard-ui",
        "private": True,
        "version": "1.0.0",
        "type": "module",
        "scripts": { "dev": "vite --host", "build": "vite build" },
        "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "recharts": "^2.10.3"
        },
        "devDependencies": {
            "@vitejs/plugin-react": "^4.2.1",
            "vite": "^5.0.8"
        }
    }
    with open(os.path.join(UI_DIR, "package.json"), "w", encoding="utf-8") as f:
        json.dump(package_json, f, indent=2)

    with open(os.path.join(UI_DIR, "vite.config.js"), "w", encoding="utf-8") as f:
        f.write('''import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
})
''')

    with open(os.path.join(UI_DIR, "index.html"), "w", encoding="utf-8") as f:
        f.write('''<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>ENTERPRISE INTELLIGENCE PLATFORM</title>
    <style> body { margin: 0; background-color: #090d16; color: #f3f4f6; } </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
''')

    with open(os.path.join(UI_SRC_DIR, "main.jsx"), "w", encoding="utf-8") as f:
        f.write('''import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
''')

    app_jsx = '''import React, { useState } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  // INVENTORY SAFETY BUFFER CONTROL
  const [safetyBufferDays, setSafetyBufferDays] = useState(15);
  const avgDailyDemand = 120;
  const leadTimeDays = 10;
  const currentInventory = 1850;
  const unitHoldingCostYearly = 240;
  const unitCost = 1200;

  const safetyBufferUnits = safetyBufferDays * avgDailyDemand;
  const leadTimeDemand = avgDailyDemand * leadTimeDays;
  const reorderPoint = leadTimeDemand + safetyBufferUnits;
  const daysOfStockRemaining = Math.round(currentInventory / avgDailyDemand);
  const targetStockLevel = reorderPoint + (avgDailyDemand * 15);
  const recommendedReorderQty = Math.max(0, targetStockLevel - currentInventory);
  const totalHoldingCostInr = Math.round((currentInventory + safetyBufferUnits) * (unitHoldingCostYearly / 365) * 30);
  const stockoutRiskPercent = Math.max(1, Math.min(99, Math.round(45 - (safetyBufferDays * 2.2))));

  // QUARTERLY FINANCE FILTER
  const [selectedQuarter, setSelectedQuarter] = useState('ALL');

  const quarterlyData = [
    { quarter: 'Q1', revenue: 14500000, cogs: 7250000, opex: 3100000, ebitda: 4150000 },
    { quarter: 'Q2', revenue: 16800000, cogs: 8100000, opex: 3400000, ebitda: 5300000 },
    { quarter: 'Q3', revenue: 19200000, cogs: 9400000, opex: 3800000, ebitda: 6000000 },
    { quarter: 'Q4', revenue: 22500000, cogs: 10800000, opex: 4200000, ebitda: 7500000 },
  ];

  const filteredQuarterData = selectedQuarter === 'ALL' 
    ? quarterlyData 
    : quarterlyData.filter(q => q.quarter === selectedQuarter);

  const finRevenue = filteredQuarterData.reduce((a, b) => a + b.revenue, 0);
  const finCogs = filteredQuarterData.reduce((a, b) => a + b.cogs, 0);
  const finOpex = filteredQuarterData.reduce((a, b) => a + b.opex, 0);
  const finEbitda = filteredQuarterData.reduce((a, b) => a + b.ebitda, 0);
  const finGrossProfit = finRevenue - finCogs;
  const finNetProfit = finEbitda - 850000;

  const formatINR = (val) => {
    if (val >= 10000000) return `\\u20b9${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `\\u20b9${(val / 100000).toFixed(2)} Lakh`;
    return `\\u20b9${val.toLocaleString('en-IN')}`;
  };

  const revenueTrend = [
    { month: 'Jan', revenue: 4200000, profit: 1100000, orders: 3400 },
    { month: 'Feb', revenue: 4800000, profit: 1350000, orders: 3900 },
    { month: 'Mar', revenue: 5500000, profit: 1700000, orders: 4500 },
    { month: 'Apr', revenue: 5200000, profit: 1550000, orders: 4200 },
    { month: 'May', revenue: 6100000, profit: 1950000, orders: 5100 },
    { month: 'Jun', revenue: 5800000, profit: 1800000, orders: 4800 },
    { month: 'Jul', revenue: 6900000, profit: 2250000, orders: 5700 },
    { month: 'Aug', revenue: 7300000, profit: 2450000, orders: 6100 },
  ];

  const marketingChannels = [
    { name: 'Google Ads', spend: 850000, revenue: 3800000, roas: 4.47, cac: 420 },
    { name: 'Meta (FB/Insta)', spend: 1100000, revenue: 4200000, roas: 3.81, cac: 510 },
    { name: 'Amazon Ads', spend: 650000, revenue: 3100000, roas: 4.76, cac: 380 },
    { name: 'Influencers', spend: 300000, revenue: 950000, roas: 3.16, cac: 640 },
  ];

  const salesPredictions = [
    { day: 'Day 1', actual: 210, predicted: 215 },
    { day: 'Day 5', actual: 230, predicted: 228 },
    { day: 'Day 10', actual: 245, predicted: 250 },
    { day: 'Day 15', actual: 260, predicted: 258 },
    { day: 'Day 20', actual: null, predicted: 275 },
    { day: 'Day 25', actual: null, predicted: 290 },
    { day: 'Day 30', actual: null, predicted: 310 },
  ];

  return (
    <div style={{ backgroundColor: '#090d16', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <header style={{ 
        textAlign: 'center', 
        padding: '28px 20px 20px 20px', 
        borderBottom: '1px solid #1e293b',
        backgroundColor: '#0f172a'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '32px', 
          fontWeight: '900', 
          letterSpacing: '2.5px', 
          color: '#ffffff',
          textTransform: 'uppercase'
        }}>
          ENTERPRISE INTELLIGENCE PLATFORM
        </h1>
        <div style={{ 
          color: '#38bdf8', 
          fontSize: '13px', 
          fontWeight: '700', 
          letterSpacing: '1.5px', 
          marginTop: '6px' 
        }}>
          EXECUTIVE DECISION SUPPORT SYSTEM
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 95px)' }}>
        
        <aside style={{ 
          width: '260px', 
          backgroundColor: '#0f172a', 
          borderRight: '1px solid #1e293b', 
          padding: '20px 12px' 
        }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', padding: '0 12px 12px 12px', letterSpacing: '1px' }}>
            ANALYTICS MODULES
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'overview', label: '📊 Executive Overview' },
              { id: 'inventory', label: '📦 Inventory & Supply Chain' },
              { id: 'finance', label: '💰 Finance & Revenue' },
              { id: 'marketing', label: '🎯 Marketing & Ad Spend' },
              { id: 'predictions', label: '🔮 Demand Predictions & Smart Insights' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === item.id ? '#0284c7' : 'transparent',
                  color: activeTab === item.id ? '#ffffff' : '#94a3b8',
                  fontWeight: activeTab === item.id ? '700' : '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main style={{ flex: 1, padding: '28px', backgroundColor: '#090d16', overflowY: 'auto' }}>
          
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 20px 0', color: '#f8fafc' }}>
                Executive Core Performance Indicators
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <KpiCard title="GROSS REVENUE (YTD)" value={formatINR(73000000)} color="#38bdf8" subtext="↑ 18.4% vs last year" />
                <KpiCard title="NET PROFIT (YTD)" value={formatINR(22800000)} color="#4ade80" subtext="Margin: 31.2%" />
                <KpiCard title="TOTAL ORDERS" value="37,700" color="#a78bfa" subtext="Avg order: \\u20b91,936" />
                <KpiCard title="CUSTOMER ACQUISITION (CAC)" value="\\u20b9440" color="#f43f5e" subtext="ROAS: 4.12x average" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <Card title="REVENUE & PROFIT DYNAMICS (IN RUPEES)">
                  <div style={{ height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueTrend}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" tickFormatter={(v) => `\\u20b9${v/100000}L`} />
                        <Tooltip formatter={(value) => formatINR(value)} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#38bdf8" fill="url(#colorRev)" strokeWidth={2} />
                        <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#4ade80" fill="url(#colorProf)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card title="ORDER VOLUME BY MONTH">
                  <div style={{ height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueTrend}>
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                        <Bar dataKey="orders" name="Orders" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#f8fafc' }}>
                  Inventory & Supply Chain Control Center
                </h2>
              </div>

              <div style={{ backgroundColor: '#0f172a', border: '1px solid #0284c7', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#f8fafc' }}>Safety Buffer Stock Level: </span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8' }}>{safetyBufferDays} Days</span>
                    <span style={{ fontSize: '14px', color: '#94a3b8', marginLeft: '8px' }}>({safetyBufferUnits.toLocaleString()} units)</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#f43f5e', fontWeight: 'bold' }}>
                    Stockout Probability: {stockoutRiskPercent}%
                  </span>
                </div>
                
                <input 
                  type="range" 
                  min="5" 
                  max="45" 
                  value={safetyBufferDays} 
                  onChange={(e) => setSafetyBufferDays(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#0284c7' }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                  <span>5 Days (Lean / Higher Risk)</span>
                  <span>25 Days (Optimal Balance)</span>
                  <span>45 Days (High Holding Cost)</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <KpiCard 
                  title="REORDER POINT (ROP)" 
                  value={`${reorderPoint.toLocaleString()} units`} 
                  color="#f59e0b" 
                  subtext={`Trigger order when stock hits ${reorderPoint}`} 
                />
                <KpiCard 
                  title="DAYS OF STOCK LEFT" 
                  value={`${daysOfStockRemaining} Days`} 
                  color={daysOfStockRemaining < 15 ? '#f43f5e' : '#4ade80'} 
                  subtext={`Current Physical Stock: ${currentInventory}`} 
                />
                <KpiCard 
                  title="RECOMMENDED REORDER QTY" 
                  value={`${recommendedReorderQty.toLocaleString()} units`} 
                  color="#a78bfa" 
                  subtext={`Est. Cost: ${formatINR(recommendedReorderQty * unitCost)}`} 
                />
                <KpiCard 
                  title="MONTHLY HOLDING COST" 
                  value={formatINR(totalHoldingCostInr)} 
                  color="#38bdf8" 
                  subtext="Based on current buffer levels" 
                />
              </div>

              <Card title="CRITICAL STOCK SKUS & REORDER STATUS">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                      <th style={{ padding: '12px' }}>SKU Name</th>
                      <th style={{ padding: '12px' }}>Current Stock</th>
                      <th style={{ padding: '12px' }}>Safety Buffer</th>
                      <th style={{ padding: '12px' }}>Reorder Point</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Action Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>SKU-Alpha Premium</td>
                      <td style={{ padding: '12px' }}>{currentInventory} units</td>
                      <td style={{ padding: '12px', color: '#38bdf8' }}>{safetyBufferUnits} units</td>
                      <td style={{ padding: '12px' }}>{reorderPoint} units</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          backgroundColor: currentInventory <= reorderPoint ? '#7f1d1d' : '#14532d', 
                          color: currentInventory <= reorderPoint ? '#fca5a5' : '#86efac',
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' 
                        }}>
                          {currentInventory <= reorderPoint ? 'ORDER NOW' : 'HEALTHY'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {currentInventory <= reorderPoint ? `Order ${recommendedReorderQty} units` : 'No action'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {activeTab === 'finance' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#f8fafc' }}>
                  Financial Statement & Profitability Analysis
                </h2>
                
                <div style={{ display: 'flex', gap: '8px', backgroundColor: '#0f172a', padding: '4px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  {['ALL', 'Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setSelectedQuarter(q)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: selectedQuarter === q ? '#0284c7' : 'transparent',
                        color: selectedQuarter === q ? '#ffffff' : '#94a3b8',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      {q === 'ALL' ? 'Full Year (YTD)' : q}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <KpiCard title="TOTAL REVENUE" value={formatINR(finRevenue)} color="#38bdf8" subtext={`Selected: ${selectedQuarter}`} />
                <KpiCard title="COST OF GOODS (COGS)" value={formatINR(finCogs)} color="#f43f5e" subtext={`Gross Margin: ${((finGrossProfit/finRevenue)*100).toFixed(1)}%`} />
                <KpiCard title="OPERATING EXPENSES (OPEX)" value={formatINR(finOpex)} color="#f59e0b" subtext="Marketing, Salaries, Logistics" />
                <KpiCard title="EBITDA" value={formatINR(finEbitda)} color="#4ade80" subtext={`EBITDA Margin: ${((finEbitda/finRevenue)*100).toFixed(1)}%`} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <Card title="QUARTERLY REVENUE vs COGS vs EBITDA COMPARISON">
                  <div style={{ height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={quarterlyData}>
                        <XAxis dataKey="quarter" stroke="#64748b" />
                        <YAxis stroke="#64748b" tickFormatter={(v) => `\\u20b9${v/10000000}Cr`} />
                        <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                        <Bar dataKey="revenue" name="Revenue" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="cogs" name="COGS" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="ebitda" name="EBITDA" fill="#4ade80" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card title="PROFITABILITY SUMMARY">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                    <SummaryRow label="Gross Profit" value={formatINR(finGrossProfit)} color="#38bdf8" />
                    <SummaryRow label="Operating Profit" value={formatINR(finEbitda - finOpex)} color="#a78bfa" />
                    <SummaryRow label="Net Profit (Pre-tax)" value={formatINR(finNetProfit)} color="#4ade80" />
                    <div style={{ borderTop: '1px solid #334155', paddingTop: '12px', fontSize: '13px', color: '#94a3b8' }}>
                      All values formatted in Indian Rupees (\\u20b9).
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'marketing' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 20px 0', color: '#f8fafc' }}>
                Marketing Efficiency & Ad Spend Performance
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <KpiCard title="TOTAL AD SPEND" value={formatINR(2900000)} color="#f43f5e" subtext="Across 4 main channels" />
                <KpiCard title="ATTRIBUTED REVENUE" value={formatINR(12050000)} color="#38bdf8" subtext="Direct ad conversions" />
                <KpiCard title="BLENDED ROAS" value="4.15x" color="#4ade80" subtext="Return on Ad Spend" />
                <KpiCard title="AVG CAC" value="\\u20b9462" color="#a78bfa" subtext="Cost per customer acquired" />
              </div>

              <Card title="PERFORMANCE BY ADVERTISING CHANNEL">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                      <th style={{ padding: '12px' }}>Channel</th>
                      <th style={{ padding: '12px' }}>Ad Spend</th>
                      <th style={{ padding: '12px' }}>Revenue Generated</th>
                      <th style={{ padding: '12px' }}>ROAS</th>
                      <th style={{ padding: '12px' }}>CAC</th>
                      <th style={{ padding: '12px' }}>Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketingChannels.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.name}</td>
                        <td style={{ padding: '12px' }}>{formatINR(c.spend)}</td>
                        <td style={{ padding: '12px' }}>{formatINR(c.revenue)}</td>
                        <td style={{ padding: '12px', color: '#4ade80', fontWeight: 'bold' }}>{c.roas}x</td>
                        <td style={{ padding: '12px' }}>\\u20b9{c.cac}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            backgroundColor: c.roas > 4.0 ? '#14532d' : '#713f12', 
                            color: c.roas > 4.0 ? '#86efac' : '#fef08a',
                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
                          }}>
                            {c.roas > 4.0 ? 'SCALE UP BUDGET' : 'OPTIMIZE CREATIVES'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {activeTab === 'predictions' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 20px 0', color: '#f8fafc' }}>
                Business Predictions & Smart AI Recommendations
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <Card title="30-DAY SALES DEMAND PREDICTION">
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesPredictions}>
                        <XAxis dataKey="day" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                        <Line type="monotone" dataKey="actual" name="Actual Daily Sales" stroke="#38bdf8" strokeWidth={3} />
                        <Line type="monotone" dataKey="predicted" name="Predicted Demand" stroke="#a78bfa" strokeDasharray="5 5" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card title="SMART ACTIONABLE ALERTS">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <AlertBox title="📦 Stock Order Warning" desc="Demand expected to rise 18% next week. Place supplier order for SKU-Alpha by Friday." type="warning" />
                    <AlertBox title="💰 Marketing Efficiency" desc="Amazon Ads ROAS is 4.76x. Shift 15% budget from Influencers to Amazon Ads." type="success" />
                    <AlertBox title="⚠️ Customer Retention" desc="120 VIP customers haven't purchased in 60 days. Automated win-back campaign recommended." type="danger" />
                  </div>
                </Card>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

function KpiCard({ title, value, color, subtext }) {
  return (
    <div style={{ 
      backgroundColor: '#0f172a', 
      borderTop: `3px solid ${color}`, 
      borderRadius: '8px', 
      padding: '18px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }}>
      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '0.5px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: color, marginTop: '6px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{subtext}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ 
      backgroundColor: '#0f172a', 
      border: '1px solid #1e293b', 
      borderRadius: '10px', 
      padding: '20px',
      marginBottom: '16px' 
    }}>
      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '16px', letterSpacing: '0.5px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '14px', color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: '16px', fontWeight: 'bold', color: color }}>{value}</span>
    </div>
  );
}

function AlertBox({ title, desc, type }) {
  const colors = {
    warning: { bg: '#451a03', border: '#f59e0b', text: '#fde68a' },
    success: { bg: '#064e3b', border: '#10b981', text: '#a7f3d0' },
    danger: { bg: '#4c0519', border: '#f43f5e', text: '#fecdd3' }
  };
  const c = colors[type];
  return (
    <div style={{ backgroundColor: c.bg, borderLeft: `4px solid ${c.border}`, padding: '12px', borderRadius: '6px' }}>
      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff' }}>{title}</div>
      <div style={{ fontSize: '12px', color: c.text, marginTop: '4px' }}>{desc}</div>
    </div>
  );
}
'''
    with open(os.path.join(UI_SRC_DIR, "App.jsx"), "w", encoding="utf-8") as f:
        f.write(app_jsx)

# 4. EXECUTING PIPELINE & INSTALLATION
def execute_pipeline_and_install():
    print("\n [4/5] Executing database scripts & installing dependencies...")
    env = os.environ.copy()
    env["PYTHONPATH"] = f"{ROOT_DIR};{SRC_DIR}"

    for script in ["src/build_silver.py", "src/build_gold.py", "src/build_analytics_views.py"]:
        script_path = os.path.join(ROOT_DIR, script)
        if os.path.exists(script_path):
            print(f"  -> Running {script}...")
            subprocess.run([sys.executable, script_path], env=env)

    print("  -> Installing Python backend libraries...")
    subprocess.run([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn", "pandas"], check=True)

    print("  -> Installing React UI npm packages...")
    subprocess.run("npm install", cwd=UI_DIR, shell=True, check=True)

# 5. LAUNCH BOTH SERVERS
def launch_servers():
    print("\n" + "="*60)
    print(" 🚀 BACKEND ACTIVE : http://localhost:8000")
    print(" 🚀 REACT DASHBOARD ACTIVE: http://localhost:5173")
    print("="*60 + "\n")

    backend_proc = subprocess.Popen([sys.executable, "server.py"], cwd=ROOT_DIR)
    frontend_proc = subprocess.Popen("npm run dev", cwd=UI_DIR, shell=True)

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    create_directory_structure()
    create_backend_files()
    create_react_files()
    execute_pipeline_and_install()
    launch_servers()