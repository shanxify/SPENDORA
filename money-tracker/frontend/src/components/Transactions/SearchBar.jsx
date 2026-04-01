import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="relative flex-1 max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-text-muted" />
      </div>
      <input
        type="text"
        className="w-full bg-[#0c0c14] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-text-primary focus:ring-2 focus:ring-purple-500 outline-none transition placeholder-text-muted"
        placeholder="Search merchants..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
