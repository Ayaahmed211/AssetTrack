import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './UsageStatsChart.css';

const STATUS_FILL = {
  ASSIGNED: '#10b981',
  AVAILABLE: '#8b5cf6',
  DECOMMISSIONED: '#ef4444',
  UNDER_MAINTENANCE: '#f59e0b',
};

const FALLBACK = ['#3b82f6', '#64748b', '#06b6d4', '#ec4899', '#84cc16'];

const formatStatusLabel = (name) =>
  String(name || '')
    .replace(/_/g, ' ')
    .trim()
    .toUpperCase();

const UsageStatsChart = ({ data, dataKey = 'value', nameKey = 'name' }) => {
  const rows = useMemo(() => {
    if (!data || !data.length) return [];
    return [...data].sort((a, b) => (b[dataKey] || 0) - (a[dataKey] || 0));
  }, [data, dataKey]);

  const getFill = (name, index) => STATUS_FILL[name] || FALLBACK[index % FALLBACK.length];

  if (!rows.length) {
    return <div className="usage-chart__empty">No status data yet</div>;
  }

  return (
    <div className="usage-chart">
      <div className="usage-chart__donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={78}
              paddingAngle={2}
              dataKey={dataKey}
              nameKey={nameKey}
              stroke="none"
            >
              {rows.map((entry, index) => (
                <Cell
                  key={`cell-${entry[nameKey]}-${index}`}
                  fill={getFill(entry[nameKey], index)}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [value, 'Count']}
              labelFormatter={(label) => formatStatusLabel(label)}
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="usage-chart__legend" aria-label="Status breakdown">
        {rows.map((entry, index) => (
          <li key={String(entry[nameKey])} className="usage-chart__legend-item">
            <span
              className="usage-chart__dot"
              style={{ backgroundColor: getFill(entry[nameKey], index) }}
            />
            <span>{formatStatusLabel(entry[nameKey])}</span>
            <span className="usage-chart__count">({entry[dataKey]})</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsageStatsChart;
