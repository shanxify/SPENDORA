import React from 'react';
import { NavLink } from 'react-router-dom';
import SoftAurora from '../../components/SoftAurora';

const DemoLayout = ({ children }) => {
  const links = [
    { name: 'Upload', path: '/demo/upload', icon: '📤' },
    { name: 'Merchants', path: '/demo/merchants', icon: '🏪' },
    { name: 'Dashboard', path: '/demo/dashboard', icon: '📊' }
  ];

  return (
    <div className="relative min-h-screen bg-[#060010]">
      {/* Background aurora */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <SoftAurora
          speed={0.6}
          scale={1.5}
          brightness={1}
          color1="#c084fc"
          color2="#6366f1"
          noiseFrequency={2.5}
          noiseAmplitude={1}
          bandHeight={0.5}
          bandSpread={1}
          octaveDecay={0.1}
          layerOffset={0}
          colorSpeed={1}
          enableMouseInteraction={false}
        />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden text-text-primary font-sans">
        {/* Left Sidebar */}
        <div className="w-64 bg-[#111118] border-r border-[#22222E] flex flex-col pt-8 pb-6 px-4 shrink-0 shadow-2xl">
          <div className="flex items-center justify-between px-4 mb-10 mt-2">
            <h1 className="brand-font text-2xl text-white flex items-baseline tracking-wide">
              <span className="font-medium">SPEND</span>
              <span className="text-[32px] font-bold text-purple-400 ml-0.5 leading-none">
                X
              </span>
            </h1>
          </div>

          <nav className="flex-1 space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-purple-500/10 text-purple-400 font-medium shadow-[inset_4px_0_0_#a855f7] border-l-4 border-purple-500'
                      : 'text-gray-400 hover:bg-[#181824] hover:text-white'
                  }`
                }
              >
                <span className="text-lg">{link.icon}</span>
                <span className="tracking-wide font-medium">{link.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto border-t border-[#22222E] pt-6 px-2 text-center text-xs text-gray-500 font-semibold tracking-wider uppercase">
            Demo Session
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Top Header */}
          <header className="flex items-center justify-between px-8 py-4 bg-[#111118] border-b border-[#22222E] shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-400">Environment:</span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                Demo Mode
              </span>
            </div>
            <div className="text-xs text-gray-500 font-mono">
              In-Memory Session
            </div>
          </header>

          {/* Render child pages */}
          <main className="flex-1 overflow-y-auto min-w-0 bg-[#0A0A0F]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DemoLayout;
