import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

const SpendingPieChart = ({ data }) => {
  const navigate = useNavigate();
  
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, payload: dataPayload } = payload[0];
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="font-medium text-text-primary flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: dataPayload.color }}></span>
            {name}
          </p>
          <p className="text-accent font-mono mt-1 font-bold">
            {formatCurrency(value)} <span className="text-text-muted text-sm font-sans font-normal">({dataPayload.percentage}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const handleClick = (entry) => {
    if (entry && entry.name) {
      navigate(`/transactions?category=${encodeURIComponent(entry.name)}`);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-text-muted">
        Not enough data to display chart
      </div>
    );
  }

  // Calculate total for center label
  const totalSpend = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="h-full w-full relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-4">
        <div className="text-center">
          <p className="text-text-muted text-xs uppercase tracking-widest">Total</p>
          <p className="text-xl font-bold font-mono text-text-primary">{formatCurrency(totalSpend)}</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="total"
            onClick={handleClick}
            className="cursor-pointer outline-none"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || '#95A5A6'} 
                className="hover:opacity-80 transition-opacity duration-300 outline-none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingPieChart;
