import React from 'react';
import CountUp from '../CountUp';

const StatCard = ({ title, amount, icon: Icon, trend, colorClass, hideBar, subtext }) => {
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
    <div className="flex flex-col h-full w-full items-center text-center">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="flex items-center justify-center gap-3 mb-2 w-full">
          <span className="text-text-muted text-sm font-medium uppercase tracking-widest pt-1">
            {title}
          </span>
          {Icon && (
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${colorClass.bg}`}>
              <Icon className={`w-4 h-4 ${colorClass.text}`} />
            </div>
          )}
        </div>
        
        <div className={`text-[32px] leading-none mb-1 font-bold number-font ${isNet ? (amount >= 0 ? 'text-success' : 'text-danger') : 'text-text-primary'}`}>
          {title.toLowerCase().includes('transactions') ? (
            <CountUp 
              from={0} 
              to={parseInt(amount)} 
              duration={1.0} 
              startWhen={true} 
              startCounting={true} 
            />
          ) : (
            <>
              {amount < 0 ? '-₹' : '₹'}
              <CountUp 
                from={0} 
                to={Math.abs(amount)} 
                duration={1.2} 
                separator="," 
                decimals={2} 
                startWhen={true} 
                startCounting={true} 
              />
            </>
          )}
        </div>
        
        {trend && (
          <div className="mt-2 text-sm text-text-muted flex items-center justify-center gap-2">
            <span className={`${isPositive ? 'text-success' : 'text-danger'} number-font`}>
              {isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span>from {trend.label}</span>
          </div>
        )}

        {subtext && (
          <div className="mt-2 text-xs text-text-muted w-full">
            {subtext}
          </div>
        )}
      </div>
      
      {!hideBar && (
        <div className={`w-full mt-auto pt-4`}>
          <div className={`h-1.5 w-full rounded-full ${colorClass.bgBar}`}>
            <div 
              className={`h-full rounded-full ${colorClass.bgFill}`} 
              style={{ width: '75%' }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
