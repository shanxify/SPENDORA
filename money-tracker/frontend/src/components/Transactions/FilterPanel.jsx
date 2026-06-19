import React from 'react';

const FilterPanel = ({ categories, filters, onFilterChange }) => {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center w-full sm:w-auto">
      <select
        className="bg-secondary-bg border border-border text-text-primary text-sm rounded-xl focus:ring-accent focus:border-accent block p-2.5 appearance-none min-w-[140px] shadow-sm w-full sm:w-auto cursor-pointer"
        value={filters.category}
        onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
      >
        <option value="">All Categories</option>
        {(Array.isArray(categories) ? categories : []).map((c) => (
          <option key={c.id} value={c.name}>{c.name}</option>
        ))}
      </select>

      <select
        className="bg-secondary-bg border border-border text-text-primary text-sm rounded-xl focus:ring-accent focus:border-accent block p-2.5 appearance-none min-w-[120px] shadow-sm w-full sm:w-auto cursor-pointer"
        value={filters.type}
        onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
      >
        <option value="all">All Types</option>
        <option value="debit">Debit</option>
        <option value="credit">Credit</option>
      </select>
      
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
        <input 
          type="date"
          className="bg-[#0c0c14] border border-white/10 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition text-text-primary text-sm block w-[45%] sm:w-auto"
          value={filters.from}
          onChange={(e) => onFilterChange({ ...filters, from: e.target.value })}
        />
        <span className="text-text-muted text-sm">to</span>
        <input 
          type="date"
          className="bg-[#0c0c14] border border-white/10 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition text-text-primary text-sm block w-[45%] sm:w-auto"
          value={filters.to}
          onChange={(e) => onFilterChange({ ...filters, to: e.target.value })}
        />
      </div>
    </div>
  );
};

export default FilterPanel;
