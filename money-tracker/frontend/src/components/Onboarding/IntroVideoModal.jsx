import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const IntroVideoModal = () => {
  const { user, markIntroVideoSeen } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (user) {
      const hasSeenThisSession = sessionStorage.getItem('has_seen_intro_session');
      if (!hasSeenThisSession) {
        setShow(true);
        sessionStorage.setItem('has_seen_intro_session', 'true');
      }
    }
  }, [user]);

  useEffect(() => {
    // Expose a window function to replay the video without clearing/setting the seen flag
    window.showIntroVideo = () => {
      setShow(true);
    };
    return () => {
      delete window.showIntroVideo;
    };
  }, []);

  const handleClose = () => {
    setShow(false);
    if (user && !user.user_metadata?.has_seen_intro_video) {
      markIntroVideoSeen();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-[#0c0c14] rounded-2xl border border-white/10 max-w-2xl w-full overflow-hidden shadow-2xl my-auto">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 sm:p-2 transition-colors border border-white/5"
          aria-label="Close video"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <div className="aspect-video w-full bg-black">
          <video
            src="/spendx-demo.mp4"
            controls
            autoPlay
            muted
            className="w-full h-full object-contain"
            playsInline
          />
        </div>
        
        <div className="p-3 sm:p-4 text-center border-t border-white/5 bg-[#0f0f18]">
          <p className="text-white font-medium text-sm sm:text-base">
            New here? Watch a quick walkthrough.
          </p>
          <p className="text-text-muted text-xs sm:text-sm mt-1 sm:mt-1.5">
            Upload <span className="mx-1 text-purple-400">→</span> Map merchants <span className="mx-1 text-purple-400">→</span> View your dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntroVideoModal;
