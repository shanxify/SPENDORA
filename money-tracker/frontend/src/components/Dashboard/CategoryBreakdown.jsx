import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryBreakdown = ({ categories }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/transactions?category=${encodeURIComponent(categoryName)}`);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-syne font-bold text-text-primary mb-4">Top Spending Categories</h3>
      
      {categories.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-text-muted">
          No category data available
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          {categories.map((cat, idx) => (
            <div 
              key={idx} 
              className="group flex flex-col gap-2 p-3 rounded-xl hover:bg-secondary-bg transition-colors cursor-pointer border border-transparent hover:border-border"
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="font-medium text-text-primary group-hover:text-accent transition-colors">{cat.name}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono font-bold text-text-primary">{formatCurrency(cat.total)}</span>
                  <span className="text-xs text-text-muted">{cat.percentage}%</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-secondary-bg rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${Math.min(100, cat.percentage)}%`, 
                    backgroundColor: cat.color 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryBreakdown;
