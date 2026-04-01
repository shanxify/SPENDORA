import React from 'react';

const TopNav = ({ title, actions, meta }) => {
  return (
    <div className="px-6 lg:px-10 py-5 border-b border-white/10 flex items-center justify-between bg-[#060010]">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">{title}</h1>
        {meta && <p className="text-sm text-gray-400 mt-1">{meta}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-4">
          {actions}
        </div>
      )}
    </div>
  );
};

export default TopNav;
