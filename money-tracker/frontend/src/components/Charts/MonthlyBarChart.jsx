import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MonthlyBarChart = ({ data }) => {
  const formatCurrency = (val) => {
    if (val >= 1000) {
      return `₹${(val / 1000).toFixed(1)}k`;
    }
    return `₹${val}`;
  };

  const FullCurrencyFormatter = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-4 rounded-xl shadow-xl backdrop-blur-md">
          <p className="font-syne font-bold text-text-primary mb-3 border-b border-border pb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="flex justify-between gap-4 text-sm mb-1">
              <span className="text-text-muted capitalize">{entry.name}:</span>
              <span className={`font-bold ${entry.name === 'debit' ? 'text-danger' : 'text-success'}`}>
                {FullCurrencyFormatter(entry.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-text-muted">
        Not enough monthly data to display
      </div>
    );
  }

  return (
    <div className="h-full w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#22222E" />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#606080', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={formatCurrency}
            tick={{ fill: '#606080', fontSize: 12 }}
            width={60}
          />
          <Tooltip cursor={{ fill: '#1C1C28' }} content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar dataKey="debit" name="Spent" fill="#EF4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="credit" name="Received" fill="#22C55E" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyBarChart;
