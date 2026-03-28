import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, Receipt, Tags, Store, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const [version] = useState('v1.0.0');

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Merchants', path: '/merchants', icon: Store }
  ];

  return (
    <div className="w-64 fixed h-full bg-[#111118] border-r border-[#22222E] flex flex-col pt-8 pb-6 px-4 z-10 shadow-2xl">
      <div className="flex items-center gap-3 px-4 mb-10">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-[0_0_15px_var(--accent-glow)]">
          <span className="text-xl font-syne font-bold text-white tracking-tighter">MT</span>
        </div>
        <h1 className="text-2xl font-syne font-bold text-text-primary tracking-tight">MoneyTrack</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-accent/10 text-accent font-medium shadow-[inset_4px_0_0_var(--accent)]'
                    : 'text-text-muted hover:bg-card hover:text-text-primary'
                }`
              }
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  // Need to force active color if isActive, done by tailwind parent matching via group but here we use simple JS if we had access to isActive inside. We can just rely on the parent text color.
                  '' // inheriting stroke color
                }`}
              />
              <span className="tracking-wide">{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border-light pt-6 px-2 space-y-4">
        <div className="flex items-center justify-between text-text-muted text-sm px-2 hover:text-text-primary transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-text-muted text-sm px-2">
          <span>Version {version}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
