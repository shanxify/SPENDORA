import React from 'react';

const TopNav = ({ title, actions, meta }) => {
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-primary-bg/80 backdrop-blur-md sticky top-0 z-10 border-b border-border/50">
      <div>
        <h1 className="text-2xl font-syne font-bold text-text-primary">{title}</h1>
        {meta && <p className="text-sm text-text-muted mt-0.5">{meta}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-4">
          {actions}
        </div>
      )}
    </header>
  );
};

export default TopNav;
