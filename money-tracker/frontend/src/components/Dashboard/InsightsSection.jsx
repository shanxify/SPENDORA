import React from 'react';
import { Crown, Repeat, Zap, Calculator } from 'lucide-react';
import BorderGlow from '../BorderGlow';
import GlareHover from '../GlareHover';

const InsightsSection = ({ topMerchantBySpend, mostFrequentMerchant, biggestExpense, avgTransaction, transactionCount }) => {
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getValueTextClass = (text) => {
    if (!text) return 'text-xl sm:text-2xl font-semibold';
    return text.length > 15 
      ? 'text-lg sm:text-xl font-semibold' 
      : 'text-xl sm:text-2xl font-semibold';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Insights</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: TOP MERCHANT */}
        <BorderGlow
          className="h-[140px] w-full"
          edgeSensitivity={30}
          glowColor="270 80 70"
          backgroundColor="#0c0c14"
          borderRadius={20}
          glowRadius={30}
          glowIntensity={0.6}
          coneSpread={20}
          animated={false}
          colors={['#7c3aed']}
        >
          <GlareHover
            className="rounded-[20px]"
            width="100%"
            height="100%"
            background="transparent"
            borderColor="transparent"
            glareColor="#ffffff"
            glareOpacity={0.1}
            glareSize={200}
            transitionDuration={500}
          >
            <div className="p-5 h-full flex flex-col justify-between items-center text-center w-full min-w-0">
              <div className="flex items-center justify-center gap-3 w-full">
                <span className="text-text-muted text-[11px] sm:text-xs font-medium uppercase tracking-wider pt-0.5">
                  TOP MERCHANT
                </span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-accent/10">
                  <Crown className="w-4 h-4 text-accent" />
                </div>
              </div>
              <p 
                className={`${getValueTextClass(topMerchantBySpend?.display)} text-text-primary line-clamp-2 leading-snug w-full`} 
                title={topMerchantBySpend?.display || ''}
              >
                {topMerchantBySpend?.display || '—'}
              </p>
              <div className="text-sm text-text-muted w-full truncate">
                {topMerchantBySpend 
                  ? `${formatCurrency(topMerchantBySpend.total)} total spent` 
                  : 'No data yet'}
              </div>
            </div>
          </GlareHover>
        </BorderGlow>

        {/* Card 2: MOST FREQUENT */}
        <BorderGlow
          className="h-[140px] w-full"
          edgeSensitivity={30}
          glowColor="270 80 70"
          backgroundColor="#0c0c14"
          borderRadius={20}
          glowRadius={30}
          glowIntensity={0.6}
          coneSpread={20}
          animated={false}
          colors={['#7c3aed']}
        >
          <GlareHover
            className="rounded-[20px]"
            width="100%"
            height="100%"
            background="transparent"
            borderColor="transparent"
            glareColor="#ffffff"
            glareOpacity={0.1}
            glareSize={200}
            transitionDuration={500}
          >
            <div className="p-5 h-full flex flex-col justify-between items-center text-center w-full min-w-0">
              <div className="flex items-center justify-center gap-3 w-full">
                <span className="text-text-muted text-[11px] sm:text-xs font-medium uppercase tracking-wider pt-0.5">
                  MOST FREQUENT
                </span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-accent/10">
                  <Repeat className="w-4 h-4 text-accent" />
                </div>
              </div>
              <p 
                className={`${getValueTextClass(mostFrequentMerchant?.display)} text-text-primary line-clamp-2 leading-snug w-full`} 
                title={mostFrequentMerchant?.display || ''}
              >
                {mostFrequentMerchant?.display || '—'}
              </p>
              <div className="text-sm text-text-muted w-full truncate">
                {mostFrequentMerchant 
                  ? `${mostFrequentMerchant.count} transactions` 
                  : 'No data yet'}
              </div>
            </div>
          </GlareHover>
        </BorderGlow>

        {/* Card 3: BIGGEST EXPENSE */}
        <BorderGlow
          className="h-[140px] w-full"
          edgeSensitivity={30}
          glowColor="270 80 70"
          backgroundColor="#0c0c14"
          borderRadius={20}
          glowRadius={30}
          glowIntensity={0.6}
          coneSpread={20}
          animated={false}
          colors={['#7c3aed']}
        >
          <GlareHover
            className="rounded-[20px]"
            width="100%"
            height="100%"
            background="transparent"
            borderColor="transparent"
            glareColor="#ffffff"
            glareOpacity={0.1}
            glareSize={200}
            transitionDuration={500}
          >
            <div className="p-5 h-full flex flex-col justify-between items-center text-center w-full min-w-0">
              <div className="flex items-center justify-center gap-3 w-full">
                <span className="text-text-muted text-[11px] sm:text-xs font-medium uppercase tracking-wider pt-0.5">
                  BIGGEST EXPENSE
                </span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-danger/10">
                  <Zap className="w-4 h-4 text-danger" />
                </div>
              </div>
              <p 
                className={`${getValueTextClass(biggestExpense?.merchant)} text-text-primary line-clamp-2 leading-snug w-full`} 
                title={biggestExpense?.merchant || ''}
              >
                {biggestExpense?.merchant || '—'}
              </p>
              <div className="text-sm text-text-muted w-full truncate">
                {biggestExpense 
                  ? `${formatCurrency(biggestExpense.amount)} on ${formatDate(biggestExpense.date)}` 
                  : 'No data yet'}
              </div>
            </div>
          </GlareHover>
        </BorderGlow>

        {/* Card 4: AVG TRANSACTION */}
        <BorderGlow
          className="h-[140px] w-full"
          edgeSensitivity={30}
          glowColor="270 80 70"
          backgroundColor="#0c0c14"
          borderRadius={20}
          glowRadius={30}
          glowIntensity={0.6}
          coneSpread={20}
          animated={false}
          colors={['#7c3aed']}
        >
          <GlareHover
            className="rounded-[20px]"
            width="100%"
            height="100%"
            background="transparent"
            borderColor="transparent"
            glareColor="#ffffff"
            glareOpacity={0.1}
            glareSize={200}
            transitionDuration={500}
          >
            <div className="p-5 h-full flex flex-col justify-between items-center text-center w-full min-w-0">
              <div className="flex items-center justify-center gap-3 w-full">
                <span className="text-text-muted text-[11px] sm:text-xs font-medium uppercase tracking-wider pt-0.5">
                  AVG TRANSACTION
                </span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-success/10">
                  <Calculator className="w-4 h-4 text-success" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl leading-snug font-semibold number-font text-text-primary truncate w-full">
                {formatCurrency(avgTransaction)}
              </p>
              <div className="text-sm text-text-muted w-full truncate">
                across {transactionCount} transactions
              </div>
            </div>
          </GlareHover>
        </BorderGlow>

      </div>
    </div>
  );
};

export default InsightsSection;
