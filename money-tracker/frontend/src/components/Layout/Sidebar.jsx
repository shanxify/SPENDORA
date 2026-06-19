import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, ArrowLeftRight, Tags, Store, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const [version] = useState('v1.1.7');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      const names = user.user_metadata.full_name.trim().split(/\s+/);
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
  };

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Merchants', path: '/merchants', icon: Store }
  ];

  return (
    <div className="w-64 fixed h-full bg-[#111118] border-r border-[#22222E] flex flex-col pt-8 pb-6 px-4 z-10 shadow-2xl">
      <div onClick={() => window.location.reload()} className="flex items-center px-4 mb-10 mt-2 transition-all duration-300 hover:opacity-90 cursor-pointer">
        <h1 className="brand-font text-2xl text-white flex items-baseline tracking-wide">
          <span className="font-medium">SPEND</span>
          <span className="text-[32px] font-bold text-purple-400 ml-0.5 leading-none">
            X
          </span>
        </h1>
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
                className="w-5 h-5 transition-colors"
              />
              <span className="tracking-wide">{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border-light pt-6 px-2 space-y-4">
        {user && (
          <div ref={menuRef} className="relative flex flex-col">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className={`w-full flex items-center justify-between p-3 bg-[#0c0c14] border border-border-light hover:bg-[#12121c] transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                isAccountMenuOpen ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'
              }`}
              aria-expanded={isAccountMenuOpen}
              aria-label="Account menu"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="profile"
                    className="w-8 h-8 rounded-full object-cover border border-border-light shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 text-accent flex items-center justify-center font-bold text-xs shrink-0">
                    {getInitials()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-text-primary text-sm font-medium truncate leading-tight">
                    {user.user_metadata?.full_name || user.email.split('@')[0]}
                  </div>
                  <div className="text-text-muted text-xs truncate leading-normal mt-0.5">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="text-text-muted shrink-0 ml-2">
                {isAccountMenuOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {isAccountMenuOpen && (
              <div className="bg-[#0c0c14] border-x border-b border-border-light rounded-b-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:bg-[#12121c] hover:text-text-primary transition-all duration-150 text-left w-full focus:outline-none"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-text-muted text-sm px-2 pt-2">
          <span>Version {version}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
