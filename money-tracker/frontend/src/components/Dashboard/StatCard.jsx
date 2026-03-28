import React from 'react';

const StatCard = ({ title, amount, icon: Icon, trend, colorClass }) => {
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(num);
  };

  const isPositive = trend?.value > 0;
  const isNet = title.toLowerCase().includes('net');

  return (
    <div className="bg-card rounded-2xl p-6 border border-border hover:border-accent/30 transition-all duration-200 hover:shadow-lg hover:shadow-accent/5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-text-muted text-sm font-medium uppercase tracking-widest">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass.bg}`}>
            <Icon className={`w-5 h-5 ${colorClass.text}`} />
          </div>
        )}
      </div>
      
      <div className={`text-3xl font-bold font-mono ${isNet ? (amount >= 0 ? 'text-success' : 'text-danger') : 'text-text-primary'}`}>
        {title.toLowerCase().includes('transactions') ? parseInt(amount) : formatCurrency(amount)}
      </div>
      
      {trend && (
        <div className="mt-2 text-sm text-text-muted flex items-center gap-2">
          <span className={isPositive ? 'text-success' : 'text-danger'}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span>from {trend.label}</span>
        </div>
      )}
      
      {/* Subtle indicator bar */}
      <div className={`mt-4 h-1 rounded-full ${colorClass.bgBar}`}>
        <div 
          className={`h-full rounded-full ${colorClass.bgFill}`} 
          style={{ width: '75%' }} 
        />
      </div>
    </div>
  );
};

export default StatCard;
