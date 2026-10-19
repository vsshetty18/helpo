import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AccidentIncident } from '../../types/incident';

interface IncidentTrendChartProps {
  incidents: AccidentIncident[];
  type?: 'bar' | 'donut';
  height?: number;
}

const SEVERITY_COLORS = {
  critical: '#EF4444',
  high: '#F97316',
  moderate: '#F59E0B',
  low: '#10B981'
};

export const IncidentTrendChart: React.FC<IncidentTrendChartProps> = ({
  incidents,
  type = 'bar',
  height = 240
}) => {
  if (type === 'donut') {
    const severityCounts = {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0
    };

    incidents.forEach(inc => {
      severityCounts[inc.severity] = (severityCounts[inc.severity] || 0) + 1;
    });

    const pieData = [
      { name: 'Critical', value: severityCounts.critical, color: SEVERITY_COLORS.critical },
      { name: 'High', value: severityCounts.high, color: SEVERITY_COLORS.high },
      { name: 'Moderate', value: severityCounts.moderate, color: SEVERITY_COLORS.moderate },
      { name: 'Low', value: severityCounts.low, color: SEVERITY_COLORS.low }
    ].filter(d => d.value > 0);

    if (pieData.length === 0) {
      return (
        <div className="w-full flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg p-6" style={{ height }}>
          <span className="font-semibold text-slate-600">0 Incident Records</span>
          <span className="text-[11px] text-slate-400 mt-0.5">No severity data to chart.</span>
        </div>
      );
    }

    return (
      <div className="w-full flex items-center justify-between" style={{ height }}>
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 flex flex-col gap-2 pl-4 border-l border-slate-100 text-xs">
          {pieData.map(item => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Bar chart by days - all zero unless incidents exist
  const daysMap: Record<string, number> = {
    'Mon': 0,
    'Tue': 0,
    'Wed': 0,
    'Thu': 0,
    'Fri': 0,
    'Sat': 0,
    'Sun': incidents.length
  };

  const barData = Object.entries(daysMap).map(([day, count]) => ({ day, incidents: count }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" allowDecimals={false} domain={[0, Math.max(5, incidents.length)]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="incidents" fill="#14243A" radius={[4, 4, 0, 0]} name="Incidents Logged" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
